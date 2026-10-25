/**
 * ============================================================================
 * AprendIDos - Lógica das Lições e Atividades
 * Arquivo: licoes.js
 * ============================================================================
 */

/* ===== BOTÃO DE ÁUDIO DAS LIÇÕES ===== */
let _licaoCurrentAudio = null;
let _licaoPtVoice = null;
let _licaoSpeechGen = 0;
let _licaoBtnAtivo = null;
const _licaoIsIOS = (function() {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
})();

function _loadLicaoVoices() {
  if (!('speechSynthesis' in window)) return;
  const v = window.speechSynthesis.getVoices();
  if (!v || v.length === 0) return;
  _licaoPtVoice =
    v.find(x => x.lang === 'pt-BR') ||
    v.find(x => x.lang === 'pt_BR') ||
    v.find(x => x.lang.startsWith('pt')) || null;
}

if ('speechSynthesis' in window) {
  _loadLicaoVoices();
  window.speechSynthesis.onvoiceschanged = _loadLicaoVoices;
}

function _stopAllLicaoAudio() {
  _licaoSpeechGen++;
  if (_licaoCurrentAudio) {
    try {
      _licaoCurrentAudio.pause();
      _licaoCurrentAudio.currentTime = 0;
      _licaoCurrentAudio.src = '';
      _licaoCurrentAudio.onended = null;
      _licaoCurrentAudio.onerror = null;
    } catch (e) {}
    _licaoCurrentAudio = null;
  }
  if (window.speechSynthesis) {
    try { window.speechSynthesis.cancel(); } catch (e) {}
  }
  if (_licaoBtnAtivo) {
    _pararBtnOuvir(_licaoBtnAtivo);
    _licaoBtnAtivo = null;
  }
}

function falarLicao(btn, event) {
  // Impede que o clique propague para o card (que navegaria para outra página)
  if (event) { event.stopPropagation(); event.preventDefault(); }

  const texto = btn.dataset.audio || '';
  if (!texto) return;

  // Se este botão já está falando, para tudo
  if (btn.classList.contains('speaking')) {
    _stopAllLicaoAudio();
    return;
  }

  _stopAllLicaoAudio();

  // Ativa visual de "speaking"
  _ativarBtnOuvir(btn);
  _licaoBtnAtivo = btn;

  const currentGen = _licaoSpeechGen;

  // No iOS (Safari), dispara fala nativa imediatamente e síncrona dentro do clique
  if (_licaoIsIOS) {
    _falarLicaoNativo(texto, btn, currentGen);
    return;
  }

  let fallbackTriggered = false;

  function triggerFallback() {
    if (fallbackTriggered) return;
    fallbackTriggered = true;
    if (currentGen !== _licaoSpeechGen) return;
    _falarLicaoNativo(texto, btn, currentGen);
  }

  // Tenta primeiro Google TTS para manter a mesma voz natural do restante do site
  try {
    const url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=pt-BR&client=tw-ob&q=' + encodeURIComponent(texto);
    const audio = new Audio();
    _licaoCurrentAudio = audio;

    audio.onended = () => {
      if (currentGen !== _licaoSpeechGen) return;
      _pararBtnOuvir(btn);
      if (_licaoBtnAtivo === btn) _licaoBtnAtivo = null;
      _licaoCurrentAudio = null;
    };

    audio.onerror = () => {
      triggerFallback();
    };

    audio.src = url;
    const p = audio.play();
    if (p !== undefined) {
      p.catch(() => {
        triggerFallback();
      });
    }
  } catch (e) {
    triggerFallback();
  }
}

