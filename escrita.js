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
var currentEvalMessage = '';
var autoEvalTimeout = null;
var hasPassedCurrentWord = false;

// ============================================================
// MOTOR DE VOZ (ANTI-ECO & ANTI-REPETIÇÃO)
// ============================================================
function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    var v = window.speechSynthesis.getVoices();
    ptVoice = v.find(function(x) { return x.lang === 'pt-BR' || x.lang.startsWith('pt'); }) || null;
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
        } catch(e) {}
        currentAudio = null;
    }
    if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch(e) {}
    }
}

function speak(text, onEnd) {
    stopAllAudio();
    var thisGen = speechGeneration;
    var url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=pt-BR&client=tw-ob&q=' + encodeURIComponent(text);
    var audio = new Audio(url);
    currentAudio = audio;

    var fallbackTriggered = false;
    function triggerFallback() {
        if (thisGen !== speechGeneration) return;
        if (fallbackTriggered) return;
        fallbackTriggered = true;
        speakNativo(text, onEnd, thisGen);
    }

    audio.onended = function() {
        if (thisGen !== speechGeneration) return;
        if (onEnd) onEnd();
    };
    audio.onerror = function() {
        triggerFallback();
    };

    var p = audio.play();
    if (p) {
        p.catch(function() {
            triggerFallback();
        });
    }
}

