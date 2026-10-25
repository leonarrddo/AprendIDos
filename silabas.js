/**
 * AprendIDos — Sílabas
 * silabas.js
 */

var wordBank = [
    { word: 'BOLO',  syl1: 'BO', syl2: 'LO',  distractors: ['BA','LA','BO','LO','BE','LU'] },
    { word: 'CAFÉ',  syl1: 'CA', syl2: 'FE',  distractors: ['CO','FI','CA','FE','CE','FU'] },
    { word: 'CASA',  syl1: 'CA', syl2: 'SA',  distractors: ['CO','SI','CA','SA','CE','SU'] },
    { word: 'DATA',  syl1: 'DA', syl2: 'TA',  distractors: ['DI','TO','DA','TA','DO','TU'] },
    { word: 'FOTO',  syl1: 'FO', syl2: 'TO',  distractors: ['FA','TA','FO','TO','FI','TU'] },
    { word: 'GOTA',  syl1: 'GO', syl2: 'TA',  distractors: ['GA','TI','GO','TA','GU','TE'] },
    { word: 'LATA',  syl1: 'LA', syl2: 'TA',  distractors: ['LO','TE','LA','TA','LU','TI'] },
    { word: 'NETO',  syl1: 'NE', syl2: 'TO',  distractors: ['NA','TA','NE','TO','NO','TU'] },
    { word: 'PAGO',  syl1: 'PA', syl2: 'GO',  distractors: ['PO','GA','PA','GO','PE','GU'] },
    { word: 'ROTA',  syl1: 'RO', syl2: 'TA',  distractors: ['RA','TI','RO','TA','RU','TE'] },
    { word: 'SALA',  syl1: 'SA', syl2: 'LA',  distractors: ['SO','LE','SA','LA','SI','LO'] },
    { word: 'SOPA',  syl1: 'SO', syl2: 'PA',  distractors: ['SA','PE','SO','PA','SE','PU'] },
    { word: 'TELA',  syl1: 'TE', syl2: 'LA',  distractors: ['TA','LO','TE','LA','TI','LU'] },
    { word: 'VELA',  syl1: 'VE', syl2: 'LA',  distractors: ['VA','LO','VE','LA','VI','LI'] },
    { word: 'VIDA',  syl1: 'VI', syl2: 'DA',  distractors: ['VA','DO','VI','DA','VO','DE'] },
    { word: 'ZERO',  syl1: 'ZE', syl2: 'RO',  distractors: ['ZA','RA','ZE','RO','ZO','RU'] },
    { word: 'DEDO',  syl1: 'DE', syl2: 'DO',  distractors: ['DA','DI','DE','DO','DU','DE'] },
    { word: 'LOJA',  syl1: 'LO', syl2: 'JA',  distractors: ['LA','JI','LO','JA','LU','JE'] },
    { word: 'NOME',  syl1: 'NO', syl2: 'ME',  distractors: ['NA','MA','NO','ME','NU','MI'] },
    { word: 'VOTO',  syl1: 'VO', syl2: 'TO',  distractors: ['VA','TA','VO','TO','VI','TU'] },
    { word: 'MAPA',  syl1: 'MA', syl2: 'PA',  distractors: ['MI','PE','MA','PA','MO','PU'] },
    { word: 'SUCO',  syl1: 'SU', syl2: 'CO',  distractors: ['SA','CA','SU','CO','SO','CI'] }
];

var TOTAL = 10;
var questions = [], currentIdx = 0, hits = 0, misses = 0, answered = false, errorLog = [];
var currentAudio = null, ptVoice = null;
var speechGeneration = 0;

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

        audio.playbackRate = 0.90;
        if ('preservesPitch' in audio) {
            audio.preservesPitch = true;
        }

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
    } catch (e) {}

    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR';
    u.rate = 0.82; // Calmo e pausado para o idoso
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
            } catch (e) {
                cleanup();
            }
        }, 80);
    }
}