function _falarLicaoNativo(texto, btn, gen) {
  if (gen !== undefined && gen !== _licaoSpeechGen) return;
  if (!window.speechSynthesis) {
    _pararBtnOuvir(btn);
    if (_licaoBtnAtivo === btn) _licaoBtnAtivo = null;
    return;
  }

  try { window.speechSynthesis.cancel(); } catch (e) {}

  const utter = new SpeechSynthesisUtterance(texto);
  utter.lang = 'pt-BR';
  utter.rate = 0.82;   // voz calma e pausada para idosos
  utter.pitch = 1.0;
  utter.volume = 1.0;

  if (!_licaoPtVoice) _loadLicaoVoices();
  if (_licaoPtVoice) utter.voice = _licaoPtVoice;

  const cleanup = () => {
    if (gen !== undefined && gen !== _licaoSpeechGen) return;
    _pararBtnOuvir(btn);
    if (_licaoBtnAtivo === btn) _licaoBtnAtivo = null;
  };

  utter.onend = cleanup;
  utter.onerror = cleanup;

  // No iOS, a chamada DEVE ser síncrona dentro do gesto do usuário.
  // No Windows/Chrome, o delay de 80ms evita bug de cancelamento imediato.
  if (_licaoIsIOS) {
    try { window.speechSynthesis.speak(utter); } catch (e) { cleanup(); }
  } else {
    setTimeout(() => {
      if (gen !== undefined && gen !== _licaoSpeechGen) return;
      try {
        window.speechSynthesis.speak(utter);
      } catch (e) {
        cleanup();
      }
    }, 80);
  }
}

function _ativarBtnOuvir(btn) {
  btn.classList.add('speaking');
  const label = btn.querySelector('.ouvir-label');
  if (label) label.textContent = 'Toque para parar';
}

function _pararBtnOuvir(btn) {
  btn.classList.remove('speaking');
  const label = btn.querySelector('.ouvir-label');
  if (label) label.textContent = 'Ouvir o que vou aprender';
}

// Funções de sessão universais (compatíveis com duplo-clique local file:// e servidores)
async function getCurrentUser() {
  if (typeof window !== 'undefined' && window.AprendIDosAuth && window.AprendIDosAuth.getCurrentUser) {
    try { return await window.AprendIDosAuth.getCurrentUser(); } catch(e) {}
  }
  try {
    const raw = localStorage.getItem('aprendidos_usuario');
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

async function signOut(redirectPath = 'login.html') {
  if (typeof window !== 'undefined' && window.AprendIDosAuth && window.AprendIDosAuth.signOut) {
    try { await window.AprendIDosAuth.signOut(redirectPath); return; } catch(e) {}
  }
  try { localStorage.removeItem('aprendidos_usuario'); } catch(e) {}
  window.location.href = redirectPath;
}

const LESSON_KEYS = [
  'letras',      // 0: As Letras
  'vogais',      // 1: As Vogais
  'consoantes',   // 2: Consoantes e Sons
  'meunome',     // 3: Meu Nome
  'silabas',     // 4: Sílabas
  'palavras',    // 5: Palavras do Dia a Dia
  'frases',      // 6: Frases Simples
  'leituras',    // 7: Pequenas Leituras
  'escrita'      // 8: Escrita
];

async function getLessonProgress() {
  // 1. Consulta a nuvem e recebe os dados locais identificados como locais quando não sincronizados.
  if (typeof window !== 'undefined' && window.AprendIDosAuth && window.AprendIDosAuth.getLessonProgress) {
    try {
      const authProg = await window.AprendIDosAuth.getLessonProgress();
      if (authProg && typeof authProg === 'object' && authProg.progress && typeof authProg.progress === 'object') {
        return authProg;
      }
      // Compatibility with older auth modules: unlabelled values are local, never cloud-confirmed.
      if (authProg && typeof authProg === 'object') {
        return {
          status: 'local_only',
          source: 'local',
          synced: false,
          progress: Object.fromEntries(Object.entries(authProg).map(([key, value]) => [
            key, { ...value, syncStatus: 'local_only' }
          ])),
          localOnlyCount: Object.keys(authProg).length,
          error: null
        };
      }
    } catch(e) {}
  }

  // 2. Fallback para a chave exclusiva do usuário atual ou do dispositivo anônimo.
  try {
    const user = await getCurrentUser();
    const storageKey = window.AprendIDosAuth?.getProgressStorageKey
      ? window.AprendIDosAuth.getProgressStorageKey(user)
      : user?.id
        ? `${user.isDemo ? 'aprendidos_progresso_demo_' : 'aprendidos_progresso_'}${user.id}`
        : 'aprendidos_progresso_anonymous_v2';
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          const progress = Object.fromEntries(Object.entries(parsed).map(([key, value]) => [
            key, { ...value, syncStatus: 'local_only' }
          ]));
          return {
            status: Object.keys(progress).length ? 'local_only' : 'empty',
            source: 'local',
            synced: false,
            progress,
            localOnlyCount: Object.keys(progress).length,
            error: null
          };
        }
      } catch(e) {}
    }
  } catch(e) {
    console.warn('Erro ao ler progresso local:', e);
  }

  return { status: 'empty', source: 'local', synced: false, progress: {}, localOnlyCount: 0, error: null };
}

