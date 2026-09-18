/**
 * ============================================================================
 * AprendIDos - Módulo de Autenticação e Dados do Usuário
 * Arquivo: auth.js
 * ============================================================================
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from './supabase-config.js';

let supabase = null;

// Tenta inicializar o cliente Supabase se estiver configurado
async function initSupabaseClient() {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('✅ [AprendIDos] Conectado ao Supabase!');
    } catch (err) {
      console.warn('⚠️ [AprendIDos] Erro ao carregar SDK do Supabase. Usando Modo Demo Local.', err);
    }
  }
}

initSupabaseClient();

/**
 * Retorna o usuário atualmente logado
 */
export async function getCurrentUser() {
  if (supabase) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user && !error) {
        return {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
          avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          isDemo: false
        };
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
    // Caso storage esteja bloqueado
  }

  return null;
}

/**
 * Login com Google ou Facebook
 */
export async function signInWithProvider(provider, redirectPath = 'index.html') {
  if (supabase) {
    try {
      const targetUrl = new URL(redirectPath, window.location.href).href;
      const { data, error } = await supabase.auth.signInWithOAuth({
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
    avatar: provider === 'google'
      ? ''
      : '',
    provider: provider
  };

  localStorage.setItem('aprendidos_usuario', JSON.stringify(mockUser));
  await new Promise(r => setTimeout(r, 400));
  window.location.href = redirectPath;
  return { user: mockUser };
}

/**
 * Cadastro com E-mail e Senha
 */
export async function signUpWithEmail(name, email, password, redirectPath = 'index.html') {
  if (!name || !email || !password) throw new Error('Preencha todos os campos obrigatórios.');
  if (password.length < 6) throw new Error('A senha deve ter no mínimo 6 caracteres.');

  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: { data: { full_name: name } }
      });
      if (error) throw error;
      if (data?.user) window.location.href = redirectPath;
      return data;
    } catch (e) {
      console.warn('Erro no cadastro Supabase, aplicando fallback local:', e);
    }
  }

  const mockUser = { id: 'demo_' + Date.now(), email, name, avatar: null, provider: 'email' };
  localStorage.setItem('aprendidos_usuario', JSON.stringify(mockUser));
  await new Promise(r => setTimeout(r, 400));
  window.location.href = redirectPath;
  return { user: mockUser };
}

/**
 * Login com E-mail e Senha
 */
export async function signInWithEmail(email, password, redirectPath = 'index.html') {
  if (!email || !password) throw new Error('Informe o e-mail e a senha.');

  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.href = redirectPath;
      return data;
    } catch (e) {
      console.warn('Erro login Supabase:', e);
      throw e;
    }
  }

  const mockUser = {
    id: 'demo_' + Date.now(),
    email,
    name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
    avatar: null,
    provider: 'email'
  };
  localStorage.setItem('aprendidos_usuario', JSON.stringify(mockUser));
  await new Promise(r => setTimeout(r, 400));
  window.location.href = redirectPath;
  return { user: mockUser };
}

/**
 * Logout
 */
export async function signOut(redirectPath = 'login.html') {
  if (supabase) {
    try { await supabase.auth.signOut(); } catch (e) { }
  }
  localStorage.removeItem('aprendidos_usuario');
  window.location.href = redirectPath;
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

  // Grava também nas chaves globais e de anon para total interoperabilidade
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

  if (supabase && user && !user.isDemo) {
    try {
      await supabase.from('progresso_licoes').upsert({
        user_id: user.id,
        licao_id: lessonId,
        concluido: true,
        pontuacao: data.score ?? 10,
        atualizado_em: new Date().toISOString()
      }, { onConflict: 'user_id, licao_id' });
    } catch (e) { }
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

  // Fallback e mesclagem de chaves adicionais para não perder progresso
  try {
    const legacy = JSON.parse(localStorage.getItem('aprendidos_progresso') || '{}');
    progress = { ...legacy, ...progress };
  } catch (e) { }
  try {
    const anon = JSON.parse(localStorage.getItem('aprendidos_progresso_anon') || '{}');
    progress = { ...anon, ...progress };
  } catch (e) { }

  if (supabase && user && !user.isDemo) {
    try {
      const { data, error } = await supabase
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

// Expõe globalmente no window para compatibilidade com qualquer contexto
if (typeof window !== 'undefined') {
  window.AprendIDosAuth = {
    getCurrentUser,
    signInWithProvider,
    signUpWithEmail,
    signInWithEmail,
    signOut,
    saveLessonProgress,
    getLessonProgress
  };
}
