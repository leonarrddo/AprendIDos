/**
 * AprendIDos — Frases Simples
 * frases.js
 */

var sentenceBank = [
    // NÍVEL FÁCIL (3 a 4 palavras)
    { text: 'A CASA É BONITA', words: ['A', 'CASA', 'É', 'BONITA'], audio: 'A casa é bonita', level: 'facil', emoji: '🏠' },
    { text: 'O GATO BEBE LEITE', words: ['O', 'GATO', 'BEBE', 'LEITE'], audio: 'O gato bebe leite', level: 'facil', emoji: '🐱' },
    { text: 'EU GOSTO DE CAFÉ', words: ['EU', 'GOSTO', 'DE', 'CAFÉ'], audio: 'Eu gosto de café', level: 'facil', emoji: '☕' },
    { text: 'A VOVÓ FAZ BOLO', words: ['A', 'VOVÓ', 'FAZ', 'BOLO'], audio: 'A vovó faz bolo', level: 'facil', emoji: '👵' },
    { text: 'O DIA ESTÁ LINDO', words: ['O', 'DIA', 'ESTÁ', 'LINDO'], audio: 'O dia está lindo', level: 'facil', emoji: '☀️' },
    { text: 'O PÃO ESTÁ QUENTE', words: ['O', 'PÃO', 'ESTÁ', 'QUENTE'], audio: 'O pão está quente', level: 'facil', emoji: '🥖' },
    { text: 'A FLOR É CHEIROSA', words: ['A', 'FLOR', 'É', 'CHEIROSA'], audio: 'A flor é cheirosa', level: 'facil', emoji: '🌸' },
    { text: 'O CÃO É AMIGO', words: ['O', 'CÃO', 'É', 'AMIGO'], audio: 'O cão é amigo', level: 'facil', emoji: '🐶' },

    // NÍVEL MÉDIO (4 a 5 palavras)
    { text: 'O PATO NADA NA ÁGUA', words: ['O', 'PATO', 'NADA', 'NA', 'ÁGUA'], audio: 'O pato nada na água', level: 'medio', emoji: '🦆' },
    { text: 'A PORTA DA SALA ABRIU', words: ['A', 'PORTA', 'DA', 'SALA', 'ABRIU'], audio: 'A porta da sala abriu', level: 'medio', emoji: '🚪' },
    { text: 'O MENINO TOMA SUCO GELADO', words: ['O', 'MENINO', 'TOMA', 'SUCO', 'GELADO'], audio: 'O menino toma suco gelado', level: 'medio', emoji: '🥤' },
    { text: 'O PÁSSARO CANTA NO JARDIM', words: ['O', 'PÁSSARO', 'CANTA', 'NO', 'JARDIM'], audio: 'O pássaro canta no jardim', level: 'medio', emoji: '🐦' },
    { text: 'O SOL BRILHA NO CÉU', words: ['O', 'SOL', 'BRILHA', 'NO', 'CÉU'], audio: 'O sol brilha no céu', level: 'medio', emoji: '🌤️' },
    { text: 'A FAMÍLIA ALMOÇA COM ALEGRIA', words: ['A', 'FAMÍLIA', 'ALMOÇA', 'COM', 'ALEGRIA'], audio: 'A família almoça com alegria', level: 'medio', emoji: '🍽️' },
    { text: 'O RÁDIO TOCA UMA MÚSICA', words: ['O', 'RÁDIO', 'TOCA', 'UMA', 'MÚSICA'], audio: 'O rádio toca uma música', level: 'medio', emoji: '📻' },
    { text: 'A ÁRVORE DÁ FRUTAS DOCES', words: ['A', 'ÁRVORE', 'DÁ', 'FRUTAS', 'DOCES'], audio: 'A árvore dá frutas doces', level: 'medio', emoji: '🌳' },

    // NÍVEL DIFÍCIL (5 a 7 palavras)
    { text: 'O SEU JOSÉ REGOU AS PLANTAS HOJE', words: ['O', 'SEU', 'JOSÉ', 'REGOU', 'AS', 'PLANTAS', 'HOJE'], audio: 'O seu José regou as plantas hoje', level: 'dificil', emoji: '🪴' },
    { text: 'DONA MARIA FEZ UM BOLO DE CENOURA', words: ['DONA', 'MARIA', 'FEZ', 'UM', 'BOLO', 'DE', 'CENOURA'], audio: 'Dona Maria fez um bolo de cenoura', level: 'dificil', emoji: '🥕' },
    { text: 'A CIDADE ACORDA COM MUITO MOVIMENTO', words: ['A', 'CIDADE', 'ACORDA', 'COM', 'MUITO', 'MOVIMENTO'], audio: 'A cidade acorda com muito movimento', level: 'dificil', emoji: '🏙️' },
    { text: 'O NETO LEU UMA CARTA PARA A VOVÓ', words: ['O', 'NETO', 'LEU', 'UMA', 'CARTA', 'PARA', 'A', 'VOVÓ'], audio: 'O neto leu uma carta para a vovó', level: 'dificil', emoji: '✉️' },
    { text: 'A CHUVA MANSA MOLHA A TERRA SECA', words: ['A', 'CHUVA', 'MANSA', 'MOLHA', 'A', 'TERRA', 'SECA'], audio: 'A chuva mansa molha a terra seca', level: 'dificil', emoji: '🌧️' },
    { text: 'O SABÃO LIMPA A ROUPA NO VARAL', words: ['O', 'SABÃO', 'LIMPA', 'A', 'ROUPA', 'NO', 'VARAL'], audio: 'O sabão limpa a roupa no varal', level: 'dificil', emoji: '🫧' },
    { text: 'A SAÚDE É O NOSSO MAIOR TESOURO', words: ['A', 'SAÚDE', 'É', 'O', 'NOSSO', 'MAIOR', 'TESOURO'], audio: 'A saúde é o nosso maior tesouro', level: 'dificil', emoji: '❤️' },
    { text: 'TODOS NÓS MERECEMOS VIVER COM DIGNIDADE', words: ['TODOS', 'NÓS', 'MERECEMOS', 'VIVER', 'COM', 'DIGNIDADE'], audio: 'Todos nós merecemos viver com dignidade', level: 'dificil', emoji: '🕊️' }
];