async function saveSingleLessonProgress(key, data = { completed: true, score: 10, total: 10 }) {
  if (!key) return;
  try {
    const record = {
      completed: true,
      score: data.score ?? 10,
      total: data.total ?? 10,
      updatedAt: new Date().toISOString(),
      ...data
    };

    if (typeof window !== 'undefined' && window.AprendIDosAuth && window.AprendIDosAuth.saveLessonProgress) {
      try {
        return await window.AprendIDosAuth.saveLessonProgress(key, record);
      } catch(e) {}
    }

    // Fallback local caso auth.js não esteja disponível
    const user = await getCurrentUser();
    const storageKey = window.AprendIDosAuth?.getProgressStorageKey
      ? window.AprendIDosAuth.getProgressStorageKey(user)
      : user?.id
        ? `${user.isDemo ? 'aprendidos_progresso_demo_' : 'aprendidos_progresso_'}${user.id}`
        : 'aprendidos_progresso_anonymous_v2';
    try {
      const curr = JSON.parse(localStorage.getItem(storageKey) || '{}');
      curr[key] = record;
      localStorage.setItem(storageKey, JSON.stringify(curr));
      return { status: 'local_only', success: true, localSaved: true, synced: false, progress: curr };
    } catch(e) {
      return { status: 'failed', success: false, localSaved: false, synced: false, error: e };
    }
  } catch(e) {
    console.warn('Erro ao salvar progresso:', e);
  }
}

/* ===== ESTADO DA APLICAÇÃO ===== */
const TOTAL = 9;
let completedCount = 0;

/* ===== REFERÊNCIAS DO DOM ===== */
const progressFill = document.getElementById('progressFill');
const progressCount = document.getElementById('progressCount');
const toastContainer = document.getElementById('toastContainer');
const grid = document.getElementById('activitiesGrid');
const cards = grid ? Array.from(grid.querySelectorAll('.activity-card')) : [];

// Garante que todos os cards fiquem visíveis imediatamente
cards.forEach(card => card.classList.add('visible'));

/* ===== INICIALIZAÇÃO DE USUÁRIO E SESSÃO ===== */
async function initUserSession() {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (e) {
    console.warn('Erro ao obter usuário:', e);
  }

  const userNameEl = document.getElementById('userDisplayName');
  const greetingEl = document.getElementById('pageGreeting');
  const avatarEl = document.getElementById('userAvatarCircle');
  const btnLogout = document.getElementById('btnLogout');

  if (user) {
    const firstName = user.name ? user.name.split(' ')[0] : 'Aprendiz';
    if (userNameEl) userNameEl.textContent = firstName;
    if (greetingEl) greetingEl.textContent = `Olá, ${firstName}! Vamos aprender?`;

    if (user.avatar && avatarEl) {
      avatarEl.replaceChildren();
      // Validação defensiva de esquema de URL para mitigar XSS via javascript:
      if (/^(https?:|\/|data:image\/)/i.test(user.avatar)) {
        const img = document.createElement('img');
        img.src = user.avatar;
        img.alt = user.name ? String(user.name) : 'Foto do perfil';
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        avatarEl.appendChild(img);
      }
    }
  } else {
    if (userNameEl) userNameEl.textContent = 'Aprendiz';
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      showToast('Saindo da conta...', 'sign-out-alt');
      setTimeout(async () => {
        await signOut('login.html');
      }, 400);
    });
  }

  await loadUserProgress();
}

