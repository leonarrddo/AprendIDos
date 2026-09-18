/**
 * AprendIDos — Sílabas
 * silabas.js
 */

var wordBank = [
    { word: 'BOLA',  syl1: 'BO', syl2: 'LA',  distractors: ['BA','LO','BO','LA','LE','BU'] },
    { word: 'CASA',  syl1: 'CA', syl2: 'SA',  distractors: ['CO','SI','CA','SA','CE','SU'] },
    { word: 'FADA',  syl1: 'FA', syl2: 'DA',  distractors: ['FI','DE','FA','DA','FO','DU'] },
    { word: 'LAGO',  syl1: 'LA', syl2: 'GO',  distractors: ['LO','GA','LA','GO','LU','GI'] },
    { word: 'MAPA',  syl1: 'MA', syl2: 'PA',  distractors: ['MI','PE','MA','PA','MO','PU'] },
    { word: 'NADA',  syl1: 'NA', syl2: 'DA',  distractors: ['NO','DI','NA','DA','NU','DE'] },
    { word: 'PATO',  syl1: 'PA', syl2: 'TO',  distractors: ['PI','TA','PA','TO','PU','TE'] },
    { word: 'RODA',  syl1: 'RO', syl2: 'DA',  distractors: ['RA','DI','RO','DA','RU','DE'] },
    { word: 'SACO',  syl1: 'SA', syl2: 'CO',  distractors: ['SO','CA','SA','CO','SI','CE'] },
    { word: 'TELA',  syl1: 'TE', syl2: 'LA',  distractors: ['TA','LO','TE','LA','TI','LU'] },
    { word: 'VELA',  syl1: 'VE', syl2: 'LA',  distractors: ['VA','LO','VE','LA','VI','LI'] },
    { word: 'MULA',  syl1: 'MU', syl2: 'LA',  distractors: ['MA','LO','MU','LA','MI','LE'] },
    { word: 'GALO',  syl1: 'GA', syl2: 'LO',  distractors: ['GO','LA','GA','LO','GI','LU'] },
    { word: 'NETA',  syl1: 'NE', syl2: 'TA',  distractors: ['NA','TO','NE','TA','NO','TU'] },
    { word: 'DEDO',  syl1: 'DE', syl2: 'DO',  distractors: ['DA','DI','DE','DO','DU','DE'] },
    { word: 'FIGO',  syl1: 'FI', syl2: 'GO',  distractors: ['FA','GU','FI','GO','FO','GA'] },
    { word: 'PELE',  syl1: 'PE', syl2: 'LE',  distractors: ['PA','LO','PE','LE','PI','LA'] },
    { word: 'LOBA',  syl1: 'LO', syl2: 'BA',  distractors: ['LA','BI','LO','BA','LU','BE'] },
    { word: 'MEMO',  syl1: 'ME', syl2: 'MO',  distractors: ['MA','MI','ME','MO','MU','MA'] },
    { word: 'BICO',  syl1: 'BI', syl2: 'CO',  distractors: ['BA','CA','BI','CO','BU','CI'] },
    { word: 'CAMA',  syl1: 'CA', syl2: 'MA',  distractors: ['CO','MI','CA','MA','CI','MU'] },
    { word: 'DATA',  syl1: 'DA', syl2: 'TA',  distractors: ['DI','TO','DA','TA','DO','TU'] },
    { word: 'FOTO',  syl1: 'FO', syl2: 'TO',  distractors: ['FA','TA','FO','TO','FI','TU'] },
    { word: 'GEMA',  syl1: 'GE', syl2: 'MA',  distractors: ['GA','MI','GE','MA','GO','MU'] },
    { word: 'HORA',  syl1: 'HO', syl2: 'RA',  distractors: ['HA','RO','HO','RA','HU','RI'] },
    { word: 'JATO',  syl1: 'JA', syl2: 'TO',  distractors: ['JO','TA','JA','TO','JU','TI'] },
    { word: 'KILO',  syl1: 'KI', syl2: 'LO',  distractors: ['KA','LA','KI','LO','KU','LI'] },
    { word: 'LUTA',  syl1: 'LU', syl2: 'TA',  distractors: ['LA','TO','LU','TA','LO','TI'] },
    { word: 'MATO',  syl1: 'MA', syl2: 'TO',  distractors: ['MI','TA','MA','TO','MO','TU'] },
    { word: 'NOTA',  syl1: 'NO', syl2: 'TA',  distractors: ['NA','TO','NO','TA','NU','TI'] },
    { word: 'PIPA',  syl1: 'PI', syl2: 'PA',  distractors: ['PA','PE','PI','PA','PO','PU'] },
    { word: 'RATO',  syl1: 'RA', syl2: 'TO',  distractors: ['RO','TA','RA','TO','RI','TU'] },
    { word: 'SOLA',  syl1: 'SO', syl2: 'LA',  distractors: ['SA','LO','SO','LA','SI','LI'] },
    { word: 'TOCO',  syl1: 'TO', syl2: 'CO',  distractors: ['TA','CA','TO','CO','TU','CI'] },
    { word: 'VASO',  syl1: 'VA', syl2: 'SO',  distractors: ['VO','SA','VA','SO','VI','SI'] },
    { word: 'ZUMO',  syl1: 'ZU', syl2: 'MO',  distractors: ['ZA','MA','ZU','MO','ZO','MI'] },
    { word: 'FURO',  syl1: 'FU', syl2: 'RO',  distractors: ['FA','RA','FU','RO','FO','RI'] },
    { word: 'GOLA',  syl1: 'GO', syl2: 'LA',  distractors: ['GA','LO','GO','LA','GU','LI'] },
    { word: 'HULA',  syl1: 'HU', syl2: 'LA',  distractors: ['HA','LO','HU','LA','HO','LI'] },
    { word: 'JUBA',  syl1: 'JU', syl2: 'BA',  distractors: ['JA','BI','JU','BA','JO','BE'] }
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
    speak('Aprenda como as sílabas se juntam para formar palavras. Toque nos exemplos para ouvir.', function() {
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

    // Build options: correct pair + 2 wrong pairs
    var opts = buildOptions(q);
    var optCont = document.getElementById('optionsContainer');
    if (optCont) {
        optCont.innerHTML = '';
        opts.forEach(function(opt) {
            var btn = document.createElement('button');
            btn.className = 'btn-option-syl';
            btn.setAttribute('data-s1', opt.s1);
            btn.setAttribute('data-s2', opt.s2);
            btn.setAttribute('aria-label', opt.s1 + ' + ' + opt.s2 + ' = ' + opt.s1 + opt.s2);
            btn.innerHTML = '<span class="syl syl-1">' + opt.s1 + '</span><span class="syl-plus">+</span><span class="syl syl-2">' + opt.s2 + '</span><span class="syl-result">= ' + opt.s1 + opt.s2 + '</span>';
            var isCorrect = opt.s1 === q.syl1 && opt.s2 === q.syl2;
            btn.onclick = (function(ic, o, b) { return function() { checkAnswer(ic, o, b); }; })(isCorrect, opt, btn);
            optCont.appendChild(btn);
        });
    }
    setTimeout(playQuestionAudio, 400);
}

function buildOptions(q) {
    var correct = { s1: q.syl1, s2: q.syl2 };
    var dist = q.distractors.slice();
    var wrong = [];
    for (var i = 0; i < dist.length - 1 && wrong.length < 2; i += 2) {
        if (dist[i] !== q.syl1 || dist[i+1] !== q.syl2) {
            wrong.push({ s1: dist[i], s2: dist[i+1] });
        }
    }
    while (wrong.length < 2) wrong.push({ s1: 'MO', s2: 'TA' });
    return shuffle([correct].concat(wrong));
}

function playQuestionAudio() {
    if (currentIdx >= questions.length) return;
    var q = questions[currentIdx];
    var btn = document.getElementById('btnExerciseAudio');
    if (btn) btn.classList.add('speaking');
    speak('Qual par de sílabas forma a palavra: ' + q.word.toLowerCase() + '?', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function playHelpExercise() {
    var btn = document.getElementById('btnHelpExercise');
    if (btn) btn.classList.add('speaking');
    speak('Escolha o par de sílabas que forma a palavra ouvida.', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function checkAnswer(isCorrect, opt, btn) {
    if (answered) return;
    answered = true;
    document.querySelectorAll('.btn-option-syl').forEach(function(b) { b.disabled = true; });
    btn.classList.add(isCorrect ? 'correct' : 'wrong');
    if (!isCorrect) {
        var corrBtn = document.querySelector('.btn-option-syl[data-s1="' + questions[currentIdx].syl1 + '"][data-s2="' + questions[currentIdx].syl2 + '"]');
        if (corrBtn) corrBtn.classList.add('correct');
        errorLog.push({ word: questions[currentIdx].word, chosen: opt.s1 + opt.s2 });
    }
    if (isCorrect) {
        hits++;
        var h = document.getElementById('hitsCount'); if (h) h.textContent = hits;
        showFeedback('success', 'Muito bem! ' + questions[currentIdx].syl1 + ' + ' + questions[currentIdx].syl2 + ' = ' + questions[currentIdx].word);
        speak('Muito bem!');
    } else {
        misses++;
        var m = document.getElementById('missesCount'); if (m) m.textContent = misses;
        showFeedback('error', 'A resposta é ' + questions[currentIdx].syl1 + ' + ' + questions[currentIdx].syl2);
        speak('A resposta é ' + questions[currentIdx].syl1 + ' mais ' + questions[currentIdx].syl2 + '.');
    }
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
    var msg = hits === TOTAL ? 'Perfeito!' : hits >= 7 ? 'Muito bom!' : hits >= 5 ? 'Bom trabalho!' : 'Continue praticando!';
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
    speak('Parabens! Voce terminou! ' + msg);
}

function salvarProgresso() {
    var data = { completed: true, score: hits, total: TOTAL, misses: misses, savedAt: new Date().toISOString() };
    var user = null;
    try { var r = localStorage.getItem('aprendidos_usuario'); if (r) user = JSON.parse(r); } catch(e) {}
    var uk = (user && user.id) ? ('aprendidos_progresso_' + user.id) : null;
    [uk, 'aprendidos_progresso', 'aprendidos_progresso_anon'].filter(Boolean).forEach(function(k) {
        try { var c = JSON.parse(localStorage.getItem(k) || '{}'); c['silabas'] = data; localStorage.setItem(k, JSON.stringify(c)); } catch(e) {}
    });
    if (window.AprendIDosAuth && window.AprendIDosAuth.saveLessonProgress) {
        try { window.AprendIDosAuth.saveLessonProgress('silabas', data); } catch(e) {}
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
            if (raw) { var p = JSON.parse(raw); if (p && p.silabas && p.silabas.completed) { isDone = true; prevScore = p.silabas.score; prevTotal = p.silabas.total; break; } }
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
