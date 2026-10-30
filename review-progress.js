(function (global) {
  'use strict';

  var FALLBACK_MESSAGE = 'Você já concluiu este treino anteriormente. Pratique novamente para manter seu aprendizado!';

  function readCount(value) {
    if (typeof value === 'string' && value.trim() === '') return null;
    if (typeof value !== 'number' && typeof value !== 'string') return null;
    var count = Number(value);
    return Number.isSafeInteger(count) && count >= 0 ? count : null;
  }

  function getValue(record, names) {
    for (var i = 0; i < names.length; i++) {
      if (Object.prototype.hasOwnProperty.call(record, names[i])) return record[names[i]];
    }
    return undefined;
  }

  function format(record) {
    if (!record || record.completed !== true) return null;

    var score = readCount(getValue(record, ['score', 'hits', 'acertos', 'pontuacao']));
    var total = readCount(getValue(record, ['total', 'totalQuestions', 'total_questoes']));
    if (score !== null && total !== null && total > 0 && score <= total) {
      return 'Você já concluiu este treino com ' + score + ' de ' + total + ' acertos. Pratique novamente para manter seu aprendizado!';
    }
    return FALLBACK_MESSAGE;
  }

  function getCurrentProgress() {
    try {
      var user = null;
      var userRaw = global.localStorage.getItem('aprendidos_usuario');
      if (userRaw) user = JSON.parse(userRaw);

      var storageKey = user && user.id
        ? ((user.isDemo ? 'aprendidos_progresso_demo_' : 'aprendidos_progresso_') + user.id)
        : 'aprendidos_progresso_anonymous_v2';
      var raw = global.localStorage.getItem(storageKey);
      var progress = raw ? JSON.parse(raw) : null;
      return progress && typeof progress === 'object' && !Array.isArray(progress) ? progress : null;
    } catch (error) {
      return null;
    }
  }

  function render(lessonId) {
    var banner = global.document.getElementById('reviewBanner');
    var bannerText = global.document.getElementById('reviewBannerText');
    if (banner) banner.style.display = 'none';

    var progress = getCurrentProgress();
    var record = progress && progress[lessonId];
    var message = format(record);
    if (message === null) return false;

    if (!banner) return false;

    banner.style.display = 'flex';
    if (bannerText) bannerText.textContent = message;
    return true;
  }

  global.AprendIDosReview = {
    fallbackMessage: FALLBACK_MESSAGE,
    format: format,
    render: render
  };
})(window);
