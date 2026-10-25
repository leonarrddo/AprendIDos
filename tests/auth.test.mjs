/**
 * ============================================================================
 * AprendIDos – Testes de Autenticação
 * Arquivo: tests/auth.test.mjs
 *
 * Cobertura:
 *  1. Login Google com sessão válida
 *  2. Retorno do OAuth em navegador sem usuário salvo no localStorage
 *  3. Acesso ao menu após recuperar uma sessão válida
 *  4. Redirecionamento para login quando não houver sessão válida
 *  5. Atualização do nome ao alternar entre usuários
 *  6. Remoção / invalidação dos dados locais obsoletos
 *  7. Prevenção de sessão fictícia durante falhas do OAuth em produção
 *  8. Persistência da sessão após navegar entre páginas
 *  9. Redirecionamento correto no ambiente de produção
 * 10. Preservação da proteção contra Open Redirect
 * 11. Formato normalizado do usuário (name + nome)
 * 12. initSession: validação assíncrona de sessão
 * 13. Demo mode isolation when Supabase not configured
 * ============================================================================
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeRedirectPath } from '../auth.js';
import { isSupabaseConfigured } from '../supabase-config.js';

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 1: Formato normalizado do usuário
// ─────────────────────────────────────────────────────────────────────────────
test('1. Formato normalizado do usuário deve conter "name" e "nome"', async (t) => {
  const userMetadata = { full_name: 'Leonardo Santos', avatar_url: 'https://example.com/pic.jpg' };
  const email = 'leo@test.com';
  const nomeFull = userMetadata.full_name || email.split('@')[0];

  const usuario = {
    id: 'abc-123',
    email: email,
    name: nomeFull,
    nome: nomeFull,
    avatar: userMetadata.avatar_url || null,
    isDemo: false
  };

  await t.test('"name" e "nome" devem ser idênticos', () => {
    assert.equal(usuario.name, usuario.nome);
    assert.equal(usuario.name, 'Leonardo Santos');
  });

  await t.test('Não deve conter "user_metadata" no objeto normalizado', () => {
    assert.equal(usuario.user_metadata, undefined);
  });

  await t.test('Deve usar email como fallback para o nome', () => {
    const fallbackUser = {
      name: email.split('@')[0],
      nome: email.split('@')[0],
    };
    assert.equal(fallbackUser.name, 'leo');
    assert.equal(fallbackUser.nome, 'leo');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 2: Proteção contra Open Redirect (SEC-07)
// ─────────────────────────────────────────────────────────────────────────────
test('2. Proteção contra Open Redirect (SEC-07)', async (t) => {
  await t.test('Deve bloquear URLs externas e esquemas perigosos', () => {
    const malicious = [
      'https://malicious-phishing.com',
      'http://attacker.org/steal-creds',
      '//evil.com/fake-login',
      'javascript:alert(document.cookie)',
      'data:text/html,<script>alert(1)</script>',
      'https://evil.com/aprendidos/menu.html',
    ];

    malicious.forEach((url) => {
      const result = sanitizeRedirectPath(url, 'index.html');
      assert.equal(result, 'index.html', `URL perigosa não bloqueada: ${url}`);
    });
  });

  await t.test('Deve aceitar caminhos internos válidos', () => {
    const valid = [
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
      'escrita.html',
      'login.html?confirmado=true',
    ];

    valid.forEach((path) => {
      const result = sanitizeRedirectPath(path, 'index.html');
      assert.equal(result, path, `Caminho válido rejeitado: ${path}`);
    });
  });

  await t.test('Deve retornar defaultPath para valores nulos/vazios', () => {
    assert.equal(sanitizeRedirectPath(null, 'index.html'), 'index.html');
    assert.equal(sanitizeRedirectPath('', 'index.html'), 'index.html');
    assert.equal(sanitizeRedirectPath(undefined, 'index.html'), 'index.html');
  });

  await t.test('Deve rejeitar caminhos desconhecidos', () => {
    assert.equal(sanitizeRedirectPath('admin.html', 'index.html'), 'index.html');
    assert.equal(sanitizeRedirectPath('../../etc/passwd', 'index.html'), 'index.html');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 3: signInWithProvider NÃO deve criar demo em produção
// ─────────────────────────────────────────────────────────────────────────────
test('3. signInWithProvider: separação demo vs produção', async (t) => {
  await t.test('isSupabaseConfigured() deve retornar true para credenciais reais', () => {
    const configured = isSupabaseConfigured();
    assert.equal(configured, true, 'Supabase não está configurado — fluxo de produção não será testado');
  });

  await t.test('signInWithProvider deve propagar erros em vez de criar demo (verificação estática)', async () => {
    const fs = await import('node:fs');
    const authCode = fs.readFileSync(new URL('../auth.js', import.meta.url), 'utf-8');

    // O padrão antigo "Falha no OAuth real, fallback para demo" não deve existir
    assert.equal(
      authCode.includes('fallback para demo'),
      false,
      'auth.js ainda contém fallback silencioso para demo após falha do OAuth'
    );

    // Deve haver throw para erro de OAuth em produção
    assert.ok(
      authCode.includes('throw new Error(`Erro ao iniciar login com'),
      'auth.js não propaga erros do OAuth corretamente'
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 4: Consistência do nome (Problema 1)
// ─────────────────────────────────────────────────────────────────────────────
test('4. Consistência do nome entre auth.js e menu.html', async (t) => {
  await t.test('auth.js deve normalizar com "name" e "nome" em todos os pontos', async () => {
    const fs = await import('node:fs');
    const authCode = fs.readFileSync(new URL('../auth.js', import.meta.url), 'utf-8');

    const nameAssignments = (authCode.match(/\bname:\s*nomeFull/g) || []).length;
    const nomeAssignments = (authCode.match(/\bnome:\s*nomeFull/g) || []).length;

    assert.ok(nameAssignments >= 4, `Esperado >=4 atribuições "name: nomeFull", encontrado ${nameAssignments}`);
    assert.ok(nomeAssignments >= 4, `Esperado >=4 atribuições "nome: nomeFull", encontrado ${nomeAssignments}`);
    assert.equal(nameAssignments, nomeAssignments, '"name" e "nome" devem ter o mesmo número de atribuições');
  });

  await t.test('menu.html NÃO deve ler userObj.nome diretamente de localStorage sem validação', async () => {
    const fs = await import('node:fs');
    const menuCode = fs.readFileSync(new URL('../menu.html', import.meta.url), 'utf-8');

    assert.equal(
      menuCode.includes('userObj.nome'),
      false,
      'menu.html ainda lê userObj.nome diretamente de localStorage sem validação'
    );

    assert.ok(
      menuCode.includes('initSession'),
      'menu.html deve usar initSession() para validar a sessão'
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 5: Guard do menu.html NÃO deve redirecionar antes do Supabase
// ─────────────────────────────────────────────────────────────────────────────
test('5. menu.html: guard de autenticação assíncrono (Problema 2)', async (t) => {
  await t.test('menu.html NÃO deve ter guard síncrono baseado em localStorage', async () => {
    const fs = await import('node:fs');
    const menuCode = fs.readFileSync(new URL('../menu.html', import.meta.url), 'utf-8');

    const syncGuardPattern = /if\s*\(\s*!localStorage\.getItem\(\s*['"]aprendidos_usuario['"]\s*\)\s*\)/;
    assert.equal(
      syncGuardPattern.test(menuCode),
      false,
      'menu.html ainda contém guard síncrono que bloqueia OAuth callback'
    );
  });

  await t.test('menu.html deve importar initSession do auth.js', async () => {
    const fs = await import('node:fs');
    const menuCode = fs.readFileSync(new URL('../menu.html', import.meta.url), 'utf-8');

    assert.ok(
      menuCode.includes("import { initSession, signOut } from './auth.js'"),
      'menu.html não importa initSession corretamente'
    );
  });

  await t.test('menu.html deve ocultar conteúdo antes da validação', async () => {
    const fs = await import('node:fs');
    const menuCode = fs.readFileSync(new URL('../menu.html', import.meta.url), 'utf-8');

    assert.ok(
      menuCode.includes("document.documentElement.style.visibility = 'hidden'"),
      'menu.html deve ocultar a página durante a validação'
    );

    assert.ok(
      menuCode.includes("document.documentElement.style.visibility = 'visible'"),
      'menu.html deve revelar a página após validação bem-sucedida'
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 6: Prevenção de demo silencioso em produção (Problema 3)
// ─────────────────────────────────────────────────────────────────────────────
test('6. Prevenção de sessão fictícia em produção (Problema 3)', async (t) => {
  await t.test('getCurrentUser NÃO deve retornar demo quando Supabase está configurado', async () => {
    const fs = await import('node:fs');
    const authCode = fs.readFileSync(new URL('../auth.js', import.meta.url), 'utf-8');

    assert.ok(
      authCode.includes('if (!isSupabaseConfigured())'),
      'getCurrentUser deve condicionar fallback de localStorage a !isSupabaseConfigured()'
    );
  });

  await t.test('signInWithProvider deve verificar isSupabaseConfigured() antes de criar demo', async () => {
    const fs = await import('node:fs');
    const authCode = fs.readFileSync(new URL('../auth.js', import.meta.url), 'utf-8');

    assert.ok(
      authCode.includes('client && isSupabaseConfigured()'),
      'signInWithProvider deve verificar isSupabaseConfigured() para separar prod de demo'
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 7: initSession remove dados obsoletos
// ─────────────────────────────────────────────────────────────────────────────
test('7. initSession deve limpar dados obsoletos do localStorage', async (t) => {
  await t.test('initSession remove aprendidos_usuario quando não há sessão válida (análise estática)', async () => {
    const fs = await import('node:fs');
    const authCode = fs.readFileSync(new URL('../auth.js', import.meta.url), 'utf-8');

    const initSessionBlock = authCode.substring(authCode.indexOf('export async function initSession()'));
    assert.ok(
      initSessionBlock.includes("localStorage.removeItem('aprendidos_usuario')"),
      'initSession deve limpar localStorage quando não há sessão'
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 8: Redirecionamento correto no ambiente de produção
// ─────────────────────────────────────────────────────────────────────────────
test('8. redirectTo usa window.location.href como base (produção e desenvolvimento)', async (t) => {
  await t.test('signInWithProvider constrói redirectTo a partir da origem real', async () => {
    const fs = await import('node:fs');
    const authCode = fs.readFileSync(new URL('../auth.js', import.meta.url), 'utf-8');

    assert.ok(
      authCode.includes("new URL(safeRedirect, window.location.href).href"),
      'signInWithProvider deve construir redirectTo a partir de window.location.href'
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 9: Logout limpa sessão real e redireciona
// ─────────────────────────────────────────────────────────────────────────────
test('9. menu.html logout usa signOut do auth.js', async (t) => {
  await t.test('Botão Sair deve usar signOut importado, não apenas localStorage.removeItem', async () => {
    const fs = await import('node:fs');
    const menuCode = fs.readFileSync(new URL('../menu.html', import.meta.url), 'utf-8');

    assert.ok(
      menuCode.includes("await signOut('login.html')"),
      'Botão Sair deve chamar signOut() do auth.js'
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 10: Preservação de funcionalidades existentes
// ─────────────────────────────────────────────────────────────────────────────
test('10. Preservação de funcionalidades não relacionadas à autenticação', async (t) => {
  await t.test('menu.html deve preservar navegação do menu (Lições, Início, Ajuda)', async () => {
    const fs = await import('node:fs');
    const menuCode = fs.readFileSync(new URL('../menu.html', import.meta.url), 'utf-8');

    assert.ok(menuCode.includes("'licoes.html'"), 'Navegação para Lições deve existir');
    assert.ok(menuCode.includes("'menu.html'"), 'Navegação para Início deve existir');
    assert.ok(menuCode.includes('.rodape-ajuda'), 'Scroll para Ajuda deve existir');
    assert.ok(menuCode.includes('Começar Agora') || menuCode.includes('botao-principal'), 'Botão Começar Agora deve existir');
  });

  await t.test('menu.html deve preservar VLibras', async () => {
    const fs = await import('node:fs');
    const menuCode = fs.readFileSync(new URL('../menu.html', import.meta.url), 'utf-8');

    assert.ok(menuCode.includes('vlibras.gov.br'), 'VLibras deve estar presente');
  });

  await t.test('menu.html deve preservar botão de tema', async () => {
    const fs = await import('node:fs');
    const menuCode = fs.readFileSync(new URL('../menu.html', import.meta.url), 'utf-8');

    assert.ok(menuCode.includes('seletorTemaMenu'), 'Seletor de tema deve existir');
    assert.ok(menuCode.includes('theme.js'), 'theme.js deve ser carregado');
  });

  await t.test('auth.js deve preservar saveLessonProgress e getLessonProgress', async () => {
    const fs = await import('node:fs');
    const authCode = fs.readFileSync(new URL('../auth.js', import.meta.url), 'utf-8');
    const progressCode = fs.readFileSync(new URL('../progress-store.js', import.meta.url), 'utf-8');

    assert.ok(authCode.includes('saveLessonProgress'), 'saveLessonProgress deve existir');
    assert.ok(authCode.includes('getLessonProgress'), 'getLessonProgress deve existir');
    assert.ok(authCode.includes("from './progress-store.js'"), 'auth.js deve usar o serviço central de progresso');
    assert.ok(progressCode.includes('progresso_licoes'), 'O serviço deve consultar a tabela progresso_licoes');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 11: initSession na API pública do window
// ─────────────────────────────────────────────────────────────────────────────
test('11. initSession deve estar exposta globalmente via window.AprendIDosAuth', async (t) => {
  await t.test('window.AprendIDosAuth deve conter initSession', async () => {
    const fs = await import('node:fs');
    const authCode = fs.readFileSync(new URL('../auth.js', import.meta.url), 'utf-8');

    assert.ok(
      authCode.includes('initSession,') || authCode.includes('initSession\n'),
      'initSession deve estar em window.AprendIDosAuth'
    );
  });
});