/* ===== CARREGA PROGRESSO DO BANCO / SESSÃO ===== */
async function loadUserProgress() {
  let result = { progress: {}, localOnlyCount: 0, source: 'none', error: null };
  try {
    result = await getLessonProgress();
  } catch (e) {
    console.warn('Erro ao obter progresso:', e);
  }
  const progress = result.progress || {};

  completedCount = 0;

  cards.forEach((card, index) => {
    const key = LESSON_KEYS[index];
    if (key && progress[key]?.completed) {
      markCardAsDone(card, false, progress[key].syncStatus);
      completedCount++;
    } else {
      resetCardToStart(card);
    }
  });

  if (result.localOnlyCount > 0) {
    showToast('Algumas atividades estão salvas somente neste aparelho.', 'cloud');
  } else if (result.error) {
    showToast('Não foi possível consultar o progresso na nuvem.', 'cloud');
  }

  updateProgress();
}

function resetCardToStart(card) {
  if (!card) return;
  card.dataset.completed = 'false';
  const badge = card.querySelector('.status-badge');
  const btn = card.querySelector('.card-btn');
  const check = card.querySelector('.check-badge');
  if (check) check.remove();

  if (badge) {
    badge.className = 'status-badge badge-iniciar';
    badge.innerHTML = '<i class="fas fa-play-circle"></i> Iniciar';
  }

  if (btn) {
    btn.className = 'card-btn btn-comecar';
    btn.dataset.action = 'start';
    btn.textContent = 'Começar';
  }
}

function markCardAsDone(card, animate = true, syncStatus = 'synced') {
  if (!card) return;
  const circle = card.querySelector('.icon-circle');
  const badge = card.querySelector('.status-badge');
  const btn = card.querySelector('.card-btn');

  if (animate) {
    card.classList.add('completing');
    setTimeout(() => card.classList.remove('completing'), 600);
  }

  if (circle && !circle.querySelector('.check-badge')) {
    const checkBadge = document.createElement('div');
    checkBadge.className = 'check-badge';
    checkBadge.innerHTML = '<i class="fas fa-check"></i>';
    circle.appendChild(checkBadge);
  }

  if (badge) {
    badge.className = 'status-badge badge-concluida';
    badge.innerHTML = syncStatus === 'local_only'
      ? '<i class="fas fa-mobile-alt" aria-hidden="true"></i> Só neste aparelho'
      : '<i class="fas fa-check-circle" aria-hidden="true"></i> Concluída';
  }

  if (btn) {
    btn.className = 'card-btn btn-rever';
    btn.dataset.action = 'review';
    btn.textContent = 'Rever Lição';
  }

  card.dataset.completed = 'true';
}

/* ===== ATUALIZA BARRA DE PROGRESSO ===== */
function updateProgress() {
  const pct = Math.round((completedCount / TOTAL) * 100);
  if (progressFill) progressFill.style.width = pct + '%';
  if (progressCount) {
    progressCount.textContent = completedCount + ' de ' + TOTAL + ' concluídas';
    progressCount.classList.remove('bump');
    void progressCount.offsetWidth;
    progressCount.classList.add('bump');
  }
}

/* ===== SISTEMA DE TOAST ===== */
function showToast(message, icon = 'check-circle') {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = '<i class="fas fa-' + icon + '"></i> ' + message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
}

