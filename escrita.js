/**
 * AprendIDos — Escrita (Ditado Digital)
 * escrita.js
 */

var wordBank = [
    { word: 'BOLA', hint: 'Brinquedo redondo que rola', audio: 'Bola' },
    { word: 'CASA', hint: 'Lugar onde a gente mora', audio: 'Casa' },
    { word: 'DADO', hint: 'Objeto de jogo com números', audio: 'Dado' },
    { word: 'GATO', hint: 'Animal de estimação que mia', audio: 'Gato' },
    { word: 'MESA', hint: 'Móvel onde colocamos o prato', audio: 'Mesa' },
    { word: 'PATO', hint: 'Ave que nada na lagoa', audio: 'Pato' },
    { word: 'RODA', hint: 'Peça redonda do carro ou bicicleta', audio: 'Roda' },
    { word: 'SUCO', hint: 'Bebida gostosa feita de frutas', audio: 'Suco' },
    { word: 'VELA', hint: 'Ilumina quando falta energia', audio: 'Vela' },
    { word: 'FACA', hint: 'Usada para cortar o pão', audio: 'Faca' }
];

var TOTAL = 6;
var questions = [], currentIdx = 0, hits = 0, misses = 0, errorLog = [];
var typedLetters = [];
var currentAudio = null, ptVoice = null;

function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    var v = window.speechSynthesis.getVoices();
    ptVoice = v.find(function(x) { return x.lang === 'pt-BR' || x.lang.startsWith('pt'); }) || null;
}
if ('speechSynthesis' in window) { loadVoices(); window.speechSynthesis.onvoiceschanged = loadVoices; }

function speak(text, onEnd) {
    if (currentAudio) { try { currentAudio.pause(); currentAudio.currentTime = 0; } catch(e) {} }
    if ('speechSynthesis' in window) { try { window.speechSynthesis.cancel(); } catch(e) {} }
    var url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=pt-BR&client=tw-ob&q=' + encodeURIComponent(text);
    var audio = new Audio(url);
    currentAudio = audio;
    var ok = false;
    audio.onended = function() { if (onEnd) onEnd(); };
    audio.onerror = function() { if (!ok) speakNativo(text, onEnd); };
    var p = audio.play();
    if (p) p.then(function() { ok = true; }).catch(function() { speakNativo(text, onEnd); });
}

function speakNativo(text, onEnd) {
    if (!('speechSynthesis' in window)) { if (onEnd) onEnd(); return; }
    try { window.speechSynthesis.cancel(); } catch(e) {}
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR'; u.rate = 0.8; u.pitch = 1; u.volume = 1;
    if (!ptVoice) loadVoices();
    if (ptVoice) u.voice = ptVoice;
    u.onend = function() { if (onEnd) onEnd(); };
    u.onerror = function() { if (onEnd) onEnd(); };
    setTimeout(function() { try { window.speechSynthesis.speak(u); } catch(e) { if (onEnd) onEnd(); } }, 80);
}

