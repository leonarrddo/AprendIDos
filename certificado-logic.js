/**
 * AprendIDos - Lógica de Elegibilidade, Emissão e Dados do Certificado
 * Arquivo: certificado-logic.js
 * 
 * Centraliza as regras de negócio para elegibilidade, formatação e persistência
 * do certificado de conclusão da jornada educacional do AprendIDos.
 */

export const MANDATORY_LESSON_KEYS = [
  'letras',
  'vogais',
  'consoantes',
  'meunome',
  'silabas',
  'palavras',
  'frases',
  'leituras',
  'escrita'
];

export const MANDATORY_LESSON_TITLES = {
  letras: 'As Letras',
  vogais: 'As Vogais',
  consoantes: 'Consoantes e Sons',
  meunome: 'Meu Nome',
  silabas: 'Sílabas',
  palavras: 'Palavras do Dia a Dia',
  frases: 'Frases Simples',
  leituras: 'Pequenas Leituras',
  escrita: 'Escrita'
};

const CERT_STORAGE_PREFIX = 'aprendidos_certificado_';
const CERT_DEMO_PREFIX = 'aprendidos_certificado_demo_';
const CERT_ANONYMOUS_KEY = 'aprendidos_certificado_anonymous_v2';

/**
 * Retorna a chave de armazenamento local do certificado isolada por usuário.
 */
export function getCertificateStorageKey(user) {
  if (user?.id) {
    const prefix = user.isDemo ? CERT_DEMO_PREFIX : CERT_STORAGE_PREFIX;
    return `${prefix}${user.id}`;
  }
  return CERT_ANONYMOUS_KEY;
}

/**
 * Verifica a elegibilidade para emissão do certificado.
 * O certificado exige a conclusão de todas as 9 atividades obrigatórias.
 */
export function checkCertificateEligibility(progress = {}, lessonKeys = MANDATORY_LESSON_KEYS) {
  if (!progress || typeof progress !== 'object') {
    return {
      eligible: false,
      completedCount: 0,
      total: lessonKeys.length,
      missingLessons: [...lessonKeys],
      completedLessons: [],
      syncStatus: 'none'
    };
  }

  const missingLessons = [];
  const completedLessons = [];
  let localOnlyCount = 0;

  for (const key of lessonKeys) {
    const record = progress[key];
    if (record && record.completed) {
      completedLessons.push(key);
      if (record.syncStatus === 'local_only') {
        localOnlyCount++;
      }
    } else {
      missingLessons.push(key);
    }
  }

  const completedCount = completedLessons.length;
  const eligible = completedCount === lessonKeys.length;

  let syncStatus = 'synced';
  if (localOnlyCount > 0) {
    syncStatus = 'local_only';
  } else if (completedCount === 0) {
    syncStatus = 'empty';
  }

  return {
    eligible,
    completedCount,
    total: lessonKeys.length,
    missingLessons,
    completedLessons,
    localOnlyCount,
    syncStatus
  };
}

/**
 * Determina a data oficial de conclusão.
 * Se já houver certificado emitido salvo, preserva a data original de emissão.
 * Caso contrário, busca a data da lição mais recente concluída.
 */
export function resolveCertificateDate(progress = {}, savedCertificate = null, now = () => new Date()) {
  if (savedCertificate?.issuedAt) {
    return savedCertificate.issuedAt;
  }

  let latestTimestamp = 0;
  for (const record of Object.values(progress || {})) {
    if (!record || !record.completed) continue;
    const dateVal = record.updatedAt || record.atualizado_em || record.savedAt || record.date;
    const ts = dateVal ? Date.parse(dateVal) : NaN;
    if (Number.isFinite(ts) && ts > latestTimestamp) {
      latestTimestamp = ts;
    }
  }

  if (latestTimestamp > 0) {
    return new Date(latestTimestamp).toISOString();
  }

  return now().toISOString();
}

/**
 * Formata uma data ISO no padrão brasileiro por extenso (ex: "29 de outubro de 2026").
 */
export function formatCertificateDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  const meses = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

/**
 * Resolve o nome a ser impresso no certificado.
 * Prioridade:
 * 1. Nome customizado explicitamente confirmado pelo usuário para o certificado
 * 2. Nome do perfil autenticado
 * 3. Fallback acessível e respeitoso ('Aprendiz')
 */
export function resolveStudentName(user = null, savedCertificate = null) {
  if (savedCertificate?.customName && typeof savedCertificate.customName === 'string') {
    const clean = savedCertificate.customName.trim();
    if (clean.length > 0) return clean;
  }
  if (user?.name && typeof user.name === 'string') {
    const clean = user.name.trim();
    if (clean.length > 0) return clean;
  }
  if (user?.nome && typeof user.nome === 'string') {
    const clean = user.nome.trim();
    if (clean.length > 0) return clean;
  }
  return 'Aprendiz';
}

/**
 * Gera um código alfanumérico amigável para verificação local de autenticidade (ex: APR-7A12-B3C4).
 */
export function generateVerificationCode(userId, dateIso) {
  const seed = `${userId || 'anon'}_${dateIso || 'nodate'}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `APR-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

/**
 * Lê os dados locais do certificado do armazenamento.
 */
export function getStoredCertificate(storage, user) {
  try {
    const key = getCertificateStorageKey(user);
    const raw = storage?.getItem?.(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Salva os dados locais do certificado no armazenamento.
 */
export function saveStoredCertificate(storage, user, certData) {
  try {
    const key = getCertificateStorageKey(user);
    if (!storage?.setItem) return false;
    storage.setItem(key, JSON.stringify(certData));
    return true;
  } catch {
    return false;
  }
}

