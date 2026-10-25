import test from 'node:test';
import assert from 'node:assert/strict';
import { createProgressStore, getProgressStorageKey } from '../progress-store.js';

const authenticatedUser = { id: 'user-a', isDemo: false };

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  };
}

function createClient({ upsertResult, queryResult }) {
  const calls = { upserts: [], filters: [] };
  const client = {
    from(table) {
      assert.equal(table, 'progresso_licoes');
      return {
        upsert(payload, options) {
          calls.upserts.push({ payload, options });
          return {
            select(columns) {
              calls.upserts.at(-1).returning = columns;
              return {
                single: async () => Array.isArray(upsertResult) ? upsertResult.shift() : upsertResult
              };
            }
          };
        },
        select(columns) {
          calls.select = columns;
          return {
            eq: async (column, value) => {
              calls.filters.push({ column, value });
                return Array.isArray(queryResult) ? queryResult.shift() : queryResult;
            }
          };
        }
      };
    }
  };
  return { client, calls };
}

function createStore({ user = authenticatedUser, storage = createStorage(), client = null, getSupabase } = {}) {
  return {
    storage,
    ...createProgressStore({
      getCurrentUser: async () => user,
      getSupabase: getSupabase || (async () => client),
      storage,
      now: () => new Date('2026-10-25T12:00:00.000Z'),
      logger: { warn() {}, error() {} }
    })
  };
}

test('saves locally and reports synced only after the Supabase upsert returns a row', async () => {
  const { client, calls } = createClient({
    upsertResult: { data: { user_id: 'user-a', licao_id: 'letras' }, error: null }
  });
  const { saveLessonProgress, storage } = createStore({ client });

  const result = await saveLessonProgress('letras', { score: 8, total: 10 });

  assert.equal(result.status, 'synced');
  assert.equal(result.localSaved, true);
  assert.equal(result.synced, true);
  assert.equal(result.success, true);
  assert.equal(calls.upserts[0].options.onConflict, 'user_id,licao_id');
  assert.equal(calls.upserts[0].returning, 'user_id,licao_id');
  assert.equal(calls.upserts[0].payload.user_id, 'user-a');
  assert.equal(calls.upserts[0].payload.pontuacao, 8);
  assert.ok(storage.getItem(getProgressStorageKey(authenticatedUser)));
  assert.equal(storage.getItem('aprendidos_progresso'), null);
  assert.equal(storage.getItem('aprendidos_progresso_anon'), null);
});

test('keeps a local save distinct from failed Supabase synchronization', async () => {
  const error = { code: '42501', message: 'RLS denied the write' };
  const { client } = createClient({ upsertResult: { data: null, error } });
  const { saveLessonProgress, storage } = createStore({ client });

  const result = await saveLessonProgress('vogais', { score: 5 });

  assert.equal(result.status, 'local_only');
  assert.equal(result.localSaved, true);
  assert.equal(result.synced, false);
  assert.equal(result.success, true);
  assert.equal(result.syncError, error);
  assert.ok(JSON.parse(storage.getItem(getProgressStorageKey(authenticatedUser))).vogais);
});

test('reports failure when neither local storage nor Supabase saves the lesson', async () => {
  const storage = {
    getItem() { return null; },
    setItem() { throw new Error('storage quota exceeded'); },
    removeItem() {}
  };
  const { client } = createClient({ upsertResult: { data: null, error: new Error('offline') } });
  const { saveLessonProgress } = createStore({ storage, client });

  const result = await saveLessonProgress('consoantes', { score: 4 });

  assert.equal(result.status, 'failed');
  assert.equal(result.localSaved, false);
  assert.equal(result.synced, false);
  assert.equal(result.success, false);
  assert.ok(result.localError);
  assert.ok(result.syncError);
});

test('an unauthenticated user uses an isolated local key and never calls Supabase', async () => {
  const legacy = { escrita: { completed: true, score: 10 } };
  const storage = createStorage({
    aprendidos_progresso: JSON.stringify(legacy),
    aprendidos_progresso_anon: JSON.stringify(legacy),
    'aprendidos_progresso_user-a': JSON.stringify({ frases: { completed: true, score: 9 } })
  });
  let cloudCalls = 0;
  const { saveLessonProgress, getLessonProgress } = createStore({
    user: null,
    storage,
    getSupabase: async () => { cloudCalls++; throw new Error('must not connect'); }
  });

  const saved = await saveLessonProgress('letras', { score: 7 });
  const loaded = await getLessonProgress();

  assert.equal(saved.status, 'local_only');
  assert.equal(saved.synced, false);
  assert.equal(loaded.source, 'local');
  assert.equal(loaded.progress.letras.syncStatus, 'local_only');
  assert.equal(loaded.progress.escrita, undefined);
  assert.equal(loaded.progress.frases, undefined);
  assert.equal(storage.getItem('aprendidos_progresso'), JSON.stringify(legacy));
  assert.equal(storage.getItem('aprendidos_progresso_anon'), JSON.stringify(legacy));
  assert.ok(storage.getItem(getProgressStorageKey(null)));
  assert.equal(cloudCalls, 0);
});

