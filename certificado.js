/**
 * AprendIDos - Controlador da Página do Certificado
 * Arquivo: certificado.js
 */

import {
  MANDATORY_LESSON_KEYS,
  MANDATORY_LESSON_TITLES,
  checkCertificateEligibility,
  resolveCertificateDate,
  formatCertificateDate,
  resolveStudentName,
  generateVerificationCode,
  getStoredCertificate,
  saveStoredCertificate
} from './certificado-logic.js';

let _currentUser = null;
let _currentCertData = null;
let _currentAudio = null;
let _isSpeaking = false;
let _speechGen = 0;
let _fallbackTimer = null;

/* ===== CONTROLE DE ÁUDIO ===== */
function stopAudio() {
  _speechGen++;
  if (_fallbackTimer) {
    clearTimeout(_fallbackTimer);
    _fallbackTimer = null;
  }
  if (_currentAudio) {
    try {
      _currentAudio.pause();
      _currentAudio.currentTime = 0;
      _currentAudio.src = '';
    } catch (e) {}
    _currentAudio = null;
  }
  if ('speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch (e) {}
  }
  _isSpeaking = false;
  const btn = document.getElementById('btnOuvirCert');
  const label = document.getElementById('labelOuvirCert');
  if (btn) btn.classList.remove('speaking');
  if (label) label.textContent = 'Ouvir Certificado';
}

function speakText(text, btnElement = null, labelElement = null) {
  if (!text) return;

  if (_isSpeaking) {
    stopAudio();
    return;
  }

  stopAudio();
  _isSpeaking = true;
  const gen = _speechGen;

  if (btnElement) btnElement.classList.add('speaking');
  if (labelElement) labelElement.textContent = 'Toque para parar';

  const onFinish = () => {
    if (gen !== _speechGen) return;
    if (_fallbackTimer) {
      clearTimeout(_fallbackTimer);
      _fallbackTimer = null;
    }
    _isSpeaking = false;
    if (btnElement) btnElement.classList.remove('speaking');
    if (labelElement) labelElement.textContent = 'Ouvir Certificado';
  };

  const speakNative = () => {
    if (gen !== _speechGen) return;
    if (_fallbackTimer) {
      clearTimeout(_fallbackTimer);
      _fallbackTimer = null;
    }
    if (_currentAudio) {
      try { _currentAudio.pause(); _currentAudio.src = ''; } catch (e) {}
      _currentAudio = null;
    }
    if (!('speechSynthesis' in window)) {
      const status = document.getElementById('certAudioStatus');
      if (status) status.textContent = 'Não foi possível reproduzir o áudio neste dispositivo.';
      onFinish();
      return;
    }
    const status = document.getElementById('certAudioStatus');
    if (status) status.textContent = '';
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'pt-BR';
      utter.rate = 0.84;
      utter.pitch = 1.0;
      utter.onend = onFinish;
      utter.onerror = onFinish;
      window.speechSynthesis.speak(utter);
    } catch (e) {
      onFinish();
    }
  };

  try {
    const url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=pt-BR&client=tw-ob&q=' + encodeURIComponent(text);
    const audio = new Audio();
    _currentAudio = audio;

    audio.onended = () => {
      _currentAudio = null;
      onFinish();
    };

    audio.onerror = () => {
      _currentAudio = null;
      speakNative();
    };

    const playPromise = audio.play();
    // Uma requisição de áudio pode ficar pendente sem rejeitar. Tenta a voz nativa nesse caso.
    _fallbackTimer = setTimeout(speakNative, 2500);
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        speakNative();
      });
    }
  } catch (e) {
    speakNative();
  }
}

/* ===== CARREGAMENTO E RENDERIZAÇÃO DO CERTIFICADO ===== */
async function loadCertificate() {
  const loadingEl = document.getElementById('certLoading');
  const eligibleEl = document.getElementById('certEligibleSection');
  const incompleteEl = document.getElementById('certIncompleteSection');

  try {
    // 1. Obtém usuário atual
    if (window.AprendIDosAuth?.getCurrentUser) {
      try { _currentUser = await window.AprendIDosAuth.getCurrentUser(); } catch(e) {}
    }
    if (!_currentUser) {
      try {
        const raw = localStorage.getItem('aprendidos_usuario');
        if (raw) _currentUser = JSON.parse(raw);
      } catch (e) {}
    }

    // 2. Obtém progresso das lições
    let progResult = { progress: {}, localOnlyCount: 0 };
    if (window.AprendIDosAuth?.getLessonProgress) {
      try { progResult = await window.AprendIDosAuth.getLessonProgress(); } catch(e) {}
    } else {
      const storageKey = _currentUser?.id
        ? (_currentUser.isDemo ? `aprendidos_progresso_demo_${_currentUser.id}` : `aprendidos_progresso_${_currentUser.id}`)
        : 'aprendidos_progresso_anonymous_v2';
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) progResult.progress = JSON.parse(raw);
      } catch(e) {}
    }

    const progress = progResult?.progress || {};
    const status = checkCertificateEligibility(progress, MANDATORY_LESSON_KEYS);

    if (loadingEl) loadingEl.style.display = 'none';

    if (status.eligible) {
      renderEligibleCertificate(progress, progResult.localOnlyCount);
      if (eligibleEl) eligibleEl.style.display = 'block';
      if (incompleteEl) incompleteEl.style.display = 'none';
    } else {
      renderIncompleteCertificate(status, progress);
      if (eligibleEl) eligibleEl.style.display = 'none';
      if (incompleteEl) incompleteEl.style.display = 'flex';
    }
  } catch (error) {
    console.error('Erro ao processar certificado:', error);
    if (loadingEl) loadingEl.style.display = 'none';
    if (incompleteEl) {
      incompleteEl.style.display = 'flex';
      const title = incompleteEl.querySelector('.incomplete-title');
      if (title) title.textContent = 'Não foi possível carregar o progresso no momento.';
    }
  }
}

