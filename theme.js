/**
 * AprendIDos - Sistema de Temas (Modo Claro & Modo Escuro Acessível)
 * Especialmente projetado para alta visibilidade, facilidade de uso e acessibilidade para idosos.
 */

(function () {
  'use strict';

  var THEME_KEY = 'aprendidos_theme';

  // 1. Aplicação imediata para evitar tela branca rápida (FOUC)
  function applyInitialTheme() {
    try {
      var savedTheme = localStorage.getItem(THEME_KEY);
      var currentTheme = savedTheme || 'light';
      if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark-mode');
        if (document.body) document.body.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
        if (document.body) document.body.classList.remove('dark-mode');
      }
    } catch (e) {
      console.warn('Erro ao ler tema inicial:', e);
    }
  }

  applyInitialTheme();

  // Executa novamente assim que o body estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyInitialTheme);
  } else {
    applyInitialTheme();
  }

  // 2. Feedback por Voz Acessível (Web Speech API)
  var _themePtVoice = null;
  function _loadThemeVoices() {
    if (!('speechSynthesis' in window)) return;
    var v = window.speechSynthesis.getVoices();
    if (!v || v.length === 0) return;
    _themePtVoice =
      v.find(function(x) { return x.lang === 'pt-BR'; }) ||
      v.find(function(x) { return x.lang === 'pt_BR'; }) ||
      v.find(function(x) { return x.lang.startsWith('pt'); }) || null;
  }
  if ('speechSynthesis' in window) {
    _loadThemeVoices();
    window.speechSynthesis.onvoiceschanged = _loadThemeVoices;
  }

  function speakFeedback(texto) {
    if ('speechSynthesis' in window) {
      try {
        // Se uma atividade estiver tocando áudio ou falando, não cancela nem compete com a lição
        var atividadeFalando = document.querySelector('.speaking, .highlight-line') !== null || window.speechSynthesis.speaking;
        if (atividadeFalando) {
          return;
        }

        var utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.85;
        utterance.pitch = 1.0;

        if (!_themePtVoice) _loadThemeVoices();
        if (_themePtVoice) utterance.voice = _themePtVoice;

        setTimeout(function() {
          try {
            window.speechSynthesis.speak(utterance);
          } catch (e) {}
        }, 60);
      } catch (e) {
        // Fallback silencioso se o navegador bloquear ou não tiver áudio
      }
    }
  }

  // 3. Toast visual temporário
  function showThemeToast(msg, icon) {
    var id = 'aprendidos-theme-toast';
    var toast = document.getElementById(id);
    if (!toast) {
      toast = document.createElement('div');
      toast.id = id;
      toast.className = 'toast-tema-flutuante';
      document.body.appendChild(toast);
    }
    toast.innerHTML = '<span style="font-size:22px;">' + icon + '</span><span>' + msg + '</span>';
    toast.classList.add('visivel');

    if (window._themeToastTimeout) clearTimeout(window._themeToastTimeout);
    window._themeToastTimeout = setTimeout(function () {
      toast.classList.remove('visivel');
    }, 2400);
  }

  // 4. Alteração de Tema
  function setTheme(theme, silent) {
    var isDark = theme === 'dark';
    try {
      localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    } catch (e) {}

    if (isDark) {
      document.documentElement.classList.add('dark-mode');
      if (document.body) document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
      if (document.body) document.body.classList.remove('dark-mode');
    }

    updateAllSwitches(isDark ? 'dark' : 'light');

    // Dispara evento customizado para outros scripts
    try {
      window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme: isDark ? 'dark' : 'light' } }));
    } catch (e) {}

    if (!silent) {
      if (isDark) {
        speakFeedback('Modo escuro ativado. Cores confortáveis para descansar a visão.');
        showThemeToast('Modo Escuro ativado', '🌙');
      } else {
        speakFeedback('Modo claro ativado.');
        showThemeToast('Modo Claro ativado', '☀️');
      }
    }
  }

  function getTheme() {
    try {
      return localStorage.getItem(THEME_KEY) || 'light';
    } catch (e) {
      return 'light';
    }
  }

  function toggleTheme() {
    var next = getTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  // 5. Criação do HTML do interruptor circular unificado (Sol / Lua)
  function createSwitchElement() {
    var container = document.createElement('div');
    container.className = 'aprendidos-theme-switch';
    container.setAttribute('role', 'group');
    container.setAttribute('aria-label', 'Controle de tema claro e escuro');

    var currentTheme = getTheme();
    var isDark = currentTheme === 'dark';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle-btn theme-switch-btn ' + (isDark ? 'btn-escuro btn-claro active mode-dark' : 'btn-escuro mode-light');
    btn.id = 'btnThemeToggle';
    btn.setAttribute('aria-label', isDark ? 'Ativar modo claro' : 'Ativar modo escuro');
    btn.setAttribute('title', isDark ? 'Ativar modo claro' : 'Ativar modo escuro');
    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');

    var iconSpan = document.createElement('span');
    iconSpan.className = 'theme-icon-indicator';
    iconSpan.setAttribute('aria-hidden', 'true');
    iconSpan.textContent = isDark ? '🌙' : '☀️';

    btn.appendChild(iconSpan);

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      toggleTheme();
    });

    container.appendChild(btn);
    return container;
  }

  // 6. Atualização do estado visual do botão circular
  function updateAllSwitches(currentTheme) {
    var isDark = currentTheme === 'dark';
    var switches = document.querySelectorAll('.aprendidos-theme-switch');
    switches.forEach(function (sw) {
      var btn = sw.querySelector('.theme-toggle-btn, .theme-switch-btn');
      if (btn) {
        btn.setAttribute('aria-label', isDark ? 'Ativar modo claro' : 'Ativar modo escuro');
        btn.setAttribute('title', isDark ? 'Ativar modo claro' : 'Ativar modo escuro');
        btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');

        if (isDark) {
          btn.classList.add('active', 'mode-dark', 'btn-escuro', 'btn-claro');
          btn.classList.remove('mode-light');
        } else {
          btn.classList.remove('active', 'mode-dark', 'btn-claro');
          btn.classList.add('mode-light', 'btn-escuro');
        }

        var iconSpan = btn.querySelector('.theme-icon-indicator') || btn.querySelector('span');
        if (iconSpan) {
          iconSpan.textContent = isDark ? '🌙' : '☀️';
        }
      }
    });
  }

  // 7. Inicialização automática em slots da página
  function initSwitches() {
    var slots = document.querySelectorAll('.seletor-tema-container, [data-theme-slot]');
    var inserted = false;

    if (slots.length > 0) {
      slots.forEach(function (slot) {
        if (!slot.querySelector('.aprendidos-theme-switch')) {
          slot.innerHTML = '';
          slot.appendChild(createSwitchElement());
          inserted = true;
        }
      });
    }

    // Se a página não tiver slot explícito, posiciona na navbar com prioridade para mobile
    if (!inserted && !document.querySelector('.aprendidos-theme-switch')) {
      var navbar = document.querySelector('.navbar');
      if (navbar) {
        var hamburger = navbar.querySelector('.navbar-hamburger');
        var wrap = document.createElement('div');
        wrap.className = 'navbar-theme-wrapper';
        wrap.appendChild(createSwitchElement());
        if (hamburger) {
          navbar.insertBefore(wrap, hamburger);
          inserted = true;
        } else {
          var navTarget = navbar.querySelector('.navbar-right') || navbar.querySelector('.navbar-nav');
          if (navTarget) {
            navTarget.appendChild(wrap);
            inserted = true;
          } else {
            navbar.appendChild(wrap);
            inserted = true;
          }
        }
      } else if (document.body && !document.querySelector('.floating-theme-switch')) {
        // Se for tela de login/cadastro/inicio sem navbar, coloca botão circular flutuante
        var floatWrap = document.createElement('div');
        floatWrap.className = 'floating-theme-switch';
        floatWrap.appendChild(createSwitchElement());
        document.body.appendChild(floatWrap);
        inserted = true;
      }
    }

    updateAllSwitches(getTheme());
  }

  // Sincronização entre abas
  window.addEventListener('storage', function (e) {
    if (e.key === THEME_KEY) {
      applyInitialTheme();
      updateAllSwitches(e.newValue || 'light');
    }
  });

  // Exporta objeto global
  window.AprendIDosTheme = {
    getTheme: getTheme,
    setTheme: setTheme,
    toggleTheme: toggleTheme,
    createSwitchElement: createSwitchElement,
    updateAllSwitches: updateAllSwitches,
    init: initSwitches
  };

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSwitches);
  } else {
    initSwitches();
  }
})();
