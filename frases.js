/**
 * AprendIDos — Frases Simples
 * frases.js
 */

var sentenceBank = [
    { text: 'A CASA É BONITA', words: ['A', 'CASA', 'É', 'BONITA'], audio: 'A casa é bonita' },
    { text: 'O GATO BEBE LEITE', words: ['O', 'GATO', 'BEBE', 'LEITE'], audio: 'O gato bebe leite' },
    { text: 'EU GOSTO DE CAFÉ', words: ['EU', 'GOSTO', 'DE', 'CAFÉ'], audio: 'Eu gosto de café' },
    { text: 'A VOVÓ FAZ BOLO', words: ['A', 'VOVÓ', 'FAZ', 'BOLO'], audio: 'A vovó faz bolo' },
    { text: 'O PÃO É QUENTINHO', words: ['O', 'PÃO', 'É', 'QUENTINHO'], audio: 'O pão é quentinho' },
    { text: 'O SOL É BRILHANTE', words: ['O', 'SOL', 'É', 'BRILHANTE'], audio: 'O sol é brilhante' },
    { text: 'O PATO NADA NA ÁGUA', words: ['O', 'PATO', 'NADA', 'NA', 'ÁGUA'], audio: 'O pato nada na água' },
    { text: 'A FLOR É CHEIROSA', words: ['A', 'FLOR', 'É', 'CHEIROSA'], audio: 'A flor é cheirosa' },
    { text: 'A PORTA ESTÁ ABERTA', words: ['A', 'PORTA', 'ESTÁ', 'ABERTA'], audio: 'A porta está aberta' },
    { text: 'O DIA ESTÁ LINDO', words: ['O', 'DIA', 'ESTÁ', 'LINDO'], audio: 'O dia está lindo' }
];

