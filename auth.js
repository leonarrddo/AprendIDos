/**
 * ============================================================================
 * AprendIDos - Módulo de Autenticação e Dados do Usuário
 * Arquivo: auth.js
 * ============================================================================
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from './supabase-config.js';
import { createProgressStore, getProgressStorageKey } from './progress-store.js';

let supabase = null;
let supabasePromise = null;

/**
 * Garante que a instância do Supabase seja carregada e inicializada
 */
export async function getSupabase() {
  if (supabase) return supabase;
  if (!supabasePromise) {
    supabasePromise = (async () => {
      if (isSupabaseConfigured()) {
        try {
          let createClient = null;
          try {
            const mod = await import('@supabase/supabase-js');
            createClient = mod.createClient;
          } catch (eNode) {
            const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            createClient = mod.createClient;
          }
          supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
          console.log('✅ [AprendIDos] Conectado ao Supabase!');

          // Observa eventos de sessão (ex: quando o usuário clica no link do e-mail)
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (session && session.user) {
              const u = session.user;
              const nomeFull = u.user_metadata?.full_name || u.user_metadata?.name || u.email.split('@')[0];
              const usuario = {
                id: u.id,
                email: u.email,
                name: nomeFull,
                nome: nomeFull,
                avatar: u.user_metadata?.avatar_url || u.user_metadata?.picture || null,
                isDemo: false
              };
              localStorage.setItem('aprendidos_usuario', JSON.stringify(usuario));
            } else if (event === 'SIGNED_OUT') {
              localStorage.removeItem('aprendidos_usuario');
            }
          });
        } catch (err) {
          console.warn('⚠️ [AprendIDos] Erro ao carregar SDK do Supabase. Usando Modo Demo Local.', err);
        }
      }
      return supabase;
    })();
  }
  return supabasePromise;
}

// Inicia conexão em segundo plano
getSupabase();

/**
 * Retorna o usuário atualmente logado
 */
export async function getCurrentUser() {
  const client = await getSupabase();
  if (client) {
    try {
      // 1. Tenta recuperar da sessão ativa local (rápido e compatível com cache/offline)
      const { data: sessionData } = await client.auth.getSession();
      const sessUser = sessionData?.session?.user;
      if (sessUser) {
        const nomeFull = sessUser.user_metadata?.full_name || sessUser.user_metadata?.name || sessUser.email.split('@')[0];
        const usuarioFormatado = {
          id: sessUser.id,
          email: sessUser.email,
          name: nomeFull,
          nome: nomeFull,
          avatar: sessUser.user_metadata?.avatar_url || sessUser.user_metadata?.picture || null,
          isDemo: false
        };
        try { localStorage.setItem('aprendidos_usuario', JSON.stringify(usuarioFormatado)); } catch (e) {}
        return usuarioFormatado;
      }

      // 2. Validação no servidor do Supabase
      const { data: { user }, error } = await client.auth.getUser();
      if (user && !error) {
        const nomeFull = user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0];
        const usuarioFormatado = {
          id: user.id,
          email: user.email,
          name: nomeFull,
          nome: nomeFull,
          avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          isDemo: false
        };
        try { localStorage.setItem('aprendidos_usuario', JSON.stringify(usuarioFormatado)); } catch (e) {}
        return usuarioFormatado;
      }
    } catch (e) {
      console.warn('Erro ao verificar sessão Supabase:', e);
    }
  }

  // Fallback no LocalStorage — somente quando Supabase NÃO está configurado
  if (!isSupabaseConfigured()) {
    try {
      const demoUser = localStorage.getItem('aprendidos_usuario');
      if (demoUser) {
        return { ...JSON.parse(demoUser), isDemo: true };
      }
    } catch (e) {
      // Storage bloqueado
    }
  }

  return null;
}

