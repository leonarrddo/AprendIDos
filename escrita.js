/**
 * AprendIDos — Treino de Escrita à Mão (Caligrafia)
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
    { word: 'FACA', hint: 'Usada para cortar o pão', audio: 'Faca' },
    { word: 'BOLO', hint: 'Delicioso doce de aniversário', audio: 'Bolo' },
    { word: 'CAFÉ', hint: 'Bebida quente e cheirosa', audio: 'Café' },
    { word: 'VIDA', hint: 'O bem mais precioso que temos', audio: 'Vida' },
    { word: 'LEITE', hint: 'Bebida branca e nutritiva', audio: 'Leite' },
    { word: 'AMOR', hint: 'Sentimento de carinho e afeto', audio: 'Amor' }
];

var TOTAL = 6;
var questions = [], currentIdx = 0, hits = 0, misses = 0;
var currentAudio = null, ptVoice = null;
var speechGeneration = 0;

// Estado do quadro de caligrafia
var writingCanvas = null, writingCtx = null;
var strokes = [];
var isDrawing = false;
var currentStroke = null;
var lastPoint = null;
var penColor = '#1565C0';
var penWidth = 5.5;
var hideWordGuide = false; // Opção de ocultar a palavra no fundo para praticar de memória
var letterStatusMap = {};
var currentEvalScore = 0;
var currentEvalStars = 0;
var currentEvalMessage = '';
var autoEvalTimeout = null;
var hasPassedCurrentWord = false;
var prevCanvasWidth = 0;
var prevCanvasHeight = 0;
var resizeDebounceTimer = null;

// ============================================================
// MOTOR DE VOZ (ANTI-ECO & ANTI-REPETIÇÃO)
// ============================================================
function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    var v = window.speechSynthesis.getVoices();
    if (!v || v.length === 0) return;
    ptVoice =
        v.find(function(x) { return x.lang === 'pt-BR'; }) ||
        v.find(function(x) { return x.lang === 'pt_BR'; }) ||
        v.find(function(x) { return x.lang.startsWith('pt'); }) || null;
}
if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
}

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

var isIOS = (function() {
    if (typeof navigator === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
})();

function speak(text, onEnd) {
    stopAllAudio();
    if (!text || typeof text !== 'string') return;
    var thisGen = speechGeneration;

    // No iOS (Safari), o Google TTS falha com 404/AVPlayer e qualquer fallback assíncrono
    // perde o gesto do usuário. Dispara síntese nativa imediatamente no clique!
    if (isIOS) {
        speakNativo(text, onEnd, thisGen);
        return;
    }

    var fallbackTriggered = false;

    function triggerFallback() {
        if (thisGen !== speechGeneration) return;
        if (fallbackTriggered) return;
        fallbackTriggered = true;
        speakNativo(text, onEnd, thisGen);
    }

    try {
        var url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=pt-BR&client=tw-ob&q=' + encodeURIComponent(text);
        var audio = new Audio();
        currentAudio = audio;

        audio.onended = function() {
            if (thisGen !== speechGeneration) return;
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
            p.catch(function() {
                triggerFallback();
            });
        }
    } catch(e) {
        triggerFallback();
    }
}

function speakNativo(text, onEnd, expectedGen) {
    if (expectedGen !== undefined && expectedGen !== speechGeneration) return;
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
        if (expectedGen !== undefined && expectedGen !== speechGeneration) return;
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
            if (expectedGen !== undefined && expectedGen !== speechGeneration) return;
            try {
                window.speechSynthesis.speak(u);
            } catch (e) {
                cleanup();
            }
        }, 80);
    }
}

function playInstruction() {
    var btn = document.getElementById('btnInstruction');
    if (btn) btn.classList.add('speaking');
    speak('Treine a escrita à mão. Passe o dedo por cima das letras para cobri-las, ou clique no botão para ocultar o fundo e praticar de memória.', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function speakNotebookTip() {
    speak('Dica de ouro! Pegue agora um lápis ou caneta e tente escrever esta palavra no seu caderno de papel. O treino com lápis no papel fortalece sua mão e ajuda muito no dia a dia!');
}

function playWordAudio() {
    var q = questions[currentIdx];
    if (!q) return;
    var btn = document.getElementById('btnWordAudio');
    if (btn) btn.classList.add('speaking');
    speak(q.audio + '. ' + q.hint + '.', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function speakCurrentEvaluation() {
    if (currentEvalMessage) {
        speak(currentEvalMessage);
    } else {
        speak('Passe o dedo cobrindo as letras para avaliar sua escrita.');
    }
}

// ============================================================
// INICIALIZAÇÃO DO EXERCÍCIO
// ============================================================
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
    currentIdx = 0;
    hits = 0;
    misses = 0;
    var h = document.getElementById('hitsCount'); if (h) h.textContent = '0';
    var m = document.getElementById('missesCount'); if (m) m.textContent = '0';
    var layout = document.getElementById('exerciseLayout');
    var comp = document.getElementById('completionScreen');
    if (layout) layout.style.display = '';
    if (comp) comp.classList.remove('visible');

    initWritingCanvas();
    loadWord();
}

function loadWord() {
    var q = questions[currentIdx];
    if (!q) return;

    hasPassedCurrentWord = false;
    strokes = [];
    currentStroke = null;
    lastPoint = null;
    letterStatusMap = {};
    currentEvalScore = 0;
    currentEvalStars = 0;
    currentEvalMessage = '';

    // Atualiza cabeçalhos
    var wordTitle = document.getElementById('targetWordTitle');
    var wordHint = document.getElementById('targetWordHint');
    if (wordTitle) wordTitle.textContent = q.word;
    if (wordHint) wordHint.textContent = q.hint;

    var pFill = document.getElementById('progressFill');
    var pBar = document.getElementById('progressBar');
    var pLabel = document.getElementById('progressLabel');
    var fbArea = document.getElementById('feedbackArea');

    var pct = (currentIdx / TOTAL) * 100;
    if (pFill) pFill.style.width = pct + '%';
    if (pBar) pBar.setAttribute('aria-valuenow', Math.round(pct));
    if (pLabel) pLabel.textContent = 'Palavra ' + (currentIdx + 1) + ' de ' + TOTAL;
    if (fbArea) fbArea.innerHTML = '';

    var hint = document.getElementById('canvasHint');
    if (hint) hint.style.opacity = '1';

    setupCanvasResolution();
    redrawWritingCanvas();
    renderLetterTracker();
    updateEvaluationUI(0, 0, 'Passe o dedo por cima das letras. O sistema avalia sua escrita automaticamente!', 'info');

    // Fala a palavra ao carregar a questão
    setTimeout(function() {
        speak(q.audio + '. ' + q.hint);
    }, 250);
}

// ============================================================
// QUADRO DE ESCRITA (CANVAS TOUCH & POINTER EVENTS)
// ============================================================
function initWritingCanvas() {
    writingCanvas = document.getElementById('writingCanvas');
    if (!writingCanvas) return;
    writingCtx = writingCanvas.getContext('2d');

    setupCanvasResolution();
    attachCanvasEvents();

    window.removeEventListener('resize', handleCanvasResize);
    window.addEventListener('resize', handleCanvasResize);
    window.removeEventListener('orientationchange', handleCanvasResize);
    window.addEventListener('orientationchange', handleCanvasResize);
}

function setupCanvasResolution() {
    if (!writingCanvas) return;
    var container = writingCanvas.parentElement;
    var rect = container ? container.getBoundingClientRect() : writingCanvas.getBoundingClientRect();
    var width = (container && container.clientWidth > 0) ? container.clientWidth : (Math.floor(rect.width) || 640);
    var height = 320; // Altura confortável para escrita grande

    var dimChanged = (prevCanvasWidth > 0 && prevCanvasHeight > 0) &&
                     (Math.abs(width - prevCanvasWidth) >= 3 || Math.abs(height - prevCanvasHeight) >= 3);

    // Se já havia traços desenhados e as dimensões mudaram, reescala os traços existentes proporcionalmente!
    if (dimChanged && strokes && strokes.length > 0 && prevCanvasWidth > 0 && prevCanvasHeight > 0) {
        var scaleX = width / prevCanvasWidth;
        var scaleY = height / prevCanvasHeight;
        for (var s = 0; s < strokes.length; s++) {
            var st = strokes[s];
            if (st && st.points) {
                for (var p = 0; p < st.points.length; p++) {
                    st.points[p].x = st.points[p].x * scaleX;
                    st.points[p].y = st.points[p].y * scaleY;
                }
            }
        }
    }

    prevCanvasWidth = width;
    prevCanvasHeight = height;

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
    if (isDrawing) return;

    if (resizeDebounceTimer) clearTimeout(resizeDebounceTimer);
    resizeDebounceTimer = setTimeout(function() {
        if (isDrawing || !writingCanvas) return;
        var container = writingCanvas.parentElement;
        var rect = container ? container.getBoundingClientRect() : writingCanvas.getBoundingClientRect();
        var newWidth = (container && container.clientWidth > 0) ? container.clientWidth : (Math.floor(rect.width) || 640);
        if (prevCanvasWidth > 0 && Math.abs(newWidth - prevCanvasWidth) < 3) return;

        setupCanvasResolution();
        redrawWritingCanvas();
        renderLetterTracker();
    }, 100);
}

function getCanvasCoordinates(e) {
    var rect = writingCanvas.getBoundingClientRect();
    var logicalWidth = parseFloat(writingCanvas.style.width) || prevCanvasWidth || (writingCanvas.width / (window.devicePixelRatio || 1));
    var logicalHeight = parseFloat(writingCanvas.style.height) || prevCanvasHeight || (writingCanvas.height / (window.devicePixelRatio || 1));
    var scaleX = rect.width > 0 ? (logicalWidth / rect.width) : 1;
    var scaleY = rect.height > 0 ? (logicalHeight / rect.height) : 1;
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

function attachCanvasEvents() {
    if (!writingCanvas) return;
    writingCanvas.style.touchAction = 'none';
    writingCanvas.addEventListener('contextmenu', function(e) { e.preventDefault(); });

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

        if (currentStroke && currentStroke.points.length >= 2) {
            var metrics = getLetterMetrics();
            if (typeof findBestLetterForStroke === 'function') {
                var assigned = findBestLetterForStroke(currentStroke, metrics);
                if (assigned >= 0) {
                    currentStroke.letterIndex = assigned;
                }
            }
            strokes.push(currentStroke);
            currentStroke = null;

            // Dispara avaliação com debounce suave
            clearTimeout(autoEvalTimeout);
            autoEvalTimeout = setTimeout(function() {
                evaluateWriting(false);
            }, 380);
        }
    }

    writingCanvas.addEventListener('pointerup', endStroke);
    writingCanvas.addEventListener('pointercancel', endStroke);
}

function setPenColor(color, btn) {
    penColor = color;
    document.querySelectorAll('.color-dot').forEach(function(d) { d.classList.remove('active'); });
    if (btn) btn.classList.add('active');
}

// ============================================================
// OPÇÃO IMPORTANTE: OCULTAR PALAVRA NO FUNDO
// ============================================================
function toggleWordGuide() {
    hideWordGuide = !hideWordGuide;
    var btn = document.getElementById('btnToggleWordGuide');
    if (btn) {
        btn.setAttribute('aria-pressed', hideWordGuide ? 'true' : 'false');
        if (hideWordGuide) {
            btn.classList.add('active');
            btn.innerHTML = '<i class="fas fa-eye"></i> Mostrar Palavra no Fundo';
            speak('Palavra no fundo oculta. Agora escreva de memória na pauta do caderno!');
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Palavra no Fundo';
            speak('Palavra no fundo visível. Passe o dedo por cima das letras pontilhadas.');
        }
    }
    redrawWritingCanvas();
}

function clearWritingCanvas() {
    strokes = [];
    currentStroke = null;
    lastPoint = null;
    letterStatusMap = {};
    redrawWritingCanvas();
    var hint = document.getElementById('canvasHint');
    if (hint) hint.style.opacity = '1';
    renderLetterTracker();
    updateEvaluationUI(0, 0, 'Quadro limpo! Escreva novamente a palavra com calma.', 'info');
}

// ============================================================
// DESENHO DAS PAUTAS E GUIAS DE CALIGRAFIA
// ============================================================
function getCanvasLayout(width, text) {
    var maxW = Math.max(260, width - 60);
    var baseFontSize = 88;
    if (writingCtx) {
        writingCtx.save();
        writingCtx.font = 'bold ' + baseFontSize + 'px Nunito, sans-serif';
        var tw = writingCtx.measureText(text).width;
        if (tw > maxW && tw > 0) {
            baseFontSize = Math.max(48, Math.floor(baseFontSize * (maxW / tw)));
        }
        writingCtx.restore();
    }
    var height = 320;
    var baseline = Math.round(height * 0.72);

    return {
        text: text,
        fontSize: baseFontSize,
        baseline: baseline,
        height: height
    };
}

function getLetterMetrics() {
    var q = questions[currentIdx];
    if (!writingCanvas || !q) return [];
    var width = parseFloat(writingCanvas.style.width) || 640;
    var layout = getCanvasLayout(width, q.word);
    var list = [];

    writingCtx.save();
    writingCtx.font = 'bold ' + layout.fontSize + 'px Nunito, sans-serif';
    var textWidth = writingCtx.measureText(layout.text).width;
    var startX = Math.max(20, (width - textWidth) / 2);
    var curX = startX;

    for (var i = 0; i < layout.text.length; i++) {
        var ch = layout.text[i];
        var chW = writingCtx.measureText(ch).width;
        if (ch !== ' ') {
            list.push({
                char: ch,
                index: i,
                x1: curX,
                x2: curX + chW,
                width: chW,
                centerX: curX + chW / 2,
                y1: layout.baseline - layout.fontSize * 0.72,
                y2: layout.baseline,
                baseline: layout.baseline,
                fontSize: layout.fontSize
            });
        }
        curX += chW;
    }
    writingCtx.restore();
    return list;
}

function drawBackgroundGuides() {
    if (!writingCanvas || !writingCtx) return;
    var width = parseFloat(writingCanvas.style.width) || 640;
    var height = parseFloat(writingCanvas.style.height) || 320;

    // Fundo limpo de papel
    writingCtx.fillStyle = '#FFFFFF';
    writingCtx.fillRect(0, 0, width, height);

    var q = questions[currentIdx];
    if (!q) return;

    var layout = getCanvasLayout(width, q.word);
    var base = layout.baseline;
    var top = base - layout.fontSize * 0.72;
    var mid = base - layout.fontSize * 0.36;

    // 1. Linhas pedagógicas de pauta (estilo caderno de caligrafia)
    writingCtx.save();
    // Linha de topo (suave)
    writingCtx.beginPath();
    writingCtx.strokeStyle = '#ECEFF1';
    writingCtx.lineWidth = 1.6;
    writingCtx.setLineDash([4, 4]);
    writingCtx.moveTo(16, top);
    writingCtx.lineTo(width - 16, top);
    writingCtx.stroke();

    // Linha do meio (guia das minúsculas)
    writingCtx.beginPath();
    writingCtx.strokeStyle = '#CFD8DC';
    writingCtx.lineWidth = 1.8;
    writingCtx.setLineDash([6, 6]);
    writingCtx.moveTo(16, mid);
    writingCtx.lineTo(width - 16, mid);
    writingCtx.stroke();

    // Linha de base principal (firme e verde onde a letra se apoia)
    writingCtx.beginPath();
    writingCtx.strokeStyle = '#388E3C';
    writingCtx.lineWidth = 3.0;
    writingCtx.setLineDash([]);
    writingCtx.moveTo(16, base);
    writingCtx.lineTo(width - 16, base);
    writingCtx.stroke();
    writingCtx.restore();

    // 2. Se a opção de ocultar palavra no fundo estiver DESATIVADA (ou seja, visível),
    // desenha os cartões e as letras pontilhadas idênticas ao meunome.js
    if (!hideWordGuide) {
        var metrics = getLetterMetrics();
        if (metrics.length === 0) return;

        writingCtx.save();
        writingCtx.textBaseline = 'alphabetic';
        writingCtx.textAlign = 'left';

        metrics.forEach(function(m) {
            writingCtx.font = 'bold ' + m.fontSize + 'px Nunito, sans-serif';

            var padX = Math.max(4, m.fontSize * 0.05);
            var padY = Math.max(5, m.fontSize * 0.06);
            var cardX = m.x1 - padX;
            var cardY = m.y1 - padY;
            var cardW = m.width + padX * 2;
            var cardH = (m.y2 - m.y1) + padY * 2;

            // Bloco pedagógico de contraste
            writingCtx.save();
            writingCtx.fillStyle = 'rgba(232, 245, 233, 0.65)';
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

            // Silhueta da letra para baixa visão
            writingCtx.fillStyle = 'rgba(46, 125, 50, 0.32)';
            writingCtx.fillText(m.char, m.x1, m.baseline);

            // Contorno pontilhado forte
            writingCtx.strokeStyle = '#1B5E20';
            writingCtx.lineWidth = Math.max(2.8, m.fontSize * 0.045);
            writingCtx.setLineDash([6, 5]);
            writingCtx.strokeText(m.char, m.x1, m.baseline);
        });
        writingCtx.restore();
    }
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

// ============================================================
// RASTREADOR DE LETRAS & AVALIAÇÃO EM TEMPO REAL
// ============================================================
function renderLetterTracker() {
    var tracker = document.getElementById('writingLettersTracker');
    var countEl = document.getElementById('trackerProgressCount');
    if (!tracker) return;
    tracker.innerHTML = '';

    var q = questions[currentIdx];
    if (!q) return;

    var metrics = getLetterMetrics();
    var completed = 0;

    metrics.forEach(function(m, idx) {
        var status = letterStatusMap[idx] || { passed: false, partial: false, fallback: false };
        if (status.passed) completed++;

        var chip = document.createElement('div');
        chip.className = 'tracker-chip letter-tracker-chip' + (status.passed ? ' completed' : (status.fallback ? ' uncalibrated' : (status.partial ? ' partial' : '')));
        chip.id = 'trackerChip_' + idx;
        chip.title = status.fallback
            ? 'Letra ' + m.char + ' (avaliação de traçado indisponível)'
            : 'Clique para ouvir a letra ' + m.char;

        var charSpan = document.createElement('span');
        charSpan.className = 'chip-char';
        charSpan.textContent = m.char;

        var statusSpan = document.createElement('span');
        statusSpan.className = 'chip-status';
        statusSpan.id = 'chipStatus_' + idx;
        statusSpan.innerHTML = status.passed
            ? '<i class="fas fa-check"></i>'
            : (status.fallback ? '<i class="fas fa-question"></i>' : (status.partial ? '<i class="fas fa-pencil-alt"></i>' : '<i class="fas fa-pen"></i>'));

        chip.appendChild(charSpan);
        chip.appendChild(statusSpan);

        chip.onclick = function() {
            speak('Letra ' + m.char + '. Passe o dedo cobrindo a letra com calma.');
        };

        tracker.appendChild(chip);
    });

    if (countEl) {
        countEl.textContent = completed + ' de ' + metrics.length;
    }
}

function updateEvaluationUI(score, stars, message, type) {
    if (typeof stars === 'string') {
        type = message;
        message = stars;
        stars = (score >= 88) ? 3 : (score >= 70) ? 2 : (score >= 45) ? 1 : 0;
    }
    stars = typeof stars === 'number' ? stars : 0;
    currentEvalScore = score;
    currentEvalStars = stars;
    currentEvalMessage = message;

    var fill = document.getElementById('evalProgressBarFill');
    var label = document.getElementById('evalScoreLabel');
    var msgBox = document.getElementById('evalFeedbackMsg');
    var textSpan = document.getElementById('evalFeedbackText');

    if (fill) fill.style.width = Math.min(100, Math.max(0, score)) + '%';
    if (label) label.textContent = Math.round(score) + '%';

    if (msgBox) {
        msgBox.className = 'eval-feedback-msg ' + (type || 'info');
    }
    if (textSpan) {
        textSpan.textContent = message;
    }

    // Estrelas - Equivalente a Meu Nome (usa classe 'active')
    for (var s = 1; s <= 3; s++) {
        var starEl = document.getElementById('star' + s);
        if (starEl) {
            if (s <= stars) {
                starEl.classList.add('active');
            } else {
                starEl.classList.remove('active');
            }
        }
    }
}

function ensureNextWordButton(fbArea) {
    if (!fbArea || fbArea.querySelector('.btn-next')) return;

    var isLast = currentIdx >= TOTAL - 1;
    fbArea.insertAdjacentHTML('beforeend',
        '<button type="button" class="btn-next" onclick="nextWord()" aria-label="' +
        (isLast ? 'Ver resultado' : 'Próxima palavra') + '"><i class="fas ' +
        (isLast ? 'fa-flag-checkered' : 'fa-arrow-right') + '"></i> ' +
        (isLast ? 'Concluir Lição' : 'Próxima Palavra') + '</button>');
}

function evaluateWriting(isManual) {
    if (!writingCanvas) return;
    var q = questions[currentIdx];
    if (!q) return;

    var metrics = getLetterMetrics();
    if (metrics.length === 0) return;

    if (strokes.length === 0) {
        letterStatusMap = {};
        updateEvaluationUI(0, 0, 'Passe o dedo com firmeza por cima das linhas para escrever.', 'info');
        if (isManual) {
            speak('Passe o dedo cobrindo as letras antes de avaliar.');
            ensureNextWordButton(document.getElementById('feedbackArea'));
        }
        renderLetterTracker();
        return;
    }

    var totalScoreSum = 0;
    var completedCount = 0;
    var uncalibratedCount = 0;

    metrics.forEach(function(m, idx) {
        m.allMetrics = metrics;
        var filterFn = (typeof filterStrokesForLetter === 'function')
            ? filterStrokesForLetter
            : (typeof window !== 'undefined' && typeof window.filterStrokesForLetter === 'function' ? window.filterStrokesForLetter : null);

        var letterStrokes = filterFn
            ? filterFn(m, strokes, metrics)
            : strokes.filter(function(st) {
                if (!st || !st.points || st.points.length === 0) return false;
                if (st.letterIndex !== undefined) return st.letterIndex === idx;
                if (!metrics || metrics.length <= 1) return true;
                var sumX = 0;
                for (var p = 0; p < st.points.length; p++) sumX += st.points[p].x;
                var avgX = sumX / st.points.length;
                var prevM = (idx > 0) ? metrics[idx - 1] : null;
                var nextM = (idx < metrics.length - 1) ? metrics[idx + 1] : null;
                var leftCol = prevM ? (prevM.x2 + m.x1) / 2 : (m.x1 - (m.width || 50) * 0.45);
                var rightCol = nextM ? (m.x2 + nextM.x1) / 2 : (m.x2 + (m.width || 50) * 0.45);
                return avgX >= leftCol && avgX <= rightCol;
            });

        if (letterStrokes.length === 0) {
            letterStatusMap[idx] = {
                score: 0,
                coverage: 0,
                passed: false,
                partial: false,
                fallback: false,
                strokeCount: 0
            };
            return;
        }

        // Estabilidade: se os traços desta letra específica não mudaram, mantém a avaliação estável
        var prevStatus = letterStatusMap[idx];
        if (prevStatus && prevStatus.strokeCount === letterStrokes.length && prevStatus._lastStrokeRef === letterStrokes[letterStrokes.length - 1]) {
            if (prevStatus.passed) completedCount++;
            if (prevStatus.fallback) uncalibratedCount++;
            totalScoreSum += prevStatus.score;
            return;
        }

        var result = null;
        try {
            if (typeof window.evaluateLetter === 'function') {
                result = window.evaluateLetter(m.char, m, letterStrokes, 0.1);
            }
        } catch (e) {
            console.error('Erro na avaliação da letra ' + m.char + ':', e);
            result = null;
        }

        // Se a avaliação principal não estiver disponível, falhar ou retornar inválido
        if (!result || typeof result !== 'object') {
            result = evaluateLetterFallback(m, letterStrokes);
        }

        var isFallback = Boolean(result && result.fallback);
        if (isFallback) {
            uncalibratedCount++;
        }

        // A aprovação individual é estrita: só aprova se o avaliador principal aprovar explicitamente.
        // Nunca aprova com base apenas em score/coverage contornando a reprovação do avaliador.
        var passed = Boolean(result && result.passed === true && !isFallback);
        var score = (result && typeof result.score === 'number' && !isNaN(result.score)) ? result.score : 0;
        var coverage = (result && typeof result.coverage === 'number' && !isNaN(result.coverage)) ? result.coverage : 0;
        var partial = !passed && !isFallback && (score >= 30 || coverage >= 30);

        letterStatusMap[idx] = {
            score: score,
            coverage: coverage,
            passed: passed,
            partial: partial,
            fallback: isFallback,
            strokeCount: letterStrokes.length,
            _lastStrokeRef: letterStrokes[letterStrokes.length - 1]
        };

        if (passed) completedCount++;
        totalScoreSum += score;
    });

    var avgScore = Math.round(totalScoreSum / metrics.length);
    renderLetterTracker();

    // A palavra só é considerada concluída quando TODAS as letras obrigatórias
    // forem individualmente avaliadas e aprovadas, sem letras em fallback/não calibradas.
    var allPassed = metrics.length > 0 && completedCount === metrics.length && uncalibratedCount === 0;
    var partialRatio = completedCount / Math.max(metrics.length, 1);
    var fbArea = document.getElementById('feedbackArea');

    // Feedback pedagógico e cálculo de estrelas equivalente ao Meu Nome
    var stars = 0;
    if (allPassed && avgScore >= 75) {
        stars = 3;
    } else if (allPassed || (partialRatio >= 0.70 && avgScore >= 55)) {
        stars = 2;
    } else if (partialRatio >= 0.35 || (completedCount > 0 && avgScore >= 35)) {
        stars = 1;
    } else {
        stars = 0;
    }

    if (allPassed) {
        var successMessage = stars === 3
            ? 'Excelente caligrafia! Você escreveu a palavra ' + q.word + ' com maestria!'
            : 'Muito bem por concluir a palavra! Continue praticando para melhorar seus traços.';
        updateEvaluationUI(avgScore, stars, successMessage, stars === 3 ? 'success' : 'partial');

        if (!hasPassedCurrentWord) {
            hasPassedCurrentWord = true;
            hits++;
            var h = document.getElementById('hitsCount'); if (h) h.textContent = hits;

            speak(stars === 3
                ? 'Excelente! Você escreveu a palavra ' + q.word + ' com perfeição!'
                : 'Muito bem por concluir a palavra! Continue praticando para melhorar seus traços.');

            if (fbArea) fbArea.innerHTML = '<div class="feedback-msg success" role="alert"><i class="fas fa-check-circle"></i> Parabéns! Escrita completada com sucesso!</div>';
        }
        ensureNextWordButton(fbArea);
    } else if (uncalibratedCount > 0) {
        // Quando faltar referência para alguma letra, informa o usuário e não bloqueia a progressão
        var msgUncalibrated = 'A avaliação automática não está disponível para todas as letras desta palavra. Pratique o desenho e avance quando desejar.';
        updateEvaluationUI(avgScore, stars, msgUncalibrated, 'info');
        if (isManual) speak(msgUncalibrated);

        if (fbArea) {
            if (!hasPassedCurrentWord) {
                fbArea.innerHTML = '<div class="feedback-msg info" role="alert"><i class="fas fa-info-circle"></i> ' + msgUncalibrated + '</div>';
            }
            ensureNextWordButton(fbArea);
        }
    } else if (avgScore >= 35 || completedCount > 0) {
        var msg = 'Muito bem! Você completou ' + completedCount + ' de ' + metrics.length + ' letras. Continue praticando o restante da palavra!';
        updateEvaluationUI(avgScore, stars, msg, 'partial');
        if (isManual) speak(msg);
        ensureNextWordButton(fbArea);
    } else {
        var tipMsg = hideWordGuide
            ? 'Continue escrevendo a palavra de memória. Você pode reativar a guia a qualquer momento.'
            : 'Passe o dedo cobrindo com firmeza as letras pontilhadas.';
        updateEvaluationUI(avgScore, stars, tipMsg, 'info');
        if (isManual) speak(tipMsg);
        ensureNextWordButton(fbArea);
    }
}

function evaluateLetterFallback(m, allStrokes) {
    // Estimador básico para quando letter-paths.js não tiver o caractere ou estiver inacessível.
    // Retorna fallback: true e passed: false para NUNCA aprovar automaticamente rabiscos
    // ou ausência de traçado de referência.
    var pointsInLetter = 0;
    var pad = m ? (m.fontSize * 0.25) : 10;

    if (m && allStrokes && allStrokes.length > 0) {
        allStrokes.forEach(function(st) {
            if (st && st.points) {
                st.points.forEach(function(pt) {
                    if (pt.x >= m.x1 - pad && pt.x <= m.x2 + pad &&
                        pt.y >= m.y1 - pad && pt.y <= m.y2 + pad) {
                        pointsInLetter++;
                    }
                });
            }
        });
    }

    var cov = m ? Math.min(100, Math.round((pointsInLetter / Math.max(8, m.fontSize * 0.4)) * 100)) : 0;
    return {
        char: m ? m.char : '',
        score: cov,
        coverage: cov,
        passed: false,
        fallback: true
    };
}

// ============================================================
// NAVEGAÇÃO & TRANSIÇÃO DE PALAVRAS
// ============================================================
function nextWord() {
    stopAllAudio();
    currentIdx++;
    if (currentIdx >= TOTAL) {
        showCompletion();
    } else {
        loadWord();
    }
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

    var msg = hits === TOTAL ? 'Perfeito! Sua caligrafia está formidável!' : hits >= 4 ? 'Muito bom! Continue treinando sempre!' : 'Bom treino! Cada prática aperfeiçoa sua escrita!';
    var cm = document.getElementById('completionMsg'); if (cm) cm.textContent = msg;

    salvarProgresso();
    speak('Parabéns! Você concluiu a atividade de escrita e caligrafia! ' + msg);
}

function restartExercise() {
    stopAllAudio();
    initExercise();
}

// ============================================================
// SALVAMENTO DE PROGRESSO (LOCALSTORAGE & SUPABASE)
// ============================================================
function salvarProgresso() {
    var data = { completed: true, score: hits, total: TOTAL, misses: misses, savedAt: new Date().toISOString() };
    if (window.AprendIDosAuth && window.AprendIDosAuth.saveLessonProgress) {
        try { return window.AprendIDosAuth.saveLessonProgress('escrita', data); } catch(e) {}
    }
    return Promise.resolve({ status: 'failed', success: false, localSaved: false, synced: false });
}

async function salvarEVerOutras(event) {
    if (event) event.preventDefault();
    var btn = document.getElementById('btnSalvarEVerOutras');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    }
    try {
        var res = await salvarProgresso();
        if (btn) {
            if (res && res.status === 'synced') {
                btn.innerHTML = '<i class="fas fa-check-circle"></i> Salvo na nuvem!';
            } else if (res && res.status === 'local_only') {
                btn.innerHTML = res.syncError
                    ? '<i class="fas fa-mobile-alt"></i> Salvo neste aparelho. Falha ao sincronizar.'
                    : '<i class="fas fa-mobile-alt"></i> Salvo somente neste aparelho.';
            } else {
                btn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Falha ao salvar. Tente novamente.';
                btn.disabled = false;
                return;
            }
        }
    } catch(e) {
        if (btn) {
            btn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Falha ao salvar. Tente novamente.';
            btn.disabled = false;
        }
        return;
    }
    setTimeout(function() { window.location.href = 'licoes.html'; }, 500);
}

function verificarLicaoConcluida() {
    var isDone = false, prevScore = null, prevTotal = TOTAL;
    try {
        var user = null;
        try { var r = localStorage.getItem('aprendidos_usuario'); if (r) user = JSON.parse(r); } catch(e) {}
        var uk = (user && user.id)
            ? ((user.isDemo ? 'aprendidos_progresso_demo_' : 'aprendidos_progresso_') + user.id)
            : 'aprendidos_progresso_anonymous_v2';
        var keys = [uk];
        for (var i = 0; i < keys.length; i++) {
            var raw = localStorage.getItem(keys[i]);
            if (raw) {
                var p = JSON.parse(raw);
                if (p && p.escrita && p.escrita.completed) {
                    isDone = true;
                    prevScore = p.escrita.score;
                    prevTotal = p.escrita.total;
                    break;
                }
            }
        }
    } catch(e) {}

    if (isDone) {
        var banner = document.getElementById('reviewBanner');
        var bannerText = document.getElementById('reviewBannerText');
        if (banner) banner.style.display = 'flex';
        if (bannerText && prevScore !== null) {
            bannerText.textContent = 'Você já concluiu este treino com ' + prevScore + ' de ' + prevTotal + ' acertos. Pratique novamente para manter a caligrafia afiada!';
        }
    }
}

function toggleMenu() {
    var m = document.getElementById('mobileMenu');
    var b = document.querySelector('.navbar-hamburger');
    if (!m) return;
    var open = m.classList.toggle('open');
    if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false');
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    verificarLicaoConcluida();
    initExercise();
});
