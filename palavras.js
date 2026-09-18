/**
 * AprendIDos — Palavras do Dia a Dia
 * palavras.js
 */

var wordBank = [
    { word: 'CAMA',   emoji: '🛏️', distractors: ['MESA', 'SALA'] },
    { word: 'MESA',   emoji: '🪵', distractors: ['CAMA', 'COPO'] },
    { word: 'PÃO',    emoji: '🥖', distractors: ['MÃO', 'CHÃO'] },
    { word: 'COPO',   emoji: '🥛', distractors: ['BOLO', 'FOGO'] },
    { word: 'CAFÉ',   emoji: '☕', distractors: ['BIFE', 'DOCE'] },
    { word: 'ÁGUA',   emoji: '💧', distractors: ['LUZ', 'FOGO'] },
    { word: 'FOGO',   emoji: '🔥', distractors: ['JOGO', 'BOLO'] },
    { word: 'PORTA',  emoji: '🚪', distractors: ['HORTA', 'TORTA'] },
    { word: 'SAPATO', emoji: '👞', distractors: ['BATATA', 'MACACO'] },
    { word: 'BOLO',   emoji: '🎂', distractors: ['COPO', 'BOLA'] },
    { word: 'PRATO',  emoji: '🍽️', distractors: ['PATO', 'GATO'] },
    { word: 'COLHER', emoji: '🥄', distractors: ['MULHER', 'FOLHA'] },
    { word: 'PANELA', emoji: '🍲', distractors: ['JANELA', 'CANELA'] },
    { word: 'SALA',   emoji: '🛋️', distractors: ['MALA', 'FALA'] },
    { word: 'ROUPA',  emoji: '👕', distractors: ['SOPA', 'LUPA'] },
    { word: 'CHAVE',  emoji: '🔑', distractors: ['NAVE', 'AVE'] },
    { word: 'RELOGIO',emoji: '⏰', distractors: ['QUADRO', 'ESPELHO'] },
    { word: 'JANELA', emoji: '🪟', distractors: ['PANELA', 'CANETA'] },
    { word: 'SABÃO',  emoji: '🧼', distractors: ['LIMÃO', 'BALÃO'] },
    { word: 'ESCOVA', emoji: '🪥', distractors: ['ESCOLA', 'ESPONJA'] }
];