// Allowlist estrita de destinos internos (Prevenção de Open Redirect - SEC-07)
const ALLOWED_REDIRECT_PATHS = new Set([
  'index.html',
  'inicio.html',
  'menu.html',
  'login.html',
  'cadastro.html',
  'licoes.html',
  'letras.html',
  'vogais.html',
  'consoantes.html',
  'meunome.html',
  'silabas.html',
  'palavras.html',
  'frases.html',
  'leituras.html',
  'escrita.html'
]);

/**
 * Valida e sanitiza caminhos de redirecionamento para evitar Open Redirects
 */
export function sanitizeRedirectPath(path, defaultPath = 'index.html') {
  if (!path || typeof path !== 'string') return defaultPath;
  try {
    // Rejeita esquemas externos, barras duplas e javascript:
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(path) || /^\/\//.test(path)) {
      const parsed = new URL(path, window.location.href);
      if (parsed.origin !== window.location.origin) {
        return defaultPath;
      }
      path = parsed.pathname.replace(/^\//, '') + parsed.search + parsed.hash;
    }
    const cleanPath = path.split('?')[0].split('#')[0].replace(/^\.?\//, '');
    if (ALLOWED_REDIRECT_PATHS.has(cleanPath)) {
      return path;
    }
  } catch (e) { }
  return defaultPath;
}

/**
 * Login com Google ou Facebook
 *
 * PRODUÇÃO (Supabase configurado):
 *   - Inicia o fluxo OAuth real.
 *   - Se o OAuth falhar, propaga o erro para o chamador exibir mensagem.
 *   - NÃO cria usuário fictício.
 *
 * DEMO (Supabase NÃO configurado):
 *   - Cria usuário demo para permitir testes locais sem backend.
 */
export async function signInWithProvider(provider, redirectPath = 'index.html') {
  const safeRedirect = sanitizeRedirectPath(redirectPath, 'index.html');
  const client = await getSupabase();

  // ── PRODUÇÃO: fluxo OAuth real ──
  if (client && isSupabaseConfigured()) {
    const targetUrl = new URL(safeRedirect, window.location.href).href;
    const { data, error } = await client.auth.signInWithOAuth({
      provider: provider,
      options: { redirectTo: targetUrl }
    });
    if (error) {
      throw new Error(`Erro ao iniciar login com ${provider}: ${error.message}`);
    }
    return data;
  }

  // ── MODO DEMONSTRAÇÃO: apenas quando Supabase NÃO está configurado ──
  const mockName = provider === 'google' ? 'Manoel da Silva (Google)' : 'Maria Oliveira (Facebook)';
  const mockUser = {
    id: 'demo_' + Date.now(),
    email: `${provider}.demo@aprendidos.com.br`,
    name: mockName,
    nome: mockName,
    avatar: null,
    provider: provider,
    isDemo: true
  };

  localStorage.setItem('aprendidos_usuario', JSON.stringify(mockUser));
  await new Promise(r => setTimeout(r, 400));
  window.location.href = safeRedirect;
  return { user: mockUser };
}

/**
 * Cadastro com E-mail e Senha
 * Se confirmação de e-mail estiver ativa, retorna emailConfirmationRequired = true
 */
export async function signUpWithEmail(name, email, password) {
  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanName || !cleanEmail || !password) throw new Error('Preencha todos os campos obrigatórios.');
  if (cleanName.length < 2 || cleanName.length > 100) throw new Error('O nome deve ter entre 2 e 100 caracteres.');

  // Regex de e-mail RFC 5322 seguro contra ReDoS
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(cleanEmail)) throw new Error('Por favor, informe um endereço de e-mail válido.');
  if (password.length < 6) throw new Error('A senha deve ter no mínimo 6 caracteres.');
  if (password.length > 72) throw new Error('A senha não pode exceder 72 caracteres.');

  const client = await getSupabase();
  if (client) {
    const redirectUrl = new URL('login.html?confirmado=true', window.location.href).href;
    const { data, error } = await client.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: { full_name: cleanName },
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        throw new Error('Este e-mail já está cadastrado. Vá até a tela de login para entrar.');
      }
      throw new Error(error.message);
    }

    // Supabase não retorna erro para e-mails duplicados (proteção anti-enumeração),
    // mas retorna identities vazio quando o e-mail já existe.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw new Error('Este e-mail já está cadastrado. Vá até a tela de login para entrar.');
    }

    // Se session for nula, o Supabase enviou o e-mail e aguarda a confirmação
    const isConfirmationRequired = !data.session;
    return {
      user: data.user,
      session: data.session,
      emailConfirmationRequired: isConfirmationRequired
    };
  }

  // Fallback demo caso não configurado
  const mockUser = { id: 'demo_' + Date.now(), email, name, nome: name, avatar: null, provider: 'email', isDemo: true };
  localStorage.setItem('aprendidos_usuario', JSON.stringify(mockUser));
  return { user: mockUser, emailConfirmationRequired: false };
}

