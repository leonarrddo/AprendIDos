/**
 * ============================================================================
 * AprendIDos - Configuração do Supabase (BaaS)
 * Arquivo: supabase-config.js
 * 
 * INSTRUÇÕES PARA O SEU TCC:
 * 1. Crie seu projeto gratuito em https://supabase.com
 * 2. Copie a "Project URL" e a "anon / public key" em Project Settings > API
 * 3. Cole nas constantes abaixo.
 * 
 * Se as chaves estiverem vazias, o sistema funcionará automaticamente em 
 * "MODO DEMO LOCAL" (armazenando na memória do navegador / localStorage),
 * permitindo testar e apresentar o projeto perfeitamente sem falhas!
 * ============================================================================
 */

export const SUPABASE_URL = 'https://ggptdxmsrsfrpvntlfja.supabase.co';
export const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANON_AQUI';

// Detecta se o usuário já inseriu as credenciais reais do Supabase
export const isSupabaseConfigured = () => {
  return SUPABASE_URL !== 'https://SEU_PROJETO_AQUI.supabase.co' && 
         SUPABASE_ANON_KEY !== 'SUA_CHAVE_ANON_AQUI' &&
         SUPABASE_URL.startsWith('https://') &&
         SUPABASE_ANON_KEY.length > 20;
};