var TOTAL = 10;
var questions = [], currentIdx = 0, hits = 0, misses = 0, answered = false, errorLog = [];
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
    speak('Aprenda a reconhecer palavras comuns do dia a dia. Toque nos exemplos para ouvir.', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function playDemo(word) {
    speak(word, null);
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
    currentIdx = 0; hits = 0; misses = 0; answered = false; errorLog = [];
    var h = document.getElementById('hitsCount'); if (h) h.textContent = '0';
    var m = document.getElementById('missesCount'); if (m) m.textContent = '0';
    var layout = document.getElementById('exerciseLayout');
    var comp = document.getElementById('completionScreen');
    if (layout) layout.style.display = '';
    if (comp) comp.classList.remove('visible');
    loadQuestion();
}

function loadQuestion() {
    answered = false;
    var q = questions[currentIdx];
    if (!q) return;

    var pFill = document.getElementById('progressFill');
    var pBar = document.getElementById('progressBar');
    var pLabel = document.getElementById('progressLabel');
    var fbArea = document.getElementById('feedbackArea');

    var pct = (currentIdx / TOTAL) * 100;
    if (pFill) pFill.style.width = pct + '%';
    if (pBar) pBar.setAttribute('aria-valuenow', Math.round(pct));
    if (pLabel) pLabel.textContent = 'Pergunta ' + (currentIdx + 1) + ' de ' + TOTAL;
    if (fbArea) fbArea.innerHTML = '';

    var opts = shuffle([q.word].concat(q.distractors));
    var optCont = document.getElementById('optionsContainer');
    if (optCont) {
        optCont.innerHTML = '';
        opts.forEach(function(optWord) {
            var btn = document.createElement('button');
            btn.className = 'btn-word-opt';
            btn.setAttribute('data-word', optWord);
            btn.setAttribute('aria-label', 'Palavra ' + optWord);
            btn.textContent = optWord;
            var isCorrect = optWord === q.word;
            btn.onclick = (function(ic, w, b) { return function() { checkAnswer(ic, w, b); }; })(isCorrect, optWord, btn);
            optCont.appendChild(btn);
        });
    }

    setTimeout(playQuestionAudio, 400);
}

function playQuestionAudio() {
    if (currentIdx >= questions.length) return;
    var q = questions[currentIdx];
    var btn = document.getElementById('btnExerciseAudio');
    if (btn) btn.classList.add('speaking');
    speak('Onde está escrito: ' + q.word.toLowerCase() + '?', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function playHelpExercise() {
    var btn = document.getElementById('btnHelpExercise');
    if (btn) btn.classList.add('speaking');
    speak('Toque no botão de som para ouvir a palavra e depois escolha a opção correta.', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function checkAnswer(isCorrect, optWord, btn) {
    if (answered) return;
    answered = true;

    document.querySelectorAll('.btn-word-opt').forEach(function(b) { b.disabled = true; });
    btn.classList.add(isCorrect ? 'correct' : 'wrong');

    if (!isCorrect) {
        var corrBtn = document.querySelector('.btn-word-opt[data-word="' + questions[currentIdx].word + '"]');
        if (corrBtn) corrBtn.classList.add('correct');
        errorLog.push({ word: questions[currentIdx].word, chosen: optWord });
    }

    if (isCorrect) {
        hits++;
        var h = document.getElementById('hitsCount'); if (h) h.textContent = hits;
        showFeedback('success', 'Muito bem! ' + questions[currentIdx].emoji + ' ' + questions[currentIdx].word);
        speak('Muito bem! ' + questions[currentIdx].word.toLowerCase());
    } else {
        misses++;
        var m = document.getElementById('missesCount'); if (m) m.textContent = misses;
        showFeedback('error', 'A palavra certa é ' + questions[currentIdx].word);
        speak('A palavra certa é ' + questions[currentIdx].word.toLowerCase());
    }

    var isLast = currentIdx >= TOTAL - 1;
    setTimeout(function() {
        var fb = document.getElementById('feedbackArea');
        if (fb) {
            fb.innerHTML += '<button class="btn-next" onclick="nextQuestion()" aria-label="' + (isLast ? 'Ver resultado' : 'Próxima') + '">' +
                '<i class="fas ' + (isLast ? 'fa-flag-checkered' : 'fa-arrow-right') + '"></i> ' + (isLast ? 'Ver resultado' : 'Próxima') + '</button>';
            var nb = document.querySelector('.btn-next'); if (nb) nb.focus();
        }
    }, isCorrect ? 200 : 700);
}

function showFeedback(type, msg) {
    var fb = document.getElementById('feedbackArea');
    if (fb) fb.innerHTML = '<div class="feedback-msg ' + type + '" role="alert"><i class="fas ' + (type === 'success' ? 'fa-check-circle' : 'fa-redo') + '"></i> ' + msg + '</div>';
}

function nextQuestion() {
    currentIdx++;
    if (currentIdx >= TOTAL) showCompletion();
    else loadQuestion();
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

    var msg = hits === TOTAL ? 'Excelente! Acertou tudo!' : hits >= 7 ? 'Muito bem! Grande resultado!' : hits >= 5 ? 'Bom trabalho!' : 'Continue praticando!';
    var cm = document.getElementById('completionMsg'); if (cm) cm.textContent = msg;

    var errSum = document.getElementById('errorSummary');
    var errList = document.getElementById('errorList');
    if (errList) errList.innerHTML = '';
    if (errorLog.length > 0 && errSum && errList) {
        errSum.style.display = 'block';
        errorLog.forEach(function(e) {
            var li = document.createElement('li');
            li.innerHTML = 'Palavra: <strong>' + e.word + '</strong> — você escolheu <span class="wrong-answer">' + e.chosen + '</span>';
            errList.appendChild(li);
        });
    } else if (errSum) errSum.style.display = 'none';

    salvarProgresso();
    speak('Parabéns! Você concluiu as palavras do dia a dia. ' + msg);
}

function salvarProgresso() {
    var data = { completed: true, score: hits, total: TOTAL, misses: misses, savedAt: new Date().toISOString() };
    var user = null;
    try { var r = localStorage.getItem('aprendidos_usuario'); if (r) user = JSON.parse(r); } catch(e) {}
    var uk = (user && user.id) ? ('aprendidos_progresso_' + user.id) : null;
    [uk, 'aprendidos_progresso', 'aprendidos_progresso_anon'].filter(Boolean).forEach(function(k) {
        try { var c = JSON.parse(localStorage.getItem(k) || '{}'); c['palavras'] = data; localStorage.setItem(k, JSON.stringify(c)); } catch(e) {}
    });
    if (window.AprendIDosAuth && window.AprendIDosAuth.saveLessonProgress) {
        try { window.AprendIDosAuth.saveLessonProgress('palavras', data); } catch(e) {}
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
            if (raw) { var p = JSON.parse(raw); if (p && p.palavras && p.palavras.completed) { isDone = true; prevScore = p.palavras.score; prevTotal = p.palavras.total; break; } }
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

document.addEventListener('click', function(e) {
    var menu = document.getElementById('mobileMenu'), btn = document.querySelector('.navbar-hamburger');
    if (menu && btn && menu.classList.contains('open') && !menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false');
    }
});

window.speak = speak; window.playInstruction = playInstruction; window.playDemo = playDemo;
window.playQuestionAudio = playQuestionAudio; window.playHelpExercise = playHelpExercise;
window.nextQuestion = nextQuestion; window.restartExercise = restartExercise;
window.salvarEVerOutras = salvarEVerOutras; window.toggleMenu = toggleMenu;

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', function() { initExercise(); verificarLicaoConcluida(); }); }
else { initExercise(); verificarLicaoConcluida(); }