function speakNativo(text, onEnd, expectedGen) {
    if (expectedGen !== undefined && expectedGen !== speechGeneration) return;
    if (!('speechSynthesis' in window)) { if (onEnd) onEnd(); return; }
    try { window.speechSynthesis.cancel(); } catch(e) {}

    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR';
    u.rate = 0.8;
    u.pitch = 1;
    u.volume = 1;
    if (!ptVoice) loadVoices();
    if (ptVoice) u.voice = ptVoice;

    u.onend = function() {
        if (expectedGen !== undefined && expectedGen !== speechGeneration) return;
        if (onEnd) onEnd();
    };
    u.onerror = function() {
        if (expectedGen !== undefined && expectedGen !== speechGeneration) return;
        if (onEnd) onEnd();
    };

    try {
        window.speechSynthesis.speak(u);
    } catch(e) {
        if (onEnd) onEnd();
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
    updateEvaluationUI(0, 'Passe o dedo por cima das letras. O sistema avalia sua escrita automaticamente!', 'info');

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
}

function handleCanvasResize() {
    if (!writingCanvas || writingCanvas.offsetParent === null) return;
    setupCanvasResolution();
    redrawWritingCanvas();
}

function setupCanvasResolution() {
    if (!writingCanvas) return;
    var container = writingCanvas.parentElement;
    var rect = container.getBoundingClientRect();
    var width = Math.floor(rect.width) || 640;
    var height = 320; // Altura confortável para escrita grande

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

        if (currentStroke && currentStroke.points.length >= 2) {
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
    redrawWritingCanvas();
    var hint = document.getElementById('canvasHint');
    if (hint) hint.style.opacity = '1';
    renderLetterTracker();
    updateEvaluationUI(0, 'Quadro limpo! Escreva novamente a palavra com calma.', 'info');
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
        var status = letterStatusMap[idx] || { passed: false, partial: false };
        if (status.passed) completed++;

        var chip = document.createElement('div');
        chip.className = 'letter-tracker-chip' + (status.passed ? ' completed' : (status.partial ? ' partial' : ''));
        chip.id = 'trackerChip_' + idx;
        chip.title = 'Clique para ouvir a letra ' + m.char;

        var charSpan = document.createElement('span');
        charSpan.className = 'chip-char';
        charSpan.textContent = m.char;

        var statusSpan = document.createElement('span');
        statusSpan.className = 'chip-status';
        statusSpan.id = 'chipStatus_' + idx;
        statusSpan.innerHTML = status.passed
            ? '<i class="fas fa-check"></i>'
            : (status.partial ? '<i class="fas fa-pencil-alt"></i>' : '<i class="fas fa-pen"></i>');

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

function updateEvaluationUI(score, message, type) {
    currentEvalScore = score;
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

    // Estrelas
    var star1 = document.getElementById('star1');
    var star2 = document.getElementById('star2');
    var star3 = document.getElementById('star3');
    [star1, star2, star3].forEach(function(s) { if (s) s.classList.remove('filled'); });

    if (score >= 45 && star1) star1.classList.add('filled');
    if (score >= 70 && star2) star2.classList.add('filled');
    if (score >= 88 && star3) star3.classList.add('filled');
}

function evaluateWriting(isManual) {
    if (!writingCanvas) return;
    var q = questions[currentIdx];
    if (!q) return;

    var metrics = getLetterMetrics();
    if (metrics.length === 0) return;

    if (strokes.length === 0) {
        updateEvaluationUI(0, 'Passe o dedo com firmeza por cima das linhas para escrever.', 'info');
        if (isManual) speak('Passe o dedo cobrindo as letras antes de avaliar.');
        return;
    }

    var totalScoreSum = 0;
    var completedCount = 0;

    metrics.forEach(function(m, idx) {
        var result;
        if (typeof window.evaluateLetter === 'function') {
            result = window.evaluateLetter(m.char, m, strokes, 0.1);
        } else {
            // Avaliação heurística por proximidade dos pontos do stroke
            result = evaluateLetterFallback(m, strokes);
        }

        var passed = result.passed || (result.score >= 60) || (result.coverage >= 60);
        var partial = !passed && (result.score >= 30 || result.coverage >= 30);

        letterStatusMap[idx] = {
            score: result.score,
            coverage: result.coverage,
            passed: passed,
            partial: partial
        };

        if (passed) completedCount++;
        totalScoreSum += result.score;
    });

    var avgScore = Math.round(totalScoreSum / metrics.length);
    renderLetterTracker();

    var allPassed = completedCount === metrics.length;
    var fbArea = document.getElementById('feedbackArea');

    if (allPassed || avgScore >= 68) {
        updateEvaluationUI(avgScore, 'Excelente caligrafia! Você escreveu a palavra ' + q.word + ' com maestria!', 'success');

        if (!hasPassedCurrentWord) {
            hasPassedCurrentWord = true;
            hits++;
            var h = document.getElementById('hitsCount'); if (h) h.textContent = hits;

            speak('Excelente! Você escreveu a palavra ' + q.word + ' com perfeição!');

            if (fbArea) {
                var isLast = currentIdx >= TOTAL - 1;
                fbArea.innerHTML = '<div class="feedback-msg success" role="alert"><i class="fas fa-check-circle"></i> Parabéns! Escrita completada com sucesso!</div>' +
                    '<button class="btn-next" onclick="nextWord()" aria-label="' + (isLast ? 'Ver resultado' : 'Próxima palavra') + '"><i class="fas ' + (isLast ? 'fa-flag-checkered' : 'fa-arrow-right') + '"></i> ' + (isLast ? 'Concluir Lição' : 'Próxima Palavra') + '</button>';
            }
        }
    } else if (avgScore >= 35 || completedCount > 0) {
        var msg = 'Muito bem! Você completou ' + completedCount + ' de ' + metrics.length + ' letras. Continue praticando o restante da palavra!';
        updateEvaluationUI(avgScore, msg, 'partial');
        if (isManual) speak(msg);
    } else {
        var tipMsg = hideWordGuide
            ? 'Continue escrevendo a palavra de memória. Você pode reativar a guia a qualquer momento.'
            : 'Passe o dedo cobrindo com firmeza as letras pontilhadas.';
        updateEvaluationUI(avgScore, tipMsg, 'info');
        if (isManual) speak(tipMsg);
    }
}

function evaluateLetterFallback(m, allStrokes) {
    // Estimador de cobertura de traço para quando letter-paths.js não tiver o caractere específico
    var pointsInLetter = 0;
    var totalPoints = 0;
    var pad = m.fontSize * 0.25;

    allStrokes.forEach(function(st) {
        st.points.forEach(function(pt) {
            totalPoints++;
            if (pt.x >= m.x1 - pad && pt.x <= m.x2 + pad &&
                pt.y >= m.y1 - pad && pt.y <= m.y2 + pad) {
                pointsInLetter++;
            }
        });
    });

    var cov = Math.min(100, Math.round((pointsInLetter / Math.max(8, m.fontSize * 0.4)) * 100));
    return {
        score: cov,
        coverage: cov,
        passed: cov >= 65
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
    var user = null;
    try { var r = localStorage.getItem('aprendidos_usuario'); if (r) user = JSON.parse(r); } catch(e) {}
    var uk = (user && user.id) ? ('aprendidos_progresso_' + user.id) : null;
    [uk, 'aprendidos_progresso', 'aprendidos_progresso_anon'].filter(Boolean).forEach(function(k) {
        try {
            var c = JSON.parse(localStorage.getItem(k) || '{}');
            c['escrita'] = data;
            localStorage.setItem(k, JSON.stringify(c));
        } catch(e) {}
    });
    if (window.AprendIDosAuth && window.AprendIDosAuth.saveLessonProgress) {
        try { window.AprendIDosAuth.saveLessonProgress('escrita', data); } catch(e) {}
    }
}

function salvarEVerOutras(event) {
    if (event) event.preventDefault();
    var btn = document.getElementById('btnSalvarEVerOutras');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    }
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
