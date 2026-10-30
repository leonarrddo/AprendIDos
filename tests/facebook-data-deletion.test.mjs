import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import {
  decodeAndVerifySignedRequest,
  handleFacebookDataDeletion,
  handleFacebookDataDeletionStatus
} from '../lib/facebook-data-deletion.js';

const APP_SECRET = 'meta-app-secret-for-tests-only';
const SUPABASE_URL = 'https://example.supabase.co';
const SERVICE_KEY = 'service-role-test-only';
const SITE_URL = 'https://aprendidos.vercel.app';

function base64Url(value) {
  return Buffer.from(value).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function makeSignedRequest(payload, secret = APP_SECRET) {
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signature = createHmac('sha256', secret).update(encodedPayload).digest();
  return `${base64Url(signature)}.${encodedPayload}`;
}

function responseRecorder() {
  return {
    statusCode: null,
    headers: {},
    body: null,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    end(body) { this.body = body; return this; }
  };
}

test('valida signed_request HMAC-SHA256 e rejeita assinatura ou algoritmo inválidos', () => {
  const signed = makeSignedRequest({ algorithm: 'HMAC-SHA256', user_id: '1234567890' });
  assert.deepEqual(decodeAndVerifySignedRequest(signed, APP_SECRET), {
    algorithm: 'HMAC-SHA256',
    user_id: '1234567890'
  });
  assert.throws(() => decodeAndVerifySignedRequest(makeSignedRequest({ algorithm: 'HMAC-SHA256', user_id: '1234567890' }, 'wrong-secret'), APP_SECRET));
  assert.throws(() => decodeAndVerifySignedRequest(makeSignedRequest({ algorithm: 'sha1', user_id: '1234567890' }), APP_SECRET));
});

test('callback recusa método ou assinatura inválidos sem persistir a solicitação', async () => {
  let fetchCalls = 0;
  const options = { env: { META_APP_SECRET: APP_SECRET, SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY, PUBLIC_SITE_URL: SITE_URL, SUPABASE_URL }, fetchImpl: async () => { fetchCalls++; } };
  const methodResponse = responseRecorder();
  await handleFacebookDataDeletion({ method: 'GET' }, methodResponse, options);
  assert.equal(methodResponse.statusCode, 405);

  const invalidResponse = responseRecorder();
  await handleFacebookDataDeletion({ method: 'POST', body: { signed_request: 'invalid' } }, invalidResponse, options);
  assert.equal(invalidResponse.statusCode, 400);
  assert.equal(fetchCalls, 0);
});

test('callback verifica o usuário Meta, registra pedido pendente e retorna código e URL de status', async () => {
  const signed = makeSignedRequest({ algorithm: 'HMAC-SHA256', user_id: '1234567890' });
  let stored;
  const options = {
    env: { META_APP_SECRET: APP_SECRET, SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY, PUBLIC_SITE_URL: SITE_URL, SUPABASE_URL },
    randomBytes: () => Buffer.from('0123456789abcdef0123456789abcdef', 'hex'),
    fetchImpl: async (url, init) => {
      stored = { url, init, row: JSON.parse(init.body) };
      return { ok: true, status: 201 };
    }
  };
  const response = responseRecorder();
  await handleFacebookDataDeletion({ method: 'POST', body: { signed_request: signed } }, response, options);

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
  assert.equal(response.body.confirmation_code, '0123456789ABCDEF0123456789ABCDEF');
  assert.equal(response.body.url, `${SITE_URL}/exclusao-dados.html?code=0123456789ABCDEF0123456789ABCDEF`);
  assert.equal(stored.row.meta_user_id, '1234567890');
  assert.equal(stored.row.status, 'received');
  assert.equal(stored.init.headers.Authorization, `Bearer ${SERVICE_KEY}`);
});

test('callback aceita signed_request em formulário e não confirma quando a persistência falha', async () => {
  const signed = makeSignedRequest({ algorithm: 'HMAC-SHA256', user_id: '987654321' });
  const response = responseRecorder();
  await handleFacebookDataDeletion({
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: `signed_request=${encodeURIComponent(signed)}`
  }, response, {
    env: { META_APP_SECRET: APP_SECRET, SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY, PUBLIC_SITE_URL: SITE_URL, SUPABASE_URL },
    fetchImpl: async () => ({ ok: false, status: 401 })
  });
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.url, undefined);
  assert.equal(response.body.confirmation_code, undefined);
});

