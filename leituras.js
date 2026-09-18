/**
 * AprendIDos — Pequenas Leituras
 * leituras.js
 */

var storyBank = [
    {
        title: 'O Café de Dona Maria',
        emoji: '☕',
        lines: [
            'Dona Maria acorda bem cedinho.',
            'Ela passa um café bem quentinho.',
            'O cheirinho de café enche a casa toda.',
            'O dia começa com muita paz e alegria.'
        ],
        audioFull: 'O Café de Dona Maria. Dona Maria acorda bem cedinho. Ela passa um café bem quentinho. O cheirinho de café enche a casa toda. O dia começa com muita paz e alegria.',
        question: 'O que a Dona Maria preparou?',
        options: ['Café quentinho', 'Suco gelado', 'Chá verde'],
        correct: 0
    },
    {
        title: 'As Flores do Seu José',
        emoji: '🌸',
        lines: [
            'Seu José cuida do jardim com carinho.',
            'Ele rega as plantas todo fim de tarde.',
            'Hoje uma linda flor vermelha se abriu.',
            'Os passarinhos cantam felizes na árvore.'
        ],
        audioFull: 'As Flores do Seu José. Seu José cuida do jardim com carinho. Ele rega as plantas todo fim de tarde. Hoje uma linda flor vermelha se abriu. Os passarinhos cantam felizes na árvore.',
        question: 'O que o Seu José cuida no quintal?',
        options: ['Do jardim', 'Do carro', 'Do barco'],
        correct: 0
    },
    {
        title: 'O Gato Mimi',
        emoji: '🐱',
        lines: [
            'O gato Mimi gosta de dormir na cadeira.',
            'Ele toma leite na sua tigela azul.',
            'Quando ganha carinho, ele ronrona bem alto.',
            'Mimi é um companheiro muito carinhoso.'
        ],
        audioFull: 'O Gato Mimi. O gato Mimi gosta de dormir na cadeira. Ele toma leite na sua tigela azul. Quando ganha carinho, ele ronrona bem alto. Mimi é um companheiro muito carinhoso.',
        question: 'Onde o gato Mimi gosta de dormir?',
        options: ['Na cadeira', 'No telhado', 'Na calçada'],
        correct: 0
    },
    {
        title: 'O Bolo da Vovó',
        emoji: '🎂',
        lines: [
            'Vovó fez um bolo de milho delicioso.',
            'A cozinha ficou com cheiro muito bom.',
            'Ela chamou os netos para lanchar.',
            'Todos comeram e pediram mais um pedaço.'
        ],
        audioFull: 'O Bolo da Vovó. Vovó fez um bolo de milho delicioso. A cozinha ficou com cheiro muito bom. Ela chamou os netos para lanchar. Todos comeram e pediram mais um pedaço.',
        question: 'De que sabor era o bolo da vovó?',
        options: ['Bolo de milho', 'Bolo de limão', 'Bolo de carne'],
        correct: 0
    },
    {
        title: 'O Pato na Lagoa',
        emoji: '🦆',
        lines: [
            'O patinho amarelo foi nadar na lagoa.',
            'A água estava calma e refrescante.',
            'Ele mergulhou e achou um peixinho.',
            'Depois sacudiu as penas sob o sol.'
        ],
        audioFull: 'O Pato na Lagoa. O patinho amarelo foi nadar na lagoa. A água estava calma e refrescante. Ele mergulhou e achou um peixinho. Depois sacudiu as penas sob o sol.',
        question: 'Onde o patinho foi nadar?',
        options: ['Na lagoa', 'Na banheira', 'Na piscina'],
        correct: 0
    }
];

