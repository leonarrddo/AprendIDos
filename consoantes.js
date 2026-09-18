/**
 * AprendIDos — Consoantes e Sons
 * consoantes.js
 */

var consonantData = {
    B: { letter: 'B', word: 'Bola',     speech: 'B. B de Bola.' },
    C: { letter: 'C', word: 'Casa',     speech: 'C. C de Casa.' },
    D: { letter: 'D', word: 'Dado',     speech: 'D. D de Dado.' },
    F: { letter: 'F', word: 'Faca',     speech: 'F. F de Faca.' },
    G: { letter: 'G', word: 'Gato',     speech: 'G. G de Gato.' },
    H: { letter: 'H', word: 'Homem',    speech: 'H. H de Homem.' },
    J: { letter: 'J', word: 'Janela',   speech: 'J. J de Janela.' },
    K: { letter: 'K', word: 'Kiwi',     speech: 'K. K de Kiwi.' },
    L: { letter: 'L', word: 'Lua',      speech: 'L. L de Lua.' },
    M: { letter: 'M', word: 'Mao',      speech: 'M. M de Mão.' },
    N: { letter: 'N', word: 'Nuvem',    speech: 'N. N de Nuvem.' },
    P: { letter: 'P', word: 'Pao',      speech: 'P. P de Pão.' },
    Q: { letter: 'Q', word: 'Queijo',   speech: 'Q. Q de Queijo.' },
    R: { letter: 'R', word: 'Rato',     speech: 'R. R de Rato.' },
    S: { letter: 'S', word: 'Sol',      speech: 'S. S de Sol.' },
    T: { letter: 'T', word: 'Terra',    speech: 'T. T de Terra.' },
    V: { letter: 'V', word: 'Vaca',     speech: 'V. V de Vaca.' },
    W: { letter: 'W', word: 'Wagon',    speech: 'W. W de Vagão.' },
    X: { letter: 'X', word: 'Xicara',   speech: 'X. X de Xícara.' },
    Y: { letter: 'Y', word: 'Yuca',     speech: 'Y. Y de Yuca.' },
    Z: { letter: 'Z', word: 'Zebra',    speech: 'Z. Z de Zebra.' }
};

var wordBank = [
    { word: 'Bola',    consonant: 'B' }, { word: 'Barco',   consonant: 'B' }, { word: 'Boneca',  consonant: 'B' },
    { word: 'Casa',    consonant: 'C' }, { word: 'Cama',    consonant: 'C' }, { word: 'Cadeira', consonant: 'C' },
    { word: 'Dado',    consonant: 'D' }, { word: 'Dente',   consonant: 'D' }, { word: 'Doce',    consonant: 'D' },
    { word: 'Faca',    consonant: 'F' }, { word: 'Flor',    consonant: 'F' }, { word: 'Fogao',   consonant: 'F' },
    { word: 'Gato',    consonant: 'G' }, { word: 'Galinha', consonant: 'G' }, { word: 'Goiaba',  consonant: 'G' },
    { word: 'Janela',  consonant: 'J' }, { word: 'Jardim',  consonant: 'J' }, { word: 'Jogo',    consonant: 'J' },
    { word: 'Lua',     consonant: 'L' }, { word: 'Livro',   consonant: 'L' }, { word: 'Lapis',   consonant: 'L' },
    { word: 'Mesa',    consonant: 'M' }, { word: 'Milho',   consonant: 'M' }, { word: 'Mala',    consonant: 'M' },
    { word: 'Nuvem',   consonant: 'N' }, { word: 'Nariz',   consonant: 'N' }, { word: 'Ninho',   consonant: 'N' },
    { word: 'Pato',    consonant: 'P' }, { word: 'Pedra',   consonant: 'P' }, { word: 'Peixe',   consonant: 'P' },
    { word: 'Rato',    consonant: 'R' }, { word: 'Roupa',   consonant: 'R' }, { word: 'Rua',     consonant: 'R' },
    { word: 'Sol',     consonant: 'S' }, { word: 'Sapato',  consonant: 'S' }, { word: 'Sopa',    consonant: 'S' },
    { word: 'Terra',   consonant: 'T' }, { word: 'Telhado', consonant: 'T' }, { word: 'Tomate',  consonant: 'T' },
    { word: 'Vaca',    consonant: 'V' }, { word: 'Vela',    consonant: 'V' }, { word: 'Vidro',   consonant: 'V' },
    { word: 'Xale',    consonant: 'X' }, { word: 'Xeque',   consonant: 'X' }, { word: 'Xerife',  consonant: 'X' },
    { word: 'Zebra',   consonant: 'Z' }, { word: 'Zinco',   consonant: 'Z' }, { word: 'Zona',    consonant: 'Z' },
    { word: 'Queijo',  consonant: 'Q' }, { word: 'Quarto',  consonant: 'Q' }, { word: 'Queda',   consonant: 'Q' }
];