/* ===== DELEGAÇÃO DE EVENTOS NOS CARDS ===== */
if (grid) {
  grid.addEventListener('click', function(e) {
    const card = e.target.closest('.activity-card');
    if (!card) return;

    const index = parseInt(card.dataset.index, 10);
    const title = card.querySelector('h3') ? card.querySelector('h3').textContent : '';
    const isCompleted = card.dataset.completed === 'true';

    // Se for a lição de Letras (card index 0), abre a tela de letras (seja para iniciar ou para rever)
    if (index === 0 || title.toLowerCase().includes('letras')) {
      e.preventDefault();
      const toastMsg = isCompleted ? 'Abrindo lição de Letras para rever...' : 'Abrindo atividade de Letras...';
      const toastIcon = isCompleted ? 'redo' : 'book-open';
      showToast(toastMsg, toastIcon);
      setTimeout(() => {
        window.location.href = 'letras.html';
      }, 250);
      return;
    }

    // Se for a lição de Vogais (card index 1)
    if (index === 1 || title.toLowerCase().includes('vogais')) {
      e.preventDefault();
      const toastMsg = isCompleted ? 'Abrindo lição de Vogais para rever...' : 'Abrindo atividade de Vogais...';
      showToast(toastMsg, isCompleted ? 'redo' : 'book-open');
      setTimeout(() => { window.location.href = 'vogais.html'; }, 250);
      return;
    }

    // Se for Consoantes e Sons (index 2)
    if (index === 2 || title.toLowerCase().includes('consoante')) {
      e.preventDefault();
      showToast(isCompleted ? 'Revisando Consoantes...' : 'Abrindo Consoantes e Sons...', isCompleted ? 'redo' : 'book-open');
      setTimeout(() => { window.location.href = 'consoantes.html'; }, 250);
      return;
    }

    // Se for Meu Nome (index 3)
    if (index === 3 || title.toLowerCase().includes('nome')) {
      e.preventDefault();
      showToast(isCompleted ? 'Revisando Meu Nome...' : 'Abrindo Meu Nome...', isCompleted ? 'redo' : 'book-open');
      setTimeout(() => { window.location.href = 'meunome.html'; }, 250);
      return;
    }

    // Se for Sílabas (index 4)
    if (index === 4 || title.toLowerCase().includes('sílaba') || title.toLowerCase().includes('silaba')) {
      e.preventDefault();
      showToast(isCompleted ? 'Revisando Sílabas...' : 'Abrindo Sílabas...', isCompleted ? 'redo' : 'book-open');
      setTimeout(() => { window.location.href = 'silabas.html'; }, 250);
      return;
    }

    // Se for Palavras do Dia a Dia (index 5)
    if (index === 5 || title.toLowerCase().includes('palavras')) {
      e.preventDefault();
      showToast(isCompleted ? 'Revisando Palavras...' : 'Abrindo Palavras do Dia a Dia...', isCompleted ? 'redo' : 'book-open');
      setTimeout(() => { window.location.href = 'palavras.html'; }, 250);
      return;
    }

    // Se for Frases Simples (index 6)
    if (index === 6 || title.toLowerCase().includes('frases')) {
      e.preventDefault();
      showToast(isCompleted ? 'Revisando Frases...' : 'Abrindo Frases Simples...', isCompleted ? 'redo' : 'book-open');
      setTimeout(() => { window.location.href = 'frases.html'; }, 250);
      return;
    }

    // Se for Pequenas Leituras (index 7)
    if (index === 7 || title.toLowerCase().includes('leitura')) {
      e.preventDefault();
      showToast(isCompleted ? 'Revisando Leituras...' : 'Abrindo Pequenas Leituras...', isCompleted ? 'redo' : 'book-open');
      setTimeout(() => { window.location.href = 'leituras.html'; }, 250);
      return;
    }

    // Se for Escrita (index 8)
    if (index === 8 || title.toLowerCase().includes('escrita')) {
      e.preventDefault();
      showToast(isCompleted ? 'Revisando Escrita...' : 'Abrindo Escrita...', isCompleted ? 'redo' : 'book-open');
      setTimeout(() => { window.location.href = 'escrita.html'; }, 250);
      return;
    }

    const btn = e.target.closest('.card-btn');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'start') {
      markCardAsDone(card, true);
      completedCount++;
      updateProgress();
      showToast('"' + title + '" concluída!', 'check-circle');
      const key = LESSON_KEYS[index];
      if (key) {
        saveSingleLessonProgress(key, { completed: true, score: 10, total: 10 });
      }
    } else if (action === 'review') {
      showToast('Revisando "' + title + '"...', 'redo');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initUserSession();
  });
} else {
  initUserSession();
}