var TOTAL = 4;
var stories = [], currentIdx = 0, hits = 0, misses = 0, answered = false;
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
    speak('Acompanhe a leitura de cada pequena história. Você pode ouvir a história completa e depois responder uma pergunta sobre ela.', function() {
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
    stories = shuffle(storyBank.slice()).slice(0, TOTAL);
    currentIdx = 0; hits = 0; misses = 0; answered = false;
    var h = document.getElementById('hitsCount'); if (h) h.textContent = '0';
    var m = document.getElementById('missesCount'); if (m) m.textContent = '0';
    var layout = document.getElementById('exerciseLayout');
    var comp = document.getElementById('completionScreen');
    if (layout) layout.style.display = '';
    if (comp) comp.classList.remove('visible');
    loadStory();
}

function loadStory() {
    answered = false;
    var s = stories[currentIdx];
    if (!s) return;

    var pFill = document.getElementById('progressFill');
    var pBar = document.getElementById('progressBar');
    var pLabel = document.getElementById('progressLabel');
    var fbArea = document.getElementById('feedbackArea');

    var pct = (currentIdx / TOTAL) * 100;
    if (pFill) pFill.style.width = pct + '%';
    if (pBar) pBar.setAttribute('aria-valuenow', Math.round(pct));
    if (pLabel) pLabel.textContent = 'Leitura ' + (currentIdx + 1) + ' de ' + TOTAL;
    if (fbArea) fbArea.innerHTML = '';

    var storyCard = document.getElementById('storyCard');
    if (storyCard) {
        var linesHtml = s.lines.map(function(line, lidx) {
            return '<p class="story-line" onclick="speakLine(\'' + line.replace(/'/g, "\\'") + '\', this)" role="button" tabindex="0" aria-label="' + line + '"><i class="fas fa-volume-up" style="color:var(--green);font-size:0.9rem;margin-right:8px;"></i>' + line + '</p>';
        }).join('');

        storyCard.innerHTML =
            '<div class="story-header">' +
                '<span class="story-emoji">' + s.emoji + '</span>' +
                '<h3 class="story-title">' + s.title + '</h3>' +
            '</div>' +
            '<div class="story-text">' + linesHtml + '</div>' +
            '<div class="story-actions">' +
                '<button class="btn-action" id="btnPlayFull" onclick="playFullStory()">' +
                    '<i class="fas fa-volume-up"></i> Ouvir História Completa' +
                '</button>' +
            '</div>';
    }

    var qTitle = document.getElementById('questionTitle');
    if (qTitle) qTitle.textContent = s.question;

    var optCont = document.getElementById('optionsContainer');
    if (optCont) {
        optCont.innerHTML = '';
        s.options.forEach(function(optText, idx) {
            var btn = document.createElement('button');
            btn.className = 'btn-reading-opt';
            btn.textContent = optText;
            btn.setAttribute('data-idx', idx);
            btn.setAttribute('aria-label', optText);
            var isCorrect = idx === s.correct;
            btn.onclick = function() { checkReadingAnswer(isCorrect, optText, btn); };
            optCont.appendChild(btn);
        });
    }

    setTimeout(function() {
        playFullStory();
    }, 400);
}

function playFullStory() {
    var s = stories[currentIdx];
    if (!s) return;
    var btn = document.getElementById('btnPlayFull');
    if (btn) btn.classList.add('speaking');
    speak(s.audioFull, function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function speakLine(text, el) {
    if (el) el.classList.add('highlight-line');
    speak(text, function() {
        if (el) el.classList.remove('highlight-line');
    });
}

function playQuestionAudio() {
    var s = stories[currentIdx];
    if (!s) return;
    speak(s.question, null);
}

function checkReadingAnswer(isCorrect, optText, btn) {
    if (answered) return;
    answered = true;

    document.querySelectorAll('.btn-reading-opt').forEach(function(b) { b.disabled = true; });
    btn.classList.add(isCorrect ? 'correct' : 'wrong');

    var s = stories[currentIdx];
    if (!isCorrect) {
        var correctBtn = document.querySelector('.btn-reading-opt[data-idx="' + s.correct + '"]');
        if (correctBtn) correctBtn.classList.add('correct');
    }

    if (isCorrect) {
        hits++;
        var h = document.getElementById('hitsCount'); if (h) h.textContent = hits;
        showFeedback('success', 'Muito bem! Resposta correta!');
        speak('Muito bem! Resposta correta!');
    } else {
        misses++;
        var m = document.getElementById('missesCount'); if (m) m.textContent = misses;
        showFeedback('error', 'A resposta certa é: ' + s.options[s.correct]);
        speak('A resposta certa é: ' + s.options[s.correct]);
    }

    var isLast = currentIdx >= TOTAL - 1;
    setTimeout(function() {
        var fb = document.getElementById('feedbackArea');
        if (fb) {
            fb.innerHTML += '<br><button class="btn-next" onclick="nextStory()"><i class="fas ' + (isLast ? 'fa-flag-checkered' : 'fa-arrow-right') + '"></i> ' + (isLast ? 'Ver resultado' : 'Próxima leitura') + '</button>';
            var nb = document.querySelector('.btn-next'); if (nb) nb.focus();
        }
    }, isCorrect ? 200 : 700);
}

function showFeedback(type, msg) {
    var fb = document.getElementById('feedbackArea');
    if (fb) fb.innerHTML = '<div class="feedback-msg ' + type + '" role="alert"><i class="fas ' + (type === 'success' ? 'fa-check-circle' : 'fa-redo') + '"></i> ' + msg + '</div>';
}

function nextStory() {
    currentIdx++;
    if (currentIdx >= TOTAL) showCompletion();
    else loadStory();
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

    var msg = hits === TOTAL ? 'Excelente! Você compreendeu todas as histórias!' : hits >= 3 ? 'Muito bem! Ótima interpretação!' : 'Bom começo! A leitura melhora com a prática!';
    var cm = document.getElementById('completionMsg'); if (cm) cm.textContent = msg;

    salvarProgresso();
    speak('Parabéns! Você concluiu as pequenas leituras. ' + msg);
}

function salvarProgresso() {
    var data = { completed: true, score: hits, total: TOTAL, misses: misses, savedAt: new Date().toISOString() };
    var user = null;
    try { var r = localStorage.getItem('aprendidos_usuario'); if (r) user = JSON.parse(r); } catch(e) {}
    var uk = (user && user.id) ? ('aprendidos_progresso_' + user.id) : null;
    [uk, 'aprendidos_progresso', 'aprendidos_progresso_anon'].filter(Boolean).forEach(function(k) {
        try { var c = JSON.parse(localStorage.getItem(k) || '{}'); c['leituras'] = data; localStorage.setItem(k, JSON.stringify(c)); } catch(e) {}
    });
    if (window.AprendIDosAuth && window.AprendIDosAuth.saveLessonProgress) {
        try { window.AprendIDosAuth.saveLessonProgress('leituras', data); } catch(e) {}
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
            if (raw) { var p = JSON.parse(raw); if (p && p.leituras && p.leituras.completed) { isDone = true; prevScore = p.leituras.score; prevTotal = p.leituras.total; break; } }
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

window.speak = speak; window.playInstruction = playInstruction; window.playFullStory = playFullStory;
window.speakLine = speakLine; window.playQuestionAudio = playQuestionAudio;
window.checkReadingAnswer = checkReadingAnswer; window.nextStory = nextStory;
window.restartExercise = restartExercise; window.salvarEVerOutras = salvarEVerOutras; window.toggleMenu = toggleMenu;

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', function() { initExercise(); verificarLicaoConcluida(); }); }
else { initExercise(); verificarLicaoConcluida(); }