var TOTAL = 8;
var questions = [], currentIdx = 0, hits = 0, misses = 0, errorLog = [];
var assembledWords = [];
var currentAudio = null, ptVoice = null;
var speechGeneration = 0;
var currentDemoFilter = 'todos';

function stopAllAudio() {
    speechGeneration++;
    if (currentAudio) {
        try {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio.src = '';
            currentAudio.onended = null;
            currentAudio.onerror = null;
        } catch(e) {}
        currentAudio = null;
    }
    if ('speechSynthesis' in window) {
        try {
            window.speechSynthesis.cancel();
        } catch(e) {}
    }
    document.querySelectorAll('.speaking').forEach(function(el) {
        el.classList.remove('speaking');
    });
}

function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    var v = window.speechSynthesis.getVoices();
    if (!v || v.length === 0) return;
    ptVoice =
        v.find(function(x) { return x.lang === 'pt-BR'; }) ||
        v.find(function(x) { return x.lang === 'pt_BR'; }) ||
        v.find(function(x) { return x.lang.startsWith('pt'); }) || null;
}
if ('speechSynthesis' in window) { loadVoices(); window.speechSynthesis.onvoiceschanged = loadVoices; }

var isIOS = (function() {
    if (typeof navigator === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
})();

function speak(text, onEnd) {
    stopAllAudio();
    if (!text || typeof text !== 'string') return;

    var currentGen = speechGeneration;

    // No iOS (Safari), o Google TTS falha com 404/AVPlayer e qualquer fallback assíncrono
    // perde o gesto do usuário. Dispara síntese nativa imediatamente no clique!
    if (isIOS) {
        speakNativo(text, onEnd, currentGen);
        return;
    }

    var fallbackTriggered = false;

    function triggerFallback() {
        if (fallbackTriggered) return;
        fallbackTriggered = true;
        if (currentGen !== speechGeneration) return;
        speakNativo(text, onEnd, currentGen);
    }

    try {
        var url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=pt-BR&client=tw-ob&q=' + encodeURIComponent(text);
        var audio = new Audio();
        currentAudio = audio;

        audio.onended = function() {
            if (currentGen !== speechGeneration) return;
            document.querySelectorAll('.speaking').forEach(function(el) { el.classList.remove('speaking'); });
            currentAudio = null;
            if (onEnd) onEnd();
        };

        audio.onerror = function() {
            triggerFallback();
        };

        audio.src = url;
        var p = audio.play();
        if (p !== undefined) {
            p.then(function() {
                // Áudio do Google iniciado com sucesso
            }).catch(function() {
                triggerFallback();
            });
        }
    } catch(e) {
        triggerFallback();
    }
}

function speakNativo(text, onEnd, gen) {
    if (gen !== undefined && gen !== speechGeneration) return;
    if (!('speechSynthesis' in window)) {
        document.querySelectorAll('.speaking').forEach(function(el) { el.classList.remove('speaking'); });
        if (onEnd) onEnd();
        return;
    }

    try {
        window.speechSynthesis.cancel();
    } catch(e) {}

    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR';
    u.rate = 0.82; // Calmo e amigável para idosos
    u.pitch = 1.0;
    u.volume = 1.0;

    if (!ptVoice) loadVoices();
    if (ptVoice) u.voice = ptVoice;

    var cleanup = function() {
        if (gen !== undefined && gen !== speechGeneration) return;
        document.querySelectorAll('.speaking').forEach(function(el) { el.classList.remove('speaking'); });
        if (onEnd) onEnd();
    };

    u.onend = cleanup;
    u.onerror = cleanup;

    // No iOS, a chamada DEVE ser síncrona dentro do gesto do usuário.
    // No Windows/Chrome, o delay de 80ms evita bug de cancelamento imediato.
    if (isIOS) {
        try { window.speechSynthesis.speak(u); } catch(e) { cleanup(); }
    } else {
        setTimeout(function() {
            if (gen !== undefined && gen !== speechGeneration) return;
            try {
                window.speechSynthesis.speak(u);
            } catch(e) {
                cleanup();
            }
        }, 80);
    }
}

function playInstruction() {
    var btn = document.getElementById('btnInstruction');
    if (btn) btn.classList.add('speaking');
    speak('Aprenda a formar frases simples. Toque nas palavras na ordem correta para montar a frase.', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function playDemo(phrase, cardEl) {
    if (cardEl) cardEl.classList.add('speaking');
    speak(phrase, function() {
        if (cardEl) cardEl.classList.remove('speaking');
    });
}

function getLevelBadgeHtml(level) {
    var map = {
        facil: { label: 'Fácil', cls: 'level-facil', icon: 'fa-seedling' },
        medio: { label: 'Médio', cls: 'level-medio', icon: 'fa-feather' },
        dificil: { label: 'Difícil', cls: 'level-dificil', icon: 'fa-mountain' }
    };
    var item = map[level] || map.facil;
    return '<span class="level-badge ' + item.cls + '"><i class="fas ' + item.icon + '"></i> ' + item.label + '</span>';
}

function renderDemoGrid(filter) {
    var grid = document.getElementById('demoGrid');
    if (!grid) return;
    currentDemoFilter = filter || 'todos';

    var filtered = sentenceBank;
    if (currentDemoFilter !== 'todos') {
        filtered = sentenceBank.filter(function(s) { return s.level === currentDemoFilter; });
    }

    grid.innerHTML = '';
    filtered.forEach(function(item) {
        var card = document.createElement('div');
        card.className = 'demo-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', item.text + ' — Nível ' + item.level);
        
        card.innerHTML = 
            '<div class="demo-card-header">' +
                '<span style="font-size:1.6rem;">' + (item.emoji || '💬') + '</span>' +
                getLevelBadgeHtml(item.level) +
            '</div>' +
            '<div class="demo-phrase">' + item.text + '</div>' +
            '<div class="demo-footer">' +
                '<span class="demo-hint"><i class="fas fa-volume-up"></i> Toque para ouvir</span>' +
            '</div>';

        card.onclick = function() { playDemo(item.audio, card); };
        card.onkeydown = function(e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playDemo(item.audio, card); } };
        grid.appendChild(card);
    });
}

function filterDemoPhrases(level, btn) {
    document.querySelectorAll('.btn-filter-tab').forEach(function(b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
    });
    if (btn) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
    }
    renderDemoGrid(level);
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
    stopAllAudio();
    var fac = shuffle(sentenceBank.filter(function(x) { return x.level === 'facil'; })).slice(0, 3);
    var med = shuffle(sentenceBank.filter(function(x) { return x.level === 'medio'; })).slice(0, 3);
    var dif = shuffle(sentenceBank.filter(function(x) { return x.level === 'dificil'; })).slice(0, 2);
    questions = fac.concat(med).concat(dif);
    TOTAL = questions.length;

    currentIdx = 0; hits = 0; misses = 0; errorLog = [];
    var h = document.getElementById('hitsCount'); if (h) h.textContent = '0';
    var m = document.getElementById('missesCount'); if (m) m.textContent = '0';
    var layout = document.getElementById('exerciseLayout');
    var comp = document.getElementById('completionScreen');
    if (layout) layout.style.display = '';
    if (comp) comp.classList.remove('visible');
    renderDemoGrid('todos');
    loadQuestion();
}