var TOTAL = 6;
var questions = [], currentIdx = 0, hits = 0, misses = 0, errorLog = [];
var assembledWords = [];
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
    speak('Aprenda a formar frases simples. Toque nas palavras na ordem correta para montar a frase.', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function playDemo(phrase) {
    speak(phrase, null);
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
    questions = shuffle(sentenceBank.slice()).slice(0, TOTAL);
    currentIdx = 0; hits = 0; misses = 0; errorLog = [];
    var h = document.getElementById('hitsCount'); if (h) h.textContent = '0';
    var m = document.getElementById('missesCount'); if (m) m.textContent = '0';
    var layout = document.getElementById('exerciseLayout');
    var comp = document.getElementById('completionScreen');
    if (layout) layout.style.display = '';
    if (comp) comp.classList.remove('visible');
    loadQuestion();
}

function loadQuestion() {
    assembledWords = [];
    var q = questions[currentIdx];
    if (!q) return;

    var pFill = document.getElementById('progressFill');
    var pBar = document.getElementById('progressBar');
    var pLabel = document.getElementById('progressLabel');
    var fbArea = document.getElementById('feedbackArea');

    var pct = (currentIdx / TOTAL) * 100;
    if (pFill) pFill.style.width = pct + '%';
    if (pBar) pBar.setAttribute('aria-valuenow', Math.round(pct));
    if (pLabel) pLabel.textContent = 'Frase ' + (currentIdx + 1) + ' de ' + TOTAL;
    if (fbArea) fbArea.innerHTML = '';

    renderSlotsAndTiles(q);
    setTimeout(playQuestionAudio, 400);
}

function renderSlotsAndTiles(q) {
    assembledWords = [];
    var slotsContainer = document.getElementById('sentenceSlots');
    var tilesContainer = document.getElementById('wordTiles');
    var fbArea = document.getElementById('feedbackArea');
    if (fbArea) fbArea.innerHTML = '';

    if (slotsContainer) {
        slotsContainer.innerHTML = '';
        q.words.forEach(function(_, idx) {
            var slot = document.createElement('div');
            slot.className = 'sentence-slot';
            slot.setAttribute('data-idx', idx);
            slotsContainer.appendChild(slot);
        });
    }

    var scrambled = shuffle(q.words.slice());
    // Garante que não fique na ordem exata original
    if (scrambled.join(' ') === q.words.join(' ') && q.words.length > 1) {
        scrambled.reverse();
    }

    if (tilesContainer) {
        tilesContainer.innerHTML = '';
        scrambled.forEach(function(word, idx) {
            var btn = document.createElement('button');
            btn.className = 'btn-word-tile';
            btn.textContent = word;
            btn.setAttribute('data-word', word);
            btn.setAttribute('data-idx', idx);
            btn.setAttribute('aria-label', 'Palavra ' + word);
            btn.onclick = function() { pickWord(word, btn); };
            tilesContainer.appendChild(btn);
        });
    }
}

function pickWord(word, btn) {
    if (btn.disabled) return;
    btn.disabled = true;
    btn.classList.add('used');

    var q = questions[currentIdx];
    var pos = assembledWords.length;
    assembledWords.push(word);

    var slots = document.querySelectorAll('.sentence-slot');
    if (slots[pos]) {
        slots[pos].textContent = word;
        slots[pos].classList.add('filled');
    }

    speak(word.toLowerCase(), null);

    if (assembledWords.length === q.words.length) {
        checkSentence();
    }
}

function checkSentence() {
    var q = questions[currentIdx];
    var built = assembledWords.join(' ');
    var isCorrect = built === q.words.join(' ');
    var fb = document.getElementById('feedbackArea');

    if (isCorrect) {
        hits++;
        var h = document.getElementById('hitsCount'); if (h) h.textContent = hits;
        document.querySelectorAll('.sentence-slot').forEach(function(s) { s.classList.add('correct'); });
        if (fb) fb.innerHTML = '<div class="feedback-msg success"><i class="fas fa-check-circle"></i> Parabéns! Frase correta!</div>';
        speak('Parabéns! ' + q.audio);

        var isLast = currentIdx >= TOTAL - 1;
        setTimeout(function() {
            if (fb) {
                fb.innerHTML += '<br><button class="btn-next" onclick="nextQuestion()"><i class="fas ' + (isLast ? 'fa-flag-checkered' : 'fa-arrow-right') + '"></i> ' + (isLast ? 'Ver resultado' : 'Próxima frase') + '</button>';
                var nb = document.querySelector('.btn-next'); if (nb) nb.focus();
            }
        }, 500);
    } else {
        misses++;
        var m = document.getElementById('missesCount'); if (m) m.textContent = misses;
        errorLog.push({ phrase: q.text, chosen: built });
        document.querySelectorAll('.sentence-slot').forEach(function(s) { s.classList.add('wrong'); });
        if (fb) fb.innerHTML = '<div class="feedback-msg error"><i class="fas fa-redo"></i> Ordem incorreta. Tente novamente!</div><br>' +
            '<button class="btn-next" onclick="retryCurrentSentence()"><i class="fas fa-redo"></i> Tentar de novo</button>';
        speak('Ordem incorreta. Tente novamente.');
    }
}

function retryCurrentSentence() {
    var q = questions[currentIdx];
    renderSlotsAndTiles(q);
}

function playQuestionAudio() {
    if (currentIdx >= questions.length) return;
    var q = questions[currentIdx];
    var btn = document.getElementById('btnExerciseAudio');
    if (btn) btn.classList.add('speaking');
    speak('Monte a frase: ' + q.audio, function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function playHelpExercise() {
    var btn = document.getElementById('btnHelpExercise');
    if (btn) btn.classList.add('speaking');
    speak('Toque nas palavras abaixo na ordem correta para formar a frase ouvida.', function() {
        if (btn) btn.classList.remove('speaking');
    });
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

    var msg = hits === TOTAL ? 'Fantástico! Acertou todas as frases!' : hits >= 4 ? 'Muito bem! Você está lendo muito bem!' : 'Bom começo! Continue praticando!';
    var cm = document.getElementById('completionMsg'); if (cm) cm.textContent = msg;

    var errSum = document.getElementById('errorSummary');
    var errList = document.getElementById('errorList');
    if (errList) errList.innerHTML = '';
    if (errorLog.length > 0 && errSum && errList) {
        errSum.style.display = 'block';
        errorLog.forEach(function(e) {
            var li = document.createElement('li');
            li.innerHTML = 'Frase: <strong>' + e.phrase + '</strong>';
            errList.appendChild(li);
        });
    } else if (errSum) errSum.style.display = 'none';

    salvarProgresso();
    speak('Parabéns! Você concluiu as frases simples. ' + msg);
}

function salvarProgresso() {
    var data = { completed: true, score: hits, total: TOTAL, misses: misses, savedAt: new Date().toISOString() };
    var user = null;
    try { var r = localStorage.getItem('aprendidos_usuario'); if (r) user = JSON.parse(r); } catch(e) {}
    var uk = (user && user.id) ? ('aprendidos_progresso_' + user.id) : null;
    [uk, 'aprendidos_progresso', 'aprendidos_progresso_anon'].filter(Boolean).forEach(function(k) {
        try { var c = JSON.parse(localStorage.getItem(k) || '{}'); c['frases'] = data; localStorage.setItem(k, JSON.stringify(c)); } catch(e) {}
    });
    if (window.AprendIDosAuth && window.AprendIDosAuth.saveLessonProgress) {
        try { window.AprendIDosAuth.saveLessonProgress('frases', data); } catch(e) {}
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
            if (raw) { var p = JSON.parse(raw); if (p && p.frases && p.frases.completed) { isDone = true; prevScore = p.frases.score; prevTotal = p.frases.total; break; } }
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
window.pickWord = pickWord; window.retryCurrentSentence = retryCurrentSentence;
window.nextQuestion = nextQuestion; window.restartExercise = restartExercise;
window.salvarEVerOutras = salvarEVerOutras; window.toggleMenu = toggleMenu;

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', function() { initExercise(); verificarLicaoConcluida(); }); }
else { initExercise(); verificarLicaoConcluida(); }