function playInstruction() {
    var btn = document.getElementById('btnInstruction');
    if (btn) btn.classList.add('speaking');
    speak('Treine a escrita das palavras. Ouça a palavra com atenção e escreva usando as teclas na tela ou o seu teclado.', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
}

function initExercise() {
    questions = shuffle(wordBank.slice()).slice(0, TOTAL);
    currentIdx = 0; hits = 0; misses = 0; errorLog = [];
    var h = document.getElementById('hitsCount'); if (h) h.textContent = '0';
    var m = document.getElementById('missesCount'); if (m) m.textContent = '0';
    var layout = document.getElementById('exerciseLayout');
    var comp = document.getElementById('completionScreen');
    if (layout) layout.style.display = '';
    if (comp) comp.classList.remove('visible');
    renderVirtualKeyboard();
    loadWord();
}

function loadWord() {
    typedLetters = [];
    var q = questions[currentIdx];
    if (!q) return;

    var pFill = document.getElementById('progressFill');
    var pBar = document.getElementById('progressBar');
    var pLabel = document.getElementById('progressLabel');
    var fbArea = document.getElementById('feedbackArea');

    var pct = (currentIdx / TOTAL) * 100;
    if (pFill) pFill.style.width = pct + '%';
    if (pBar) pBar.setAttribute('aria-valuenow', Math.round(pct));
    if (pLabel) pLabel.textContent = 'Palavra ' + (currentIdx + 1) + ' de ' + TOTAL;
    if (fbArea) fbArea.innerHTML = '';

    var hintEl = document.getElementById('wordHint');
    if (hintEl) hintEl.textContent = 'Dica: ' + q.hint;

    var slotsContainer = document.getElementById('letterSlots');
    if (slotsContainer) {
        slotsContainer.innerHTML = '';
        for (var i = 0; i < q.word.length; i++) {
            var slot = document.createElement('div');
            slot.className = 'letter-slot';
            slot.setAttribute('data-idx', i);
            slotsContainer.appendChild(slot);
        }
    }

    setTimeout(playQuestionAudio, 400);
}

function playQuestionAudio() {
    if (currentIdx >= questions.length) return;
    var q = questions[currentIdx];
    var btn = document.getElementById('btnExerciseAudio');
    if (btn) btn.classList.add('speaking');
    speak('Escreva a palavra: ' + q.audio, function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function playHelpExercise() {
    var btn = document.getElementById('btnHelpExercise');
    if (btn) btn.classList.add('speaking');
    speak('Toque nas letras do teclado na tela para escrever a palavra ouvida.', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function renderVirtualKeyboard() {
    var kb = document.getElementById('virtualKeyboard');
    if (!kb) return;
    var rows = [
        ['Q','W','E','R','T','Y','U','I','O','P'],
        ['A','S','D','F','G','H','J','K','L'],
        ['Z','X','C','V','B','N','M']
    ];

    kb.innerHTML = '';
    rows.forEach(function(row) {
        var rDiv = document.createElement('div');
        rDiv.className = 'kb-row';
        row.forEach(function(key) {
            var btn = document.createElement('button');
            btn.className = 'kb-key';
            btn.textContent = key;
            btn.setAttribute('data-key', key);
            btn.setAttribute('aria-label', 'Tecla ' + key);
            btn.onclick = function() { typeKey(key); };
            rDiv.appendChild(btn);
        });
        kb.appendChild(rDiv);
    });

    // Barra de ações (Apagar e Confirmar)
    var actRow = document.createElement('div');
    actRow.className = 'kb-row actions-row';

    var btnDel = document.createElement('button');
    btnDel.className = 'kb-key kb-action-key del-key';
    btnDel.innerHTML = '<i class="fas fa-backspace"></i> Apagar';
    btnDel.onclick = deleteKey;
    actRow.appendChild(btnDel);

    var btnConfirm = document.createElement('button');
    btnConfirm.className = 'kb-key kb-action-key confirm-key';
    btnConfirm.innerHTML = '<i class="fas fa-check"></i> Verificar';
    btnConfirm.onclick = checkTypedWord;
    actRow.appendChild(btnConfirm);

    kb.appendChild(actRow);
}

function typeKey(key) {
    var q = questions[currentIdx];
    if (!q || typedLetters.length >= q.word.length) return;

    typedLetters.push(key.toUpperCase());
    updateSlots();
    speak(key.toLowerCase(), null);

    if (typedLetters.length === q.word.length) {
        setTimeout(checkTypedWord, 350);
    }
}

function deleteKey() {
    if (typedLetters.length === 0) return;
    typedLetters.pop();
    updateSlots();
    var fbArea = document.getElementById('feedbackArea');
    if (fbArea) fbArea.innerHTML = '';
}

function updateSlots() {
    var slots = document.querySelectorAll('.letter-slot');
    slots.forEach(function(slot, idx) {
        slot.className = 'letter-slot';
        if (typedLetters[idx]) {
            slot.textContent = typedLetters[idx];
            slot.classList.add('filled');
        } else {
            slot.textContent = '';
        }
    });
}

function checkTypedWord() {
    var q = questions[currentIdx];
    if (!q || typedLetters.length === 0) return;

    var typed = typedLetters.join('');
    var isCorrect = typed === q.word;
    var slots = document.querySelectorAll('.letter-slot');
    var fb = document.getElementById('feedbackArea');

    if (isCorrect) {
        hits++;
        var h = document.getElementById('hitsCount'); if (h) h.textContent = hits;
        slots.forEach(function(s) { s.classList.add('correct'); });
        if (fb) fb.innerHTML = '<div class="feedback-msg success"><i class="fas fa-check-circle"></i> Muito bem! Palavra escrita corretamente!</div>';
        speak('Muito bem! Você escreveu ' + q.audio);

        var isLast = currentIdx >= TOTAL - 1;
        setTimeout(function() {
            if (fb) {
                fb.innerHTML += '<br><button class="btn-next" onclick="nextWord()"><i class="fas ' + (isLast ? 'fa-flag-checkered' : 'fa-arrow-right') + '"></i> ' + (isLast ? 'Ver resultado' : 'Próxima palavra') + '</button>';
                var nb = document.querySelector('.btn-next'); if (nb) nb.focus();
            }
        }, 500);
    } else {
        misses++;
        var m = document.getElementById('missesCount'); if (m) m.textContent = misses;
        errorLog.push({ word: q.word, typed: typed });
        slots.forEach(function(s) { s.classList.add('wrong'); });
        if (fb) fb.innerHTML = '<div class="feedback-msg error"><i class="fas fa-redo"></i> A palavra certa é <strong>' + q.word + '</strong>. Tente novamente!</div><br>' +
            '<button class="btn-next" onclick="retryCurrentWord()"><i class="fas fa-redo"></i> Tentar de novo</button>';
        speak('A palavra certa é ' + q.audio + '. Tente novamente.');
    }
}

function retryCurrentWord() {
    typedLetters = [];
    updateSlots();
    var fb = document.getElementById('feedbackArea');
    if (fb) fb.innerHTML = '';
}

function nextWord() {
    currentIdx++;
    if (currentIdx >= TOTAL) showCompletion();
    else loadWord();
}

function showCompletion() {
    var layout = document.getElementById('exerciseLayout');
    var comp = document.getElementById('completionScreen');
    if (layout) layout.style.display = 'none';
    if (comp) comp.classList.add('visible');

    var fh = document.getElementById('finalHits'); if (fh) fh.textContent = hits;
    var fm = document.getElementById('finalMisses'); if (fm) fm.textContent = misses;
    var ft = document.getElementById('finalTotal'); if (ft) ft.textContent = TOTAL;
    var pf = document.getElementById('progressFill'); if (pf) pf.style.width = '100%';

    var msg = hits === TOTAL ? 'Fantástico! Você escreveu todas as palavras sem errar!' : hits >= 4 ? 'Muito bem! Sua escrita está muito boa!' : 'Bom começo! A escrita melhora a cada treino!';
    var cm = document.getElementById('completionMsg'); if (cm) cm.textContent = msg;

    var errSum = document.getElementById('errorSummary');
    var errList = document.getElementById('errorList');
    if (errList) errList.innerHTML = '';
    if (errorLog.length > 0 && errSum && errList) {
        errSum.style.display = 'block';
        errorLog.forEach(function(e) {
            var li = document.createElement('li');
            li.innerHTML = 'Palavra: <strong>' + e.word + '</strong> — você digitou <span class="wrong-answer">' + e.typed + '</span>';
            errList.appendChild(li);
        });
    } else if (errSum) errSum.style.display = 'none';

    salvarProgresso();
    speak('Parabéns! Você concluiu a atividade de escrita. ' + msg);
}

function salvarProgresso() {
    var data = { completed: true, score: hits, total: TOTAL, misses: misses, savedAt: new Date().toISOString() };
    var user = null;
    try { var r = localStorage.getItem('aprendidos_usuario'); if (r) user = JSON.parse(r); } catch(e) {}
    var uk = (user && user.id) ? ('aprendidos_progresso_' + user.id) : null;
    [uk, 'aprendidos_progresso', 'aprendidos_progresso_anon'].filter(Boolean).forEach(function(k) {
        try { var c = JSON.parse(localStorage.getItem(k) || '{}'); c['escrita'] = data; localStorage.setItem(k, JSON.stringify(c)); } catch(e) {}
    });
    if (window.AprendIDosAuth && window.AprendIDosAuth.saveLessonProgress) {
        try { window.AprendIDosAuth.saveLessonProgress('escrita', data); } catch(e) {}
    }
}

function salvarEVerOutras(event) {
    if (event) event.preventDefault();
    var btn = document.getElementById('btnSalvarEVerOutras');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...'; }
    salvarProgresso();
    if (btn) btn.innerHTML = '<i class="fas fa-check-circle"></i> Salvo!';
    setTimeout(function() { window.location.href = 'licoes.html'; }, 450);
}

function verificarLicaoConcluida() {
    var isDone = false, prevScore = null, prevTotal = TOTAL;
    try {
        var user = null;
        try { var r = localStorage.getItem('aprendidos_usuario'); if (r) user = JSON.parse(r); } catch(e) {}
        var uk = (user && user.id) ? ('aprendidos_progresso_' + user.id) : null;
        var keys = [uk, 'aprendidos_progresso', 'aprendidos_progresso_anon'].filter(Boolean);
        for (var i = 0; i < keys.length; i++) {
            var raw = localStorage.getItem(keys[i]);
            if (raw) { var p = JSON.parse(raw); if (p && p.escrita && p.escrita.completed) { isDone = true; prevScore = p.escrita.score; prevTotal = p.escrita.total; break; } }
        }
    } catch(e) {}
    if (isDone) {
        var banner = document.getElementById('reviewBanner');
        var bt = document.getElementById('reviewBannerText');
        if (banner) { banner.style.display = 'flex'; if (bt) bt.innerHTML = 'Você já concluiu esta lição' + (prevScore !== null ? ' com <strong>' + prevScore + ' de ' + prevTotal + ' acertos</strong>' : '') + '! Sinta-se à vontade para praticar novamente.'; }
    }
}

function restartExercise() { initExercise(); verificarLicaoConcluida(); }

function toggleMenu() {
    var menu = document.getElementById('mobileMenu'), btn = document.querySelector('.navbar-hamburger');
    if (menu && btn) { var open = menu.classList.toggle('open'); btn.setAttribute('aria-expanded', open); }
}

document.addEventListener('keydown', function(e) {
    if (document.getElementById('completionScreen')?.classList.contains('visible')) return;
    if (e.key === 'Backspace') { deleteKey(); }
    else if (e.key === 'Enter') { checkTypedWord(); }
    else if (/^[a-zA-Z]$/.test(e.key)) { typeKey(e.key.toUpperCase()); }
});

document.addEventListener('click', function(e) {
    var menu = document.getElementById('mobileMenu'), btn = document.querySelector('.navbar-hamburger');
    if (menu && btn && menu.classList.contains('open') && !menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false');
    }
});

window.speak = speak; window.playInstruction = playInstruction; window.playQuestionAudio = playQuestionAudio;
window.playHelpExercise = playHelpExercise; window.typeKey = typeKey; window.deleteKey = deleteKey;
window.checkTypedWord = checkTypedWord; window.retryCurrentWord = retryCurrentWord;
window.nextWord = nextWord; window.restartExercise = restartExercise;
window.salvarEVerOutras = salvarEVerOutras; window.toggleMenu = toggleMenu;

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', function() { initExercise(); verificarLicaoConcluida(); }); }
else { initExercise(); verificarLicaoConcluida(); }