function loadQuestion() {
    stopAllAudio();
    assembledWords = [];
    var q = questions[currentIdx];
    if (!q) return;

    var pFill = document.getElementById('progressFill');
    var pBar = document.getElementById('progressBar');
    var pLabel = document.getElementById('progressLabel');
    var fbArea = document.getElementById('feedbackArea');
    var levelBadge = document.getElementById('phraseLevelBadge');

    var pct = (currentIdx / TOTAL) * 100;
    if (pFill) pFill.style.width = pct + '%';
    if (pBar) pBar.setAttribute('aria-valuenow', Math.round(pct));
    if (pLabel) pLabel.textContent = 'Frase ' + (currentIdx + 1) + ' de ' + TOTAL;
    if (fbArea) fbArea.innerHTML = '';

    if (levelBadge && q.level) {
        var map = {
            facil: { label: 'Fácil', cls: 'level-facil', icon: 'fa-seedling' },
            medio: { label: 'Médio', cls: 'level-medio', icon: 'fa-feather' },
            dificil: { label: 'Difícil', cls: 'level-dificil', icon: 'fa-mountain' }
        };
        var item = map[q.level] || map.facil;
        levelBadge.className = 'level-badge ' + item.cls;
        levelBadge.innerHTML = '<i class="fas ' + item.icon + '"></i> ' + item.label;
    }

    renderSlotsAndTiles(q);
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
    if (btn.classList.contains('used')) return;
    btn.classList.add('used');
    btn.disabled = true;

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
        speak('Muito bem! ' + q.audio);

        var isLast = currentIdx >= TOTAL - 1;
        setTimeout(function() {
            if (fb && !fb.querySelector('.btn-next')) {
                var btnNext = document.createElement('button');
                btnNext.className = 'btn-next';
                btnNext.onclick = nextQuestion;
                btnNext.setAttribute('aria-label', isLast ? 'Ver resultado' : 'Próxima frase');
                btnNext.innerHTML = '<i class="fas ' + (isLast ? 'fa-flag-checkered' : 'fa-arrow-right') + '"></i> ' + (isLast ? 'Ver resultado' : 'Próxima frase');
                fb.appendChild(btnNext);
                btnNext.focus();
            }
        }, 500);
    } else {
        misses++;
        var m = document.getElementById('missesCount'); if (m) m.textContent = misses;
        errorLog.push({ phrase: q.text, chosen: built, level: q.level });
        document.querySelectorAll('.sentence-slot').forEach(function(s) { s.classList.add('wrong'); });
        if (fb) {
            fb.innerHTML = '<div class="feedback-msg error"><i class="fas fa-redo"></i> Ordem incorreta. Tente novamente!</div><br>' +
                '<button class="btn-next" onclick="retryCurrentSentence()"><i class="fas fa-redo"></i> Tentar de novo</button>';
            var rb = fb.querySelector('.btn-next'); if (rb) rb.focus();
        }
        speak('Ordem incorreta. Tente novamente.');
    }
}

