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
        hint: 'Esta história conta a rotina tranquila de Dona Maria ao acordar cedo e fazer um café fresco para começar o dia bem.',
        vocabulary: [
            { word: 'Quentinho', tip: 'Café recém-passado e bem aquecido.' },
            { word: 'Paz', tip: 'Sensação boa de calma e tranquilidade.' }
        ],
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
        hint: 'Seu José tem paciência e amor pela natureza. Ele rega suas plantas e se alegra com as flores que desabrocham.',
        vocabulary: [
            { word: 'Rega', tip: 'Colocar água na terra das plantas com cuidado.' },
            { word: 'Carinho', tip: 'Fazer as coisas com amor e dedicação.' }
        ],
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
        hint: 'Mimi é um gatinho de estimação manso que gosta de conforto, leite fresco e carinho da família.',
        vocabulary: [
            { word: 'Ronrona', tip: 'Barulhinho suave que o gato faz quando está feliz.' },
            { word: 'Tigela', tip: 'Pote ou vasilha onde se coloca comida ou bebida.' }
        ],
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
        hint: 'A vovó reuniu os netos com uma receita tradicional feita com muito amor para o lanche da tarde.',
        vocabulary: [
            { word: 'Delicioso', tip: 'Comida com sabor muito agradável e gostoso.' },
            { word: 'Lanchar', tip: 'Fazer uma refeição gostosa no meio da tarde.' }
        ],
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
        hint: 'Mostra um dia calmo na lagoa, onde a natureza segue tranquila com o pato nadando e se refrescando.',
        vocabulary: [
            { word: 'Refrescante', tip: 'Água fresca e agradável que tira o calor.' },
            { word: 'Lagoa', tip: 'Grande porção de água parada na natureza.' }
        ],
        question: 'Onde o patinho foi nadar?',
        options: ['Na lagoa', 'Na banheira', 'Na piscina'],
        correct: 0
    },
    {
        title: 'A Padaria do Seu Manuel',
        emoji: '🥖',
        lines: [
            'Seu Manuel assa pães franceses douradinhos.',
            'Logo cedo forma-se uma fila animada na porta.',
            'Os vizinhos conversam e dão bom dia com um sorriso.',
            'O pão com manteiga derretida alegra toda a manhã.'
        ],
        audioFull: 'A Padaria do Seu Manuel. Seu Manuel assa pães franceses douradinhos. Logo cedo forma-se uma fila animada na porta. Os vizinhos conversam e dão bom dia com um sorriso. O pão com manteiga derretida alegra toda a manhã.',
        hint: 'A padaria do bairro é um ponto de encontro comunitário, onde a amizade e o pão fresco aproximam as pessoas.',
        vocabulary: [
            { word: 'Douradinho', tip: 'Pão bem assado no ponto certo, com casquinha crocante.' },
            { word: 'Animada', tip: 'Ambiente alegre e cheio de vida.' }
        ],
        question: 'Quem assa os pães franceses douradinhos?',
        options: ['Seu Manuel', 'O gato Mimi', 'Dona Maria'],
        correct: 0
    },
    {
        title: 'O Passeio na Praça',
        emoji: '🌳',
        lines: [
            'No domingo à tarde a praça fica cheia.',
            'As crianças correm e brincam de bola.',
            'Os idosos sentam no banco para prosear.',
            'Uma brisa suave balança as folhas dos ipês.'
        ],
        audioFull: 'O Passeio na Praça. No domingo à tarde a praça fica cheia. As crianças correm e brincam de bola. Os idosos sentam no banco para prosear. Uma brisa suave balança as folhas dos ipês.',
        hint: 'A praça pública é lugar de convivência, descanso e boas conversas entre amigos de todas as idades.',
        vocabulary: [
            { word: 'Prosear', tip: 'Conversar com calma sobre a vida e contar histórias.' },
            { word: 'Brisa', tip: 'Vento leve e agradável que refresca.' }
        ],
        question: 'O que os idosos fazem nos bancos da praça?',
        options: ['Sentam para prosear', 'Dormem na chuva', 'Pintam paredes'],
        correct: 0
    },
    {
        title: 'A Chuva no Sertão',
        emoji: '🌧️',
        lines: [
            'As nuvens escuras anunciam a chuva esperada.',
            'Gotas grossas molham a terra e trazem alívio.',
            'O cheiro de terra molhada enche os corações de esperança.',
            'Os passarinhos cantam celebrando a água da vida.'
        ],
        audioFull: 'A Chuva no Sertão. As nuvens escuras anunciam a chuva esperada. Gotas grossas molham a terra e trazem alívio. O cheiro de terra molhada enche os corações de esperança. Os passarinhos cantam celebrando a água da vida.',
        hint: 'A chegada da chuva é uma bênção para quem vive na roça, renovando a terra e a alegria das famílias.',
        vocabulary: [
            { word: 'Alívio', tip: 'Sensação boa de paz quando uma dificuldade passa.' },
            { word: 'Esperança', tip: 'Confiança de que dias melhores estão chegando.' }
        ],
        question: 'O que as gotas grossas de chuva trazem?',
        options: ['Alívio e esperança', 'Neve gelada', 'Fumaça escura'],
        correct: 0
    },
    {
        title: 'A Horta do Vovô',
        emoji: '🥬',
        lines: [
            'Vovô cuida de canteiros cheios de alface e couve.',
            'Ele colhe tomates bem maduros e vermelhos.',
            'Toda verdura é fresca e plantada sem veneno.',
            'Na hora do almoço a salada é o orgulho da família.'
        ],
        audioFull: 'A Horta do Vovô. Vovô cuida de canteiros cheios de alface e couve. Ele colhe tomates bem maduros e vermelhos. Toda verdura é fresca e plantada sem veneno. Na hora do almoço a salada é o orgulho da família.',
        hint: 'Plantar e colher o próprio alimento traz saúde, independência e alegria de compartilhar à mesa.',
        vocabulary: [
            { word: 'Canteiro', tip: 'Pequena faixa de terra preparada para plantar verduras.' },
            { word: 'Orgulho', tip: 'Sentimento de satisfação por um trabalho bem feito.' }
        ],
        question: 'O que o vovô colhe nos seus canteiros?',
        options: ['Alface, couve e tomates', 'Pedras e gravetos', 'Sapatos velhos'],
        correct: 0
    },
    {
        title: 'A Carta do Neto',
        emoji: '✉️',
        lines: [
            'O carteiro tocou a campainha trazendo um envelope.',
            'Era uma carta escrita à mão com letra bem bonita.',
            'O neto contava sobre seus estudos e mandava um abraço.',
            'Dona Lurdes guardou a carta com muito amor no coração.'
        ],
        audioFull: 'A Carta do Neto. O carteiro tocou a campainha trazendo um envelope. Era uma carta escrita à mão com letra bem bonita. O neto contava sobre seus estudos e mandava um abraço. Dona Lurdes guardou a carta com muito amor no coração.',
        hint: 'Receber notícias escritas de quem a gente ama é uma emoção única que fortalece os laços de família.',
        vocabulary: [
            { word: 'Envelope', tip: 'Papel dobrado que protege a carta durante o envio.' },
            { word: 'Laços', tip: 'União forte e carinhosa entre as pessoas.' }
        ],
        question: 'O que o carteiro entregou para Dona Lurdes?',
        options: ['Uma carta do neto', 'Um saco de carvão', 'Um despertador'],
        correct: 0
    }
];