function renderEligibleCertificate(progress, localOnlyCount = 0) {
  const stored = getStoredCertificate(localStorage, _currentUser);
  const studentName = resolveStudentName(_currentUser, stored);
  const issuedAt = resolveCertificateDate(progress, stored);
  const formattedDate = formatCertificateDate(issuedAt);
  const authCode = generateVerificationCode(_currentUser?.id, issuedAt);

  _currentCertData = {
    issuedAt,
    customName: stored?.customName || '',
    verificationCode: authCode
  };

  saveStoredCertificate(localStorage, _currentUser, _currentCertData);

  const nameEl = document.getElementById('certStudentName');
  const dateEl = document.getElementById('certDateDisplay');
  const codeEl = document.getElementById('certAuthCode');
  const syncBadge = document.getElementById('syncStatusBadge');

  if (nameEl) nameEl.textContent = studentName;
  if (dateEl) dateEl.textContent = formattedDate;
  if (codeEl) codeEl.textContent = `ID de Autenticidade: ${authCode}`;

  if (syncBadge) {
    if (localOnlyCount > 0) {
      syncBadge.className = 'sync-status-badge local_only';
      syncBadge.innerHTML = '<i class="fas fa-mobile-alt" aria-hidden="true"></i> Salvo neste aparelho (sincronização pendente)';
    } else {
      syncBadge.className = 'sync-status-badge';
      syncBadge.innerHTML = '<i class="fas fa-check-circle" aria-hidden="true"></i> Conquista Registrada na Nuvem';
    }
  }
}

function renderIncompleteCertificate(status, progress) {
  const countEl = document.getElementById('incompleteCountDisplay');
  if (countEl) countEl.textContent = `${status.completedCount} de ${status.total}`;

  const listEl = document.getElementById('incompleteLessonsList');
  if (listEl) {
    listEl.innerHTML = '';
    MANDATORY_LESSON_KEYS.forEach(key => {
      const isDone = progress[key]?.completed;
      const title = MANDATORY_LESSON_TITLES[key] || key;
      const li = document.createElement('li');
      li.className = isDone ? 'done' : 'pending';
      li.innerHTML = isDone
        ? `<i class="fas fa-check-circle" aria-hidden="true"></i> ${title}`
        : `<i class="far fa-circle" aria-hidden="true"></i> ${title} (pendente)`;
      listEl.appendChild(li);
    });
  }
}

/* ===== AÇÕES DO USUÁRIO ===== */
window.ouvirCertificado = function(btn) {
  const name = document.getElementById('certStudentName')?.textContent || 'Aprendiz';
  const date = document.getElementById('certDateDisplay')?.textContent || '';
  const label = document.getElementById('labelOuvirCert');

  const texto = `Certificado de conclusão do AprendIDos. Certificamos com reconhecimento e alegria que ${name} concluiu todas as 9 atividades da jornada de alfabetização da plataforma AprendIDos em ${date}. Parabéns pelo seu esforço, dedicação e vitória!`;
  speakText(texto, btn, label);
};

window.ouvirMensagemIncompleta = function() {
  const count = document.getElementById('incompleteCountDisplay')?.textContent || '';
  const texto = `Para emitir o seu certificado, é necessário concluir as 9 atividades do AprendIDos. Você já concluiu ${count} atividades. Continue praticando no seu próprio ritmo, falta pouco para sua conquista!`;
  speakText(texto);
};

window.abrirModalNome = function() {
  const backdrop = document.getElementById('modalNomeBackdrop');
  const input = document.getElementById('inputNomeCustom');
  const current = document.getElementById('certStudentName')?.textContent || '';
  if (input) input.value = current !== 'Aprendiz' ? current : '';
  if (backdrop) backdrop.classList.add('visible');
  if (input) input.focus();
};

window.fecharModalNome = function() {
  const backdrop = document.getElementById('modalNomeBackdrop');
  if (backdrop) backdrop.classList.remove('visible');
};

window.salvarNomeCustom = function() {
  const input = document.getElementById('inputNomeCustom');
  const raw = input ? input.value.trim() : '';
  const newName = raw.length > 0 ? raw : (_currentUser?.name || 'Aprendiz');

  if (!_currentCertData) _currentCertData = {};
  _currentCertData.customName = raw;
  saveStoredCertificate(localStorage, _currentUser, _currentCertData);

  const nameEl = document.getElementById('certStudentName');
  if (nameEl) nameEl.textContent = newName;

  window.fecharModalNome();
};

// Fecha modal com a tecla ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    window.fecharModalNome();
  }
});

// Inicializa ao carregar a página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadCertificate);
} else {
  loadCertificate();
}