function retryCurrentSentence() {
    stopAllAudio();
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
    stopAllAudio();
    currentIdx++;
    if (currentIdx >= TOTAL) showCompletion();
    else loadQuestion();
}

function showCompletion() {
    stopAllAudio();
    var layout = document.getElementById('exerciseLayout');
    var comp = document.getElementById('completionScreen');
    if (layout) layout.style.display = 'none';
    if (comp) comp.classList.add('visible');

    var fh = document.getElementById('finalHits'); if (fh) fh.textContent = hits;
    var fm = document.getElementById('finalMisses'); if (fm) fm.textContent = misses;
    var ft = document.getElementById('finalTotal'); if (ft) ft.textContent = TOTAL;
    var pf = document.getElementById('progressFill'); if (pf) pf.style.width = '100%';

    var msg = hits === TOTAL ? 'Fantástico! Acertou todas as frases!' : hits >= 5 ? 'Muito bem! Você está lendo muito bem!' : 'Bom começo! Continue praticando!';
    var cm = document.getElementById('completionMsg'); if (cm) cm.textContent = msg;

    var errSum = document.getElementById('errorSummary');
    var errList = document.getElementById('errorList');
    if (errList) errList.innerHTML = '';
    if (errorLog.length > 0 && errSum && errList) {
        errSum.style.display = 'block';
        errorLog.forEach(function(e) {
            var li = document.createElement('li');
            li.innerHTML = 'Frase: <strong>' + e.phrase + '</strong> ' + (e.level ? '(' + e.level + ')' : '');
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

function restartExercise() {
    stopAllAudio();
    initExercise();
    verificarLicaoConcluida();
}

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
window.stopAllAudio = stopAllAudio; window.filterDemoPhrases = filterDemoPhrases;
window.renderDemoGrid = renderDemoGrid;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initExercise();
        verificarLicaoConcluida();
    });
} else {
    initExercise();
    verificarLicaoConcluida();
}