test('demo users receive separate local progress keys by demo identity', () => {
  assert.equal(getProgressStorageKey({ id: 'demo-1', isDemo: true }), 'aprendidos_progresso_demo_demo-1');
  assert.equal(getProgressStorageKey({ id: 'demo-2', isDemo: true }), 'aprendidos_progresso_demo_demo-2');
});

test('recovers cloud progress for the authenticated account on a fresh device', async () => {
  const { client, calls } = createClient({
    queryResult: {
      data: [{ licao_id: 'frases', concluido: true, pontuacao: 9, tentativas: 2, atualizado_em: '2026-10-24T10:00:00Z' }],
      error: null
    }
  });
  const { getLessonProgress, storage } = createStore({ client });

  const result = await getLessonProgress();

  assert.equal(result.source, 'supabase');
  assert.equal(result.status, 'synced');
  assert.deepEqual(result.progress.frases, {
    completed: true,
    score: 9,
    tentativas: 2,
    updatedAt: '2026-10-24T10:00:00Z',
    syncStatus: 'synced'
  });
  assert.deepEqual(calls.filters, [{ column: 'user_id', value: 'user-a' }]);
  assert.ok(storage.getItem(getProgressStorageKey(authenticatedUser)));
});

test('a successful empty cloud query keeps a local record pending when retry fails', async () => {
  const stale = { letras: { completed: true, score: 10 } };
  const storage = createStorage({ [getProgressStorageKey(authenticatedUser)]: JSON.stringify(stale) });
  const syncError = new Error('temporary network failure');
  const { client } = createClient({
    queryResult: { data: [], error: null },
    upsertResult: { data: null, error: syncError }
  });
  const { getLessonProgress } = createStore({ storage, client });

  const result = await getLessonProgress();

  assert.equal(result.source, 'supabase');
  assert.equal(result.status, 'local_only');
  assert.equal(result.synced, false);
  assert.equal(result.progress.letras.syncStatus, 'local_only');
  assert.equal(result.progress.letras.completed, true);
  assert.equal(result.localOnlyCount, 1);
  assert.equal(result.error, syncError);
});

test('a failed cloud query may use the account cache but marks every result local-only', async () => {
  const cached = { escrita: { completed: true, score: 6 } };
  const storage = createStorage({ [getProgressStorageKey(authenticatedUser)]: JSON.stringify(cached) });
  const queryError = new Error('network unavailable');
  const { client } = createClient({ queryResult: { data: null, error: queryError } });
  const { getLessonProgress } = createStore({ storage, client });

  const result = await getLessonProgress();

  assert.equal(result.source, 'local');
  assert.equal(result.status, 'local_only');
  assert.equal(result.error, queryError);
  assert.equal(result.progress.escrita.syncStatus, 'local_only');
});

test('a different authenticated account cannot read the previous account local cache', async () => {
  const otherUser = { id: 'user-b', isDemo: false };
  const storage = createStorage({
    [getProgressStorageKey(authenticatedUser)]: JSON.stringify({ letras: { completed: true } })
  });
  const { client, calls } = createClient({ queryResult: { data: [], error: null } });
  const { getLessonProgress } = createStore({ user: otherUser, storage, client });

  const result = await getLessonProgress();

  assert.deepEqual(result.progress, {});
  assert.deepEqual(calls.filters, [{ column: 'user_id', value: 'user-b' }]);
});