var consonantKeys = Object.keys(consonantData);
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
    u.lang = 'pt-BR'; u.rate = 0.85; u.pitch = 1; u.volume = 1;
    if (!ptVoice) loadVoices();
    if (ptVoice) u.voice = ptVoice;
    u.onend = function() { if (onEnd) onEnd(); };
    u.onerror = function() { if (onEnd) onEnd(); };
    setTimeout(function() { try { window.speechSynthesis.speak(u); } catch(e) { if (onEnd) onEnd(); } }, 80);
}

function speakConsonant(key) {
    var d = consonantData[key];
    if (!d) return;
    document.querySelectorAll('.consonant-card').forEach(function(c) { c.classList.remove('speaking'); });
    var card = document.querySelector('.consonant-card[data-consonant="' + key + '"]');
    if (card) card.classList.add('speaking');
    speak(d.speech, function() { if (card) card.classList.remove('speaking'); });
}

function playInstruction() {
    var btn = document.getElementById('btnInstruction');
    if (btn) btn.classList.add('speaking');
    speak('Conheça as consoantes. Toque em cada letra para ouvir o seu som.', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function announceSR(text) {
    var el = document.getElementById('srAnnouncer');
    if (el) { el.textContent = ''; setTimeout(function() { el.textContent = text; }, 60); }
}

function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
}

function getOptionsFor(correct) {
    var others = consonantKeys.filter(function(k) { return k !== correct; });
    return shuffle(shuffle(others).slice(0, 4).concat([correct]));
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
    var qWord = document.getElementById('questionWord');
    var pFill = document.getElementById('progressFill');
    var pBar = document.getElementById('progressBar');
    var pLabel = document.getElementById('progressLabel');
    var fbArea = document.getElementById('feedbackArea');
    var optCont = document.getElementById('optionsContainer');
    if (qWord) qWord.textContent = q.word;
    var pct = (currentIdx / TOTAL) * 100;
    if (pFill) pFill.style.width = pct + '%';
    if (pBar) pBar.setAttribute('aria-valuenow', Math.round(pct));
    if (pLabel) pLabel.textContent = 'Pergunta ' + (currentIdx + 1) + ' de ' + TOTAL;
    if (fbArea) fbArea.innerHTML = '';
    var opts = getOptionsFor(q.consonant);
    if (optCont) {
        optCont.innerHTML = '';
        opts.forEach(function(c) {
            var btn = document.createElement('button');
            btn.className = 'btn-option';
            btn.setAttribute('data-consonant', c);
            btn.setAttribute('aria-label', 'Letra ' + c);
            btn.textContent = c;
            btn.onclick = function() { checkAnswer(c); };
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
    speak('Qual é a primeira consoante da palavra: ' + q.word + '?', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function playHelpExercise() {
    var btn = document.getElementById('btnHelpExercise');
    if (btn) btn.classList.add('speaking');
    speak('Escolha a primeira consoante da palavra que aparece na tela.', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function checkAnswer(selected) {
    if (answered) return;
    answered = true;
    var q = questions[currentIdx];
    var correct = selected === q.consonant;
    document.querySelectorAll('.btn-option').forEach(function(b) { b.disabled = true; });
    var selBtn = document.querySelector('.btn-option[data-consonant="' + selected + '"]');
    if (selBtn) selBtn.classList.add(correct ? 'correct' : 'wrong');
    if (!correct) {
        var corrBtn = document.querySelector('.btn-option[data-consonant="' + q.consonant + '"]');
        if (corrBtn) corrBtn.classList.add('correct');
        errorLog.push({ word: q.word, correct: q.consonant, chosen: selected });
    }
    if (correct) {
        hits++;
        var h = document.getElementById('hitsCount'); if (h) h.textContent = hits;
        showFeedback('success', 'Muito bem! A letra é ' + q.consonant + '!');
        speak('Muito bem!');
    } else {
        misses++;
        var m = document.getElementById('missesCount'); if (m) m.textContent = misses;
        showFeedback('error', 'A letra correta é ' + q.consonant + '.');
        speak('A letra correta é ' + q.consonant + '.');
    }
    announceSR(correct ? 'Certo!' : 'A resposta era ' + q.consonant);
    var isLast = currentIdx >= TOTAL - 1;
    setTimeout(function() {
        var fb = document.getElementById('feedbackArea');
        if (fb) {
            fb.innerHTML += '<button class="btn-next" onclick="nextQuestion()" aria-label="' + (isLast ? 'Ver resultado' : 'Proxima') + '">' +
                '<i class="fas ' + (isLast ? 'fa-flag-checkered' : 'fa-arrow-right') + '"></i> ' + (isLast ? 'Ver resultado' : 'Proxima') + '</button>';
            var nb = document.querySelector('.btn-next'); if (nb) nb.focus();
        }
    }, correct ? 200 : 800);
}

function showFeedback(type, msg) {
    var fb = document.getElementById('feedbackArea');
    if (fb) fb.innerHTML = '<div class="feedback-msg ' + type + '" role="alert"><i class="fas ' + (type === 'success' ? 'fa-check-circle' : 'fa-redo') + '"></i> ' + msg + '</div>';
}

function nextQuestion() { currentIdx++; if (currentIdx >= TOTAL) showCompletion(); else loadQuestion(); }

function showCompletion() {
    var layout = document.getElementById('exerciseLayout');
    var comp = document.getElementById('completionScreen');
    if (layout) layout.style.display = 'none';
    if (comp) comp.classList.add('visible');
    var fh = document.getElementById('finalHits'); if (fh) fh.textContent = hits;
    var fm = document.getElementById('finalMisses'); if (fm) fm.textContent = misses;
    var ft = document.getElementById('finalTotal'); if (ft) ft.textContent = TOTAL;
    var pf = document.getElementById('progressFill'); if (pf) pf.style.width = '100%';
    var msg = hits === TOTAL ? 'Perfeito! Você acertou todas!' : hits >= 7 ? 'Muito bom!' : hits >= 5 ? 'Bom trabalho!' : 'Continue praticando!';
    var cm = document.getElementById('completionMsg'); if (cm) cm.textContent = msg;
    var errSum = document.getElementById('errorSummary');
    var errList = document.getElementById('errorList');
    if (errList) errList.innerHTML = '';
    if (errorLog.length > 0 && errSum && errList) {
        errSum.style.display = 'block';
        errorLog.forEach(function(e) {
            var li = document.createElement('li');
            li.innerHTML = e.word + ' — você escolheu <span class="wrong-answer">' + e.chosen + '</span> → correto: <span class="correct-answer">' + e.correct + '</span>';
            errList.appendChild(li);
        });
    } else if (errSum) errSum.style.display = 'none';
    salvarProgresso();
    speak('Parabens! Voce terminou! ' + msg);
}

function salvarProgresso() {
    var data = { completed: true, score: hits, total: TOTAL, misses: misses, savedAt: new Date().toISOString() };
    var user = null;
    try { var r = localStorage.getItem('aprendidos_usuario'); if (r) user = JSON.parse(r); } catch(e) {}
    var uk = (user && user.id) ? ('aprendidos_progresso_' + user.id) : null;
    [uk, 'aprendidos_progresso', 'aprendidos_progresso_anon'].filter(Boolean).forEach(function(k) {
        try { var c = JSON.parse(localStorage.getItem(k) || '{}'); c['consoantes'] = data; localStorage.setItem(k, JSON.stringify(c)); } catch(e) {}
    });
    if (window.AprendIDosAuth && window.AprendIDosAuth.saveLessonProgress) {
        try { window.AprendIDosAuth.saveLessonProgress('consoantes', data); } catch(e) {}
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
            if (raw) { var p = JSON.parse(raw); if (p && p.consoantes && p.consoantes.completed) { isDone = true; prevScore = p.consoantes.score; prevTotal = p.consoantes.total; break; } }
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

window.speak = speak; window.speakConsonant = speakConsonant; window.playInstruction = playInstruction;
window.playQuestionAudio = playQuestionAudio; window.playHelpExercise = playHelpExercise;
window.checkAnswer = checkAnswer; window.nextQuestion = nextQuestion; window.restartExercise = restartExercise;
window.salvarEVerOutras = salvarEVerOutras; window.verificarLicaoConcluida = verificarLicaoConcluida; window.toggleMenu = toggleMenu;

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', function() { initExercise(); verificarLicaoConcluida(); }); }
else { initExercise(); verificarLicaoConcluida(); }