function playInstruction() {
    var btn = document.getElementById('btnInstruction');
    if (btn) btn.classList.add('speaking');
    speak('Aprenda como as sílabas se juntam para formar palavras. Toque nos exemplos para ouvir.', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function playDemo(word, btn) {
    if (btn) btn.classList.add('speaking');
    speak(word, function() {
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
    stopAllAudio();
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
        if (fb && !fb.querySelector('.btn-next')) {
            var btnNext = document.createElement('button');
            btnNext.className = 'btn-next';
            btnNext.onclick = nextQuestion;
            btnNext.setAttribute('aria-label', isLast ? 'Ver resultado' : 'Próxima pergunta');
            btnNext.innerHTML = '<i class="fas ' + (isLast ? 'fa-flag-checkered' : 'fa-arrow-right') + '"></i> ' + (isLast ? 'Ver resultado' : 'Próxima');
            fb.appendChild(btnNext);
            btnNext.focus();
        }
    }, isCorrect ? 250 : 800);
}

function showFeedback(type, msg) {
    var fb = document.getElementById('feedbackArea');
    if (fb) fb.innerHTML = '<div class="feedback-msg ' + type + '" role="alert"><i class="fas ' + (type === 'success' ? 'fa-check-circle' : 'fa-redo') + '"></i> ' + msg + '</div>';
}

function nextQuestion() {
    stopAllAudio();
    currentIdx++;
    if (currentIdx >= TOTAL) {
        showCompletion();
    } else {
        loadQuestion();
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
    speak('Parabéns! Você terminou! ' + msg);
}

function salvarProgresso() {
    var data = { completed: true, score: hits, total: TOTAL, misses: misses, savedAt: new Date().toISOString() };
    if (window.AprendIDosAuth && window.AprendIDosAuth.saveLessonProgress) {
        try { return window.AprendIDosAuth.saveLessonProgress('silabas', data); } catch(e) {}
    }
    return Promise.resolve({ status: 'failed', success: false, localSaved: false, synced: false });
}

async function salvarEVerOutras(event) {
    if (event) event.preventDefault();
    var btn = document.getElementById('btnSalvarEVerOutras');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...'; }
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
            if (raw) { var p = JSON.parse(raw); if (p && p.silabas && p.silabas.completed) { isDone = true; prevScore = p.silabas.score; prevTotal = p.silabas.total; break; } }
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

var lettersList = ['b', 'c', 'd', 'f', 'g', 'j', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'z'];
var currentLetterIdx = 0;

function showLetter(letterKey) {
    stopAllAudio();
    var key = (letterKey || 'b').toLowerCase();
    var idx = lettersList.indexOf(key);
    if (idx === -1) idx = 0;
    currentLetterIdx = idx;

    lettersList.forEach(function(l) {
        var sec = document.getElementById('letra-' + l);
        var btn = document.getElementById('btn-nav-' + l);
        if (sec) {
            sec.classList.remove('active');
        }
        if (btn) {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        }
    });

    var activeLetter = lettersList[currentLetterIdx];
    var activeSec = document.getElementById('letra-' + activeLetter);
    var activeBtn = document.getElementById('btn-nav-' + activeLetter);

    if (activeSec) {
        activeSec.classList.add('active');
        var isFirst = (currentLetterIdx === 0);
        var isLast = (currentLetterIdx === lettersList.length - 1);
        var prevBtns = activeSec.querySelectorAll('.btn-step-prev');
        var nextBtns = activeSec.querySelectorAll('.btn-step-next');
        prevBtns.forEach(function(b) { b.disabled = isFirst; });
        nextBtns.forEach(function(b) { b.disabled = isLast; });
    }
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-selected', 'true');
        try {
            activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } catch(e) {}
    }

    var navWrapper = document.getElementById('grade-letras');
    if (navWrapper) {
        var rect = navWrapper.getBoundingClientRect();
        if (rect.top < 0 || rect.top > 120) {
            navWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

function nextLetter() {
    if (currentLetterIdx < lettersList.length - 1) {
        showLetter(lettersList[currentLetterIdx + 1]);
    }
}

function prevLetter() {
    if (currentLetterIdx > 0) {
        showLetter(lettersList[currentLetterIdx - 1]);
    }
}

window.speak = speak; window.playInstruction = playInstruction; window.playDemo = playDemo;
window.playQuestionAudio = playQuestionAudio; window.playHelpExercise = playHelpExercise;
window.nextQuestion = nextQuestion; window.restartExercise = restartExercise;
window.salvarEVerOutras = salvarEVerOutras; window.toggleMenu = toggleMenu;
window.showLetter = showLetter; window.nextLetter = nextLetter; window.prevLetter = prevLetter;
window.stopAllAudio = stopAllAudio;

if (document.readyState === 'loading') { 
    document.addEventListener('DOMContentLoaded', function() { 
        initExercise(); 
        verificarLicaoConcluida(); 
        showLetter('b');
    }); 
} else { 
    initExercise(); 
    verificarLicaoConcluida(); 
    showLetter('b');
}
