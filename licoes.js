/**
 * ============================================================================
 * AprendIDos - Lógica das Lições e Atividades
 * Arquivo: licoes.js
 * ============================================================================
 */

import { getCurrentUser, signOut, getLessonProgress } from './auth.js';

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

  if (cards.length > 0) {
    // 1. As Letras
    if (progress['letras']?.completed) {
      markCardAsDone(cards[0], false);
      completedCount++;
    } else {
      resetCardToStart(cards[0]);
    }

    // 2. As Vogais
    if (cards.length > 1) {
      if (progress['vogais']?.completed) {
        markCardAsDone(cards[1], false);
        completedCount++;
      } else {
        resetCardToStart(cards[1]);
      }
    }
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

    const index = card.dataset.index;
    const title = card.querySelector('h3') ? card.querySelector('h3').textContent : '';

    // Se for a lição de Vogais (card index 1), abre a tela de vogais
    if (index === '1' || title.toLowerCase().includes('vogais')) {
      e.preventDefault();
      showToast('Abrindo atividade de Vogais...', 'book-open');
      setTimeout(() => {
        window.location.href = 'vogais.html';
      }, 200);
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
    } else if (action === 'review') {
      showToast('Revisando "' + title + '"...', 'redo');
    }
  });
}

initUserSession();