test('chave secreta Supabase sb_secret é enviada como apikey sem tratá-la como JWT bearer', async () => {
  const signed = makeSignedRequest({ algorithm: 'HMAC-SHA256', user_id: '333333333' });
  let requestHeaders;
  const response = responseRecorder();
  await handleFacebookDataDeletion({ method: 'POST', body: { signed_request: signed } }, response, {
    env: { META_APP_SECRET: APP_SECRET, SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_test-only', PUBLIC_SITE_URL: SITE_URL, SUPABASE_URL },
    randomBytes: () => Buffer.alloc(16, 1),
    fetchImpl: async (_url, init) => {
      requestHeaders = init.headers;
      return { ok: true, status: 201 };
    }
  });
  assert.equal(response.statusCode, 200);
  assert.equal(requestHeaders.apikey, 'sb_secret_test-only');
  assert.equal(requestHeaders.Authorization, undefined);
});

test('status retorna apenas o estado da solicitação e não expõe o identificador Meta', async () => {
  let requestedUrl;
  const response = responseRecorder();
  await handleFacebookDataDeletionStatus({ method: 'GET', query: { code: '0123456789ABCDEF0123456789ABCDEF' } }, response, {
    env: { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY },
    fetchImpl: async (url) => {
      requestedUrl = url;
      return { ok: true, json: async () => [{ confirmation_code: '0123456789ABCDEF0123456789ABCDEF', status: 'in_review', requested_at: '2026-10-29T12:00:00Z', updated_at: '2026-10-29T12:00:00Z', meta_user_id: 'must-not-leak' }] };
    }
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.status, 'in_review');
  assert.equal(JSON.stringify(response.body).includes('must-not-leak'), false);
  assert.match(requestedUrl, /facebook_data_deletion_requests/);
});

test('status não aceita código arbitrário e informa solicitação desconhecida', async () => {
  let fetchCalls = 0;
  const env = { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY };
  const invalid = responseRecorder();
  await handleFacebookDataDeletionStatus({ method: 'GET', query: { code: 'not-a-code' } }, invalid, { env, fetchImpl: async () => { fetchCalls++; } });
  assert.equal(invalid.statusCode, 400);
  assert.equal(fetchCalls, 0);

  const missing = responseRecorder();
  await handleFacebookDataDeletionStatus({ method: 'GET', query: { code: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' } }, missing, { env, fetchImpl: async () => ({ ok: true, json: async () => [] }) });
  assert.equal(missing.statusCode, 404);
});

test('página e migração mantêm a solicitação pendente sem expor ou apagar dados por padrão', async () => {
  const page = await (await import('node:fs/promises')).readFile(new URL('../exclusao-dados.html', import.meta.url), 'utf8');
  const script = await (await import('node:fs/promises')).readFile(new URL('../data-deletion-status.js', import.meta.url), 'utf8');
  const migration = await (await import('node:fs/promises')).readFile(new URL('../supabase/migrations/20261029120000_facebook_data_deletion_requests.sql', import.meta.url), 'utf8');
  const serviceWorker = await (await import('node:fs/promises')).readFile(new URL('../sw.js', import.meta.url), 'utf8');
  assert.match(page, /statusSolicitacao/);
  assert.match(script, /facebook-data-deletion-status/);
  assert.match(migration, /ENABLE ROW LEVEL SECURITY/i);
  assert.match(migration, /REVOKE ALL/i);
  assert.doesNotMatch(migration, /DELETE\s+FROM\s+auth\.users/i);
  assert.match(serviceWorker, /url\.pathname\.startsWith\(['"]\/api\/['"]\)/);
});
