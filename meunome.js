/**
 * AprendIDos — Meu Nome
 * meunome.js
 */

var TOTAL = 5; // número de tentativas de montar o nome
var currentAudio = null, ptVoice = null;
var currentName = '';
var attempts = 0, correct = 0, misses = 0;

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
    u.lang = 'pt-BR'; u.rate = 0.75; u.pitch = 1; u.volume = 1;
    if (!ptVoice) loadVoices();
    if (ptVoice) u.voice = ptVoice;
    u.onend = function() { if (onEnd) onEnd(); };
    u.onerror = function() { if (onEnd) onEnd(); };
    setTimeout(function() { try { window.speechSynthesis.speak(u); } catch(e) { if (onEnd) onEnd(); } }, 80);
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

    var html = '';
    for (var i = 0; i < name.length; i++) {
        var ch = name[i];
        if (ch === ' ') { html += '<span class="name-space"> </span>'; continue; }
        var isVowel = vowelSet.includes(ch);
        html += '<span class="name-letter ' + (isVowel ? 'vowel' : 'consonant') + '" title="' + (isVowel ? 'Vogal' : 'Consoante') + '">' + ch + '</span>';
    }
    display.innerHTML = html;
    display.style.display = 'flex';

    var vowels = [], consonants = [];
    for (var j = 0; j < name.length; j++) {
        var c = name[j];
        if (c === ' ') continue;
        if (vowelSet.includes(c)) vowels.push(c);
        else consonants.push(c);
    }
    info.innerHTML =
        '<p><strong>' + name.length + '</strong> letras no total &nbsp;|&nbsp; ' +
        '<span style="color:#2E7D32"><strong>' + vowels.length + '</strong> vogais (' + (vowels.join(', ') || '—') + ')</span> &nbsp;|&nbsp; ' +
        '<span style="color:#00695C"><strong>' + consonants.length + '</strong> consoantes (' + (consonants.join(', ') || '—') + ')</span></p>';
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
        for (var i = 0; i < target.length; i++) {
            var slot = document.createElement('div');
            slot.className = 'name-slot';
            slot.setAttribute('data-pos', i);
            assembledEl.appendChild(slot);
        }
    }

    var roundLabel = document.getElementById('roundLabel');
    if (roundLabel) roundLabel.textContent = 'Tente montar: ' + exerciseName;
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
        if (fb) fb.innerHTML = '<div class="feedback-msg success"><i class="fas fa-check-circle"></i> Muito bem! Você montou seu nome!</div>';
        speak('Muito bem! Você montou seu nome: ' + exerciseName);
        setTimeout(function() { showCompletion(); }, 1200);
    } else {
        misses++;
        if (fb) fb.innerHTML = '<div class="feedback-msg error"><i class="fas fa-redo"></i> Tente novamente!</div>' +
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
    speak('Parabens! Voce aprendeu a montar o seu nome: ' + currentName);
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
var letterStatusMap = []; // [{ char, index, coverage, completed }]

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

function setupCanvasResolution() {
    if (!writingCanvas) return;
    var container = writingCanvas.parentElement;
    var rect = container.getBoundingClientRect();
    var width = Math.floor(rect.width) || 600;
    var height = 270;
    
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
    var height = parseFloat(writingCanvas.style.height) || 270;
    var baseline = height * 0.75;
    
    var baseFontSize = 64;
    var maxW = width - 60;
    
    writingCtx.save();
    writingCtx.font = 'bold ' + baseFontSize + 'px Nunito, sans-serif';
    var textWidth = writingCtx.measureText(currentName).width;
    if (textWidth > maxW && textWidth > 0) {
        baseFontSize = Math.max(26, Math.floor(baseFontSize * (maxW / textWidth)));
        writingCtx.font = 'bold ' + baseFontSize + 'px Nunito, sans-serif';
        textWidth = writingCtx.measureText(currentName).width;
    }
    
    var startX = (width - textWidth) / 2;
    var curX = startX;
    var list = [];
    
    for (var i = 0; i < currentName.length; i++) {
        var ch = currentName[i];
        var chW = writingCtx.measureText(ch).width;
        if (ch !== ' ') {
            list.push({
                char: ch,
                index: i,
                x1: curX,
                x2: curX + chW,
                width: chW,
                centerX: curX + chW / 2,
                y1: baseline - baseFontSize * 0.95,
                y2: baseline + baseFontSize * 0.15,
                baseline: baseline,
                fontSize: baseFontSize
            });
        }
        curX += chW;
    }
    writingCtx.restore();
    return list;
}

function drawBackgroundGuides() {
    if (!writingCanvas || !writingCtx) return;
    var width = parseFloat(writingCanvas.style.width) || 600;
    var height = parseFloat(writingCanvas.style.height) || 270;
    
    // Fundo branco limpo
    writingCtx.fillStyle = '#FFFFFF';
    writingCtx.fillRect(0, 0, width, height);
    
    // Pautas (estilo caderno de caligrafia)
    var topLine = height * 0.25;
    var midLine = height * 0.50;
    var baseline = height * 0.75;
    
    // Linha de topo (guia suave)
    writingCtx.save();
    writingCtx.beginPath();
    writingCtx.strokeStyle = '#ECEFF1';
    writingCtx.lineWidth = 1.5;
    writingCtx.setLineDash([4, 4]);
    writingCtx.moveTo(16, topLine);
    writingCtx.lineTo(width - 16, topLine);
    writingCtx.stroke();
    
    // Linha intermediária (guia das minúsculas/meio)
    writingCtx.beginPath();
    writingCtx.strokeStyle = '#CFD8DC';
    writingCtx.lineWidth = 1.5;
    writingCtx.setLineDash([6, 6]);
    writingCtx.moveTo(16, midLine);
    writingCtx.lineTo(width - 16, midLine);
    writingCtx.stroke();
    writingCtx.restore();
    
    // Linha de base (onde as letras se apoiam - verde claro forte)
    writingCtx.beginPath();
    writingCtx.strokeStyle = '#81C784';
    writingCtx.lineWidth = 2.5;
    writingCtx.moveTo(16, baseline);
    writingCtx.lineTo(width - 16, baseline);
    writingCtx.stroke();
    
    if (writingMode === 'trace' && currentName) {
        var metrics = getLetterMetrics();
        if (metrics.length === 0) return;
        var fontSize = metrics[0].fontSize;
        
        writingCtx.save();
        writingCtx.font = 'bold ' + fontSize + 'px Nunito, sans-serif';
        writingCtx.textBaseline = 'alphabetic';
        writingCtx.textAlign = 'left';
        
        // Letra preenchida verde clarinho + contorno pontilhado
        metrics.forEach(function(m) {
            writingCtx.fillStyle = 'rgba(46, 125, 50, 0.20)';
            writingCtx.fillText(m.char, m.x1, m.baseline);
            
            writingCtx.strokeStyle = 'rgba(46, 125, 50, 0.55)';
            writingCtx.lineWidth = 1.8;
            writingCtx.setLineDash([4, 4]);
            writingCtx.strokeText(m.char, m.x1, m.baseline);
            
            // Setas de direção pedagógica (quando ativadas)
            if (showDirectionArrows) {
                drawArrowGuide(m);
            }
        });
        writingCtx.restore();
    } else if (writingMode === 'free') {
        // Modo Assinatura Livre: linha de documento
        writingCtx.save();
        writingCtx.fillStyle = '#8D6E63';
        writingCtx.font = 'bold 15px Nunito, sans-serif';
        writingCtx.textAlign = 'left';
        writingCtx.textBaseline = 'bottom';
        writingCtx.fillText('✍️ Linha de Assinatura Oficial (Documento / RG):', 20, baseline - 10);
        writingCtx.restore();
    }
}

function drawArrowGuide(m) {
    writingCtx.save();
    writingCtx.setLineDash([]);
    var arrowY = m.y1 + 4;
    var arrowX = m.centerX;
    
    // Ponto verde indicador de início do traçado
    writingCtx.beginPath();
    writingCtx.arc(arrowX, arrowY, 4.5, 0, Math.PI * 2);
    writingCtx.fillStyle = '#2E7D32';
    writingCtx.fill();
    writingCtx.strokeStyle = '#FFFFFF';
    writingCtx.lineWidth = 1.5;
    writingCtx.stroke();
    
    // Pequena setinha apontando para baixo
    writingCtx.beginPath();
    writingCtx.strokeStyle = '#2E7D32';
    writingCtx.lineWidth = 2;
    writingCtx.moveTo(arrowX, arrowY + 6);
    writingCtx.lineTo(arrowX, arrowY + 14);
    writingCtx.lineTo(arrowX - 3, arrowY + 11);
    writingCtx.moveTo(arrowX, arrowY + 14);
    writingCtx.lineTo(arrowX + 3, arrowY + 11);
    writingCtx.stroke();
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
    letterStatusMap = letters.map(function(ch, idx) {
        return { char: ch, index: idx, coverage: 0, completed: false };
    });
    
    letterStatusMap.forEach(function(item) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'tracker-chip';
        chip.id = 'trackerChip_' + item.index;
        chip.setAttribute('aria-label', 'Letra ' + item.char + '. Toque para ouvir dica.');
        chip.onclick = function() { speakLetterTip(item.char); };
        
        chip.innerHTML = 
            '<span class="chip-char">' + item.char + '</span>' +
            '<span class="chip-status" id="chipStatus_' + item.index + '"><i class="fas fa-pen"></i> 0%</span>';
        
        tracker.appendChild(chip);
    });
    
    var countEl = document.getElementById('trackerProgressCount');
    if (countEl) countEl.textContent = '0 de ' + letters.length;
}

