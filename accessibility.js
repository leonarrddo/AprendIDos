(function () {
  'use strict';

  const STORAGE_KEY = 'aprendidos_accessibility';
  const COLOR_FILTERS = ['none', 'grayscale', 'sepia', 'invert'];
  const FONT_FAMILIES = ['system', 'verdana', 'arial', 'georgia'];
  const SATURATION_LEVELS = [100, 50, 150, 0];
  const SPACING_LEVELS = [0, 1, 2];
  const LINE_HEIGHT_LEVELS = [1.5, 1.8, 2.2];
  const LANGUAGE = 'pt-BR';
  const DEFAULTS = Object.freeze({
    fontScale: 1, contrast: false, textAlign: 'start', colorFilter: 'none', grayscale: false,
    textSpacing: 0, lineHeight: 1.5, lineSpacing: false, fontFamily: 'system', saturation: 100,
    dyslexiaFont: false, largeCursor: false, hideImages: false, pauseAnimations: false,
    highlightLinks: false, ruler: false, language: LANGUAGE
  });
  const FONT_STACKS = {
    system: 'system-ui, sans-serif',
    verdana: 'Verdana, Arial, sans-serif',
    arial: 'Arial, Helvetica, sans-serif',
    georgia: 'Georgia, serif'
  };
  const FONT_LABELS = { system: 'Padrão do site', verdana: 'Verdana', arial: 'Arial', georgia: 'Georgia' };
  const FILTER_LABELS = { none: 'Sem filtro', grayscale: 'Escala de cinza', sepia: 'Sépia', invert: 'Inverter cores' };
  const ALIGNMENTS = ['start', 'center', 'end', 'justify'];
  const ALIGNMENT_LABELS = { start: 'Padrão', center: 'Centralizado', end: 'À direita', justify: 'Justificado' };

  function readPreferences() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const scale = Number(saved.fontScale);
      const filter = COLOR_FILTERS.includes(saved.colorFilter) ? saved.colorFilter : (saved.grayscale ? 'grayscale' : 'none');
      const lineHeight = LINE_HEIGHT_LEVELS.includes(Number(saved.lineHeight)) ? Number(saved.lineHeight) : (saved.lineSpacing ? 1.8 : 1.5);
      const spacing = Number.isInteger(Number(saved.textSpacing)) ? Math.min(2, Math.max(0, Number(saved.textSpacing))) : (saved.lineSpacing ? 1 : 0);
      return {
        ...DEFAULTS,
        ...saved,
        fontScale: Number.isFinite(scale) ? Math.min(1.5, Math.max(.8, scale)) : 1,
        colorFilter: filter,
        grayscale: filter === 'grayscale',
        textAlign: ALIGNMENTS.includes(saved.textAlign) ? saved.textAlign : 'start',
        textSpacing: spacing,
        lineHeight,
        lineSpacing: lineHeight > 1.5,
        fontFamily: FONT_FAMILIES.includes(saved.fontFamily) ? saved.fontFamily : 'system',
        saturation: SATURATION_LEVELS.includes(Number(saved.saturation)) ? Number(saved.saturation) : 100,
        language: LANGUAGE
      };
    } catch {
      return { ...DEFAULTS };
    }
  }

  const prefs = readPreferences();
  const textBaselines = new WeakMap();
  const textElements = new Set();
  let panel, toggle, status, ruler, speechActive = false, recognition = null, voiceActive = false;
  let isApplyingFont = false;

  function announce(message) {
    if (status) status.textContent = message;
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      announce('Não foi possível salvar as preferências neste dispositivo.');
    }
  }

  function shouldScale(element) {
    if (!(element instanceof HTMLElement) || element.closest('#aprendidos-a11y-panel, #aprendidos-a11y-toggle, #aprendidos-a11y-status, [vw], [vw-access-button], .vw-access-button')) return false;
    if (element.matches('script, style, link, meta, svg, path, canvas, audio, video, iframe, br, hr')) return false;
    return Boolean((element.textContent || '').trim()) || element.matches('input, textarea, select, button');
  }

  function registerText(root, shouldApply = true) {
    const nodes = [];
    if (root instanceof HTMLElement && shouldScale(root) && !textBaselines.has(root)) nodes.push(root);
    if (root.querySelectorAll) root.querySelectorAll('*').forEach(node => { if (shouldScale(node) && !textBaselines.has(node)) nodes.push(node); });
    if (!nodes.length) return;

    nodes.forEach(node => {
      const computed = getComputedStyle(node);
      const size = Number.parseFloat(computed.fontSize);
      textBaselines.set(node, {
        size: Number.isFinite(size) ? size : 16,
        inlineSize: node.style.getPropertyValue('font-size'),
        inlineSizePriority: node.style.getPropertyPriority('font-size'),
        inlineFamily: node.style.getPropertyValue('font-family'),
        inlineFamilyPriority: node.style.getPropertyPriority('font-family')
      });
      textElements.add(node);
    });
    if (shouldApply) applyTypography();
  }

  function selectedFontFamily() {
    return prefs.dyslexiaFont ? FONT_STACKS.verdana : FONT_STACKS[prefs.fontFamily];
  }

  function applyTypography() {
    if (isApplyingFont) return;
    isApplyingFont = true;
    textElements.forEach(node => {
      if (!node.isConnected) { textElements.delete(node); return; }
      const baseline = textBaselines.get(node);
      if (prefs.fontScale === 1) {
        node.style.removeProperty('font-size');
        node.removeAttribute('data-a11y-font-scaled');
        if (baseline.inlineSize) node.style.setProperty('font-size', baseline.inlineSize, baseline.inlineSizePriority);
      } else {
        node.style.setProperty('font-size', `${Math.round(baseline.size * prefs.fontScale * 100) / 100}px`, 'important');
        node.setAttribute('data-a11y-font-scaled', 'true');
      }

      if (prefs.dyslexiaFont || prefs.fontFamily !== 'system') {
        node.style.setProperty('font-family', selectedFontFamily(), 'important');
      } else {
        node.style.removeProperty('font-family');
        if (baseline.inlineFamily) node.style.setProperty('font-family', baseline.inlineFamily, baseline.inlineFamilyPriority);
      }
    });
    isApplyingFont = false;
  }

  function activeContentFilters() {
    const filters = [];
    if (prefs.colorFilter === 'grayscale') filters.push('grayscale(1)');
    else if (prefs.colorFilter === 'sepia') filters.push('sepia(1)');
    else if (prefs.colorFilter === 'invert') filters.push('invert(1) hue-rotate(180deg)');
    if (prefs.saturation !== 100) filters.push(`saturate(${prefs.saturation / 100})`);
    return filters;
  }

  function applyContentFilters() {
    document.querySelectorAll('.a11y-content-filter-target').forEach(node => {
      node.classList.remove('a11y-content-filter-target');
      node.style.removeProperty('--aprendidos-a11y-filter-chain');
    });
    const filters = activeContentFilters();
    if (!filters.length) return;

    document.querySelectorAll('main, [role="main"]').forEach(root => {
      const fixedElementsAndAncestors = new Set();
      if (getComputedStyle(root).position === 'fixed') fixedElementsAndAncestors.add(root);
      root.querySelectorAll('*').forEach(element => {
        if (getComputedStyle(element).position !== 'fixed') return;
        let ancestor = element;
        while (ancestor && root.contains(ancestor)) {
          fixedElementsAndAncestors.add(ancestor);
          if (ancestor === root) break;
          ancestor = ancestor.parentElement;
        }
      });

      function markSafeContent(element) {
        if (fixedElementsAndAncestors.has(element)) {
          Array.from(element.children).forEach(markSafeContent);
          return;
        }
        const existingFilter = getComputedStyle(element).filter;
        element.classList.add('a11y-content-filter-target');
        element.style.setProperty('--aprendidos-a11y-filter-chain', `${existingFilter === 'none' ? '' : `${existingFilter} `}${filters.join(' ')}`);
      }
      markSafeContent(root);
    });
  }

  function updateCardState(name, active, value) {
    const card = panel.querySelector(`[data-card="${name}"]`);
    if (!card) return;
    card.classList.toggle('is-active', Boolean(active));
    const indicator = card.querySelector('[data-card-state]');
    if (indicator) indicator.textContent = value;
    card.querySelectorAll('button[data-action][aria-pressed]').forEach(button => {
      button.setAttribute('aria-pressed', String(Boolean(active)));
    });
  }

  function updateCardStates() {
    updateCardState('text-size', prefs.fontScale !== 1, `${Math.round(prefs.fontScale * 100)}%`);
    updateCardState('contrast', prefs.contrast, prefs.contrast ? 'Ativado' : 'Desativado');
    updateCardState('text-align', prefs.textAlign !== 'start', ALIGNMENT_LABELS[prefs.textAlign]);
    updateCardState('color-filter', prefs.colorFilter !== 'none', FILTER_LABELS[prefs.colorFilter]);
    updateCardState('text-spacing', prefs.textSpacing > 0, prefs.textSpacing === 0 ? 'Padrão' : `Nível ${prefs.textSpacing}`);
    updateCardState('line-height', prefs.lineHeight !== 1.5, `${prefs.lineHeight}×`);
    updateCardState('font-family', prefs.fontFamily !== 'system', prefs.dyslexiaFont ? 'Fonte para dislexia' : FONT_LABELS[prefs.fontFamily]);
    updateCardState('saturation', prefs.saturation !== 100, `${prefs.saturation}%`);
    updateCardState('dyslexia-font', prefs.dyslexiaFont, prefs.dyslexiaFont ? 'Ativada' : 'Desativada');
    updateCardState('large-cursor', prefs.largeCursor, prefs.largeCursor ? 'Ativado' : 'Desativado');
    updateCardState('hide-images', prefs.hideImages, prefs.hideImages ? 'Ativado' : 'Desativado');
    updateCardState('pause-animations', prefs.pauseAnimations, prefs.pauseAnimations ? 'Pausadas' : 'Em movimento');
    updateCardState('reader', speechActive, speechActive ? 'Lendo' : 'Pronto');
    updateCardState('voice-commands', voiceActive, voiceActive ? 'Ouvindo' : 'Pronto');
    updateCardState('highlight-links', prefs.highlightLinks, prefs.highlightLinks ? 'Ativado' : 'Desativado');
    updateCardState('reading-ruler', prefs.ruler, prefs.ruler ? 'Ativada' : 'Desativada');

    panel.querySelector('[data-action="color-filter"]').value = prefs.colorFilter;
    panel.querySelector('[data-action="font-family"]').value = prefs.fontFamily;
    const readerButton = panel.querySelector('[data-action="read-aloud"]');
    readerButton.setAttribute('aria-pressed', String(speechActive));
    readerButton.querySelector('.a11y-control-label').textContent = speechActive ? 'Parar leitura' : 'Iniciar leitura';
    const voiceButton = panel.querySelector('[data-action="voice-commands"]');
    voiceButton.setAttribute('aria-pressed', String(voiceActive));
    voiceButton.querySelector('.a11y-control-label').textContent = voiceActive ? 'Parar comandos' : 'Iniciar comandos';
  }

  function applyPreferences() {
    document.body.classList.toggle('a11y-high-contrast', prefs.contrast);
    document.body.classList.toggle('a11y-text-spacing', prefs.textSpacing > 0);
    document.body.classList.toggle('a11y-line-spacing', prefs.lineHeight !== 1.5);
    document.body.classList.toggle('a11y-dyslexia-font', prefs.dyslexiaFont);
    document.body.classList.toggle('a11y-large-cursor', prefs.largeCursor);
    document.body.classList.toggle('a11y-hide-images', prefs.hideImages);
    document.body.classList.toggle('a11y-pause-animations', prefs.pauseAnimations);
    document.body.classList.toggle('a11y-highlight-links', prefs.highlightLinks);
    document.body.dataset.a11yTextAlign = prefs.textAlign;
    document.body.dataset.a11yLineHeight = String(prefs.lineHeight);
    document.body.style.setProperty('--aprendidos-a11y-letter-spacing', `${prefs.textSpacing * 0.04}em`);
    document.body.style.setProperty('--aprendidos-a11y-word-spacing', `${prefs.textSpacing * 0.12}em`);
    document.documentElement.lang = LANGUAGE;
    ruler.classList.toggle('is-active', prefs.ruler);
    document.querySelectorAll('img').forEach(image => {
      const inTool = image.closest('#aprendidos-a11y-panel, #aprendidos-a11y-toggle, [vw], [vw-access-button], .vw-access-button');
      image.classList.toggle('a11y-image-hidden', prefs.hideImages && !inTool);
    });
    applyContentFilters();
    applyTypography();
    updateCardStates();
  }

  function makeCard(name, icon, title, controls, state = 'Padrão', description = '') {
    return `<article class="a11y-card" data-card="${name}"><div class="a11y-card-heading"><span class="a11y-card-icon" aria-hidden="true">${icon}</span><span class="a11y-card-state" data-card-state>${state}</span></div><h3>${title}</h3>${description ? `<p class="a11y-card-description">${description}</p>` : ''}<div class="a11y-card-controls">${controls}</div></article>`;
  }

  function makePanel() {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = new URL('accessibility.css', document.currentScript?.src || location.href).href;
    document.head.append(style);

    toggle = document.createElement('button');
    toggle.id = 'aprendidos-a11y-toggle';
    toggle.type = 'button';
    toggle.title = 'Acessibilidade';
    toggle.setAttribute('aria-label', 'Abrir ferramentas de acessibilidade');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'aprendidos-a11y-panel');
    toggle.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><circle cx="24" cy="8" r="4" fill="currentColor"/><path d="M10 16h28M24 14v12m0 0-10 16m10-16 10 16m-10-16-9 10m9-10 9 10" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Acessibilidade</span>';
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));

    panel = document.createElement('section');
    panel.id = 'aprendidos-a11y-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'aprendidos-a11y-title');
    const actionButton = (action, icon, label, pressed = false) => `<button type="button" class="a11y-control-button" data-action="${action}" aria-label="${label}"${pressed ? ' aria-pressed="false"' : ''}><span class="a11y-control-icon" aria-hidden="true">${icon}</span><span class="a11y-control-label">${label}</span></button>`;
    const cards = [
      makeCard('text-size', 'A↕', 'Tamanho do Texto', `${actionButton('font-increase', 'A+', 'Aumentar texto')} ${actionButton('font-decrease', 'A−', 'Diminuir texto')} ${actionButton('font-reset', 'A', 'Tamanho padrão')}`, '100%'),
      makeCard('contrast', '◐', 'Alto Contraste', actionButton('contrast', '◐', 'Ativar ou desativar alto contraste', true), 'Desativado'),
      makeCard('text-align', '≡', 'Alinhamento do Texto', actionButton('text-align', '↔', 'Alternar alinhamento do texto'), 'Padrão'),
      makeCard('color-filter', '◩', 'Filtro de Cor', '<select class="a11y-card-select" data-action="color-filter" aria-label="Escolher filtro de cor"><option value="none">Sem filtro</option><option value="grayscale">Escala de cinza</option><option value="sepia">Sépia</option><option value="invert">Inverter cores</option></select>', 'Sem filtro'),
      makeCard('text-spacing', '↔', 'Espaçamento de Texto', actionButton('text-spacing', '↔', 'Alternar espaçamento entre letras e palavras'), 'Padrão'),
      makeCard('line-height', '↕', 'Altura da Linha', actionButton('line-spacing', '↕', 'Alternar altura da linha'), '1.5×'),
      makeCard('font-family', 'Aa', 'Seleção de Fonte', '<select class="a11y-card-select" data-action="font-family" aria-label="Escolher fonte"><option value="system">Padrão do site</option><option value="verdana">Verdana</option><option value="arial">Arial</option><option value="georgia">Georgia</option></select>', 'Padrão do site'),
      makeCard('saturation', '◉', 'Saturação', actionButton('saturation', '◉', 'Alternar saturação de cores'), '100%'),
      makeCard('dyslexia-font', 'd', 'Fonte para Dislexia', actionButton('dyslexia-font', 'Aa', 'Ativar ou desativar fonte para dislexia', true), 'Desativada', 'Usa Verdana e espaçamento ampliado.'),
      makeCard('large-cursor', '↖', 'Cursor Maior', actionButton('large-cursor', '↖', 'Ativar ou desativar cursor maior', true), 'Desativado'),
      makeCard('hide-images', '▧', 'Ocultar Imagens', actionButton('hide-images', '▧', 'Ocultar ou mostrar imagens', true), 'Desativado'),
      makeCard('pause-animations', 'Ⅱ', 'Pausar Animações', actionButton('pause-animations', 'Ⅱ', 'Pausar ou retomar animações', true), 'Em movimento'),
      makeCard('reader', '🔊', 'Leitor de Tela', actionButton('read-aloud', '▶', 'Iniciar leitura', true), 'Pronto', 'Lê o conteúdo da página em voz alta.'),
      makeCard('voice-commands', '🎙', 'Comando de Voz', actionButton('voice-commands', '🎙', 'Iniciar comandos de voz', true), 'Pronto', 'Use comandos como “aumentar texto” ou “alto contraste”.'),
      makeCard('highlight-links', '↗', 'Destacar Links', actionButton('highlight-links', '↗', 'Destacar links da página', true), 'Desativado'),
      makeCard('reading-ruler', '▤', 'Régua de Leitura', actionButton('reading-ruler', '▤', 'Ativar ou desativar régua de leitura', true), 'Desativada')
    ].join('');
    panel.innerHTML = `<div class="a11y-panel-chrome"><header class="a11y-header"><h2 id="aprendidos-a11y-title">Ferramentas de Acessibilidade</h2><div class="a11y-header-actions"><button type="button" data-action="reset-all" class="a11y-header-button a11y-restore" aria-label="Restaurar todas as configurações" title="Restaurar todas as configurações"><span aria-hidden="true">↺</span></button><button type="button" id="aprendidos-a11y-close" class="a11y-header-button a11y-close" aria-label="Fechar ferramentas de acessibilidade" title="Fechar">×</button></div></header><div class="a11y-language-row"><label for="aprendidos-a11y-language">Idioma</label><select id="aprendidos-a11y-language" aria-label="Idioma das ferramentas"><option value="pt-BR">Português (Brasil)</option></select></div></div><div class="a11y-content"><p class="a11y-intro">Ative os recursos que ajudam você a ler e navegar pelo AprendIDos.</p><div class="a11y-grid">${cards}</div></div>`;

    panel.querySelector('#aprendidos-a11y-close').addEventListener('click', () => setOpen(false, true));
    panel.addEventListener('click', event => {
      const button = event.target.closest('button[data-action]');
      if (button) handleAction(button.dataset.action, button);
    });
    panel.addEventListener('change', event => {
      const control = event.target.closest('select[data-action]');
      if (control) handleAction(control.dataset.action, control);
    });
    panel.querySelector('#aprendidos-a11y-language').addEventListener('change', event => {
      // A interface do AprendIDos atualmente oferece conteúdo somente em pt-BR.
      prefs.language = LANGUAGE;
      document.documentElement.lang = LANGUAGE;
      event.target.value = LANGUAGE;
      save();
      announce('Português do Brasil é o idioma disponível no AprendIDos.');
    });

    document.body.append(toggle, panel);
    ruler = document.createElement('div');
    ruler.id = 'aprendidos-a11y-ruler';
    ruler.setAttribute('aria-hidden', 'true');
    document.body.append(ruler);
    status = document.createElement('div');
    status.id = 'aprendidos-a11y-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    document.body.append(status);
    document.addEventListener('pointermove', event => { if (prefs.ruler) ruler.style.top = `${Math.max(0, Math.min(innerHeight - 46, event.clientY - 23))}px`; }, { passive: true });
    document.addEventListener('touchmove', event => { if (prefs.ruler && event.touches[0]) ruler.style.top = `${Math.max(0, Math.min(innerHeight - 46, event.touches[0].clientY - 23))}px`; }, { passive: true });
    document.addEventListener('keydown', handlePanelKeys);
    document.addEventListener('pointerdown', event => { if (!panel.hidden && !panel.contains(event.target) && !toggle.contains(event.target)) setOpen(false, false); });
    new MutationObserver(records => {
      const added = [];
      records.forEach(record => record.addedNodes.forEach(node => {
        if (node instanceof HTMLElement && !node.closest('#aprendidos-a11y-panel, #aprendidos-a11y-toggle') && !added.some(parent => parent.contains(node))) added.push(node);
      }));
      if (added.length) {
        const restore = [];
        if (prefs.fontScale !== 1 || prefs.fontFamily !== 'system' || prefs.dyslexiaFont) textElements.forEach(node => {
          restore.push([node, node.style.getPropertyValue('font-size'), node.style.getPropertyPriority('font-size'), node.style.getPropertyValue('font-family'), node.style.getPropertyPriority('font-family')]);
          node.style.removeProperty('font-size');
          node.style.removeProperty('font-family');
        });
        added.forEach(node => registerText(node, false));
        restore.forEach(([node, size, sizePriority, family, familyPriority]) => {
          if (size) node.style.setProperty('font-size', size, sizePriority);
          if (family) node.style.setProperty('font-family', family, familyPriority);
        });
        applyTypography();
      }
      if (records.length) applyContentFilters();
    }).observe(document.body, { childList: true, subtree: true });
    registerText(document.body);
    applyPreferences();
  }

  function handlePanelKeys(event) {
    if (event.key === 'Escape' && !panel.hidden) { setOpen(false, true); return; }
    if (event.key === 'Tab' && !panel.hidden) {
      const focusable = [...panel.querySelectorAll('button:not(:disabled), select:not(:disabled), [href], [tabindex]:not([tabindex="-1"])')].filter(element => element.getClientRects().length);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    }
    if (prefs.ruler && event.target.closest?.('[data-action="reading-ruler"]') && ['ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      const current = Number.parseFloat(ruler.style.top) || Math.max(0, innerHeight / 2 - 23);
      ruler.style.top = `${Math.max(0, Math.min(innerHeight - 46, current + (event.key === 'ArrowDown' ? 24 : -24)))}px`;
    }
  }

  function setOpen(open, returnFocus = false) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar ferramentas de acessibilidade' : 'Abrir ferramentas de acessibilidade');
    document.body.classList.toggle('a11y-panel-open', open);
    if (open) panel.querySelector('#aprendidos-a11y-close').focus();
    else if (returnFocus) toggle.focus();
  }

  function persistAndApply(message) {
    prefs.grayscale = prefs.colorFilter === 'grayscale';
    prefs.lineSpacing = prefs.lineHeight !== 1.5;
    save();
    applyPreferences();
    if (message) announce(message);
  }

  function handleAction(action, control) {
    const before = JSON.stringify(prefs);
    if (action === 'font-increase') prefs.fontScale = Math.min(1.5, Math.round((prefs.fontScale + .1) * 10) / 10);
    else if (action === 'font-decrease') prefs.fontScale = Math.max(.8, Math.round((prefs.fontScale - .1) * 10) / 10);
    else if (action === 'font-reset') prefs.fontScale = 1;
    else if (action === 'contrast') prefs.contrast = !prefs.contrast;
    else if (action === 'text-align') prefs.textAlign = ALIGNMENTS[(ALIGNMENTS.indexOf(prefs.textAlign) + 1) % ALIGNMENTS.length];
    else if (action === 'color-filter') prefs.colorFilter = COLOR_FILTERS.includes(control.value) ? control.value : 'none';
    else if (action === 'grayscale') prefs.colorFilter = prefs.colorFilter === 'grayscale' ? 'none' : 'grayscale';
    else if (action === 'text-spacing') prefs.textSpacing = SPACING_LEVELS[(SPACING_LEVELS.indexOf(prefs.textSpacing) + 1) % SPACING_LEVELS.length];
    else if (action === 'line-spacing') prefs.lineHeight = LINE_HEIGHT_LEVELS[(LINE_HEIGHT_LEVELS.indexOf(prefs.lineHeight) + 1) % LINE_HEIGHT_LEVELS.length];
    else if (action === 'font-family') prefs.fontFamily = FONT_FAMILIES.includes(control.value) ? control.value : 'system';
    else if (action === 'saturation') prefs.saturation = SATURATION_LEVELS[(SATURATION_LEVELS.indexOf(prefs.saturation) + 1) % SATURATION_LEVELS.length];
    else if (action === 'dyslexia-font') prefs.dyslexiaFont = !prefs.dyslexiaFont;
    else if (action === 'large-cursor') prefs.largeCursor = !prefs.largeCursor;
    else if (action === 'hide-images') prefs.hideImages = !prefs.hideImages;
    else if (action === 'pause-animations') prefs.pauseAnimations = !prefs.pauseAnimations;
    else if (action === 'highlight-links') prefs.highlightLinks = !prefs.highlightLinks;
    else if (action === 'reading-ruler') {
      prefs.ruler = !prefs.ruler;
      if (prefs.ruler) ruler.style.top = `${Math.max(0, innerHeight / 2 - 23)}px`;
    } else if (action === 'read-aloud') { toggleSpeech(); return; }
    else if (action === 'voice-commands') { toggleVoiceCommands(); return; }
    else if (action === 'reset-all') {
      stopSpeech(false);
      stopVoiceCommands(false);
      Object.assign(prefs, DEFAULTS);
      persistAndApply('Todas as configurações de acessibilidade foram restauradas.');
      return;
    } else return;

    persistAndApply(actionMessage(action));
    if (control instanceof HTMLButtonElement) control.focus();
    if (before === JSON.stringify(prefs) && action.startsWith('font-')) announce('Este é o limite disponível para o tamanho do texto.');
  }

  function actionMessage(action) {
    const messages = {
      'font-increase': 'Texto aumentado.', 'font-decrease': 'Texto diminuído.', 'font-reset': 'Tamanho do texto restaurado.',
      contrast: prefs.contrast ? 'Alto contraste ativado.' : 'Alto contraste desativado.',
      'text-align': `Alinhamento do texto: ${ALIGNMENT_LABELS[prefs.textAlign]}.`,
      'color-filter': `Filtro de cor: ${FILTER_LABELS[prefs.colorFilter]}.`, grayscale: prefs.grayscale ? 'Escala de cinza ativada.' : 'Escala de cinza desativada.',
      'text-spacing': prefs.textSpacing ? `Espaçamento de texto no nível ${prefs.textSpacing}.` : 'Espaçamento de texto restaurado.',
      'line-spacing': `Altura da linha: ${prefs.lineHeight}.`, 'font-family': `Fonte selecionada: ${prefs.dyslexiaFont ? 'Verdana para dislexia' : FONT_LABELS[prefs.fontFamily]}.`,
      saturation: `Saturação de cores: ${prefs.saturation}%.`, 'dyslexia-font': prefs.dyslexiaFont ? 'Fonte para dislexia ativada.' : 'Fonte para dislexia desativada.',
      'large-cursor': prefs.largeCursor ? 'Cursor maior ativado.' : 'Cursor maior desativado.', 'hide-images': prefs.hideImages ? 'Imagens ocultadas.' : 'Imagens exibidas.',
      'pause-animations': prefs.pauseAnimations ? 'Animações pausadas.' : 'Animações retomadas.',
      'highlight-links': prefs.highlightLinks ? 'Links destacados.' : 'Destaque dos links desativado.',
      'reading-ruler': prefs.ruler ? 'Régua de leitura ativada. Use o ponteiro ou as setas para posicioná-la.' : 'Régua de leitura desativada.'
    };
    return messages[action];
  }

  function pageTextToRead() {
    const selection = window.getSelection()?.toString().trim();
    if (selection) return selection;
    const main = document.querySelector('main, [role="main"]');
    const content = (main || document.body).cloneNode(true);
    content.querySelectorAll('button, input, textarea, select, nav, [aria-hidden="true"], script, style, audio, video, iframe, #aprendidos-a11y-panel, #aprendidos-a11y-toggle').forEach(node => node.remove());
    return (content.innerText || content.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function toggleSpeech() {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      announce('A leitura em voz alta não está disponível neste navegador. Use o leitor de tela do sistema, como VoiceOver, TalkBack ou NVDA.');
      return;
    }
    if (speechActive) { stopSpeech(true); return; }
    const text = pageTextToRead();
    if (!text) { announce('Não há texto disponível para leitura nesta página.'); return; }
    const synthesis = window.speechSynthesis;
    synthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANGUAGE;
    utterance.rate = .88;
    const voices = synthesis.getVoices();
    const voice = voices.find(item => /^pt-BR$/i.test(item.lang)) || voices.find(item => /^pt/i.test(item.lang));
    if (voice) utterance.voice = voice;
    utterance.onend = () => { speechActive = false; updateCardStates(); announce('Leitura concluída.'); };
    utterance.onerror = () => { speechActive = false; updateCardStates(); announce('Não foi possível iniciar a leitura. Tente novamente ou use o leitor de tela do sistema.'); };
    try {
      synthesis.speak(utterance);
      speechActive = true;
      updateCardStates();
      announce(voice ? `Leitura iniciada com a voz ${voice.name}.` : 'Leitura iniciada com a voz padrão disponível no dispositivo.');
    } catch {
      speechActive = false;
      updateCardStates();
      announce('Não foi possível iniciar a leitura em voz alta neste dispositivo.');
    }
  }

  function stopSpeech(notify = true) {
    if (window.speechSynthesis && speechActive) window.speechSynthesis.cancel();
    speechActive = false;
    if (panel) updateCardStates();
    if (notify) announce('Leitura interrompida.');
  }

  function toggleVoiceCommands() {
    if (voiceActive && recognition) { recognition.stop(); return; }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      announce('Comandos de voz não estão disponíveis neste navegador. Use os controles do painel pelo teclado ou o controle por voz do sistema.');
      return;
    }
    if (!window.isSecureContext) {
      announce('Comandos de voz exigem uma conexão segura. Abra o AprendIDos em HTTPS.');
      return;
    }
    try {
      recognition = new Recognition();
      recognition.lang = LANGUAGE;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onstart = () => { voiceActive = true; updateCardStates(); announce('Estou ouvindo. Diga um comando, como “aumentar texto”.'); };
      recognition.onresult = event => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        runVoiceCommand(transcript);
      };
      recognition.onerror = event => {
        voiceActive = false; updateCardStates();
        announce(event.error === 'not-allowed' ? 'Acesso ao microfone negado. Você ainda pode usar os botões do painel.' : 'Não foi possível reconhecer sua fala. Tente novamente ou use os controles do painel.');
      };
      recognition.onend = () => { voiceActive = false; recognition = null; updateCardStates(); };
      recognition.start();
    } catch {
      recognition = null; voiceActive = false; updateCardStates();
      announce('Não foi possível iniciar o microfone. Verifique a permissão do navegador ou use os controles do painel.');
    }
  }

  function runVoiceCommand(transcript) {
    const command = transcript.toLocaleLowerCase(LANGUAGE).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const commands = [
      { match: /aument(ar|e) (a )?(fonte|texto)/, action: 'font-increase' },
      { match: /diminu(ir|a) (a )?(fonte|texto)/, action: 'font-decrease' },
      { match: /contraste/, action: 'contrast' },
      { match: /escala de cinza|tons de cinza/, action: 'grayscale' },
      { match: /destacar links|realcar links/, action: 'highlight-links' },
      { match: /pausar animacoes/, action: 'pause-animations' },
      { match: /ocultar imagens/, action: 'hide-images' },
      { match: /restaurar (todas|configuracoes)/, action: 'reset-all' },
      { match: /iniciar leitura|ler pagina/, action: 'read-aloud' }
    ];
    const matched = commands.find(item => item.match.test(command));
    if (matched) {
      if (matched.action === 'grayscale') handleAction('grayscale');
      else if (matched.action === 'reset-all') handleAction('reset-all');
      else if (matched.action === 'read-aloud') toggleSpeech();
      else handleAction(matched.action);
      announce(`Comando executado: ${transcript}.`);
      return;
    }
    if (/parar leitura/.test(command)) { stopSpeech(true); announce('Comando executado: parar leitura.'); return; }
    if (/fechar painel/.test(command)) { setOpen(false, true); announce('Painel fechado.'); return; }
    if (/abrir painel/.test(command)) { setOpen(true); announce('Painel de acessibilidade aberto.'); return; }
    announce(`Não reconheci o comando “${transcript}”. Tente “aumentar texto”, “alto contraste” ou “fechar painel”.`);
  }

  function stopVoiceCommands(notify = false) {
    if (recognition) {
      const activeRecognition = recognition;
      recognition = null;
      try { activeRecognition.stop(); } catch {}
    }
    voiceActive = false;
    if (panel) updateCardStates();
    if (notify) announce('Comandos de voz interrompidos.');
  }

  function initialize() {
    if (!document.body || document.getElementById('aprendidos-a11y-toggle')) return;
    makePanel();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
  window.addEventListener('beforeunload', () => { stopSpeech(false); stopVoiceCommands(false); });
})();
