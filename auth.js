/**
 * ============================================================================
 * AprendIDos - Módulo de Autenticação e Dados do Usuário
 * Arquivo: auth.js
 * ============================================================================
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from './supabase-config.js';

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
              const usuario = {
                id: u.id,
                email: u.email,
                name: u.user_metadata?.full_name || u.user_metadata?.name || u.email.split('@')[0],
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
      const { data: { user }, error } = await client.auth.getUser();
      if (user && !error) {
        const usuarioFormatado = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
          avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          isDemo: false
        };
        localStorage.setItem('aprendidos_usuario', JSON.stringify(usuarioFormatado));
        return usuarioFormatado;
      }
    } catch (e) {
      console.warn('Erro ao verificar sessão Supabase:', e);
    }
  }

  // Fallback no LocalStorage
  try {
    const demoUser = localStorage.getItem('aprendidos_usuario');
    if (demoUser) {
      return { ...JSON.parse(demoUser), isDemo: true };
    }
  } catch (e) {
    // Storage bloqueado
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
 */
export async function signInWithProvider(provider, redirectPath = 'index.html') {
  const safeRedirect = sanitizeRedirectPath(redirectPath, 'index.html');
  const client = await getSupabase();
  if (client) {
    try {
      const targetUrl = new URL(safeRedirect, window.location.href).href;
      const { data, error } = await client.auth.signInWithOAuth({
        provider: provider,
        options: { redirectTo: targetUrl }
      });
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn('Falha no OAuth real, fallback para demo:', e);
    }
  }

  // Simulação no Modo Demonstração
  const mockName = provider === 'google' ? 'Manoel da Silva (Google)' : 'Maria Oliveira (Facebook)';
  const mockUser = {
    id: 'demo_' + Date.now(),
    email: `${provider}.demo@aprendidos.com.br`,
    name: mockName,
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
  const mockUser = { id: 'demo_' + Date.now(), email, name, avatar: null, provider: 'email', isDemo: true };
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
    const usuario = {
      id: u.id,
      email: u.email,
      name: u.user_metadata?.full_name || u.user_metadata?.name || u.email.split('@')[0],
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

  // Fallback demo caso não configurado
  const mockUser = {
    id: 'demo_' + Date.now(),
    email,
    name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
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

/**
 * Salva o progresso de uma lição
 */
export async function saveLessonProgress(lessonId, data = {}) {
  const user = await getCurrentUser();
  const storageKey = `aprendidos_progresso_${user ? user.id : 'anon'}`;

  let currentProgress = {};
  try {
    currentProgress = JSON.parse(localStorage.getItem(storageKey) || '{}');
  } catch (e) { }

  currentProgress[lessonId] = {
    completed: true,
    score: data.score ?? 10,
    updatedAt: new Date().toISOString(),
    ...data
  };

  try {
    localStorage.setItem(storageKey, JSON.stringify(currentProgress));
  } catch (e) { }

  try {
    const legacy = JSON.parse(localStorage.getItem('aprendidos_progresso') || '{}');
    legacy[lessonId] = currentProgress[lessonId];
    localStorage.setItem('aprendidos_progresso', JSON.stringify(legacy));
  } catch (e) { }

  try {
    const anon = JSON.parse(localStorage.getItem('aprendidos_progresso_anon') || '{}');
    anon[lessonId] = currentProgress[lessonId];
    localStorage.setItem('aprendidos_progresso_anon', JSON.stringify(anon));
  } catch (e) { }

  const client = await getSupabase();
  if (client && user && !user.isDemo) {
    try {
      await client.from('progresso_licoes').upsert({
        user_id: user.id,
        licao_id: lessonId,
        concluido: true,
        pontuacao: data.score ?? 10,
        atualizado_em: new Date().toISOString()
      }, { onConflict: 'user_id, licao_id' });
    } catch (e) {
      console.warn('Erro ao salvar progresso no Supabase:', e);
    }
  }

  return currentProgress;
}

/**
 * Obtém todo o progresso do usuário
 */
export async function getLessonProgress() {
  const user = await getCurrentUser();
  const storageKey = `aprendidos_progresso_${user ? user.id : 'anon'}`;

  let progress = {};
  try {
    progress = JSON.parse(localStorage.getItem(storageKey) || '{}');
  } catch (e) { }

  try {
    const legacy = JSON.parse(localStorage.getItem('aprendidos_progresso') || '{}');
    progress = { ...legacy, ...progress };
  } catch (e) { }
  try {
    const anon = JSON.parse(localStorage.getItem('aprendidos_progresso_anon') || '{}');
    progress = { ...anon, ...progress };
  } catch (e) { }

  const client = await getSupabase();
  if (client && user && !user.isDemo) {
    try {
      const { data, error } = await client
        .from('progresso_licoes')
        .select('*')
        .eq('user_id', user.id);

      if (!error && data) {
        data.forEach(item => {
          progress[item.licao_id] = {
            completed: item.concluido,
            score: item.pontuacao,
            updatedAt: item.atualizado_em
          };
        });
      }
    } catch (e) { }
  }

  return progress;
}

// Expõe globalmente no window para compatibilidade com qualquer script
if (typeof window !== 'undefined') {
  window.AprendIDosAuth = {
    getSupabase,
    getCurrentUser,
    signInWithProvider,
    signUpWithEmail,
    resendConfirmationEmail,
    signInWithEmail,
    signOut,
    saveLessonProgress,
    getLessonProgress
  };
}