test('a newer local pending record wins over an older remote row and is synced', async () => {
  const localRecord = {
    completed: true,
    score: 10,
    tentativas: 3,
    updatedAt: '2026-10-25T11:00:00.000Z',
    syncStatus: 'local_only'
  };
  const storage = createStorage({
    [getProgressStorageKey(authenticatedUser)]: JSON.stringify({ vogais: localRecord })
  });
  const { client, calls } = createClient({
    queryResult: {
      data: [{ licao_id: 'vogais', concluido: true, pontuacao: 4, tentativas: 1, atualizado_em: '2026-10-24T11:00:00.000Z' }],
      error: null
    },
    upsertResult: { data: { user_id: 'user-a', licao_id: 'vogais' }, error: null }
  });
  const { getLessonProgress } = createStore({ storage, client });

  const result = await getLessonProgress();

  assert.equal(calls.upserts.length, 1);
  assert.equal(calls.upserts[0].payload.pontuacao, 10);
  assert.equal(calls.upserts[0].payload.tentativas, 3);
  assert.equal(result.progress.vogais.score, 10);
  assert.equal(result.progress.vogais.syncStatus, 'synced');
  assert.equal(JSON.parse(storage.getItem(getProgressStorageKey(authenticatedUser))).vogais.syncStatus, 'synced');
});

test('a pending local record is preserved when its remote row exists but retry fails', async () => {
  const localRecord = {
    completed: true,
    score: 8,
    tentativas: 2,
    updatedAt: '2026-10-25T11:00:00.000Z',
    syncStatus: 'local_only'
  };
  const storageKey = getProgressStorageKey(authenticatedUser);
  const storage = createStorage({ [storageKey]: JSON.stringify({ frases: localRecord }) });
  const syncError = { code: '08006', message: 'temporary network failure' };
  const { client, calls } = createClient({
    queryResult: {
      data: [{ licao_id: 'frases', concluido: true, pontuacao: 3, tentativas: 1, atualizado_em: '2026-10-24T11:00:00.000Z' }],
      error: null
    },
    upsertResult: { data: null, error: syncError }
  });
  const { getLessonProgress } = createStore({ storage, client });

  const result = await getLessonProgress();

  assert.equal(calls.upserts.length, 1);
  assert.equal(result.progress.frases.score, 8);
  assert.equal(result.progress.frases.syncStatus, 'local_only');
  assert.equal(result.localOnlyCount, 1);
  assert.deepEqual(JSON.parse(storage.getItem(storageKey)).frases, localRecord);
});

test('a successfully synced pending record is confirmed on the next recovery', async () => {
  const storageKey = getProgressStorageKey(authenticatedUser);
  const storage = createStorage({
    [storageKey]: JSON.stringify({ escrita: {
      completed: true,
      score: 9,
      tentativas: 2,
      updatedAt: '2026-10-25T11:00:00.000Z',
      syncStatus: 'local_only'
    } })
  });
  const firstClient = createClient({
    queryResult: {
      data: [{ licao_id: 'escrita', concluido: true, pontuacao: 2, tentativas: 1, atualizado_em: '2026-10-24T11:00:00.000Z' }],
      error: null
    },
    upsertResult: { data: { user_id: 'user-a', licao_id: 'escrita' }, error: null }
  });

  const first = await createStore({ storage, client: firstClient.client }).getLessonProgress();
  assert.equal(first.progress.escrita.score, 9);
  assert.equal(first.progress.escrita.syncStatus, 'synced');

  const secondClient = createClient({
    queryResult: {
      data: [{ licao_id: 'escrita', concluido: true, pontuacao: 9, tentativas: 2, atualizado_em: '2026-10-25T11:00:00.000Z' }],
      error: null
    }
  });
  const recovered = await createStore({ storage, client: secondClient.client }).getLessonProgress();

  assert.equal(secondClient.calls.upserts.length, 0);
  assert.equal(recovered.progress.escrita.score, 9);
  assert.equal(recovered.progress.escrita.syncStatus, 'synced');
});

test('another account cannot retry or read a pending record from the previous account', async () => {
  const accountAKey = getProgressStorageKey(authenticatedUser);
  const pending = { completed: true, score: 10, syncStatus: 'local_only' };
  const storage = createStorage({ [accountAKey]: JSON.stringify({ letras: pending }) });
  const { client, calls } = createClient({ queryResult: { data: [], error: null } });
  const { getLessonProgress } = createStore({
    user: { id: 'user-b', isDemo: false },
    storage,
    client
  });

  const result = await getLessonProgress();

  assert.deepEqual(result.progress, {});
  assert.deepEqual(calls.filters, [{ column: 'user_id', value: 'user-b' }]);
  assert.equal(calls.upserts.length, 0);
  assert.deepEqual(JSON.parse(storage.getItem(accountAKey)).letras, pending);
});
