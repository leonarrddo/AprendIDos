const AUTH_PROGRESS_PREFIX = 'aprendidos_progresso_';
const DEMO_PROGRESS_PREFIX = 'aprendidos_progresso_demo_';
const ANONYMOUS_PROGRESS_KEY = 'aprendidos_progresso_anonymous_v2';

/** Return a local key scoped to one authenticated, demo, or anonymous identity. */
export function getProgressStorageKey(user) {
  if (user?.id) {
    const prefix = user.isDemo ? DEMO_PROGRESS_PREFIX : AUTH_PROGRESS_PREFIX;
    return `${prefix}${user.id}`;
  }
  return ANONYMOUS_PROGRESS_KEY;
}

function parseProgress(storage, key) {
  try {
    const parsed = JSON.parse(storage?.getItem(key) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function withSyncStatus(progress, syncStatus) {
  return Object.fromEntries(Object.entries(progress).map(([lessonId, record]) => [
    lessonId,
    { ...record, syncStatus }
  ]));
}

function makeError(message) {
  return new Error(message);
}

function timestampOf(record) {
  const value = record?.updatedAt ?? record?.atualizado_em ?? record?.savedAt ?? record?.date;
  const timestamp = value ? Date.parse(value) : NaN;
  return Number.isFinite(timestamp) ? timestamp : null;
}

function localPendingIsAtLeastAsRecent(localRecord, remoteRecord) {
  const localTimestamp = timestampOf(localRecord);
  const remoteTimestamp = timestampOf(remoteRecord);
  // If either record has no usable timestamp, preserve the unconfirmed local value.
  return localTimestamp === null || remoteTimestamp === null || localTimestamp >= remoteTimestamp;
}

function normalizeScore(value) {
  const score = Number(value ?? 10);
  return Number.isFinite(score) ? Math.min(100, Math.max(0, score)) : 0;
}

function normalizeAttempts(value) {
  const attempts = Number(value ?? 1);
  return Number.isFinite(attempts) ? Math.max(1, Math.floor(attempts)) : 1;
}

async function upsertProgress(client, user, lessonId, record, now) {
  const score = normalizeScore(record?.score);
  const tentativas = normalizeAttempts(record?.tentativas);
  const updatedAt = record?.updatedAt || record?.atualizado_em || now().toISOString();
  const { data: savedRow, error } = await client
    .from('progresso_licoes')
    .upsert({
      user_id: user.id,
      licao_id: lessonId,
      concluido: true,
      pontuacao: score,
      tentativas,
      atualizado_em: updatedAt
    }, { onConflict: 'user_id,licao_id' })
    .select('user_id,licao_id')
    .single();

  if (error) throw error;
  if (!savedRow || savedRow.user_id !== user.id || savedRow.licao_id !== lessonId) {
    throw makeError('O Supabase não confirmou o registro de progresso salvo.');
  }

  return { score, tentativas, updatedAt };
}

/**
 * Progress persistence with injectable boundaries so its behavior can be tested
 * without using a live Supabase project.
 */
export function createProgressStore({ getCurrentUser, getSupabase, storage, now = () => new Date(), logger = console }) {
  async function resolveUser() {
    try {
      return { user: await getCurrentUser(), error: null };
    } catch (error) {
      return { user: null, error };
    }
  }

  async function saveLessonProgress(lessonId, data = {}) {
    if (!lessonId || typeof lessonId !== 'string') {
      return {
        status: 'failed', success: false, localSaved: false, synced: false,
        error: makeError('Identificador de lição inválido.'), localError: null, syncError: null
      };
    }

    const { user, error: userError } = await resolveUser();
    if (userError) {
      return {
        status: 'failed', success: false, localSaved: false, synced: false,
        error: userError, localError: null, syncError: null
      };
    }

    const storageKey = getProgressStorageKey(user);
    const currentProgress = parseProgress(storage, storageKey);
    const score = normalizeScore(data.score);
    const tentativas = normalizeAttempts(data.tentativas);
    const record = {
      ...data,
      completed: true,
      score,
      tentativas,
      updatedAt: now().toISOString(),
      syncStatus: 'local_only'
    };
    currentProgress[lessonId] = record;

    let localSaved = false;
    let localError = null;
    try {
      if (!storage) throw makeError('Armazenamento local indisponível.');
      storage.setItem(storageKey, JSON.stringify(currentProgress));
      localSaved = true;
    } catch (error) {
      localError = error;
    }

    let synced = false;
    let syncError = null;
    const isAuthenticatedUser = Boolean(user && !user.isDemo && user.id);

    if (isAuthenticatedUser) {
      try {
        const client = await getSupabase();
        if (!client) throw makeError('Cliente Supabase indisponível.');
        await upsertProgress(client, user, lessonId, record, now);
        synced = true;
        record.syncStatus = 'synced';
        try {
          if (storage) storage.setItem(storageKey, JSON.stringify(currentProgress));
        } catch (error) {
          // Cloud confirmation remains authoritative when the local cache is unavailable.
          localError ||= error;
        }
      } catch (error) {
        syncError = error;
        logger?.error?.('Erro ao sincronizar progresso no Supabase:', error);
      }
    }

    const status = synced ? 'synced' : localSaved ? 'local_only' : 'failed';
    return {
      status,
      success: synced || localSaved,
      localSaved,
      synced,
      error: syncError || localError,
      localError,
      syncError,
      progress: currentProgress
    };
  }

  async function getLessonProgress() {
    const { user, error: userError } = await resolveUser();
    if (userError) {
      return { status: 'failed', source: 'none', synced: false, progress: {}, localOnlyCount: 0, error: userError };
    }

    const storageKey = getProgressStorageKey(user);
    const localProgress = parseProgress(storage, storageKey);
    const isAuthenticatedUser = Boolean(user && !user.isDemo && user.id);

    if (!isAuthenticatedUser) {
      const progress = withSyncStatus(localProgress, 'local_only');
      return {
        status: Object.keys(progress).length ? 'local_only' : 'empty',
        source: 'local',
        synced: false,
        progress,
        localOnlyCount: Object.keys(progress).length,
        error: null
      };
    }

    try {
      const client = await getSupabase();
      if (!client) throw makeError('Cliente Supabase indisponível.');

      const { data, error } = await client
        .from('progresso_licoes')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      if (!Array.isArray(data)) throw makeError('O Supabase não retornou uma lista de progresso válida.');

      const cloudProgress = {};
      for (const item of data) {
        if (!item?.licao_id) continue;
        cloudProgress[item.licao_id] = {
          completed: item.concluido,
          score: item.pontuacao,
          tentativas: item.tentativas,
          updatedAt: item.atualizado_em,
          syncStatus: 'synced'
        };
      }

      // Keep pending local records when they are newer (or timestamps are unknown).
      // Retry them through the same confirmed upsert path used by activity saves.
      const progress = { ...cloudProgress };
      const pendingEntries = [];
      for (const [lessonId, localRecord] of Object.entries(localProgress)) {
        const remoteRecord = cloudProgress[lessonId];
        const isPending = localRecord && localRecord.syncStatus !== 'synced';
        if (!remoteRecord || (isPending && localPendingIsAtLeastAsRecent(localRecord, remoteRecord))) {
          progress[lessonId] = { ...localRecord, syncStatus: 'local_only' };
          pendingEntries.push([lessonId, progress[lessonId]]);
        }
      }

      let pendingSyncError = null;
      for (const [lessonId, localRecord] of pendingEntries) {
        try {
          const syncResult = await upsertProgress(client, user, lessonId, localRecord, now);
          progress[lessonId] = {
            ...localRecord,
            score: syncResult.score,
            tentativas: syncResult.tentativas,
            updatedAt: syncResult.updatedAt,
            completed: true,
            syncStatus: 'synced'
          };
        } catch (error) {
          pendingSyncError ||= error;
          logger?.warn?.(`Não foi possível sincronizar o progresso local de '${lessonId}':`, error);
        }
      }

      const localOnlyCount = Object.values(progress).filter(record => record.syncStatus === 'local_only').length;
      try {
        if (storage) storage.setItem(storageKey, JSON.stringify(progress));
      } catch (error) {
        logger?.warn?.('Não foi possível atualizar o cache local do progresso:', error);
      }

      return {
        status: localOnlyCount ? 'local_only' : 'synced',
        source: 'supabase',
        synced: localOnlyCount === 0,
        progress,
        localOnlyCount,
        error: pendingSyncError
      };
    } catch (error) {
      logger?.warn?.('Erro ao consultar progresso no Supabase:', error);
      const progress = withSyncStatus(localProgress, 'local_only');
      return {
        status: Object.keys(progress).length ? 'local_only' : 'failed',
        source: Object.keys(progress).length ? 'local' : 'none',
        synced: false,
        progress,
        localOnlyCount: Object.keys(progress).length,
        error
      };
    }
  }

  return { saveLessonProgress, getLessonProgress };
}