var TOTAL = 5;
var stories = [], currentIdx = 0, hits = 0, misses = 0, answered = false;
var currentAudio = null, ptVoice = null;
var speechGeneration = 0;
var isGuidedReadingActive = false;

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
    document.querySelectorAll('.story-line').forEach(function(el) {
        el.classList.remove('highlight-line');
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

    // Se o texto tiver mais de 200 caracteres, a URL do Google TTS trunca ou falha.
    // Nesses casos (histórias completas), usa diretamente a Web Speech API.
    if (text.length > 200) {
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
    u.rate = 0.82; // Calmo e pausado
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
    speak('Acompanhe a leitura de cada pequena história. Você pode ouvir a história completa, usar as ajudas e responder a pergunta.', function() {
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
    stopAllAudio();
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
    stopAllAudio();
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

    renderStoryCard(s);
    renderQuestion(s);
}

function renderStoryCard(s) {
    var card = document.getElementById('storyCard');
    if (!card) return;

    var linesHtml = s.lines.map(function(line, idx) {
        return '<p class="story-line" id="line_' + idx + '" onclick="speakLine(\'' + line.replace(/'/g, "\\'") + '\', this)" role="button" tabindex="0" aria-label="Ouvir linha: ' + line + '">' + line + '</p>';
    }).join('');

    var vocabHtml = '';
    if (s.vocabulary && s.vocabulary.length > 0) {
        vocabHtml = 
            '<div class="vocab-section">' +
                '<div class="vocab-title"><i class="fas fa-book-bookmark"></i> Palavras de Apoio (toque para ouvir o significado):</div>' +
                '<div class="vocab-chips">' +
                    s.vocabulary.map(function(item) {
                        return '<button type="button" class="vocab-chip" onclick="speakVocabTip(\'' + item.word + '\', \'' + item.tip.replace(/'/g, "\\'") + '\')"><i class="fas fa-lightbulb" style="color:#F57F17;"></i> <strong>' + item.word + '</strong></button>';
                    }).join('') +
                '</div>' +
            '</div>';
    }

    card.innerHTML = 
        '<div class="reading-aids-bar">' +
            '<div class="reading-aids-title">' +
                '<i class="fas fa-hands-helping"></i>' +
                '<span>Ajudas de Leitura:</span>' +
            '</div>' +
            '<div class="reading-aids-buttons">' +
                '<button type="button" class="btn-reading-aid" onclick="toggleStoryHint()"><i class="fas fa-info-circle"></i> Dica da História</button>' +
                '<button type="button" class="btn-reading-aid" id="btnGuidedReading" onclick="startGuidedReading()"><i class="fas fa-forward-step"></i> Leitura Passo a Passo</button>' +
            '</div>' +
        '</div>' +
        '<div class="story-hint-box" id="storyHintBox">' +
            '<i class="fas fa-lightbulb" style="font-size:1.4rem;color:#F57F17;margin-top:2px;"></i>' +
            '<div>' +
                '<strong>Resumo amigável:</strong> ' + (s.hint || 'Ouça a história com calma para responder a pergunta abaixo.') +
            '</div>' +
        '</div>' +
        '<div class="story-header">' +
            '<span class="story-emoji">' + s.emoji + '</span>' +
            '<h2 class="story-title" id="storyTitle">' + s.title + '</h2>' +
        '</div>' +
        '<div class="story-text" role="region" aria-label="Texto da história">' +
            linesHtml +
        '</div>' +
        '<div class="story-actions">' +
            '<button class="btn-action" id="btnPlayFullStory" onclick="playFullStory()" aria-label="Ouvir a história completa">' +
                '<i class="fas fa-volume-up"></i> Ouvir a história toda' +
            '</button>' +
        '</div>' +
        vocabHtml;
}

function toggleStoryHint() {
    var box = document.getElementById('storyHintBox');
    if (!box) return;
    var isOpen = box.classList.toggle('open');
    if (isOpen) {
        var s = stories[currentIdx];
        if (s && s.hint) speak('Dica da história: ' + s.hint);
    } else {
        stopAllAudio();
    }
}

function speakVocabTip(word, tip) {
    speak('A palavra ' + word + ' significa: ' + tip);
}

function startGuidedReading() {
    stopAllAudio();
    var s = stories[currentIdx];
    if (!s || !s.lines || s.lines.length === 0) return;

    var lineIdx = 0;
    var currentGen = speechGeneration;

    function readNext() {
        if (currentGen !== speechGeneration) return;
        if (lineIdx >= s.lines.length) {
            document.querySelectorAll('.story-line').forEach(function(el) { el.classList.remove('highlight-line'); });
            speak('Fim da leitura guiada! Agora responda a pergunta abaixo.');
            return;
        }

        document.querySelectorAll('.story-line').forEach(function(el) { el.classList.remove('highlight-line'); });
        var targetEl = document.getElementById('line_' + lineIdx);
        if (targetEl) targetEl.classList.add('highlight-line');

        var text = s.lines[lineIdx];
        lineIdx++;
        speak(text, function() {
            setTimeout(readNext, 600);
        });
    }

    readNext();
}

function renderQuestion(s) {
    var qTitle = document.getElementById('questionTitle');
    var optCont = document.getElementById('optionsContainer');
    if (qTitle) qTitle.textContent = s.question;
    if (optCont) {
        optCont.innerHTML = '';
        s.options.forEach(function(opt, idx) {
            var btn = document.createElement('button');
            btn.className = 'btn-reading-opt';
            btn.textContent = opt;
            btn.setAttribute('data-idx', idx);
            btn.setAttribute('aria-label', 'Opção: ' + opt);
            btn.onclick = function() { checkReadingAnswer(idx, btn); };
            optCont.appendChild(btn);
        });
    }
}

function speakLine(text, el) {
    stopAllAudio();
    document.querySelectorAll('.story-line').forEach(function(l) { l.classList.remove('highlight-line'); });
    if (el) el.classList.add('highlight-line');
    speak(text, function() {
        if (el) el.classList.remove('highlight-line');
    });
}

function playFullStory() {
    var s = stories[currentIdx];
    var btn = document.getElementById('btnPlayFullStory');
    if (btn) btn.classList.add('speaking');
    speak(s.audioFull, function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function playQuestionAudio() {
    var s = stories[currentIdx];
    speak(s.question + ' As opções são: ' + s.options.join(', '), null);
}

function checkReadingAnswer(chosenIdx, btn) {
    if (answered) return;
    answered = true;

    var s = stories[currentIdx];
    var isCorrect = (chosenIdx === s.correct);
    document.querySelectorAll('.btn-reading-opt').forEach(function(b) { b.disabled = true; });

    btn.classList.add(isCorrect ? 'correct' : 'wrong');
    if (!isCorrect) {
        var correctBtn = document.querySelector('.btn-reading-opt[data-idx="' + s.correct + '"]');
        if (correctBtn) correctBtn.classList.add('correct');
    }

    var fb = document.getElementById('feedbackArea');
    if (isCorrect) {
        hits++;
        var h = document.getElementById('hitsCount'); if (h) h.textContent = hits;
        if (fb) fb.innerHTML = '<div class="feedback-msg success"><i class="fas fa-check-circle"></i> Muito bem! Resposta correta!</div>';
        speak('Muito bem! Você compreendeu a história!');
    } else {
        misses++;
        var m = document.getElementById('missesCount'); if (m) m.textContent = misses;
        if (fb) fb.innerHTML = '<div class="feedback-msg error"><i class="fas fa-redo"></i> A resposta certa é: ' + s.options[s.correct] + '</div>';
        speak('A resposta correta é: ' + s.options[s.correct]);
    }

    var isLast = currentIdx >= TOTAL - 1;
    setTimeout(function() {
        if (fb && !fb.querySelector('.btn-next')) {
            var btnNext = document.createElement('button');
            btnNext.className = 'btn-next';
            btnNext.onclick = nextStory;
            btnNext.setAttribute('aria-label', isLast ? 'Ver resultado' : 'Próxima história');
            btnNext.innerHTML = '<i class="fas ' + (isLast ? 'fa-flag-checkered' : 'fa-arrow-right') + '"></i> ' + (isLast ? 'Ver resultado' : 'Próxima leitura');
            fb.appendChild(btnNext);
            btnNext.focus();
        }
    }, isCorrect ? 300 : 900);
}

function nextStory() {
    stopAllAudio();
    currentIdx++;
    if (currentIdx >= TOTAL) showCompletion();
    else loadStory();
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

    var msg = hits === TOTAL ? 'Excelente! Você compreendeu todas as histórias!' : hits >= 3 ? 'Muito bem! Você é um ótimo leitor!' : 'Bom esforço! Praticando você vai longe!';
    var cm = document.getElementById('completionMsg'); if (cm) cm.textContent = msg;

    salvarProgresso();
    speak('Parabéns! Você concluiu as leituras. ' + msg);
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
        try { return window.AprendIDosAuth.saveLessonProgress('leituras', data); } catch(e) {}
    }
    return Promise.resolve({ success: true, synced: false });
}

async function salvarEVerOutras(event) {
    if (event) event.preventDefault();
    var btn = document.getElementById('btnSalvarEVerOutras');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...'; }
    try {
        var res = await salvarProgresso();
        if (btn) {
            if (res && res.synced) {
                btn.innerHTML = '<i class="fas fa-check-circle"></i> Salvo na nuvem!';
            } else {
                btn.innerHTML = '<i class="fas fa-check-circle"></i> Salvo!';
            }
        }
    } catch(e) {
        if (btn) btn.innerHTML = '<i class="fas fa-check-circle"></i> Salvo no aparelho!';
    }
    setTimeout(function() { window.location.href = 'licoes.html'; }, 500);
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

window.speak = speak; window.playInstruction = playInstruction; window.playFullStory = playFullStory;
window.playQuestionAudio = playQuestionAudio; window.checkReadingAnswer = checkReadingAnswer;
window.nextStory = nextStory; window.restartExercise = restartExercise;
window.salvarEVerOutras = salvarEVerOutras; window.toggleMenu = toggleMenu;
window.speakLine = speakLine; window.toggleStoryHint = toggleStoryHint;
window.speakVocabTip = speakVocabTip; window.startGuidedReading = startGuidedReading;
window.stopAllAudio = stopAllAudio;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initExercise();
        verificarLicaoConcluida();
    });
} else {
    initExercise();
    verificarLicaoConcluida();
}
