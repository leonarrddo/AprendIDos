/**
 * AprendIDos — Meu Nome
 * meunome.js
 */

var TOTAL = 5; // número de tentativas de montar o nome
var currentAudio = null, ptVoice = null;
var speechGeneration = 0;
var currentName = '';
var attempts = 0, correct = 0, misses = 0;

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
        try { window.speechSynthesis.cancel(); } catch(e) {}
    }
    document.querySelectorAll('.speaking').forEach(function(el) {
        el.classList.remove('speaking');
    });
}

function speak(text, onEnd) {
    stopAllAudio();
    if (!text || typeof text !== 'string') return;

    var currentGen = speechGeneration;
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
        if (p) {
            p.then(function() { /* Google TTS reproduzindo */ })
             .catch(function() { triggerFallback(); });
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

    try { window.speechSynthesis.cancel(); } catch(e) {}

    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR';
    u.rate = 0.82;
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

    setTimeout(function() {
        if (gen !== undefined && gen !== speechGeneration) return;
        try {
            window.speechSynthesis.speak(u);
        } catch(e) {
            cleanup();
        }
    }, 80);
}

function playInstruction() {
    var btn = document.getElementById('btnInstruction');
    if (btn) btn.classList.add('speaking');
    speak('Digite o seu nome no campo abaixo e descubra as letras que o formam.', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function analyzeName() {
    var input = document.getElementById('nameInput');
    if (!input) return;
    var name = input.value.trim();
    if (!name || name.length < 2) {
        speak('Por favor, escreva pelo menos duas letras do seu nome.');
        return;
    }
    currentName = name.toUpperCase();
    showNameAnalysis(currentName);
}

var vowelSet = 'AEIOUÁÉÍÓÚÃÕÂÊÎÔÛ';

function showNameAnalysis(name) {
    var display = document.getElementById('nameDisplay');
    var info = document.getElementById('nameInfo');
    if (!display || !info) return;

    // Sanitiza e limpa nós anteriores de forma segura (mitigação XSS)
    display.replaceChildren();

    for (var i = 0; i < name.length; i++) {
        var ch = name[i];
        if (ch === ' ') {
            var spaceSpan = document.createElement('span');
            spaceSpan.className = 'name-space';
            spaceSpan.textContent = ' ';
            display.appendChild(spaceSpan);
            continue;
        }
        var isVowel = vowelSet.includes(ch);
        var letterSpan = document.createElement('span');
        letterSpan.className = 'name-letter ' + (isVowel ? 'vowel' : 'consonant');
        letterSpan.title = isVowel ? 'Vogal' : 'Consoante';
        letterSpan.textContent = ch;
        display.appendChild(letterSpan);
    }
    display.style.display = 'flex';

    var vowels = [], consonants = [];
    for (var j = 0; j < name.length; j++) {
        var c = name[j];
        if (c === ' ') continue;
        if (vowelSet.includes(c)) vowels.push(c);
        else consonants.push(c);
    }

    info.replaceChildren();
    var pInfo = document.createElement('p');

    var sTotal = document.createElement('strong');
    sTotal.textContent = String(name.length);
    pInfo.appendChild(sTotal);
    pInfo.appendChild(document.createTextNode(' letras no total \u00A0|\u00A0 '));

    var spanVowels = document.createElement('span');
    spanVowels.style.color = '#2E7D32';
    var strongV = document.createElement('strong');
    strongV.textContent = String(vowels.length);
    spanVowels.appendChild(strongV);
    spanVowels.appendChild(document.createTextNode(' vogais (' + (vowels.join(', ') || '—') + ') \u00A0|\u00A0 '));
    pInfo.appendChild(spanVowels);

    var spanCons = document.createElement('span');
    spanCons.style.color = '#00695C';
    var strongC = document.createElement('strong');
    strongC.textContent = String(consonants.length);
    spanCons.appendChild(strongC);
    spanCons.appendChild(document.createTextNode(' consoantes (' + (consonants.join(', ') || '—') + ')'));
    pInfo.appendChild(spanCons);

    info.appendChild(pInfo);
    info.style.display = 'block';

    var writingSec = document.getElementById('writingSection');
    if (writingSec) {
        writingSec.style.display = 'block';
        setTimeout(function() { initWritingCanvas(name); }, 80);
    }

    var exSection = document.getElementById('exerciseSection');
    if (exSection) exSection.style.display = 'block';
    startExercise(name);
}

function speakName() {
    if (!currentName) { speak('Por favor, escreva seu nome primeiro.'); return; }
    var btn = document.getElementById('btnSpeakName');
    if (btn) btn.classList.add('speaking');
    speak(currentName, function() { if (btn) btn.classList.remove('speaking'); });
}

function speakNameSpelled() {
    if (!currentName) { speak('Por favor, escreva seu nome primeiro.'); return; }
    var btn = document.getElementById('btnSpellName');
    if (btn) btn.classList.add('speaking');
    var letters = currentName.replace(/\s/g, '').split('').join('. ') + '.';
    speak(letters, function() { if (btn) btn.classList.remove('speaking'); });
}

// ============================================================
// EXERCÍCIO: Montar o nome clicando nas letras
// ============================================================
var exerciseName = '';
var letterPool = [];
var assembled = [];
var round = 0;

function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
}

function startExercise(name) {
    // O exercício usa o nome SEM espaços para montagem de letras
    exerciseName = name.replace(/\s/g, '');
    round = 0; correct = 0; misses = 0; attempts = 0;
    assembled = [];
    renderExercise();
}

function renderExercise() {
    assembled = [];
    var target = exerciseName;
    // Pool: letras do nome + 3-5 letras distratoras
    var extras = 'BCDFGHJKLMPQRSTVZ'.split('').filter(function(c) { return !target.includes(c); });
    var pool = target.split('').concat(shuffle(extras).slice(0, Math.min(4, extras.length)));
    letterPool = shuffle(pool);

    var letterPoolEl = document.getElementById('letterPool');
    var assembledEl = document.getElementById('assembledSlots');
    var fbArea = document.getElementById('exerciseFeedback');
    if (fbArea) fbArea.innerHTML = '';

    if (letterPoolEl) {
        letterPoolEl.innerHTML = '';
        letterPool.forEach(function(ch, i) {
            var btn = document.createElement('button');
            btn.className = 'letter-tile';
            btn.textContent = ch;
            btn.setAttribute('data-idx', i);
            btn.setAttribute('aria-label', 'Letra ' + ch);
            btn.onclick = function() { pickLetter(ch, btn); };
            letterPoolEl.appendChild(btn);
        });
    }

    if (assembledEl) {
        assembledEl.innerHTML = '';
        var words = currentName.split(/\s+/).filter(Boolean);
        var globalSlotIdx = 0;

        words.forEach(function(word, wIdx) {
            var wordGroup = document.createElement('div');
            wordGroup.className = 'assembled-word-group';

            for (var c = 0; c < word.length; c++) {
                var slot = document.createElement('div');
                slot.className = 'name-slot';
                slot.setAttribute('data-pos', globalSlotIdx);
                wordGroup.appendChild(slot);
                globalSlotIdx++;
            }
            assembledEl.appendChild(wordGroup);

            // Se houver mais palavras no nome, adiciona um separador de espaço bem visível
            if (wIdx < words.length - 1) {
                var spaceDivider = document.createElement('div');
                spaceDivider.className = 'name-slot-space';
                spaceDivider.setAttribute('aria-label', 'Espaço entre palavras');
                spaceDivider.innerHTML = '<span class="space-symbol" title="Espaço"></span>';
                assembledEl.appendChild(spaceDivider);
            }
        });
    }

    var roundLabel = document.getElementById('roundLabel');
    if (roundLabel) {
        // Exibe o nome completo preservando e destacando os espaços reais (ex: "MARIA FERNANDA")
        roundLabel.innerHTML = 'Tente montar: <span class="target-name-display">' + currentName + '</span>';
    }
}

function pickLetter(ch, btn) {
    if (btn.disabled) return;
    btn.disabled = true;
    btn.classList.add('used');
    assembled.push(ch);
    var slots = document.querySelectorAll('.name-slot');
    var pos = assembled.length - 1;
    if (slots[pos]) {
        slots[pos].textContent = ch;
        slots[pos].classList.add('filled');
        var isVowel = vowelSet.includes(ch);
        slots[pos].classList.add(isVowel ? 'vowel' : 'consonant');
    }
    speak(ch, null);
    if (assembled.length === exerciseName.length) checkBuilt();
}

function checkBuilt() {
    var built = assembled.join('');
    var isCorrect = built === exerciseName;
    var fb = document.getElementById('exerciseFeedback');
    if (isCorrect) {
        correct++;
        if (fb) fb.innerHTML = '<div class="feedback-msg success"><i class="fas fa-check-circle"></i> Muito bem! Você montou seu nome: <strong>' + currentName + '</strong>!</div>';
        speak('Muito bem! Você montou seu nome: ' + currentName);
        setTimeout(function() { showCompletion(); }, 1200);
    } else {
        misses++;
        if (fb) fb.innerHTML = '<div class="feedback-msg error"><i class="fas fa-redo"></i> Tente novamente! Tente montar: <strong>' + currentName + '</strong></div>' +
            '<button class="btn-next" onclick="renderExercise()" aria-label="Tentar novamente"><i class="fas fa-redo"></i> Tentar de novo</button>';
        speak('Tente novamente.');
    }
}

function showCompletion() {
    var exSection = document.getElementById('exerciseSection');
    var comp = document.getElementById('completionScreen');
    if (exSection) exSection.style.display = 'none';
    if (comp) { comp.classList.add('visible'); }
    var cm = document.getElementById('completionMsg');
    if (cm) cm.textContent = 'Você conhece as letras do seu nome: ' + currentName + '!';
    salvarProgresso();
    speak('Parabéns! Você aprendeu a montar o seu nome: ' + currentName);
}

function salvarProgresso() {
    var data = { completed: true, score: correct, total: 1, name: currentName, savedAt: new Date().toISOString() };
    var user = null;
    try { var r = localStorage.getItem('aprendidos_usuario'); if (r) user = JSON.parse(r); } catch(e) {}
    var uk = (user && user.id) ? ('aprendidos_progresso_' + user.id) : null;
    [uk, 'aprendidos_progresso', 'aprendidos_progresso_anon'].filter(Boolean).forEach(function(k) {
        try { var c = JSON.parse(localStorage.getItem(k) || '{}'); c['meunome'] = data; localStorage.setItem(k, JSON.stringify(c)); } catch(e) {}
    });
    if (window.AprendIDosAuth && window.AprendIDosAuth.saveLessonProgress) {
        try { window.AprendIDosAuth.saveLessonProgress('meunome', data); } catch(e) {}
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
    var isDone = false;
    try {
        var user = null;
        try { var r = localStorage.getItem('aprendidos_usuario'); if (r) user = JSON.parse(r); } catch(e) {}
        var uk = (user && user.id) ? ('aprendidos_progresso_' + user.id) : null;
        var keys = [uk, 'aprendidos_progresso', 'aprendidos_progresso_anon'].filter(Boolean);
        for (var i = 0; i < keys.length; i++) {
            var raw = localStorage.getItem(keys[i]);
            if (raw) { var p = JSON.parse(raw); if (p && p.meunome && p.meunome.completed) { isDone = true; break; } }
        }
    } catch(e) {}
    if (isDone) {
        var banner = document.getElementById('reviewBanner');
        if (banner) banner.style.display = 'flex';
    }
}

function restartExercise() {
    var comp = document.getElementById('completionScreen'); if (comp) comp.classList.remove('visible');
    var exSection = document.getElementById('exerciseSection'); if (exSection) exSection.style.display = 'none';
    var writingSec = document.getElementById('writingSection'); if (writingSec) writingSec.style.display = 'none';
    clearWritingCanvas();
    var display = document.getElementById('nameDisplay'); if (display) { display.innerHTML = ''; display.style.display = 'none'; }
    var info = document.getElementById('nameInfo'); if (info) { info.innerHTML = ''; info.style.display = 'none'; }
    var input = document.getElementById('nameInput'); if (input) input.value = '';
    currentName = ''; assembled = [];
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

// ============================================================
// TOUCH WRITING / CALIGRAFIA E ASSINATURA DIGITAL COM AVALIAÇÃO
// ============================================================
var writingCanvas = null;
var writingCtx = null;
var isDrawing = false;
var writingMode = 'trace'; // 'trace' (cobrir letras) ou 'free' (assinatura livre)
var penColor = '#1565C0';
var penWidth = 5.5;
var strokes = []; // array of { points: [{x, y}, ...], color: string, width: number }
var currentStroke = null;
var canvasInitialised = false;
var lastPoint = null;

// Estados de auxílio e avaliação
var showDirectionArrows = true;
var isDemoPlaying = false;
var demoTimer = null;
var evalDebounceTimer = null;
var currentEvalScore = 0;
var currentEvalStars = 0;
var currentEvalText = '';
var letterStatusMap = []; // [{ char, nameIndex, score, coverage, passed, ... }]

// Sistema pedagógico de tentativas por letra
// { '0': 2, '1': 1, ... } — chave = nameIndex, valor = tentativas falhas
var letterAttempts = {};

// Letra que está sendo destacada no momento (índice em letterStatusMap)
var highlightedLetterIdx = -1;

// Dicas pedagógicas de como traçar cada letra
var letterTraceTips = {
    'A': 'Letra A: comece embaixo, suba inclinado para a direita, desça inclinado e faça um traço reto no meio.',
    'B': 'Letra B: faça uma linha reta de cima para baixo e duas barriguinhas redondas para a direita.',
    'C': 'Letra C: faça uma volta redonda de cima para baixo, aberta para o lado direito.',
    'D': 'Letra D: desça uma linha reta em pé e feche com um barrigão redondo à direita.',
    'E': 'Letra E: desça uma linha em pé e puxe três perninhas para a direita: em cima, no meio e embaixo.',
    'F': 'Letra F: faça uma linha reta em pé e puxe duas perninhas para a direita: em cima e no meio.',
    'G': 'Letra G: faça uma volta redonda quase igual ao C, e entre com um traço reto para dentro.',
    'H': 'Letra H: faça duas linhas retas em pé lado a lado e junte as duas com um traço no meio.',
    'I': 'Letra I: faça uma linha reta simples de cima para baixo.',
    'J': 'Letra J: desça uma linha reta e faça um gancho redondo para a esquerda embaixo.',
    'K': 'Letra K: faça uma linha reta em pé e puxe dois braços inclinados para a direita.',
    'L': 'Letra L: desça uma linha reta em pé e puxe um traço horizontal reto para a direita no chão.',
    'M': 'Letra M: suba em pé, desça até o meio, suba de novo e desça até o chão.',
    'N': 'Letra N: suba reto, desça inclinado e suba de novo reto até em cima.',
    'O': 'Letra O: faça um círculo redondo bem bonito e fechadinho.',
    'P': 'Letra P: desça uma linha reta e faça uma cabecinha redonda na parte de cima.',
    'Q': 'Letra Q: faça um círculo redondo e puxe uma perninha inclinada para fora embaixo.',
    'R': 'Letra R: desça reto, faça uma voltinha em cima e puxe uma perna inclinada até o chão.',
    'S': 'Letra S: faça uma curva para a esquerda em cima e outra curva para a direita embaixo, como uma cobrinha.',
    'T': 'Letra T: faça um traço reto deitado em cima e desça uma linha reta bem no meio.',
    'U': 'Letra U: desça reto, faça uma curva redonda no chão e suba reto de volta.',
    'V': 'Letra V: desça inclinado até uma ponta embaixo e suba inclinado para a direita.',
    'W': 'Letra W: desça inclinado, suba até o meio, desça de novo e suba inclinado.',
    'X': 'Letra X: cruze duas linhas inclinadas formando um X.',
    'Y': 'Letra Y: faça dois bracinhos que se juntam no meio e desça uma perna reta para baixo.',
    'Z': 'Letra Z: faça um traço deitado em cima, desça inclinado para a esquerda e faça outro traço deitado embaixo.'
};

function initWritingCanvas(name) {
    writingCanvas = document.getElementById('writingCanvas');
    if (!writingCanvas) return;
    writingCtx = writingCanvas.getContext('2d');
    
    setupCanvasResolution();
    redrawWritingCanvas();
    renderLetterTracker();
    evaluateWriting(false);
    
    if (!canvasInitialised) {
        attachCanvasEvents();
        window.addEventListener('resize', handleCanvasResize);
        canvasInitialised = true;
    }
}

function getCanvasLayout(width, name) {
    if (!name || !name.trim()) {
        return {
            lines: [{ text: '', lineIndex: 0, baseline: 240, fontSize: 80 }],
            height: 340,
            fontSize: 80
        };
    }
    
    var trimmed = name.trim();
    var words = trimmed.split(/\s+/).filter(Boolean);
    var maxW = Math.max(260, width - 60);
    
    // Testa se o nome completo cabe em 1 única linha com uma fonte grande e confortável (>= 60px)
    var testCtx = writingCtx || (writingCanvas ? writingCanvas.getContext('2d') : null);
    var fullWidthAt65 = 9999;
    if (testCtx) {
        testCtx.save();
        testCtx.font = 'bold 65px Nunito, sans-serif';
        fullWidthAt65 = testCtx.measureText(trimmed).width;
        testCtx.restore();
    }
    
    // Quebra em linhas separadas se houver 2+ palavras e o nome for longo ou não couber grande em 1 linha
    var shouldSplitLines = (words.length >= 2) && (fullWidthAt65 > maxW || words.length > 2 || trimmed.length >= 10);
    
    if (!shouldSplitLines) {
        // 1 Única Linha com letras amplas
        var baseFontSize = 90;
        if (testCtx) {
            testCtx.save();
            testCtx.font = 'bold ' + baseFontSize + 'px Nunito, sans-serif';
            var tw = testCtx.measureText(trimmed).width;
            if (tw > maxW && tw > 0) {
                baseFontSize = Math.max(46, Math.floor(baseFontSize * (maxW / tw)));
            }
            testCtx.restore();
        }
        
        var height1 = Math.max(340, Math.round(baseFontSize * 3.6));
        var base1 = Math.round(height1 * 0.72);
        
        return {
            lines: [{ text: trimmed, lineIndex: 0, baseline: base1, fontSize: baseFontSize }],
            height: height1,
            fontSize: baseFontSize
        };
    } else {
        // Múltiplas Linhas para nomes compostos (ex: "MARIA FERNANDA" -> cada palavra grande e nítida)
        var lineGroups = [];
        if (words.length === 2) {
            lineGroups = [words[0], words[1]];
        } else if (words.length === 3) {
            if (words[1].length <= 3) {
                lineGroups = [words[0], words[1] + ' ' + words[2]];
            } else {
                lineGroups = [words[0] + ' ' + words[1], words[2]];
            }
        } else {
            var half = Math.ceil(words.length / 2);
            lineGroups = [words.slice(0, half).join(' '), words.slice(half).join(' ')];
        }
        
        // Calcula a melhor fonte possível para cada linha
        var lineFontSizes = lineGroups.map(function(lineText) {
            var fSize = 84;
            if (testCtx) {
                testCtx.save();
                testCtx.font = 'bold ' + fSize + 'px Nunito, sans-serif';
                var w = testCtx.measureText(lineText).width;
                if (w > maxW && w > 0) {
                    fSize = Math.max(48, Math.floor(fSize * (maxW / w)));
                }
                testCtx.restore();
            }
            return fSize;
        });
        
        // Fonte uniforme entre as linhas para harmonia visual
        var commonFontSize = Math.min(lineFontSizes[0], lineFontSizes[1]);
        var lineHeight = Math.max(225, Math.round(commonFontSize * 2.75));
        var totalHeight = Math.max(500, lineHeight * lineGroups.length + 30);
        
        var lines = [];
        for (var li = 0; li < lineGroups.length; li++) {
            var lText = lineGroups[li];
            var base = Math.round((li + 0.78) * lineHeight);
            lines.push({
                text: lText,
                lineIndex: li,
                baseline: base,
                fontSize: commonFontSize
            });
        }
        
        return {
            lines: lines,
            height: totalHeight,
            fontSize: commonFontSize
        };
    }
}

function setupCanvasResolution() {
    if (!writingCanvas) return;
    var container = writingCanvas.parentElement;
    var rect = container.getBoundingClientRect();
    var width = Math.floor(rect.width) || 600;
    
    var layout = getCanvasLayout(width, currentName);
    var height = layout.height;
    
    var dpr = window.devicePixelRatio || 1;
    writingCanvas.width = width * dpr;
    writingCanvas.height = height * dpr;
    writingCanvas.style.width = width + 'px';
    writingCanvas.style.height = height + 'px';
    
    if (writingCtx.resetTransform) {
        writingCtx.resetTransform();
    }
    writingCtx.scale(dpr, dpr);
}

function handleCanvasResize() {
    if (!writingCanvas || writingCanvas.offsetParent === null) return;
    setupCanvasResolution();
    redrawWritingCanvas();
}

function getLetterMetrics() {
    if (!writingCanvas || !currentName) return [];
    var width = parseFloat(writingCanvas.style.width) || 600;
    var layout = getCanvasLayout(width, currentName);
    var list = [];
    var globalCharIdx = 0;
    
    writingCtx.save();
    
    layout.lines.forEach(function(lineObj) {
        writingCtx.font = 'bold ' + lineObj.fontSize + 'px Nunito, sans-serif';
        var textWidth = writingCtx.measureText(lineObj.text).width;
        var startX = Math.max(20, (width - textWidth) / 2);
        var curX = startX;
        
        for (var i = 0; i < lineObj.text.length; i++) {
            var ch = lineObj.text[i];
            var chW = writingCtx.measureText(ch).width;
            
            if (ch !== ' ') {
                list.push({
                    char: ch,
                    index: globalCharIdx,
                    x1: curX,
                    x2: curX + chW,
                    width: chW,
                    centerX: curX + chW / 2,
                    y1: lineObj.baseline - lineObj.fontSize * 0.72,
                    y2: lineObj.baseline,
                    baseline: lineObj.baseline,
                    fontSize: lineObj.fontSize,
                    line: lineObj.lineIndex || 0
                });
                globalCharIdx++;
            }
            curX += chW;
        }
    });
    
    writingCtx.restore();
    return list;
}

function drawBackgroundGuides() {
    if (!writingCanvas || !writingCtx) return;
    var width = parseFloat(writingCanvas.style.width) || 600;
    var height = parseFloat(writingCanvas.style.height) || 340;
    
    // Fundo branco limpo
    writingCtx.fillStyle = '#FFFFFF';
    writingCtx.fillRect(0, 0, width, height);
    
    var layout = getCanvasLayout(width, currentName);
    
    // Desenha pautas para cada linha (estilo caderno de caligrafia do Caminho Suave)
    layout.lines.forEach(function(lineObj) {
        var base = lineObj.baseline;
        var top = base - lineObj.fontSize * 0.72;
        var mid = base - lineObj.fontSize * 0.36;
        
        writingCtx.save();
        // Linha de topo suave
        writingCtx.beginPath();
        writingCtx.strokeStyle = '#ECEFF1';
        writingCtx.lineWidth = 1.6;
        writingCtx.setLineDash([4, 4]);
        writingCtx.moveTo(16, top);
        writingCtx.lineTo(width - 16, top);
        writingCtx.stroke();
        
        // Linha intermediária (guia das minúsculas/meio)
        writingCtx.beginPath();
        writingCtx.strokeStyle = '#CFD8DC';
        writingCtx.lineWidth = 1.8;
        writingCtx.setLineDash([6, 6]);
        writingCtx.moveTo(16, mid);
        writingCtx.lineTo(width - 16, mid);
        writingCtx.stroke();
        
        // Linha de base principal (onde as letras se apoiam - verde nítido e firme)
        writingCtx.beginPath();
        writingCtx.strokeStyle = '#388E3C';
        writingCtx.lineWidth = 3.0;
        writingCtx.setLineDash([]);
        writingCtx.moveTo(16, base);
        writingCtx.lineTo(width - 16, base);
        writingCtx.stroke();
        writingCtx.restore();
    });
    
    if (writingMode === 'trace' && currentName) {
        var metrics = getLetterMetrics();
        if (metrics.length === 0) return;
        
        writingCtx.save();
        writingCtx.textBaseline = 'alphabetic';
        writingCtx.textAlign = 'left';
        
        metrics.forEach(function(m) {
            writingCtx.font = 'bold ' + m.fontSize + 'px Nunito, sans-serif';
            
            // 1. Fundo do cartão da letra (estilo bloco pedagógico para idosos enxergarem com facilidade)
            var padX = Math.max(4, m.fontSize * 0.05);
            var padY = Math.max(5, m.fontSize * 0.06);
            var cardX = m.x1 - padX;
            var cardY = m.y1 - padY;
            var cardW = m.width + padX * 2;
            var cardH = (m.y2 - m.y1) + padY * 2;
            
            writingCtx.save();
            writingCtx.fillStyle = 'rgba(232, 245, 233, 0.65)'; // verde claro com bom contraste
            writingCtx.strokeStyle = 'rgba(165, 214, 167, 0.70)';
            writingCtx.lineWidth = 1.4;
            writingCtx.setLineDash([]);
            if (writingCtx.roundRect) {
                writingCtx.beginPath();
                writingCtx.roundRect(cardX, cardY, cardW, cardH, 10);
                writingCtx.fill();
                writingCtx.stroke();
            } else {
                writingCtx.fillRect(cardX, cardY, cardW, cardH);
                writingCtx.strokeRect(cardX, cardY, cardW, cardH);
            }
            writingCtx.restore();
            
            // 2. Silhueta sólida da letra com alto contraste (fundo visível para baixa visão)
            writingCtx.fillStyle = 'rgba(46, 125, 50, 0.32)';
            writingCtx.fillText(m.char, m.x1, m.baseline);
            
            // 3. Contorno pontilhado forte e escuro
            writingCtx.strokeStyle = '#1B5E20';
            writingCtx.lineWidth = Math.max(2.8, m.fontSize * 0.045);
            writingCtx.setLineDash([6, 5]);
            writingCtx.strokeText(m.char, m.x1, m.baseline);
            
            // 4. Setas e pontos de direção pedagógica (quando ativadas)
            if (showDirectionArrows) {
                drawArrowGuide(m);
            }
        });
        writingCtx.restore();
    } else if (writingMode === 'free') {
        // Modo Assinatura Livre: linha de documento
        var baseFree = height * 0.72;
        writingCtx.save();
        writingCtx.strokeStyle = '#2E7D32';
        writingCtx.lineWidth = 3;
        writingCtx.beginPath();
        writingCtx.moveTo(20, baseFree);
        writingCtx.lineTo(width - 20, baseFree);
        writingCtx.stroke();
        
        writingCtx.fillStyle = '#8D6E63';
        writingCtx.font = 'bold 16px Nunito, sans-serif';
        writingCtx.textAlign = 'left';
        writingCtx.textBaseline = 'bottom';
        writingCtx.fillText('✍️ Linha de Assinatura Oficial (Documento / RG):', 24, baseFree - 12);
        writingCtx.restore();
    }
}

function drawArrowGuide(m) {
    writingCtx.save();
    writingCtx.setLineDash([]);
    
    // Obtém o traçado real da letra para mostrar o ponto inicial correto
    var scaledStrokes = (typeof getScaledStrokesForLetter === 'function')
        ? getScaledStrokesForLetter(m.char, m)
        : null;
    
    var startX, startY, dirDX, dirDY;
    
    if (scaledStrokes && scaledStrokes.length > 0 && scaledStrokes[0].length >= 2) {
        // Usa o ponto real de início do primeiro stroke
        startX = scaledStrokes[0][0].x;
        startY = scaledStrokes[0][0].y;
        // Direção inicial: vetor do ponto 0 ao ponto 1
        var p1 = scaledStrokes[0][0];
        var p2 = scaledStrokes[0][1];
        dirDX = p2.x - p1.x;
        dirDY = p2.y - p1.y;
    } else {
        // Fallback: topo central
        startX = m.centerX;
        startY = m.y1 + 4;
        dirDX = 0; dirDY = 1;
    }
    
    var len = Math.sqrt(dirDX * dirDX + dirDY * dirDY);
    if (len > 0) { dirDX /= len; dirDY /= len; }
    
    // Ponto verde de início
    writingCtx.beginPath();
    writingCtx.arc(startX, startY, 5, 0, Math.PI * 2);
    writingCtx.fillStyle = '#2E7D32';
    writingCtx.fill();
    writingCtx.strokeStyle = '#FFFFFF';
    writingCtx.lineWidth = 1.5;
    writingCtx.stroke();
    
    // Seta de direção inicial (aponta na direção do primeiro movimento)
    var arrowLen = 12;
    var ex = startX + dirDX * arrowLen;
    var ey = startY + dirDY * arrowLen;
    writingCtx.beginPath();
    writingCtx.strokeStyle = '#2E7D32';
    writingCtx.lineWidth = 2;
    writingCtx.moveTo(startX, startY);
    writingCtx.lineTo(ex, ey);
    // Pontinha da seta
    var angle = Math.atan2(dirDY, dirDX);
    writingCtx.lineTo(
        ex - 5 * Math.cos(angle - 0.5),
        ey - 5 * Math.sin(angle - 0.5)
    );
    writingCtx.moveTo(ex, ey);
    writingCtx.lineTo(
        ex - 5 * Math.cos(angle + 0.5),
        ey - 5 * Math.sin(angle + 0.5)
    );
    writingCtx.stroke();
    
    // Numeração de strokes (quando há mais de 1 stroke)
    if (scaledStrokes && scaledStrokes.length > 1) {
        writingCtx.font = 'bold 10px Nunito, sans-serif';
        writingCtx.textAlign = 'center';
        writingCtx.textBaseline = 'middle';
        for (var si = 0; si < Math.min(scaledStrokes.length, 4); si++) {
            if (!scaledStrokes[si] || scaledStrokes[si].length === 0) continue;
            var sx = scaledStrokes[si][0].x;
            var sy = scaledStrokes[si][0].y;
            writingCtx.beginPath();
            writingCtx.arc(sx, sy, 7, 0, Math.PI * 2);
            writingCtx.fillStyle = 'rgba(46, 125, 50, 0.85)';
            writingCtx.fill();
            writingCtx.fillStyle = '#FFFFFF';
            writingCtx.fillText(String(si + 1), sx, sy);
        }
    }
    
    writingCtx.restore();
}

function toggleDirectionArrows() {
    showDirectionArrows = !showDirectionArrows;
    var btn = document.getElementById('btnToggleArrows');
    if (btn) {
        if (showDirectionArrows) {
            btn.classList.add('active');
            speak('Setas de direção ativadas.');
        } else {
            btn.classList.remove('active');
            speak('Setas de direção ocultadas.');
        }
    }
    redrawWritingCanvas();
}

function redrawWritingCanvas() {
    if (!writingCanvas || !writingCtx) return;
    drawBackgroundGuides();
    
    // Redesenha todos os traços do usuário
    strokes.forEach(function(stroke) {
        if (!stroke.points || stroke.points.length < 2) return;
        writingCtx.save();
        writingCtx.strokeStyle = stroke.color;
        writingCtx.lineWidth = stroke.width;
        writingCtx.lineCap = 'round';
        writingCtx.lineJoin = 'round';
        writingCtx.beginPath();
        writingCtx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (var i = 1; i < stroke.points.length; i++) {
            writingCtx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        writingCtx.stroke();
        writingCtx.restore();
    });
}

function getCanvasCoordinates(e) {
    var rect = writingCanvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function attachCanvasEvents() {
    if (!writingCanvas) return;
    
    writingCanvas.addEventListener('pointerdown', function(e) {
        e.preventDefault();
        try { writingCanvas.setPointerCapture(e.pointerId); } catch(err) {}
        
        var pt = getCanvasCoordinates(e);
        isDrawing = true;
        currentStroke = {
            color: penColor,
            width: penWidth,
            points: [pt]
        };
        lastPoint = pt;
        
        var hint = document.getElementById('canvasHint');
        if (hint) hint.style.opacity = '0';
    });
    
    writingCanvas.addEventListener('pointermove', function(e) {
        if (!isDrawing || !currentStroke) return;
        e.preventDefault();
        var pt = getCanvasCoordinates(e);
        currentStroke.points.push(pt);
        
        writingCtx.save();
        writingCtx.strokeStyle = penColor;
        writingCtx.lineWidth = penWidth;
        writingCtx.lineCap = 'round';
        writingCtx.lineJoin = 'round';
        writingCtx.beginPath();
        writingCtx.moveTo(lastPoint.x, lastPoint.y);
        writingCtx.lineTo(pt.x, pt.y);
        writingCtx.stroke();
        writingCtx.restore();
        
        lastPoint = pt;
    });
    
    function endStroke(e) {
        if (!isDrawing) return;
        isDrawing = false;
        try { writingCanvas.releasePointerCapture(e.pointerId); } catch(err) {}
        if (currentStroke && currentStroke.points.length > 1) {
            strokes.push(currentStroke);
        }
        currentStroke = null;
        lastPoint = null;
        
        // Dispara avaliação silenciosa em tempo real após debounce
        if (evalDebounceTimer) clearTimeout(evalDebounceTimer);
        evalDebounceTimer = setTimeout(function() {
            evaluateWriting(false);
        }, 500);
    }
    
    writingCanvas.addEventListener('pointerup', endStroke);
    writingCanvas.addEventListener('pointercancel', endStroke);
}

// ============================================================
// SISTEMA DE AVALIAÇÃO DE ESCRITA / CALIGRAFIA
// ============================================================

function renderLetterTracker() {
    var tracker = document.getElementById('writingLettersTracker');
    var trackerWrapper = document.getElementById('writingTrackerWrapper');
    if (!tracker) return;
    
    if (writingMode !== 'trace' || !currentName) {
        if (trackerWrapper) trackerWrapper.style.display = 'none';
        return;
    }
    if (trackerWrapper) trackerWrapper.style.display = 'block';
    
    tracker.innerHTML = '';
    var letters = currentName.replace(/\s/g, '').split('');
    letterAttempts = {};
    letterStatusMap = letters.map(function(ch, idx) {
        return { char: ch, nameIndex: idx, score: 0, coverage: 0, passed: false };
    });
    
    letterStatusMap.forEach(function(item) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'tracker-chip';
        chip.id = 'trackerChip_' + item.nameIndex;
        chip.setAttribute('aria-label', 'Letra ' + item.char + '. Toque para ouvir dica.');
        chip.onclick = (function(c) { return function() { speakLetterTip(c); }; })(item.char);
        
        chip.innerHTML = 
            '<span class="chip-char">' + item.char + '</span>' +
            '<span class="chip-status" id="chipStatus_' + item.nameIndex + '"><i class="fas fa-pen"></i></span>';
        
        tracker.appendChild(chip);
    });
    
    var countEl = document.getElementById('trackerProgressCount');
    if (countEl) countEl.textContent = '0 de ' + letters.length;
}

function speakLetterTip(char) {
    var tip = letterTraceTips[char] || ('Letra ' + char + '. Passe o dedo com calma por cima da letra pontilhada.');
    speak(tip);
}

// ============================================================
// NOVA AVALIAÇÃO MULTICRITÉRIO
// Usa LETTER_PATHS de letter-paths.js para avaliação real do traçado
// ============================================================

function evaluateWriting(isManual) {
    if (!writingCanvas) return;
    
    if (writingMode === 'free') {
        evaluateFreeSignature(isManual);
        return;
    }
    
    var metrics = getLetterMetrics();
    if (metrics.length === 0) {
        updateEvaluationUI(0, 0, 'Passe o dedo cobrindo as letras pontilhadas. O sistema avaliará sua caligrafia automaticamente!', 'info');
        return;
    }
    
    if (strokes.length === 0) {
        updateEvaluationUI(0, 0, 'Passe o dedo com firmeza por cima das letras pontilhadas.', 'info');
        return;
    }
    
    // ============================================================
    // DETECÇÃO GLOBAL DE PINTURA / RABISCO DO QUADRO
    // Analisa se o usuário rabiscou caoticamente ou cobriu o quadro
    // ============================================================
    var totalUserLength = 0;
    var totalUserPoints = 0;
    strokes.forEach(function(st) {
        if (!st || !st.points) return;
        totalUserPoints += st.points.length;
        for (var p = 1; p < st.points.length; p++) {
            var dx = st.points[p].x - st.points[p - 1].x;
            var dy = st.points[p].y - st.points[p - 1].y;
            totalUserLength += Math.sqrt(dx * dx + dy * dy);
        }
    });
    
    // Comprimento total esperado para escrever as letras do nome
    var totalExpectedLength = 0;
    metrics.forEach(function(m) {
        var scaled = (typeof getScaledStrokesForLetter === 'function')
            ? getScaledStrokesForLetter(m.char, m) : null;
        if (scaled && scaled.length > 0) {
            scaled.forEach(function(s) {
                for (var k = 1; k < s.length; k++) {
                    var sx = s[k].x - s[k - 1].x;
                    var sy = s[k].y - s[k - 1].y;
                    totalExpectedLength += Math.sqrt(sx * sx + sy * sy);
                }
            });
        } else {
            totalExpectedLength += (m.width + (m.y2 - m.y1)) * 2;
        }
    });
    
    // Contagem de pontos que caem completamente fora de qualquer letra
    var pointsOutsideAllLetters = 0;
    strokes.forEach(function(st) {
        if (!st || !st.points) return;
        st.points.forEach(function(pt) {
            var nearAny = false;
            for (var mi = 0; mi < metrics.length; mi++) {
                var m = metrics[mi];
                var pad = m.fontSize * 0.35;
                if (pt.x >= m.x1 - pad && pt.x <= m.x2 + pad &&
                    pt.y >= m.y1 - pad && pt.y <= m.y2 + pad) {
                    nearAny = true;
                    break;
                }
            }
            if (!nearAny) pointsOutsideAllLetters++;
        });
    });
    
    var outsideGlobalRatio = pointsOutsideAllLetters / Math.max(1, totalUserPoints);
    var lengthRatioGlobal = totalUserLength / Math.max(20, totalExpectedLength);
    
    // Se desenhou mais de 2.5x o necessário OU espalhou mais de 38% dos traços fora das letras
    var isSevereScribble = (lengthRatioGlobal > 2.5) || (outsideGlobalRatio > 0.38 && totalUserPoints > 40);
    
    var completedCount = 0;
    var totalScoreSum = 0;
    
    metrics.forEach(function(m, idx) {
        var attempts = letterAttempts[idx] || 0;
        var bonus = attempts * WRITING_EVALUATION_CONFIG.attemptToleranceBonus;
        
        var result = evaluateLetter(m.char, m, strokes, bonus);
        
        if (letterStatusMap[idx]) {
            letterStatusMap[idx].score    = result.score;
            letterStatusMap[idx].coverage = result.coverage;
            letterStatusMap[idx].passed   = result.passed;
            letterStatusMap[idx].result   = result;
        }
        
        if (result.passed && !isSevereScribble) {
            completedCount++;
        }
        totalScoreSum += result.score;
        
        // Atualiza chip da letra
        var chip       = document.getElementById('trackerChip_'  + idx);
        var chipStatus = document.getElementById('chipStatus_'   + idx);
        if (chip && chipStatus) {
            chip.classList.remove('completed', 'partial');
            if (result.passed && !isSevereScribble) {
                chip.classList.add('completed');
                chipStatus.innerHTML = '<i class="fas fa-check"></i>';
            } else if (!isSevereScribble && (result.score >= 32 || result.coverage >= 35)) {
                chip.classList.add('partial');
                chipStatus.innerHTML = '<i class="fas fa-pencil-alt"></i>';
            } else {
                chipStatus.innerHTML = '<i class="fas fa-pen"></i>';
            }
        }
    });
    
    var avgScore = Math.round(totalScoreSum / Math.max(metrics.length, 1));
    
    // Proteção contra pintura indiscriminada do quadro
    if (isSevereScribble) {
        var scribbleScore = Math.min(10, Math.max(2, Math.round(avgScore * 0.15)));
        var scribbleMsg = 'Percebemos muitos traços e rabiscos no quadro. Para treinar sua caligrafia, passe o dedo com cuidado, apenas por cima das linhas pontilhadas de cada letra.';
        var countEl = document.getElementById('trackerProgressCount');
        if (countEl) countEl.textContent = '0 de ' + metrics.length;
        updateEvaluationUI(scribbleScore, 0, scribbleMsg, 'info');
        if (isManual) speak(scribbleMsg);
        return;
    }
    
    // Se nenhuma letra foi aprovada com precisão real, a nota média não pode ser aprovativa
    if (completedCount === 0) {
        avgScore = Math.min(avgScore, 25);
    }
    
    var countEl = document.getElementById('trackerProgressCount');
    if (countEl) countEl.textContent = completedCount + ' de ' + metrics.length;
    
    // Feedback pedagógico construtivo
    var stars = 0, feedbackMsg = '', statusClass = 'info';
    var allPassed = (completedCount === metrics.length);
    var partialRatio = completedCount / Math.max(metrics.length, 1);
    
    if (allPassed && avgScore >= 75) {
        stars = 3;
        statusClass = 'success';
        feedbackMsg = 'Muito bem! Você escreveu o seu nome ' + currentName + ' com ótimo traçado!';
    } else if (allPassed || (partialRatio >= 0.70 && avgScore >= 55)) {
        stars = 2;
        statusClass = 'partial';
        var faltam = metrics.length - completedCount;
        feedbackMsg = faltam > 0
            ? 'Você está quase lá! Vamos completar ' + faltam + ' letra(s) que ainda precisam de treino.'
            : 'Ótimo trabalho! O traçado do seu nome está muito bom.';
    } else if (partialRatio >= 0.35 || (completedCount > 0 && avgScore >= 35)) {
        stars = 1;
        statusClass = 'partial';
        feedbackMsg = 'Bom começo! Passe o dedo devagar seguindo cada letra com cuidado.';
    } else {
        stars = 0;
        statusClass = 'info';
        feedbackMsg = 'Passe a ponta do dedo bem por cima das linhas pontilhadas de cada letra.';
    }
    
    updateEvaluationUI(avgScore, stars, feedbackMsg, statusClass);
    if (isManual) speak(feedbackMsg);
}

function evaluateFreeSignature(isManual) {
    if (strokes.length === 0) {
        updateEvaluationUI(0, 0, 'Assine ou escreva seu nome livremente em cima da linha guia.', 'info');
        return;
    }
    
    var totalPts = 0;
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    var height = parseFloat(writingCanvas.style.height) || 340;
    var baseline = height * 0.72;
    var ptsNearBaseline = 0;
    
    strokes.forEach(function(st) {
        if (!st.points) return;
        totalPts += st.points.length;
        st.points.forEach(function(p) {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
            if (Math.abs(p.y - baseline) < 65) ptsNearBaseline++;
        });
    });
    
    var spanX = maxX - minX;
    var spanY = maxY - minY;
    var ratioNear = ptsNearBaseline / Math.max(1, totalPts);
    
    // Se cobriu a altura inteira do canvas de cima a baixo com rabiscos
    var isCanvasPainted = (spanY > height * 0.75 && totalPts > 90 && ratioNear < 0.42);
    if (isCanvasPainted) {
        updateEvaluationUI(8, 0, 'Percebemos muitos traços pelo quadro todo. Tente assinar com calma em cima da linha verde.', 'info');
        if (isManual) speak('Percebemos muitos traços pelo quadro todo. Tente assinar com calma em cima da linha verde.');
        return;
    }
    
    // Critérios para assinatura livre
    var score = 0, stars = 0, msg = '', sClass = 'info';
    if (totalPts >= 80 && spanX >= 200 && ratioNear >= 0.65) {
        score = 90;
        stars = 3;
        sClass = 'success';
        msg = 'Assinatura excelente! Traçado contínuo, firme e bem posicionado na linha de documento!';
    } else if (totalPts >= 40 && spanX >= 100 && ratioNear >= 0.45) {
        score = 58;
        stars = 2;
        sClass = 'partial';
        msg = 'Boa assinatura! Tente assinar com um traço mais longo, bem em cima da linha verde.';
    } else if (totalPts >= 15 && spanX >= 50) {
        score = 28;
        stars = 1;
        sClass = 'info';
        msg = 'Continue treinando. Assine com firmeza, passando o dedo de ponta a ponta da linha guia.';
    } else {
        score = 10;
        stars = 0;
        sClass = 'info';
        msg = 'Que tal tentar novamente? Passe o dedo firmemente de um lado ao outro da linha guia.';
    }
    
    updateEvaluationUI(score, stars, msg, sClass);
    if (isManual) speak(msg);
}

function updateEvaluationUI(score, stars, msg, statusClass) {
    currentEvalScore = score;
    currentEvalStars = stars;
    currentEvalText = msg;
    
    var scoreLabel = document.getElementById('evalScoreLabel');
    if (scoreLabel) scoreLabel.textContent = score + '%';
    
    var fill = document.getElementById('evalProgressBarFill');
    if (fill) fill.style.width = score + '%';
    
    for (var s = 1; s <= 3; s++) {
        var starEl = document.getElementById('star' + s);
        if (starEl) {
            if (s <= stars) starEl.classList.add('active');
            else starEl.classList.remove('active');
        }
    }
    
    var msgCard = document.getElementById('evalFeedbackMsg');
    var msgText = document.getElementById('evalFeedbackText');
    if (msgCard && msgText) {
        msgCard.className = 'eval-feedback-msg ' + (statusClass || 'info');
        msgText.textContent = msg;
    }
}

function speakCurrentEvaluation() {
    if (!currentEvalText) {
        speak('Passe o dedo sobre as letras para avaliar sua caligrafia.');
        return;
    }
    speak(currentEvalText);
}

// ============================================================
// DEMONSTRAÇÃO ANIMADA DE CALIGRAFIA (usa LETTER_PATHS reais)
// ============================================================

// Índice da letra sendo destacada durante a demo
var demoCurrentLetterIdx = -1;

// Traços já desenhados pelo demo (acumulados para persistência visual)
var demoDrawnStrokes = [];

function playWritingDemo() {
    if (isDemoPlaying) {
        stopWritingDemo();
        return;
    }
    
    if (writingMode !== 'trace' || !currentName) {
        speak('A demonstração animada está disponível no modo Cobrir Letras.');
        return;
    }
    
    var metrics = getLetterMetrics();
    if (metrics.length === 0) {
        speak('Digite um nome primeiro.');
        return;
    }
    
    isDemoPlaying = true;
    demoDrawnStrokes = []; // Limpa o acumulador de traços do demo
    var btn = document.getElementById('btnDemoTrace');
    var textEl = document.getElementById('btnDemoText');
    if (btn) btn.classList.add('active');
    if (textEl) textEl.textContent = 'Parar demonstração';
    
    // Garante que o demoState do letter-paths.js está limpo
    if (typeof stopDemo === 'function') stopDemo();
    
    // Fala introdução
    speak('Observe como escrevemos o seu nome.');
    
    // Espera a fala iniciar antes de animar
    setTimeout(function() {
        if (!isDemoPlaying) return;
        
        runLetterDemo({
            ctx: writingCtx,
            letterMetrics: metrics,
            getBackground: function() {
                // Redesenha o fundo (letras pontilhadas)
                redrawWritingCanvas();
                
                // Redesenha todos os traços já feitos pela demo (persistência)
                demoDrawnStrokes.forEach(function(dStroke) {
                    if (!dStroke || dStroke.length < 2) return;
                    writingCtx.save();
                    writingCtx.strokeStyle = '#1565C0';
                    writingCtx.lineWidth = 5.5;
                    writingCtx.lineCap = 'round';
                    writingCtx.lineJoin = 'round';
                    writingCtx.beginPath();
                    writingCtx.moveTo(dStroke[0].x, dStroke[0].y);
                    for (var di = 1; di < dStroke.length; di++) {
                        writingCtx.lineTo(dStroke[di].x, dStroke[di].y);
                    }
                    writingCtx.stroke();
                    writingCtx.restore();
                });
                
                // Destaca apenas a letra atual com sombra mais forte
                if (demoCurrentLetterIdx >= 0 && demoCurrentLetterIdx < metrics.length) {
                    var m = metrics[demoCurrentLetterIdx];
                    writingCtx.save();
                    writingCtx.font = 'bold ' + m.fontSize + 'px Nunito, sans-serif';
                    writingCtx.textBaseline = 'alphabetic';
                    writingCtx.textAlign = 'left';
                    writingCtx.fillStyle = 'rgba(46, 125, 50, 0.35)';
                    writingCtx.fillText(m.char, m.x1, m.baseline);
                    writingCtx.restore();
                }
            },
            onStrokeComplete: function(strokePoints) {
                // Acumula cada traço completado para manter na tela
                if (strokePoints && strokePoints.length >= 2) {
                    demoDrawnStrokes.push(strokePoints.slice());
                }
            },
            onLetterStart: function(m, idx) {
                demoCurrentLetterIdx = idx;
            },
            onLetterEnd: function(m, idx) {
                // pausa visual breve — a letra fica completa por um instante
            },
            onComplete: function() {
                demoCurrentLetterIdx = -1;
                // Mantém os traços visíveis por 2 segundos e depois limpa
                setTimeout(function() {
                    demoDrawnStrokes = [];
                    stopWritingDemo();
                    speak('Agora é a sua vez. Passe o dedo seguindo as letras.');
                }, 2000);
            },
            strokeSpeedMs: 1200,
            pauseBetweenStrokes: 320,
            pauseBetweenLetters: 900
        });
    }, 1400);
}

function stopWritingDemo() {
    isDemoPlaying = false;
    demoCurrentLetterIdx = -1;
    // Para animações do letter-paths.js
    if (typeof stopDemo === 'function') stopDemo();
    // Para timers legados
    if (demoTimer) { clearTimeout(demoTimer); demoTimer = null; }
    var btn = document.getElementById('btnDemoTrace');
    var textEl = document.getElementById('btnDemoText');
    if (btn) btn.classList.remove('active');
    if (textEl) textEl.textContent = 'Ver como escrever';
    redrawWritingCanvas();
}

function setWritingMode(mode) {
    writingMode = mode;
    stopWritingDemo();
    var btnTrace = document.getElementById('btnModeTrace');
    var btnFree = document.getElementById('btnModeFree');
    var bar = document.getElementById('writingGuidanceBar');
    var trackerWrapper = document.getElementById('writingTrackerWrapper');
    
    if (btnTrace && btnFree) {
        if (mode === 'trace') {
            btnTrace.classList.add('active');
            btnFree.classList.remove('active');
            if (bar) bar.style.display = 'flex';
            if (trackerWrapper) trackerWrapper.style.display = 'block';
        } else {
            btnFree.classList.add('active');
            btnTrace.classList.remove('active');
            if (bar) bar.style.display = 'none';
            if (trackerWrapper) trackerWrapper.style.display = 'none';
        }
    }
    redrawWritingCanvas();
    renderLetterTracker();
    evaluateWriting(false);
    speakWritingHint();
}

function setPenColor(color, btn) {
    penColor = color;
    document.querySelectorAll('.color-dot').forEach(function(el) { el.classList.remove('active'); });
    if (btn) btn.classList.add('active');
}

function clearWritingCanvas() {
    stopWritingDemo();
    strokes = [];
    currentStroke = null;
    redrawWritingCanvas();
    var hint = document.getElementById('canvasHint');
    if (hint) hint.style.opacity = '1';
    renderLetterTracker();
    updateEvaluationUI(0, 0, 'Canvas limpo. Passe o dedo para começar a treinar novamente.', 'info');
}

function speakWritingHint() {
    var msg = (writingMode === 'trace')
        ? 'Passe a ponta do seu dedo sobre as letras verdes para treinar a escrita do seu nome.'
        : 'Assine ou escreva o seu nome livremente em cima da linha, igual a um documento do cartório ou RG.';
    speak(msg);
}

function confirmWritingSuccess() {
    // Faz avaliação completa antes de salvar
    evaluateWriting(false);
    
    if (writingMode === 'free') {
        // Modo livre: salva diretamente
        speak('Treino de assinatura livre salvo com sucesso!');
        _markWritingSaved();
        return;
    }
    
    // Modo trace: verifica se letras essenciais foram concluídas
    var metrics = getLetterMetrics();
    var totalLetters = metrics.length;
    var passedLetters = letterStatusMap.filter(function(s) { return s.passed; }).length;
    
    // Considera salvo se pelo menos 70% das letras passaram
    var minPassed = Math.ceil(totalLetters * 0.70);
    
    if (passedLetters >= minPassed || totalLetters === 0) {
        var scoreMsg = currentEvalScore >= 75
            ? 'Muito bem! O seu treino de caligrafia foi salvo!'
            : 'Treino de escrita registrado! Continue praticando para melhorar.';
        speak(scoreMsg);
        _markWritingSaved();
    } else {
        // Ainda há letras que precisam de atenção
        var faltam = totalLetters - passedLetters;
        var msg = 'Você está quase lá! Vamos terminar ' + faltam + ' letra(s) que ainda precisam de treino.';
        speak(msg);
        
        // Identifica e destaca a próxima letra pendente
        var nextPending = letterStatusMap.find(function(s) { return !s.passed; });
        if (nextPending) {
            // Incrementa tentativas desta letra
            letterAttempts[nextPending.nameIndex] = (letterAttempts[nextPending.nameIndex] || 0) + 1;
            var attempts = letterAttempts[nextPending.nameIndex];
            
            // Feedback progressivo
            if (attempts === 1) {
                setTimeout(function() {
                    speak('Vamos tentar mais uma vez. Passe o dedo devagar seguindo a linha da letra ' + nextPending.char + '.');
                }, 2200);
            } else if (attempts === 2) {
                // Destaca a letra visualmente
                _highlightNextPendingLetter(nextPending.nameIndex);
                setTimeout(function() {
                    speak('Olhe o ponto verde. Comece por aí e siga com o dedo devagar.');
                }, 2200);
            } else {
                // Terceira tentativa: oferece demo automático
                _highlightNextPendingLetter(nextPending.nameIndex);
                setTimeout(function() {
                    speak('Que tal ver como se escreve esta letra? Vou mostrar agora.');
                    setTimeout(function() { playWritingDemo(); }, 2000);
                }, 2200);
            }
            
            // Scroll para o chip da letra
            var chip = document.getElementById('trackerChip_' + nextPending.nameIndex);
            if (chip) { chip.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
        }
        
        // Atualiza UI sem desbloquear
        var btn = document.getElementById('btnConfirmWriting');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Continue treinando';
            setTimeout(function() {
                btn.innerHTML = '<i class="fas fa-check-circle"></i> Salvar Treino';
            }, 3500);
        }
    }
}

function _markWritingSaved() {
    try {
        var btn = document.getElementById('btnConfirmWriting');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-check"></i> Treino salvo!';
            setTimeout(function() {
                btn.innerHTML = '<i class="fas fa-check-circle"></i> Salvar Treino';
            }, 3000);
        }
    } catch(e) {}
}

function _highlightNextPendingLetter(nameIndex) {
    // Pulsa o chip da letra para chamar atenção
    var chip = document.getElementById('trackerChip_' + nameIndex);
    if (!chip) return;
    chip.style.transition = 'box-shadow 0.2s';
    chip.style.boxShadow = '0 0 0 4px #FF8F00, 0 0 16px rgba(255,143,0,0.5)';
    setTimeout(function() {
        if (chip) chip.style.boxShadow = '';
    }, 3000);
}

function prefillUserName() {
    var input = document.getElementById('nameInput');
    if (!input || (input.value && input.value.trim())) return;
    try {
        var raw = localStorage.getItem('aprendidos_usuario');
        if (raw) {
            var u = JSON.parse(raw);
            var name = u.nome || u.name || '';
            if (name) {
                var firstName = name.trim().split(' ')[0];
                input.value = firstName.toUpperCase();
            }
        }
    } catch(e) {}
}

window.speak = speak; window.playInstruction = playInstruction; window.analyzeName = analyzeName;
window.speakName = speakName; window.speakNameSpelled = speakNameSpelled;
window.pickLetter = pickLetter; window.renderExercise = renderExercise;
window.salvarEVerOutras = salvarEVerOutras; window.restartExercise = restartExercise; window.toggleMenu = toggleMenu;

window.initWritingCanvas = initWritingCanvas;
window.setWritingMode = setWritingMode;
window.setPenColor = setPenColor;
window.clearWritingCanvas = clearWritingCanvas;
window.speakWritingHint = speakWritingHint;
window.confirmWritingSuccess = confirmWritingSuccess;

window.evaluateWriting = evaluateWriting;
window.playWritingDemo = playWritingDemo;
window.stopWritingDemo = stopWritingDemo;
window.toggleDirectionArrows = toggleDirectionArrows;
window.speakCurrentEvaluation = speakCurrentEvaluation;
window.speakLetterTip = speakLetterTip;
window._markWritingSaved = _markWritingSaved;
window._highlightNextPendingLetter = _highlightNextPendingLetter;

// Polyfill Array.find para navegadores antigos
if (!Array.prototype.find) {
    Array.prototype.find = function(predicate) {
        for (var i = 0; i < this.length; i++) {
            if (predicate(this[i], i, this)) return this[i];
        }
        return undefined;
    };
}


function initPage() {
    verificarLicaoConcluida();
    prefillUserName();
}

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initPage); }
else { initPage(); }