function speakLetterTip(char) {
    var tip = letterTraceTips[char] || ('Letra ' + char + '. Passe o dedo com calma por cima da letra pontilhada.');
    speak(tip);
}

function evaluateWriting(isManual) {
    if (!writingCanvas) return;
    
    if (writingMode === 'free') {
        evaluateFreeSignature(isManual);
        return;
    }
    
    var metrics = getLetterMetrics();
    if (metrics.length === 0 || strokes.length === 0) {
        updateEvaluationUI(0, 0, 'Passe o dedo cobrindo as letras pontilhadas. O sistema avaliará sua caligrafia automaticamente!', 'info');
        return;
    }
    
    // Coleta todos os pontos desenhados pelo usuário com interpolação suave
    var userPoints = [];
    strokes.forEach(function(st) {
        if (!st.points || st.points.length === 0) return;
        userPoints.push(st.points[0]);
        for (var i = 1; i < st.points.length; i++) {
            var p1 = st.points[i - 1], p2 = st.points[i];
            var dx = p2.x - p1.x, dy = p2.y - p1.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            var steps = Math.max(1, Math.floor(dist / 5));
            for (var s = 1; s <= steps; s++) {
                userPoints.push({
                    x: p1.x + (dx * s) / steps,
                    y: p1.y + (dy * s) / steps
                });
            }
        }
    });
    
    if (userPoints.length < 5) {
        updateEvaluationUI(0, 0, 'Passe o dedo com firmeza por cima das letras pontilhadas.', 'info');
        return;
    }
    
    // Canvas offscreen para amostrar pixels ideais de cada letra
    var offCanvas = document.createElement('canvas');
    var offCtx = offCanvas.getContext('2d');
    var cWidth = parseFloat(writingCanvas.style.width) || 600;
    var cHeight = parseFloat(writingCanvas.style.height) || 270;
    offCanvas.width = cWidth;
    offCanvas.height = cHeight;
    
    var completedLettersCount = 0;
    var totalCoverageSum = 0;
    var toleranceDist = 20; // tolerância generosa para o toque na tela
    var toleranceSq = toleranceDist * toleranceDist;
    
    metrics.forEach(function(m, idx) {
        // Amostra a letra individualmente no offscreen canvas
        offCtx.clearRect(0, 0, cWidth, cHeight);
        offCtx.font = 'bold ' + m.fontSize + 'px Nunito, sans-serif';
        offCtx.textBaseline = 'alphabetic';
        offCtx.textAlign = 'left';
        offCtx.fillStyle = '#000000';
        offCtx.fillText(m.char, m.x1, m.baseline);
        
        // Pega os pixels da letra dentro de sua bounding box
        var bx1 = Math.max(0, Math.floor(m.x1 - 4));
        var by1 = Math.max(0, Math.floor(m.y1 - 4));
        var bw = Math.min(cWidth - bx1, Math.ceil(m.width + 8));
        var bh = Math.min(cHeight - by1, Math.ceil((m.y2 - m.y1) + 8));
        
        var targetPoints = [];
        if (bw > 0 && bh > 0) {
            var imgData = offCtx.getImageData(bx1, by1, bw, bh);
            var data = imgData.data;
            var sampleStep = 4; // amostragem veloz a cada 4 pixels
            for (var y = 0; y < bh; y += sampleStep) {
                for (var x = 0; x < bw; x += sampleStep) {
                    var alphaIndex = (y * bw + x) * 4 + 3;
                    if (data[alphaIndex] > 40) {
                        targetPoints.push({ x: bx1 + x, y: by1 + y });
                    }
                }
            }
        }
        
        // Filtra pontos do usuário na vizinhança da letra para velocidade
        var localUserPts = userPoints.filter(function(p) {
            return p.x >= m.x1 - 25 && p.x <= m.x2 + 25 && p.y >= m.y1 - 25 && p.y <= m.y2 + 25;
        });
        
        var coveredCount = 0;
        if (targetPoints.length > 0 && localUserPts.length > 0) {
            targetPoints.forEach(function(tp) {
                for (var u = 0; u < localUserPts.length; u++) {
                    var dxx = tp.x - localUserPts[u].x;
                    var dyy = tp.y - localUserPts[u].y;
                    if (dxx * dxx + dyy * dyy <= toleranceSq) {
                        coveredCount++;
                        break;
                    }
                }
            });
        }
        
        var covPercent = (targetPoints.length > 0) 
            ? Math.min(100, Math.round((coveredCount / targetPoints.length) * 100))
            : 0;
        
        var isDone = covPercent >= 55;
        if (isDone) completedLettersCount++;
        totalCoverageSum += covPercent;
        
        // Atualiza chip da letra
        var chip = document.getElementById('trackerChip_' + idx);
        var chipStatus = document.getElementById('chipStatus_' + idx);
        if (chip && chipStatus) {
            if (isDone) {
                chip.classList.add('completed');
                chip.classList.remove('partial');
                chipStatus.innerHTML = '<i class="fas fa-check"></i> ' + covPercent + '%';
            } else if (covPercent > 20) {
                chip.classList.add('partial');
                chip.classList.remove('completed');
                chipStatus.innerHTML = '<i class="fas fa-pencil-alt"></i> ' + covPercent + '%';
            } else {
                chip.classList.remove('completed', 'partial');
                chipStatus.innerHTML = '<i class="fas fa-pen"></i> ' + covPercent + '%';
            }
        }
    });
    
    var avgCoverage = Math.round(totalCoverageSum / metrics.length);
    var countEl = document.getElementById('trackerProgressCount');
    if (countEl) countEl.textContent = completedLettersCount + ' de ' + metrics.length;
    
    // Penalidade suave por rabiscos muito fora das letras
    var firstX = metrics[0].x1 - 40;
    var lastX = metrics[metrics.length - 1].x2 + 40;
    var topY = metrics[0].y1 - 35;
    var botY = metrics[0].y2 + 35;
    var outsidePoints = userPoints.filter(function(p) {
        return p.x < firstX || p.x > lastX || p.y < topY || p.y > botY;
    });
    var strayRatio = outsidePoints.length / userPoints.length;
    var cleanMultiplier = Math.max(0.7, 1 - (strayRatio * 0.45));
    
    var finalScore = Math.min(100, Math.round(avgCoverage * cleanMultiplier));
    
    // Classificação por estrelas e feedback pedagógico
    var stars = 0;
    var feedbackMsg = '';
    var statusClass = 'info';
    
    if (finalScore >= 80 && completedLettersCount === metrics.length) {
        stars = 3;
        statusClass = 'success';
        feedbackMsg = 'Excelente caligrafia! Você cobriu todas as letras do seu nome (' + currentName + ') com precisão!';
    } else if (finalScore >= 60 || completedLettersCount >= Math.ceil(metrics.length * 0.75)) {
        stars = 2;
        statusClass = 'partial';
        var missingCount = metrics.length - completedLettersCount;
        feedbackMsg = 'Muito bom! Você já cobriu ' + completedLettersCount + ' letras. ' + 
            (missingCount > 0 ? ('Faltam apenas ' + missingCount + ' letra(s) para completar perfeitamente!') : 'Quase perfeito!');
    } else if (finalScore >= 25 || completedLettersCount > 0) {
        stars = 1;
        statusClass = 'partial';
        feedbackMsg = 'Bom começo! Você já cobriu partes do nome. Passe o dedo devagar cobrindo as letras que ainda faltam!';
    } else {
        stars = 0;
        statusClass = 'info';
        feedbackMsg = 'Passe a ponta do seu dedo bem por cima das linhas pontilhadas de cada letra.';
    }
    
    updateEvaluationUI(finalScore, stars, feedbackMsg, statusClass);
    
    if (isManual) {
        speak(feedbackMsg);
    }
}

