import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const MAX_BODY_BYTES = 16 * 1024;
const CONFIRMATION_CODE_PATTERN = /^[A-F0-9]{32}$/;

function decodeBase64Url(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error('Formato assinado inválido.');
  }
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64 + '='.repeat((4 - (base64.length % 4)) % 4), 'base64');
}

export function decodeAndVerifySignedRequest(signedRequest, appSecret) {
  if (typeof appSecret !== 'string' || appSecret.length === 0) throw new Error('Segredo não configurado.');
  if (typeof signedRequest !== 'string' || signedRequest.length > 12_000) throw new Error('Solicitação assinada inválida.');
  const parts = signedRequest.split('.');
  if (parts.length !== 2) throw new Error('Solicitação assinada inválida.');
  const [encodedSignature, encodedPayload] = parts;
  const signature = decodeBase64Url(encodedSignature);
  const expectedSignature = createHmac('sha256', appSecret).update(encodedPayload).digest();
  if (signature.length !== expectedSignature.length || !timingSafeEqual(signature, expectedSignature)) {
    throw new Error('Assinatura inválida.');
  }

  let payload;
  try {
    payload = JSON.parse(decodeBase64Url(encodedPayload).toString('utf8'));
  } catch {
    throw new Error('Conteúdo assinado inválido.');
  }
  if (!payload || payload.algorithm !== 'HMAC-SHA256' || typeof payload.user_id !== 'string' || !/^\d{1,64}$/.test(payload.user_id)) {
    throw new Error('Identidade assinada inválida.');
  }
  return payload;
}

async function readRequestBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  if (Buffer.isBuffer(req.body)) return parseBody(req.body.toString('utf8'), req.headers?.['content-type']);
  if (typeof req.body === 'string') return parseBody(req.body, req.headers?.['content-type']);

  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BODY_BYTES) throw new Error('Corpo da solicitação excede o limite.');
    chunks.push(chunk);
  }
  return parseBody(Buffer.concat(chunks).toString('utf8'), req.headers?.['content-type']);
}

function parseBody(raw, contentType = '') {
  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) throw new Error('Corpo da solicitação excede o limite.');
  if (contentType.includes('application/json')) return JSON.parse(raw || '{}');
  const form = new URLSearchParams(raw);
  return Object.fromEntries(form.entries());
}

function jsonResponse(res, statusCode, body) {
  res.setHeader?.('Content-Type', 'application/json; charset=utf-8');
  res.setHeader?.('Cache-Control', 'no-store');
  if (typeof res.status === 'function' && typeof res.json === 'function') return res.status(statusCode).json(body);
  res.statusCode = statusCode;
  return res.end(JSON.stringify(body));
}

function getEnv(options) {
  return options?.env || process.env;
}

function requiredBackendConfig(env) {
  const baseUrl = String(env.SUPABASE_URL || '').replace(/\/$/, '');
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!/^https:\/\//i.test(baseUrl) || typeof serviceKey !== 'string' || !serviceKey) return null;
  return { baseUrl, serviceKey };
}

function serviceRoleHeaders(serviceKey, includeJson = false) {
  const headers = { apikey: serviceKey };
  // New Supabase secret keys are API keys, not JWT bearer tokens. Legacy
  // service_role keys remain JWTs and continue to work in Authorization.
  if (!serviceKey.startsWith('sb_secret_')) headers.Authorization = `Bearer ${serviceKey}`;
  if (includeJson) {
    headers['Content-Type'] = 'application/json';
    headers.Prefer = 'return=minimal';
  }
  return headers;
}

export async function handleFacebookDataDeletion(req, res, options = {}) {
  if (req.method !== 'POST') {
    res.setHeader?.('Allow', 'POST');
    return jsonResponse(res, 405, { error: 'Método não permitido.' });
  }

  const env = getEnv(options);
  const backend = requiredBackendConfig(env);
  if (!env.META_APP_SECRET || !backend || !env.PUBLIC_SITE_URL) {
    return jsonResponse(res, 503, { error: 'Serviço de solicitações temporariamente indisponível.' });
  }

  let siteUrl;
  try {
    const parsedSiteUrl = new URL(env.PUBLIC_SITE_URL);
    if (parsedSiteUrl.protocol !== 'https:' || parsedSiteUrl.username || parsedSiteUrl.password) throw new Error('URL inválida.');
    siteUrl = parsedSiteUrl.origin;
  } catch {
    return jsonResponse(res, 503, { error: 'Serviço de solicitações temporariamente indisponível.' });
  }

  let payload;
  try {
    const body = await readRequestBody(req);
    payload = decodeAndVerifySignedRequest(body?.signed_request, env.META_APP_SECRET);
  } catch {
    return jsonResponse(res, 400, { error: 'Solicitação assinada inválida.' });
  }

  const confirmationCode = (options.randomBytes || randomBytes)(16).toString('hex').toUpperCase();
  const row = {
    confirmation_code: confirmationCode,
    meta_user_id: payload.user_id,
    status: 'received'
  };

  let stored;
  try {
    stored = await (options.fetchImpl || fetch)(`${backend.baseUrl}/rest/v1/facebook_data_deletion_requests`, {
      method: 'POST',
      headers: serviceRoleHeaders(backend.serviceKey, true),
      body: JSON.stringify(row)
    });
  } catch {
    return jsonResponse(res, 503, { error: 'Não foi possível registrar a solicitação. Tente novamente mais tarde.' });
  }
  if (!stored.ok) return jsonResponse(res, 503, { error: 'Não foi possível registrar a solicitação. Tente novamente mais tarde.' });

  const statusUrl = new URL('/exclusao-dados.html', siteUrl);
  statusUrl.searchParams.set('code', confirmationCode);
  return jsonResponse(res, 200, { url: statusUrl.toString(), confirmation_code: confirmationCode });
}

export async function handleFacebookDataDeletionStatus(req, res, options = {}) {
  if (req.method !== 'GET') {
    res.setHeader?.('Allow', 'GET');
    return jsonResponse(res, 405, { error: 'Método não permitido.' });
  }
  const code = req.query?.code;
  if (typeof code !== 'string' || !CONFIRMATION_CODE_PATTERN.test(code)) {
    return jsonResponse(res, 400, { error: 'Código de confirmação inválido.' });
  }
  const backend = requiredBackendConfig(getEnv(options));
  if (!backend) return jsonResponse(res, 503, { error: 'Serviço de consulta temporariamente indisponível.' });

  let response;
  try {
    const query = new URLSearchParams({
      select: 'confirmation_code,status,requested_at',
      confirmation_code: `eq.${code}`,
      limit: '1'
    });
    response = await (options.fetchImpl || fetch)(`${backend.baseUrl}/rest/v1/facebook_data_deletion_requests?${query}`, {
      headers: serviceRoleHeaders(backend.serviceKey)
    });
  } catch {
    return jsonResponse(res, 503, { error: 'Não foi possível consultar o status agora.' });
  }
  if (!response.ok) return jsonResponse(res, 503, { error: 'Não foi possível consultar o status agora.' });

  let rows;
  try { rows = await response.json(); } catch { return jsonResponse(res, 503, { error: 'Não foi possível consultar o status agora.' }); }
  const record = Array.isArray(rows) ? rows[0] : null;
  if (!record) return jsonResponse(res, 404, { error: 'Solicitação não encontrada.' });
  return jsonResponse(res, 200, {
    confirmation_code: record.confirmation_code,
    status: record.status,
    requested_at: record.requested_at
  });
}