/**
 * Reenvia o e-mail de confirmação
 */
export async function resendConfirmationEmail(email) {
  if (!email) throw new Error('Informe o e-mail.');
  const client = await getSupabase();
  if (client) {
    const redirectUrl = new URL('login.html?confirmado=true', window.location.href).href;
    const { error } = await client.auth.resend({
      type: 'signup',
      email: email,
      options: { emailRedirectTo: redirectUrl }
    });
    if (error) throw error;
    return true;
  }
  return false;
}

/**
 * Login com E-mail e Senha
 */
export async function signInWithEmail(email, password, redirectPath = 'index.html') {
  if (!email || !password) throw new Error('Informe o e-mail e a senha.');

  const client = await getSupabase();
  if (client) {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Email not confirmed') || error.code === 'email_not_confirmed') {
        const err = new Error('Seu e-mail ainda não foi confirmado! Verifique sua caixa de entrada (ou pasta de spam) e clique no link de ativação enviado.');
        err.code = 'email_not_confirmed';
        throw err;
      }
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('E-mail ou senha incorretos. Por favor, verifique os dados digitados.');
      }
      throw new Error(error.message);
    }

    const u = data.user;
    const nomeFull = u.user_metadata?.full_name || u.user_metadata?.name || u.email.split('@')[0];
    const usuario = {
      id: u.id,
      email: u.email,
      name: nomeFull,
      nome: nomeFull,
      avatar: u.user_metadata?.avatar_url || u.user_metadata?.picture || null,
      isDemo: false
    };
    localStorage.setItem('aprendidos_usuario', JSON.stringify(usuario));

    const safeRedirect = sanitizeRedirectPath(redirectPath, 'index.html');
    if (safeRedirect) {
      window.location.href = safeRedirect;
    }
    return { user: usuario, session: data.session };
  }

  // Fallback demo caso Supabase NÃO esteja configurado
  const mockEmailName = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
  const mockUser = {
    id: 'demo_' + Date.now(),
    email,
    name: mockEmailName,
    nome: mockEmailName,
    avatar: null,
    provider: 'email',
    isDemo: true
  };
  localStorage.setItem('aprendidos_usuario', JSON.stringify(mockUser));
  const safeRedirect = sanitizeRedirectPath(redirectPath, 'index.html');
  if (safeRedirect) {
    window.location.href = safeRedirect;
  }
  return { user: mockUser };
}

/**
 * Solicita ao Supabase um link de redefinição de senha por e-mail.
 */
export async function requestPasswordReset(email) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) throw new Error('Informe seu e-mail.');

  const client = await getSupabase();
  if (!client || !isSupabaseConfigured()) {
    throw new Error('A recuperação de senha está indisponível no modo de demonstração.');
  }

  const redirectTo = new URL('login.html?redefinir-senha=true', window.location.href).href;
  const { error } = await client.auth.resetPasswordForEmail(cleanEmail, { redirectTo });
  if (error) throw error;
  return true;
}