function evaluateFreeSignature(isManual) {
    if (strokes.length === 0) {
        updateEvaluationUI(0, 0, 'Assine ou escreva seu nome livremente em cima da linha guia.', 'info');
        return;
    }
    
    var totalPts = 0;
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    var height = parseFloat(writingCanvas.style.height) || 270;
    var baseline = height * 0.75;
    var ptsNearBaseline = 0;
    
    strokes.forEach(function(st) {
        if (!st.points) return;
        totalPts += st.points.length;
        st.points.forEach(function(p) {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
            if (Math.abs(p.y - baseline) < 60) ptsNearBaseline++;
        });
    });
    
    var spanX = maxX - minX;
    var ratioNear = ptsNearBaseline / Math.max(1, totalPts);
    
    var score = 0, stars = 0, msg = '', sClass = 'info';
    if (totalPts >= 35 && spanX >= 120 && ratioNear >= 0.5) {
        score = 95;
        stars = 3;
        sClass = 'success';
        msg = 'Assinatura excelente! Traçado contínuo, firme e bem posicionado na linha de documento!';
    } else if (totalPts >= 15 && spanX >= 60) {
        score = 65;
        stars = 2;
        sClass = 'partial';
        msg = 'Boa assinatura! Tente assinar com um traço contínuo bem em cima da linha verde.';
    } else {
        score = 30;
        stars = 1;
        sClass = 'info';
        msg = 'Continue treinando sua assinatura livre em cima da linha guia.';
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
// DEMONSTRAÇÃO ANIMADA DE CALIGRAFIA
// ============================================================
function playWritingDemo() {
    if (isDemoPlaying) {
        stopWritingDemo();
        return;
    }
    
    if (writingMode !== 'trace' || !currentName) {
        speak('A demonstração animada está disponível no modo Cobrir Letras.');
        return;
    }
    
    isDemoPlaying = true;
    var btn = document.getElementById('btnDemoTrace');
    var textEl = document.getElementById('btnDemoText');
    if (btn) btn.classList.add('active');
    if (textEl) textEl.textContent = 'Parar demonstração';
    
    speak('Observe o traçado da caneta para cobrir as letras do seu nome.');
    
    var metrics = getLetterMetrics();
    if (metrics.length === 0) return;
    
    var currentLetterIdx = 0;
    var animStep = 0;
    var totalStepsPerLetter = 40;
    
    function stepAnim() {
        if (!isDemoPlaying) return;
        
        var m = metrics[currentLetterIdx];
        if (!m) {
            stopWritingDemo();
            speak('Agora é a sua vez! Passe o seu dedo nas letras.');
            return;
        }
        
        redrawWritingCanvas();
        
        // Desenha caneta animada e traço guia temporário
        var t = animStep / totalStepsPerLetter;
        var curX = m.x1 + (m.width * t);
        var curY = m.y1 + ((m.y2 - m.y1) * Math.sin(t * Math.PI));
        
        writingCtx.save();
        // Rastro dourado sutil
        writingCtx.strokeStyle = 'rgba(255, 179, 0, 0.75)';
        writingCtx.lineWidth = 6;
        writingCtx.lineCap = 'round';
        writingCtx.beginPath();
        writingCtx.moveTo(m.x1, m.y1 + 10);
        writingCtx.lineTo(curX, curY);
        writingCtx.stroke();
        
        // Ponta da caneta mágica
        writingCtx.beginPath();
        writingCtx.arc(curX, curY, 9, 0, Math.PI * 2);
        writingCtx.fillStyle = '#FF8F00';
        writingCtx.fill();
        writingCtx.strokeStyle = '#FFFFFF';
        writingCtx.lineWidth = 2.5;
        writingCtx.stroke();
        writingCtx.restore();
        
        animStep++;
        if (animStep > totalStepsPerLetter) {
            animStep = 0;
            currentLetterIdx++;
        }
        
        demoTimer = setTimeout(stepAnim, 30);
    }
    
    stepAnim();
}

function stopWritingDemo() {
    isDemoPlaying = false;
    if (demoTimer) clearTimeout(demoTimer);
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
    evaluateWriting(false);
    var scoreMsg = currentEvalScore >= 75
        ? 'Que caligrafia bonita! Você obteve ' + currentEvalScore + '% de precisão!'
        : 'Treino de escrita registrado com sucesso!';
    speak(scoreMsg);
    
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

function initPage() {
    verificarLicaoConcluida();
    prefillUserName();
}

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initPage); }
else { initPage(); }

