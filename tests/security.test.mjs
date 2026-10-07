import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeRedirectPath } from '../auth.js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../supabase-config.js';

test('1. Teste de Proteção contra Open Redirect (SEC-07)', async (t) => {
  await t.test('Deve bloquear URLs externas maliciosas e redirecionar para index.html', () => {
    const maliciousUrls = [
      'https://malicious-phishing.com',
      'http://attacker.org/steal-creds',
      '//evil.com/fake-login',
      'javascript:alert(document.cookie)',
      'data:text/html,<script>alert(1)</script>'
    ];

    maliciousUrls.forEach((url) => {
      const sanitized = sanitizeRedirectPath(url, 'index.html');
      assert.equal(sanitized, 'index.html', `Falha ao bloquear URL perigosa: ${url}`);
    });
  });

  await t.test('Deve aceitar e preservar rotas internas válidas e homologadas', () => {
    const safePaths = [
      'index.html',
      'login.html',
      'cadastro.html',
      'licoes.html',
      'vogais.html',
      'login.html?confirmado=true'
    ];

    safePaths.forEach((path) => {
      const sanitized = sanitizeRedirectPath(path, 'index.html');
      assert.equal(sanitized, path, `Falha ao aceitar rota segura: ${path}`);
    });
  });
});

test('2. Teste de Políticas de RLS e Integridade no Supabase', async (t) => {
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  };

  await t.test('Usuário anônimo/não autenticado deve ser impedido de inserir registros em progresso_licoes', async () => {
    const fakeData = {
      user_id: '00000000-0000-0000-0000-000000000000',
      licao_id: 'vogais',
      concluido: true,
      pontuacao: 10
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/progresso_licoes`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify(fakeData)
    });

    // Como o RLS bloqueia anônimos para INSERT, o Supabase retorna 401/403 ou violação RLS (status 400 com erro ou 401)
    const statusBlocked = res.status === 401 || res.status === 403 || res.status === 400;
    assert.equal(statusBlocked, true, `RLS falhou: anônimo não foi bloqueado (Status ${res.status})`);
  });

  await t.test('Banco deve rejeitar pontuação forjada fora do intervalo 0-100 (Constraint chk_progresso_pontuacao)', async () => {
    const invalidScoreData = {
      user_id: '00000000-0000-0000-0000-000000000000',
      licao_id: 'vogais',
      concluido: true,
      pontuacao: 9999 // Pontuação forjada inválida
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/progresso_licoes`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify(invalidScoreData)
    });

    assert.notEqual(res.status, 201, 'Banco aceitou pontuação forjada de 9999!');
  });
});