/** Atualiza a senha depois que o usuário abre um link válido de recuperação. */
export async function updatePassword(password) {
  if (!password || password.length < 6) {
    throw new Error('A nova senha deve ter pelo menos 6 caracteres.');
  }

  const client = await getSupabase();
  if (!client || !isSupabaseConfigured()) {
    throw new Error('A redefinição de senha está indisponível no modo de demonstração.');
  }

  const { error } = await client.auth.updateUser({ password });
  if (error) throw error;
  return true;
}

/**
 * Logout
 */
export async function signOut(redirectPath = 'login.html') {
  const client = await getSupabase();
  if (client) {
    try { await client.auth.signOut(); } catch (e) { }
  }
  localStorage.removeItem('aprendidos_usuario');
  const safeRedirect = sanitizeRedirectPath(redirectPath, 'login.html');
  if (safeRedirect) {
    window.location.href = safeRedirect;
  }
}

const progressStorage = {
  getItem(key) {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(key);
  },
  setItem(key, value) {
    if (typeof localStorage === 'undefined') throw new Error('Armazenamento local indisponível.');
    localStorage.setItem(key, value);
  },
  removeItem(key) {
    if (typeof localStorage === 'undefined') throw new Error('Armazenamento local indisponível.');
    localStorage.removeItem(key);
  }
};

const progressStore = createProgressStore({
  getCurrentUser,
  getSupabase,
  storage: progressStorage,
  logger: console
});

/** Salva o progresso e informa se ficou local, sincronizado ou falhou. */
export async function saveLessonProgress(lessonId, data = {}) {
  return progressStore.saveLessonProgress(lessonId, data);
}

/** Recupera progresso com a origem e o estado de sincronização explícitos. */
export async function getLessonProgress() {
  return progressStore.getLessonProgress();
}

/**
 * Inicializa e valida a sessão do Supabase.
 * Usado pelas páginas protegidas (menu.html, etc.) para aguardar
 * a verificação real antes de decidir redirecionar.
 *
 * @returns {{ user: object|null, isAuthenticated: boolean }}
 */
export async function initSession() {
  const client = await getSupabase();
  if (client) {
    try {
      // Processa possíveis tokens no hash (retorno do OAuth)
      // O Supabase SDK já faz isso via onAuthStateChange,
      // mas getSession garante que esperamos a conclusão.
      const { data: { session }, error } = await client.auth.getSession();
      if (session && session.user && !error) {
        const u = session.user;
        const nomeFull = u.user_metadata?.full_name || u.user_metadata?.name || u.email.split('@')[0];
        const usuario = {
          id: u.id,
          email: u.email,
          name: nomeFull,
          nome: nomeFull,
          avatar: u.user_metadata?.avatar_url || u.user_metadata?.picture || null,
          isDemo: false
        };
        localStorage.setItem('aprendidos_usuario', JSON.stringify(usuario));
        return { user: usuario, isAuthenticated: true };
      }
    } catch (e) {
      console.warn('Erro ao inicializar sessão Supabase:', e);
    }
  }

  // Modo Demo: aceita localStorage somente quando Supabase NÃO está configurado
  if (!isSupabaseConfigured()) {
    try {
      const raw = localStorage.getItem('aprendidos_usuario');
      if (raw) {
        const parsed = JSON.parse(raw);
        return { user: { ...parsed, isDemo: true }, isAuthenticated: true };
      }
    } catch (e) { /* storage bloqueado */ }
  }

  // Nenhuma sessão válida — limpa possíveis dados obsoletos
  localStorage.removeItem('aprendidos_usuario');
  return { user: null, isAuthenticated: false };
}

// Expõe globalmente no window para compatibilidade com qualquer script
if (typeof window !== 'undefined') {
  window.AprendIDosAuth = {
    getSupabase,
    getCurrentUser,
    initSession,
    signInWithProvider,
    signUpWithEmail,
    resendConfirmationEmail,
    signInWithEmail,
    requestPasswordReset,
    updatePassword,
    signOut,
    saveLessonProgress,
    getLessonProgress,
    getProgressStorageKey
  };
}
