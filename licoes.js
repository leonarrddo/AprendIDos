/**
 * ============================================================================
 * AprendIDos - Lógica das Lições e Atividades
 * Arquivo: licoes.js
 * ============================================================================
 */

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
  let progress = {};

  // 1. Tenta via módulo de autenticação AprendIDosAuth se existir
  if (typeof window !== 'undefined' && window.AprendIDosAuth && window.AprendIDosAuth.getLessonProgress) {
    try {
      const authProg = await window.AprendIDosAuth.getLessonProgress();
      if (authProg && typeof authProg === 'object') {
        progress = { ...progress, ...authProg };
      }
    } catch(e) {}
  }

  // 2. Busca nas chaves do LocalStorage (usuário logado, legado e anônimo)
  try {
    const user = await getCurrentUser();
    const userKey = user && user.id ? `aprendidos_progresso_${user.id}` : null;
    const keysToCheck = [
      userKey,
      'aprendidos_progresso',
      'aprendidos_progresso_anon'
    ].filter(Boolean);

    for (const key of keysToCheck) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            progress = { ...parsed, ...progress };
          }
        } catch(e) {}
      }
    }

    // Se encontramos progresso e temos usuário logado, sincroniza na chave do usuário
    if (userKey && Object.keys(progress).length > 0) {
      try {
        localStorage.setItem(userKey, JSON.stringify(progress));
      } catch(e) {}
    }
  } catch(e) {
    console.warn('Erro ao ler progresso local:', e);
  }

  return progress;
}

async function saveSingleLessonProgress(key, data = { completed: true, score: 10, total: 10 }) {
  if (!key) return;
  try {
    const user = await getCurrentUser();
    const userKey = user && user.id ? `aprendidos_progresso_${user.id}` : null;
    const keysToUpdate = [userKey, 'aprendidos_progresso', 'aprendidos_progresso_anon'].filter(Boolean);

    const record = {
      completed: true,
      score: data.score ?? 10,
      total: data.total ?? 10,
      updatedAt: new Date().toISOString(),
      ...data
    };

    keysToUpdate.forEach(storageKey => {
      try {
        const curr = JSON.parse(localStorage.getItem(storageKey) || '{}');
        curr[key] = record;
        localStorage.setItem(storageKey, JSON.stringify(curr));
      } catch(e) {}
    });

    if (typeof window !== 'undefined' && window.AprendIDosAuth && window.AprendIDosAuth.saveLessonProgress) {
      try {
        await window.AprendIDosAuth.saveLessonProgress(key, record);
      } catch(e) {}
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
      avatarEl.innerHTML = `<img src="${user.avatar}" alt="${user.name}" style="width:100%;height:100%;object-fit:cover;">`;
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
  let progress = {};
  try {
    progress = await getLessonProgress();
  } catch (e) {
    console.warn('Erro ao obter progresso:', e);
  }

  completedCount = 0;

  cards.forEach((card, index) => {
    const key = LESSON_KEYS[index];
    if (key && progress[key]?.completed) {
      markCardAsDone(card, false);
      completedCount++;
    } else {
      resetCardToStart(card);
    }
  });

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

function markCardAsDone(card, animate = true) {
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
    badge.innerHTML = '<i class="fas fa-check-circle"></i> Concluída';
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

initUserSession();
