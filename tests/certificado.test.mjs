/**
 * Testes Automatizados do Certificado de Conclusão do AprendIDos
 * 
 * Verifica:
 * 1. Bloqueio da emissão quando houver lições obrigatórias pendentes (< 9).
 * 2. Emissão autorizada quando todas as 9 lições obrigatórias estiverem concluídas.
 * 3. Nome do aluno correto (customizado, perfil de usuário ou fallback 'Aprendiz').
 * 4. Data oficial de conclusão preservada da última lição concluída.
 * 5. Persistência da emissão em chave isolada por usuário e recuperação posterior.
 * 6. Tratamento de sincronização (cloud synced vs local_only) sem falhas silenciosas.
 * 7. Geração consistente do código de autenticidade.
 * 8. Integração em licoes.html e licoes.js: banner de celebração ativado apenas com 9/9 concluídas.
 * 9. Formatação e estilos de impressão em certificado.html (@media print, A4 landscape, ocultação de no-print).
 * 10. Política de Segurança (CSP) e PWA Precache em sw.js.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

import {
  MANDATORY_LESSON_KEYS,
  MANDATORY_LESSON_TITLES,
  getCertificateStorageKey,
  checkCertificateEligibility,
  resolveCertificateDate,
  formatCertificateDate,
  resolveStudentName,
  generateVerificationCode,
  getStoredCertificate,
  saveStoredCertificate
} from '../certificado-logic.js';

function createMockStorage() {
  const store = new Map();
  return {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); },
    clear() { store.clear(); }
  };
}

test('1. Bloqueio da emissão enquanto houver lições obrigatórias pendentes', () => {
  const partialProgress = {
    letras: { completed: true, score: 10 },
    vogais: { completed: true, score: 10 },
    consoantes: { completed: true, score: 10 },
    meunome: { completed: true, score: 1 },
    silabas: { completed: true, score: 10 }
  };

  const status = checkCertificateEligibility(partialProgress);
  assert.equal(status.eligible, false);
  assert.equal(status.completedCount, 5);
  assert.equal(status.total, 9);
  assert.deepEqual(status.missingLessons, ['palavras', 'frases', 'leituras', 'escrita']);
});

test('2. Emissão autorizada quando todas as 9 lições obrigatórias estiverem concluídas', () => {
  const completeProgress = {};
  for (const key of MANDATORY_LESSON_KEYS) {
    completeProgress[key] = { completed: true, score: 10, updatedAt: '2026-10-25T14:00:00.000Z' };
  }

  const status = checkCertificateEligibility(completeProgress);
  assert.equal(status.eligible, true);
  assert.equal(status.completedCount, 9);
  assert.equal(status.total, 9);
  assert.deepEqual(status.missingLessons, []);
});

test('3. Resolução de nome: customizado > perfil do usuário > fallback', () => {
  assert.equal(resolveStudentName(null, null), 'Aprendiz');
  assert.equal(resolveStudentName({}, {}), 'Aprendiz');

  const user = { id: 'u1', name: 'Maria da Silva' };
  assert.equal(resolveStudentName(user, null), 'Maria da Silva');

  const savedCert = { customName: 'Dona Maria da Silva Sauro' };
  assert.equal(resolveStudentName(user, savedCert), 'Dona Maria da Silva Sauro');

  assert.equal(resolveStudentName(user, { customName: '   ' }), 'Maria da Silva');
});

test('4. Data de conclusão preservada a partir da última lição e formato em português', () => {
  const progress = {
    letras: { completed: true, updatedAt: '2026-10-20T10:00:00.000Z' },
    escrita: { completed: true, updatedAt: '2026-10-29T12:30:00.000Z' },
    meunome: { completed: true, updatedAt: '2026-10-22T08:00:00.000Z' }
  };

  const initialDate = resolveCertificateDate(progress, null);
  assert.equal(initialDate, '2026-10-29T12:30:00.000Z');
  assert.equal(formatCertificateDate(initialDate), '29 de outubro de 2026');

  const savedCert = { issuedAt: '2026-10-28T10:00:00.000Z' };
  const preservedDate = resolveCertificateDate(progress, savedCert);
  assert.equal(preservedDate, '2026-10-28T10:00:00.000Z');
  assert.equal(formatCertificateDate(preservedDate), '28 de outubro de 2026');
});

test('5. Persistência isolada por conta de usuário', () => {
  const storage = createMockStorage();
  const userA = { id: 'user-aaa-111', isDemo: false };
  const userB = { id: 'user-bbb-222', isDemo: false };
  const userDemo = { id: 'demo-999', isDemo: true };
  const anon = null;

  assert.equal(getCertificateStorageKey(userA), 'aprendidos_certificado_user-aaa-111');
  assert.equal(getCertificateStorageKey(userB), 'aprendidos_certificado_user-bbb-222');
  assert.equal(getCertificateStorageKey(userDemo), 'aprendidos_certificado_demo_demo-999');
  assert.equal(getCertificateStorageKey(anon), 'aprendidos_certificado_anonymous_v2');

  const certDataA = {
    customName: 'Seu Manoel',
    issuedAt: '2026-10-29T12:00:00.000Z',
    verificationCode: 'APR-1234-5678'
  };
  saveStoredCertificate(storage, userA, certDataA);

  assert.equal(getStoredCertificate(storage, userB), null);

  const loadedA = getStoredCertificate(storage, userA);
  assert.deepEqual(loadedA, certDataA);
});

test('6. Distinção de sincronização na elegibilidade', () => {
  const mixedProgress = {};
  MANDATORY_LESSON_KEYS.forEach((key, idx) => {
    mixedProgress[key] = {
      completed: true,
      syncStatus: idx < 2 ? 'local_only' : 'synced'
    };
  });

  const status = checkCertificateEligibility(mixedProgress);
  assert.equal(status.eligible, true);
  assert.equal(status.localOnlyCount, 2);
  assert.equal(status.syncStatus, 'local_only');
});

test('7. Código de verificação determinístico e seguro', () => {
  const code1 = generateVerificationCode('user-123', '2026-10-29T12:00:00.000Z');
  const code2 = generateVerificationCode('user-123', '2026-10-29T12:00:00.000Z');
  const codeDifferent = generateVerificationCode('user-456', '2026-10-29T12:00:00.000Z');

  assert.equal(code1, code2);
  assert.match(code1, /^APR-[0-9A-F]{4}-[0-9A-F]{4}$/);
  assert.notEqual(code1, codeDifferent);
});

test('8. Integração em licoes.html e licoes.js: banner de celebração dinâmico', () => {
  const licoesHtml = fs.readFileSync(path.join(rootDir, 'licoes.html'), 'utf8');
  const licoesJs = fs.readFileSync(path.join(rootDir, 'licoes.js'), 'utf8');

  // Verifica elementos no HTML
  assert.match(licoesHtml, /id="certificateBanner"/);
  assert.match(licoesHtml, /href="certificado\.html"/);
  assert.match(licoesHtml, /id="btnVerCertificado"/);

  // Simula lógica de updateProgress de licoes.js
  const banner = { style: { display: 'none' } };
  const doc = { getElementById: (id) => (id === 'certificateBanner' ? banner : null) };

  function simulateUpdateProgress(completed, total) {
    if (banner) {
      banner.style.display = (completed >= total) ? 'block' : 'none';
    }
  }

  // 8 de 9 concluídas: banner continua oculto
  simulateUpdateProgress(8, 9);
  assert.equal(banner.style.display, 'none');

  // 9 de 9 concluídas: banner se torna visível
  simulateUpdateProgress(9, 9);
  assert.equal(banner.style.display, 'block');

  // Verifica se licoes.js contém a verificação de banner
  assert.match(licoesJs, /certificateBanner/);
  assert.match(licoesJs, /completedCount >= TOTAL/);
});

test('9. certificado.html define regras para impressão A4 landscape e oculta controles', () => {
  const certHtml = fs.readFileSync(path.join(rootDir, 'certificado.html'), 'utf8');

  assert.match(certHtml, /@page\s*\{[^}]*size:\s*A4 landscape/i);
  assert.match(certHtml, /@media print/i);
  assert.match(certHtml, /\.no-print/);
  assert.match(certHtml, /print-color-adjust:\s*exact/);
  assert.match(certHtml, /height:\s*194mm/i);
  assert.match(certHtml, /box-sizing:\s*border-box/i);
  assert.match(certHtml, /overflow:\s*hidden/i);
  assert.match(certHtml, /\.no-print[^}]*display:\s*none/is);
  assert.match(certHtml, /id="btnImprimirCert"/);
  assert.match(certHtml, /id="btnOuvirCert"/);
  assert.match(certHtml, /id="btnAbrirModalNome"/);
});

test('Clique no certificado inicia síntese nativa imediata, lê nome/data e permite parar', () => {
  const controller = fs.readFileSync(path.join(rootDir, 'certificado.js'), 'utf8');
  const start = controller.indexOf('function stopAudio()');
  const end = controller.indexOf('/* ===== CARREGAMENTO E RENDERIZAÇÃO', start);
  assert.ok(start >= 0 && end > start);
  const audioCode = controller.slice(start, end);
  const clickStart = controller.indexOf('window.ouvirCertificado = function(btn)');
  const clickEnd = controller.indexOf('window.ouvirMensagemIncompleta', clickStart);
  assert.ok(clickStart >= 0 && clickEnd > clickStart, 'handler do botão precisa existir');
  const clickCode = controller.slice(clickStart, clickEnd);
  const utterances = [];
  let stopped = 0;
  const elements = {
    btnOuvirCert: { classList: { add() {}, remove() {} } },
    labelOuvirCert: { textContent: 'Ouvir Certificado' },
    certStudentName: { textContent: 'Maria da Silva' },
    certDateDisplay: { textContent: '29 de outubro de 2026' },
    certAudioStatus: { textContent: '' }
  };
  const env = {
    _currentAudio: null, _isSpeaking: false, _speechGen: 0, _fallbackTimer: null, _nativeFallbackStartedForGen: -1,
    document: { getElementById: id => elements[id] || null },
    window: { speechSynthesis: { cancel() { stopped++; }, getVoices() { return [{ lang: 'pt-BR', name: 'Português' }]; }, speak(utterance) { utterances.push(utterance); } } },
    SpeechSynthesisUtterance: class { constructor(text) { this.text = text; } },
    Audio: class { play() { throw new Error('A voz nativa deveria ser preferida'); } },
    setTimeout(callback) { env.fallback = callback; return 1; },
    clearTimeout() {},
    console
  };
  const controls = new Function('env', `with (env) { ${audioCode}\n${clickCode}\nreturn { speakText, stopAudio }; }`)(env);
  const button = elements.btnOuvirCert;
  env.window.ouvirCertificado(button);
  assert.match(utterances[0].text, /Maria da Silva concluiu todas as 9 atividades/);
  assert.match(utterances[0].text, /29 de outubro de 2026/);
  assert.equal(utterances[0].lang, 'pt-BR');
  assert.equal(utterances[0].voice.lang, 'pt-BR');
  assert.equal(elements.labelOuvirCert.textContent, 'Toque para parar');
  env.window.ouvirCertificado(button);
  assert.ok(stopped > 0, 'Tocar durante a narração deve cancelar a fala atual');
  assert.equal(env._isSpeaking, false);
  env.window.ouvirCertificado(button);
  assert.equal(utterances.length, 2, 'Uma nova leitura após parar deve iniciar normalmente');
});

test('Sem síntese nativa, o áudio remoto é tentado e a interface informa falha sem ficar presa', () => {
  const controller = fs.readFileSync(path.join(rootDir, 'certificado.js'), 'utf8');
  const start = controller.indexOf('function stopAudio()');
  const end = controller.indexOf('/* ===== CARREGAMENTO E RENDERIZAÇÃO', start);
  const audioCode = controller.slice(start, end);
  let audio;
  let remoteTimeout;
  const status = { textContent: '' };
  const env = {
    _currentAudio: null, _isSpeaking: false, _speechGen: 0, _fallbackTimer: null, _nativeFallbackStartedForGen: -1,
    document: { getElementById: id => id === 'certAudioStatus' ? status : null },
    window: {},
    Audio: class { constructor() { audio = this; } play() { return new Promise(() => {}); } pause() {} },
    setTimeout(callback) { remoteTimeout = callback; return 1; }, clearTimeout() {}, console
  };
  const controls = new Function('env', `with (env) { ${audioCode}\nreturn { speakText }; }`)(env);
  controls.speakText('texto completo do certificado');
  audio.onerror();
  assert.equal(status.textContent, 'Não foi possível reproduzir o áudio neste dispositivo.');
  assert.equal(env._isSpeaking, false);
  controls.speakText('segunda tentativa');
  remoteTimeout();
  assert.equal(env._isSpeaking, false, 'timeout remoto deve liberar o controle de reprodução');
});

test('Lista de vozes inicialmente vazia aceita voz pt-BR carregada por voiceschanged', () => {
  const controller = fs.readFileSync(path.join(rootDir, 'certificado.js'), 'utf8');
  const start = controller.indexOf('function stopAudio()');
  const end = controller.indexOf('/* ===== CARREGAMENTO E RENDERIZAÇÃO', start);
  const audioCode = controller.slice(start, end);
  let voices = [];
  let onVoicesChanged;
  let timeoutCallback;
  const utterances = [];
  const synthesis = {
    cancel() {},
    getVoices() { return voices; },
    addEventListener(_event, callback) { onVoicesChanged = callback; },
    speak(utterance) { utterances.push(utterance); }
  };
  const env = {
    _currentAudio: null, _isSpeaking: false, _speechGen: 0, _fallbackTimer: null,
    document: { getElementById: () => null },
    window: { speechSynthesis: synthesis },
    SpeechSynthesisUtterance: class { constructor(text) { this.text = text; } },
    Audio: class {},
    setTimeout(callback) { timeoutCallback = callback; return 5; },
    clearTimeout() {}, console
  };
  new Function('env', `with (env) { ${audioCode}\nreturn { speakText }; }`)(env)
    .speakText('Certificado de Ana');
  assert.equal(utterances.length, 1, 'a fala é enfileirada sem esperar a lista de vozes');
  assert.equal(utterances[0].voice, null);

  voices = [{ lang: 'pt-BR', name: 'Português Brasil' }];
  onVoicesChanged();
  assert.equal(utterances[0].voice.lang, 'pt-BR');
  utterances[0].onstart();
  timeoutCallback();
  assert.equal(utterances.length, 1, 'voz nativa iniciada não deve duplicar com fallback remoto');
});

test('10. CSP em certificado.html inclui media-src e sw.js inclui arquivos do certificado no precache', () => {
  const certHtml = fs.readFileSync(path.join(rootDir, 'certificado.html'), 'utf8');
  const swJs = fs.readFileSync(path.join(rootDir, 'sw.js'), 'utf8');

  // CSP
  assert.match(certHtml, /media-src[^;]*translate\.google\.com/);
  assert.match(certHtml, /connect-src[^;]*supabase\.co/);

  // sw.js precache
  assert.match(swJs, /'certificado\.html'/);
  assert.match(swJs, /'certificado\.js'/);
  assert.match(swJs, /'certificado-logic\.js'/);
});
