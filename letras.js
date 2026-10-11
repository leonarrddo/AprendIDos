/**
 * ============================================================================
 * AprendIDos - Atividade Interativa: As Letras do Alfabeto
 * Arquivo: letras.js
 *
 * Sistema de Áudio Duplo (Google TTS + Web Speech API Nativo)
 * Desenvolvido com carinho para idosos em processo de alfabetização.
 * Voz calma, lenta e clara em Português do Brasil.
 * ============================================================================
 */

// ============================================================================
// DADOS DO ALFABETO — 26 Letras com Palavras Familiares do Cotidiano Brasileiro
// ============================================================================
var alphabetData = {
    A: {
        upper: 'A', lower: 'a', word: 'Abelha', simpleName: 'A de Abelha', type: 'vowel', icon: 'fa-bug',
        phrase: 'A abelha faz mel.',
        words: ['açaí', 'anel', 'avó', 'amigo', 'amor', 'asa', 'água', 'arara', 'agulha'],
        imageSrc: 'imagenscartilha/a.png', hasCustomImage: true,
        speech: 'Letra A. A de Abelha. A abelha faz mel.'
    },
    B: {
        upper: 'B', lower: 'b', word: 'Bola', simpleName: 'B de Bola', type: 'consonant', icon: 'fa-futbol',
        phrase: 'A bola é colorida.',
        words: ['bola', 'balão', 'bala', 'bico', 'boneca', 'baixo', 'berço', 'bule', 'bolo'],
        imageSrc: 'imagenscartilha/b.png', hasCustomImage: true,
        speech: 'Letra B. B de Bola. A bola é colorida.'
    },
    C: {
        upper: 'C', lower: 'c', word: 'Casa', simpleName: 'C de Casa', type: 'consonant', icon: 'fa-house',
        phrase: 'A casa é o meu lar.',
        words: ['casa', 'copo', 'cavalo', 'cobra', 'cabelo', 'caneta', 'coelho', 'caderno', 'café'],
        imageSrc: 'imagenscartilha/c.png', hasCustomImage: true,
        speech: 'Letra C. C de Casa. A casa é o meu lar.'
    },
    D: {
        upper: 'D', lower: 'd', word: 'Dado', simpleName: 'D de Dado', type: 'consonant', icon: 'fa-dice',
        phrase: 'O dado é divertido.',
        words: ['dado', 'dedo', 'dia', 'doce', 'dente', 'dama', 'dinheiro', 'dúvida'],
        imageSrc: 'imagenscartilha/d.png', hasCustomImage: true,
        speech: 'Letra D. D de Dado. O dado é divertido.'
    },
    E: {
        upper: 'E', lower: 'e', word: 'Escada', simpleName: 'E de Escada', type: 'vowel', icon: 'fa-star',
        phrase: 'A escada é alta.',
        words: ['escada', 'escola', 'esperto', 'elefante', 'espelho', 'esquilo', 'estrela', 'escova', 'enfeite'],
        imageSrc: 'imagenscartilha/e.png', hasCustomImage: true,
        speech: 'Letra E. E de Escada. A escada é alta.'
    },
    F: {
        upper: 'F', lower: 'f', word: 'Faca', simpleName: 'F de Faca', type: 'consonant', icon: 'fa-utensils',
        phrase: 'A faca é afiada.',
        words: ['faca', 'fada', 'fogo', 'fita', 'foca', 'fundo', 'família', 'futebol'],
        imageSrc: 'imagenscartilha/f.png', hasCustomImage: true,
        speech: 'Letra F. F de Faca. A faca é afiada.'
    },
    G: {
        upper: 'G', lower: 'g', word: 'Gato', simpleName: 'G de Gato', type: 'consonant', icon: 'fa-cat',
        phrase: 'O gato dorme.',
        words: ['gato', 'garrafa', 'geladeira', 'gema', 'girafa', 'grama', 'galinha', 'geleia', 'gemada'],
        imageSrc: 'imagenscartilha/g.png', hasCustomImage: true,
        speech: 'Letra G. G de Gato. O gato dorme.'
    },
    H: {
        upper: 'H', lower: 'h', word: 'Homem', simpleName: 'H de Homem', type: 'consonant', icon: 'fa-user',
        phrase: 'A letra H é de homem.',
        words: ['homem', 'hotel', 'história', 'hora', 'honra', 'helicóptero', 'hábito', 'harpa'],
        imageSrc: 'imagenscartilha/h.png', hasCustomImage: true,
        speech: 'Letra H. H de Homem. A letra H é de homem.'
    },
    I: {
        upper: 'I', lower: 'i', word: 'Igreja', simpleName: 'I de Igreja', type: 'vowel', icon: 'fa-church',
        phrase: 'A letra I é de igreja.',
        words: ['igreja', 'isopor', 'internet', 'ilha', 'inverno', 'irmão', 'imagem', 'instrumento'],
        imageSrc: 'imagenscartilha/i.png', hasCustomImage: true,
        speech: 'Letra I. I de Igreja. A letra I é de igreja.'
    },
    J: {
        upper: 'J', lower: 'j', word: 'Jacaré', simpleName: 'J de Jacaré', type: 'consonant', icon: 'fa-table-cells-large',
        phrase: 'O jacaré é grande.',
        words: ['jacaré', 'jogo', 'joaninha', 'janela', 'jardim', 'juntos', 'jaca', 'jeito'],
        imageSrc: 'imagenscartilha/j.png', hasCustomImage: true,
        speech: 'Letra J. J de Jacaré. O jacaré é grande.'
    },
    K: {
        upper: 'K', lower: 'k', word: 'Kiwi', simpleName: 'K de Kiwi', type: 'consonant', icon: 'fa-lemon',
        phrase: 'O kiwi é gostoso.',
        words: ['kiwi', 'kart', 'ketchup', 'karatê'],
        imageSrc: 'imagenscartilha/k.png', hasCustomImage: false,
        speech: 'Letra K. K de Kiwi. O kiwi é gostoso.'
    },
    L: {
        upper: 'L', lower: 'l', word: 'Lua', simpleName: 'L de Lua', type: 'consonant', icon: 'fa-moon',
        phrase: 'A lua é bonita.',
        words: ['lua', 'lápis', 'leão', 'lago', 'livro', 'lombo', 'lima', 'lata', 'leite'],
        imageSrc: 'imagenscartilha/l.png', hasCustomImage: true,
        speech: 'Letra L. L de Lua. A lua é bonita.'
    },
    M: {
        upper: 'M', lower: 'm', word: 'Mulher', simpleName: 'M de Mulher', type: 'consonant', icon: 'fa-person-dress',
        phrase: 'A mulher é especial.',
        words: ['mala', 'mesa', 'macaco', 'mão', 'mar', 'melancia', 'mãe', 'meia', 'moto'],
        imageSrc: 'imagenscartilha/m.png', hasCustomImage: true,
        speech: 'Letra M. M de Mulher. A mulher é especial.'
    },
    N: {
        upper: 'N', lower: 'n', word: 'Navio', simpleName: 'N de Navio', type: 'consonant', icon: 'fa-ship',
        phrase: 'O navio é grande.',
        words: ['navio', 'nuvem', 'ninho', 'noite', 'norte', 'número', 'nada', 'nome', 'nariz'],
        imageSrc: 'imagenscartilha/n.png', hasCustomImage: true,
        speech: 'Letra N. N de Navio. O navio é grande.'
    },
    O: {
        upper: 'O', lower: 'o', word: 'Ovo', simpleName: 'O de Ovo', type: 'vowel', icon: 'fa-egg',
        phrase: 'O ovo é nutritivo.',
        words: ['ovo', 'ovelha', 'onça', 'oito', 'olho', 'orelha', 'onda', 'ouro', 'outono'],
        imageSrc: 'imagenscartilha/o.png', hasCustomImage: true,
        speech: 'Letra O. O de Ovo. O ovo é nutritivo.'
    },
    P: {
        upper: 'P', lower: 'p', word: 'Pato', simpleName: 'P de Pato', type: 'consonant', icon: 'fa-feather',
        phrase: 'O pato é simpático.',
        words: ['pato', 'pão', 'peixe', 'pipa', 'porta', 'pipoca', 'pijama', 'pote', 'pulga'],
        imageSrc: 'imagenscartilha/p.png', hasCustomImage: true,
        speech: 'Letra P. P de Pato. O pato é simpático.'
    },
    Q: {
        upper: 'Q', lower: 'q', word: 'Queijo', simpleName: 'Q de Queijo', type: 'consonant', icon: 'fa-cheese',
        phrase: 'O queijo é delicioso.',
        words: ['queijo', 'quadro', 'quase', 'quilo', 'quina', 'quente', 'quati', 'queixo', 'quinta'],
        imageSrc: 'imagenscartilha/q.png', hasCustomImage: true,
        speech: 'Letra Q. Q de Queijo. O queijo é delicioso.'
    },
    R: {
        upper: 'R', lower: 'r', word: 'Rato', simpleName: 'R de Rato', type: 'consonant', icon: 'fa-paw',
        phrase: 'O rato é esperto.',
        words: ['rato', 'rede', 'rio', 'roda', 'rima', 'roupa', 'relógio', 'raposa', 'rua'],
        imageSrc: 'imagenscartilha/r.png', hasCustomImage: true,
        speech: 'Letra R. R de Rato. O rato é esperto.'
    },
    S: {
        upper: 'S', lower: 's', word: 'Sapo', simpleName: 'S de Sapo', type: 'consonant', icon: 'fa-frog',
        phrase: 'O sapo é saltitante.',
        words: ['sapo', 'sol', 'saia', 'sino', 'seda', 'sabonete', 'suco', 'sorvete'],
        imageSrc: 'imagenscartilha/s.png', hasCustomImage: true,
        speech: 'Letra S. S de Sapo. O sapo é saltitante.'
    },
    T: {
        upper: 'T', lower: 't', word: 'Tomate', simpleName: 'T de Tomate', type: 'consonant', icon: 'fa-apple-whole',
        phrase: 'O tomate é saudável.',
        words: ['tomate', 'tela', 'tigre', 'trem', 'tijolo', 'tesoura', 'touro', 'tarde', 'tapete'],
        imageSrc: 'imagenscartilha/t.png', hasCustomImage: true,
        speech: 'Letra T. T de Tomate. O tomate é saudável.'
    },
    U: {
        upper: 'U', lower: 'u', word: 'Uva', simpleName: 'U de Uva', type: 'vowel', icon: 'fa-leaf',
        phrase: 'A uva é saborosa.',
        words: ['uva', 'urso', 'união', 'unha', 'urna', 'uniforme', 'urubu', 'urina', 'urucum'],
        imageSrc: 'imagenscartilha/u.png', hasCustomImage: true,
        speech: 'Letra U. U de Uva. A uva é saborosa.'
    },
    V: {
        upper: 'V', lower: 'v', word: 'Vaca', simpleName: 'V de Vaca', type: 'consonant', icon: 'fa-cow',
        phrase: 'A vaca é tranquila.',
        words: ['vaca', 'vela', 'vovô', 'viola', 'vento', 'vinho', 'violão', 'vassoura', 'vermelho'],
        imageSrc: 'imagenscartilha/v.png', hasCustomImage: true,
        speech: 'Letra V. V de Vaca. A vaca é tranquila.'
    },
    W: {
        upper: 'W', lower: 'w', word: 'WhatsApp', simpleName: 'W de WhatsApp', type: 'consonant', icon: 'fa-comment-dots',
        phrase: 'O WhatsApp é prático.',
        words: ['whatsapp', 'whisky', 'waffle', 'wi-fi', 'workshop', 'wolverine', 'walkie-talkie', 'web'],
        imageSrc: 'imagenscartilha/w.png', hasCustomImage: true,
        speech: 'Letra W. W de WhatsApp. O WhatsApp é prático.'
    },
    X: {
        upper: 'X', lower: 'x', word: 'Xadrez', simpleName: 'X de Xadrez', type: 'consonant', icon: 'fa-chess-board',
        phrase: 'O xadrez é divertido.',
        words: ['xadrez', 'xícara', 'xilofone', 'xarope', 'xampu', 'xbox', 'xale', 'xerife', 'xenofobia'],
        imageSrc: 'imagenscartilha/x.png', hasCustomImage: true,
        speech: 'Letra X. X de Xadrez. O xadrez é divertido.'
    },
    Y: {
        upper: 'Y', lower: 'y', word: 'Yoga', simpleName: 'Y de Yoga', type: 'consonant', icon: 'fa-heart',
        phrase: 'O yoga traz paz e saúde.',
        words: ['yoga', 'yakisoba', 'youtube'],
        imageSrc: 'imagenscartilha/y.png', hasCustomImage: false,
        speech: 'Letra Y. Y de Yoga. O yoga traz paz e saúde.'
    },
    Z: {
        upper: 'Z', lower: 'z', word: 'Zebra', simpleName: 'Z de Zebra', type: 'consonant', icon: 'fa-horse',
        phrase: 'A zebra é linda.',
        words: ['zebra', 'zangão', 'zero', 'zíper', 'zumbi', 'zoológico', 'zente', 'zangado', 'zelador'],
        imageSrc: 'imagenscartilha/z.png', hasCustomImage: true,
        speech: 'Letra Z. Z de Zebra. A zebra é linda.'
    }
};

// ============================================================================
// SISTEMA DE ÁUDIO DUPLO (Google TTS + Fallback Web Speech API)
// ============================================================================
var currentAudio = null;

function stopAllAudio() {
    if (currentAudio) {
        try {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        } catch (e) {}
        currentAudio = null;
    }
    if ('speechSynthesis' in window) {
        try {
            window.speechSynthesis.cancel();
        } catch (e) {}
    }
}

function speak(text, onEnd) {
    stopAllAudio();

    // 1. Tenta áudio online natural via Google TTS em pt-BR
    var googleTtsUrl = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=pt-BR&client=tw-ob&q=' + encodeURIComponent(text);
    var audio = new Audio(googleTtsUrl);
    currentAudio = audio;

    var audioPlayedSuccess = false;

    audio.onended = function() {
        document.querySelectorAll('.speaking').forEach(function(el) { el.classList.remove('speaking'); });
        if (onEnd) onEnd();
    };

    audio.onerror = function() {
        if (!audioPlayedSuccess) {
            speakNativo(text, onEnd);
        }
    };

    var playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.then(function() {
            audioPlayedSuccess = true;
        }).catch(function() {
            speakNativo(text, onEnd);
        });
    }
}

function speakNativo(text, onEnd) {
    if (!('speechSynthesis' in window)) {
        document.querySelectorAll('.speaking').forEach(function(el) { el.classList.remove('speaking'); });
        if (onEnd) onEnd();
        return;
    }

    try {
        window.speechSynthesis.resume();
        window.speechSynthesis.cancel();
    } catch (e) {}

    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR';
    u.rate = 0.82; // Fala calma e pausada para idosos
    u.pitch = 1.0;
    u.volume = 1.0;

    var voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
        var ptVoice = voices.find(function(v) {
            return v.lang === 'pt-BR' || v.lang === 'pt_BR' || v.lang.startsWith('pt');
        });
        if (ptVoice) u.voice = ptVoice;
    }

    u.onend = function() {
        document.querySelectorAll('.speaking').forEach(function(el) { el.classList.remove('speaking'); });
        if (onEnd) onEnd();
    };

    u.onerror = function() {
        document.querySelectorAll('.speaking').forEach(function(el) { el.classList.remove('speaking'); });
        if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(u);
}

// ============================================================================
// INTERAÇÃO COM OS CARDS DO ALFABETO
// ============================================================================
function speakLetter(letter) {
    var item = alphabetData[letter];
    if (!item) return;

    document.querySelectorAll('.letter-card').forEach(function(c) { c.classList.remove('speaking'); });
    var card = document.querySelector('.letter-card[data-letter="' + letter + '"]');
    if (card) card.classList.add('speaking');

    speak(item.speech, function() {
        if (card) card.classList.remove('speaking');
    });

    announceSR(item.speech);
}

function playInstruction() {
    var btn = document.getElementById('btnInstruction');
    if (btn) btn.classList.add('speaking');

    var text = 'Vamos conhecer as letras do alfabeto? Toque nas letras para ouvir o som e ver o desenho.';
    speak(text, function() {
        if (btn) btn.classList.remove('speaking');
    });
}

// ============================================================================
// ATIVIDADES DIDÁTICAS PROGRESSIVAS (1 a 4)
// ============================================================================
/**
 * As atividades seguem exatamente a ordem pedagógica pedida:
 * 1. Reconhecer a letra ("Onde está a letra...?")
 * 2. Ouvir e escolher ("Qual letra você ouve?")
 * 3. Letra e imagem ("... começa com qual letra?")
 * 4. Maiúscula e minúscula ("Qual letrinha é igual?")
 */

var questions = [];
var currentIdx = 0;
var hits = 0;
var misses = 0;
var answered = false;
var errorLog = [];
var TOTAL_QUESTIONS = 8; // 2 de cada tipo por rodada

// Banco de dados para geração das perguntas
var letterKeys = Object.keys(alphabetData);
// Letras com objetos cotidianos (inclui todas as 26 letras com palavras familiares)
var commonLetterKeys = ['B','C','D','F','G','J','L','M','N','P','Q','R','S','T','V','X','Z','A','E','I','O','U','K','W','Y'];

function buildQuestionBank() {
    var qList = [];

    // TIPO 1: Encontre a letra (Reconhecimento visual da letra falada)
    // 2 perguntas de Tipo 1
    var pool1 = shuffle([...letterKeys]);
    for (var i = 0; i < 2; i++) {
        var target1 = pool1[i];
        var distractors1 = shuffle(letterKeys.filter(function(k) { return k !== target1; })).slice(0, 2);
        var options1 = shuffle([target1, distractors1[0], distractors1[1]]);

        qList.push({
            type: 1,
            stageLabel: 'Passo 1 de 4: Reconhecer a letra',
            instructionText: 'Onde está a letra <strong>' + target1 + '</strong>?',
            speechAudio: 'Onde está a letra ' + target1 + '?',
            helpText: 'Toque na letra ' + target1 + ' entre as três opções abaixo.',
            correctAnswer: target1,
            options: options1,
            displayPrompt: '<span class="prompt-big-letter">' + target1 + '</span>',
            referenceName: 'Letra ' + target1
        });
    }

    // TIPO 2: Ouça e escolha (Reconhecimento puramente auditivo)
    // 2 perguntas de Tipo 2
    var pool2 = shuffle([...letterKeys].filter(function(k) { return pool1.slice(0,2).indexOf(k) === -1; }));
    for (var j = 0; j < 2; j++) {
        var target2 = pool2[j] || 'M';
        var distractors2 = shuffle(letterKeys.filter(function(k) { return k !== target2; })).slice(0, 2);
        var options2 = shuffle([target2, distractors2[0], distractors2[1]]);

        qList.push({
            type: 2,
            stageLabel: 'Passo 2 de 4: Ouvir a letra',
            instructionText: 'Ouça o som e toque na letra correta.',
            speechAudio: 'Letra ' + target2 + '. Qual é a letra ' + target2 + '?',
            helpText: 'Escute o som com atenção e escolha a letra correspondente.',
            correctAnswer: target2,
            options: options2,
            displayPrompt: '<span class="prompt-sound-wave"><i class="fas fa-volume-up"></i> Som da letra</span>',
            referenceName: 'Som da letra ' + target2
        });
    }

    // TIPO 3: Letra e imagem (Associação de objeto cotidiano brasileiro à letra inicial)
    // 2 perguntas de Tipo 3
    var pool3 = shuffle([...commonLetterKeys]);
    for (var k = 0; k < 2; k++) {
        var target3 = pool3[k];
        var item3 = alphabetData[target3];
        var distractors3 = shuffle(letterKeys.filter(function(x) { return x !== target3; })).slice(0, 2);
        var options3 = shuffle([target3, distractors3[0], distractors3[1]]);

        var promptMedia = item3.hasCustomImage
            ? '<img src="' + item3.imageSrc + '" class="prompt-cartilha-img" alt="' + item3.word + '" style="max-height:140px;width:auto;object-fit:contain;border-radius:12px;margin:0 auto 8px;display:block;box-shadow:0 4px 12px rgba(0,0,0,0.1);">'
            : getSvgForLetter(target3);

        qList.push({
            type: 3,
            stageLabel: 'Passo 3 de 4: Letra e imagem',
            instructionText: '<strong>' + item3.word + '</strong> começa com qual letra?',
            speechAudio: item3.word + '. ' + item3.word + ' começa com qual letra?',
            helpText: 'Veja a figura de ' + item3.word + ' e toque na letra que começa.',
            correctAnswer: target3,
            options: options3,
            svgLetter: target3,
            displayPrompt: '<div class="prompt-image-wrap">' + promptMedia + '<span class="prompt-image-name">' + item3.word + '</span></div>',
            referenceName: item3.word + ' (Letra ' + target3 + ')'
        });
    }

    // TIPO 4: Maiúscula e minúscula (Associação visual entre par maiúsculo e minúsculo)
    // 2 perguntas de Tipo 4
    var pool4 = shuffle([...letterKeys]);
    for (var m = 0; m < 2; m++) {
        var target4 = pool4[m];
        var distractors4 = shuffle(letterKeys.filter(function(x) { return x !== target4; })).slice(0, 2);
        var options4Upper = shuffle([target4, distractors4[0], distractors4[1]]);
        var options4Lower = options4Upper.map(function(letter) { return letter.toLowerCase(); });

        qList.push({
            type: 4,
            stageLabel: 'Passo 4 de 4: Maiúscula e minúscula',
            instructionText: 'Qual é a letrinha minúscula igual a <strong>' + target4 + '</strong>?',
            speechAudio: 'Qual é a letrinha pequena igual a ' + target4 + '?',
            helpText: 'Veja a letra grande ' + target4 + ' e encontre a letrinha pequena correspondente.',
            correctAnswer: target4.toLowerCase(),
            options: options4Lower,
            displayPrompt: '<div class="prompt-match-wrap"><span class="prompt-big-upper">' + target4 + '</span> <span class="prompt-arrow-icon"><i class="fas fa-arrow-right"></i></span> <span class="prompt-target-box">?</span></div>',
            referenceName: target4 + ' para ' + target4.toLowerCase()
        });
    }

    return qList;
}

function initExercise() {
    questions = buildQuestionBank();
    currentIdx = 0;
    hits = 0;
    misses = 0;
    answered = false;
    errorLog = [];

    var hitsEl = document.getElementById('hitsCount');
    var missesEl = document.getElementById('missesCount');
    var cardEl = document.getElementById('exerciseCard');
    var compEl = document.getElementById('completionScreen');

    if (hitsEl) hitsEl.textContent = '0';
    if (missesEl) missesEl.textContent = '0';
    if (cardEl) cardEl.style.display = 'block';
    if (compEl) compEl.classList.remove('visible');

    loadQuestion();
}

function loadQuestion() {
    answered = false;
    if (!questions[currentIdx]) return;
    var q = questions[currentIdx];

    var pLabel = document.getElementById('progressLabel');
    var pFill = document.getElementById('progressFill');
    var pBar = document.getElementById('progressBar');
    var stepBadge = document.getElementById('exerciseStepBadge');
    var exInstr = document.getElementById('exerciseInstruction');
    var qPrompt = document.getElementById('questionPromptArea');
    var fbArea = document.getElementById('feedbackArea');
    var optsContainer = document.getElementById('optionsContainer');

    var pct = (currentIdx / TOTAL_QUESTIONS) * 100;
    if (pFill) pFill.style.width = pct + '%';
    if (pBar) pBar.setAttribute('aria-valuenow', Math.round(pct));
    if (pLabel) pLabel.textContent = 'Pergunta ' + (currentIdx + 1) + ' de ' + TOTAL_QUESTIONS;

    if (stepBadge) {
        stepBadge.textContent = q.stageLabel;
    }
    if (exInstr) {
        exInstr.innerHTML = q.instructionText;
    }
    if (qPrompt) {
        qPrompt.innerHTML = q.displayPrompt;
    }
    if (fbArea) {
        fbArea.innerHTML = '';
    }

    // Monta as 3 alternativas bem grandes e espaçadas
    if (optsContainer) {
        optsContainer.innerHTML = '';
        q.options.forEach(function(opt) {
            var btn = document.createElement('button');
            btn.className = 'btn-option';
            btn.setAttribute('data-val', opt);
            btn.setAttribute('aria-label', 'Letra ' + opt);
            if (opt.length === 1 && opt === opt.toUpperCase()) {
                btn.innerHTML = '<span class="opt-upper">' + opt + '</span><span class="opt-lower">' + opt.toLowerCase() + '</span>';
            } else {
                btn.innerHTML = '<span class="opt-lower" style="font-size:2.2rem;font-weight:900;">' + opt + '</span>';
            }
            btn.onclick = function() { checkAnswer(opt); };
            optsContainer.appendChild(btn);
        });
    }

    // Toca o áudio da pergunta com um pequeno atraso agradável
    setTimeout(function() {
        playQuestionAudio();
    }, 280);
}

function playQuestionAudio() {
    if (currentIdx >= questions.length) return;
    var btn = document.getElementById('btnExerciseAudio');
    if (btn) btn.classList.add('speaking');

    var q = questions[currentIdx];
    speak(q.speechAudio, function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function playHelpExercise() {
    if (currentIdx >= questions.length) return;
    var btn = document.getElementById('btnHelpExercise');
    if (btn) btn.classList.add('speaking');

    var q = questions[currentIdx];
    speak(q.helpText, function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function checkAnswer(selected) {
    if (answered) return;
    answered = true;

    var q = questions[currentIdx];
    var isCorrect = (selected === q.correctAnswer);

    // Desativa opções para evitar duplo clique
    document.querySelectorAll('#optionsContainer .btn-option').forEach(function(b) {
        b.disabled = true;
    });

    var selectedBtn = document.querySelector('#optionsContainer .btn-option[data-val="' + selected + '"]');
    if (selectedBtn) {
        selectedBtn.classList.add(isCorrect ? 'correct' : 'wrong');
    }

    if (!isCorrect) {
        var correctBtn = document.querySelector('#optionsContainer .btn-option[data-val="' + q.correctAnswer + '"]');
        if (correctBtn) correctBtn.classList.add('correct');
        errorLog.push({
            promptName: q.referenceName,
            chosen: selected,
            correct: q.correctAnswer
        });
    }

    var hitsEl = document.getElementById('hitsCount');
    var missesEl = document.getElementById('missesCount');

    if (isCorrect) {
        hits++;
        if (hitsEl) hitsEl.textContent = hits;

        var praises = ['Muito bem!', 'Parabéns!', 'Acertou!', 'Isso mesmo!'];
        var randomPraise = praises[Math.floor(Math.random() * praises.length)];
        showFeedback('success', randomPraise);
        speak(randomPraise);
        announceSR(randomPraise);
    } else {
        misses++;
        if (missesEl) missesEl.textContent = misses;

        var errSpeech = 'Vamos tentar novamente. A resposta era ' + q.correctAnswer + '.';
        showFeedback('error', 'Vamos tentar novamente.');
        speak(errSpeech);
        announceSR(errSpeech);
    }

    var isLast = (currentIdx >= TOTAL_QUESTIONS - 1);
    var nextLabel = isLast ? 'Ver resultado' : 'Próxima pergunta';
    var nextIcon = isLast ? 'fa-flag-checkered' : 'fa-arrow-right';

    setTimeout(function() {
        var fbArea = document.getElementById('feedbackArea');
        if (fbArea) {
            fbArea.innerHTML +=
                '<button class="btn-next" onclick="nextQuestion()" aria-label="' + nextLabel + '">' +
                '<i class="fas ' + nextIcon + '" aria-hidden="true"></i> ' + nextLabel + '</button>';
            var nb = document.querySelector('.btn-next');
            if (nb) nb.focus();
        }
    }, isCorrect ? 250 : 800);
}

function showFeedback(type, text) {
    var icon = type === 'success' ? 'fa-check-circle' : 'fa-redo';
    var fbArea = document.getElementById('feedbackArea');
    if (fbArea) {
        fbArea.innerHTML =
            '<div class="feedback-msg ' + type + '" role="alert">' +
            '<i class="fas ' + icon + '" aria-hidden="true"></i> ' + text + '</div>';
    }
}

function nextQuestion() {
    currentIdx++;
    if (currentIdx >= TOTAL_QUESTIONS) {
        showCompletion();
    } else {
        loadQuestion();
    }
}

function showCompletion() {
    var exCard = document.getElementById('exerciseCard');
    var compScreen = document.getElementById('completionScreen');
    var finalHitsEl = document.getElementById('finalHits');
    var finalMissesEl = document.getElementById('finalMisses');
    var finalTotalEl = document.getElementById('finalTotal');
    var progFill = document.getElementById('progressFill');

    if (exCard) exCard.style.display = 'none';
    if (compScreen) compScreen.classList.add('visible');
    if (finalHitsEl) finalHitsEl.textContent = hits;
    if (finalMissesEl) finalMissesEl.textContent = misses;
    if (finalTotalEl) finalTotalEl.textContent = TOTAL_QUESTIONS;
    if (progFill) progFill.style.width = '100%';

    var msg;
    if (hits === TOTAL_QUESTIONS) {
        msg = 'Perfeito! Você acertou todas as perguntas!';
    } else if (hits >= 6) {
        msg = 'Muito bom! Você está conhecendo bem as letras!';
    } else if (hits >= 4) {
        msg = 'Bom trabalho! Pratique mais um pouquinho!';
    } else {
        msg = 'Não desista! Cada vez que tentar, fica mais fácil!';
    }

    var compMsgEl = document.getElementById('completionMsg');
    if (compMsgEl) compMsgEl.textContent = msg;

    var errorSummaryEl = document.getElementById('errorSummary');
    var errorListEl = document.getElementById('errorList');
    if (errorListEl) errorListEl.innerHTML = '';

    if (errorLog.length > 0 && errorSummaryEl && errorListEl) {
        errorSummaryEl.style.display = 'block';
        errorLog.forEach(function(err) {
            var li = document.createElement('li');
            li.innerHTML = err.promptName +
                ' — você escolheu <span class="wrong-answer">' + err.chosen + '</span>' +
                ' <span class="arrow"><i class="fas fa-arrow-right" aria-hidden="true"></i></span> ' +
                'o correto é <span class="correct-answer">' + err.correct + '</span>';
            errorListEl.appendChild(li);
        });
    } else if (errorSummaryEl) {
        errorSummaryEl.style.display = 'none';
    }

    salvarProgressoLetras();

    speak('Parabéns! Você terminou as atividades! ' + msg);
    announceSR('Atividade concluída. ' + hits + ' acertos de ' + TOTAL_QUESTIONS + '. ' + msg);

    setTimeout(function() {
        var b = document.getElementById('btnSalvarEVerOutras');
        if (b) b.focus();
    }, 350);
}

function restartExercise() {
    initExercise();
    verificarLicaoConcluida();
}

// ============================================================================
// PERSISTÊNCIA DE PROGRESSO (LocalStorage + Supabase / AprendIDosAuth)
// ============================================================================
function salvarProgressoLetras() {
    var progData = {
        completed: true,
        score: hits,
        total: TOTAL_QUESTIONS,
        misses: misses,
        savedAt: new Date().toISOString()
    };

    var user = null;
    try {
        var userRaw = localStorage.getItem('aprendidos_usuario');
        if (userRaw) user = JSON.parse(userRaw);
    } catch(e) {}

    var userKey = (user && user.id) ? ('aprendidos_progresso_' + user.id) : null;
    var keys = [userKey, 'aprendidos_progresso', 'aprendidos_progresso_anon'].filter(Boolean);

    keys.forEach(function(k) {
        try {
            var curr = JSON.parse(localStorage.getItem(k) || '{}');
            curr['letras'] = progData;
            localStorage.setItem(k, JSON.stringify(curr));
        } catch(e) {}
    });

    if (typeof window !== 'undefined' && window.AprendIDosAuth && window.AprendIDosAuth.saveLessonProgress) {
        try {
            window.AprendIDosAuth.saveLessonProgress('letras', progData);
        } catch(e) {}
    }
}

function salvarEVerOutras(event) {
    if (event) event.preventDefault();
    var btn = document.getElementById('btnSalvarEVerOutras');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Salvando progresso...';
    }

    salvarProgressoLetras();

    setTimeout(function() {
        window.location.href = 'licoes.html';
    }, 300);
}

function verificarLicaoConcluida() {
    var isDone = false;
    var prevScore = null;
    var prevTotal = null;

    try {
        var user = null;
        try {
            var uRaw = localStorage.getItem('aprendidos_usuario');
            if (uRaw) user = JSON.parse(uRaw);
        } catch(e) {}

        var userKey = (user && user.id) ? ('aprendidos_progresso_' + user.id) : null;
        var keys = [userKey, 'aprendidos_progresso', 'aprendidos_progresso_anon'].filter(Boolean);

        for (var i = 0; i < keys.length; i++) {
            var raw = localStorage.getItem(keys[i]);
            if (raw) {
                var p = JSON.parse(raw);
                if (p && p.letras && p.letras.completed) {
                    isDone = true;
                    if (p.letras.score !== undefined) prevScore = p.letras.score;
                    if (p.letras.total !== undefined) prevTotal = p.letras.total;
                    break;
                }
            }
        }
    } catch(e) {}

    if (isDone) {
        var banner = document.getElementById('reviewBanner');
        var bannerText = document.getElementById('reviewBannerText');
        if (banner) {
            banner.style.display = 'flex';
            if (bannerText) {
                var scoreMsg = prevScore !== null ? ' com <strong>' + prevScore + ' de ' + prevTotal + ' acertos</strong>' : '';
                bannerText.innerHTML = 'Você já concluiu esta lição' + scoreMsg + '! Sinta-se à vontade para rever o alfabeto e praticar novamente quantas vezes desejar.';
            }
        }
    }
}

// ============================================================================
// ACESSIBILIDADE E MENU
// ============================================================================
function announceSR(text) {
    var el = document.getElementById('srAnnouncer');
    if (el) {
        el.textContent = '';
        setTimeout(function() { el.textContent = text; }, 60);
    }
}

function toggleMenu() {
    var menu = document.getElementById('mobileMenu');
    var btn = document.querySelector('.navbar-hamburger');
    if (menu && btn) {
        var isOpen = menu.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen);
    }
}

document.addEventListener('click', function(e) {
    var menu = document.getElementById('mobileMenu');
    var btn = document.querySelector('.navbar-hamburger');
    if (menu && btn && menu.classList.contains('open') &&
        !menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
    }
});

function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
}

// ============================================================================
// ILUSTRAÇÕES VETORIAIS (SVGs) DAS 26 LETRAS
// Desenhos claros, limpos, de alto contraste e reconhecimento imediato
// ============================================================================
function getSvgForLetter(letter) {
    var svgs = {
        A: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="40" cy="38" rx="28" ry="9" fill="#FFCCBC" stroke="#D84315" stroke-width="2.5"/><path d="M30 33 L40 14 L50 33" fill="#FFAB91" stroke="#D84315" stroke-width="2.5" stroke-linejoin="round"/><path d="M32 43 L40 58 L48 43" fill="#FFAB91" stroke="#D84315" stroke-width="2.5" stroke-linejoin="round"/><rect x="60" y="22" width="5" height="18" rx="2" fill="#FFAB91" stroke="#D84315" stroke-width="2"/><circle cx="22" cy="36" r="2.5" fill="#FFF3E0" stroke="#D84315" stroke-width="1.5"/><circle cx="34" cy="36" r="2.5" fill="#FFF3E0" stroke="#D84315" stroke-width="1.5"/><circle cx="46" cy="36" r="2.5" fill="#FFF3E0" stroke="#D84315" stroke-width="1.5"/></svg>',
        B: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="30" fill="#FFFFFF" stroke="#2E7D32" stroke-width="3"/><path d="M40 26 L48 33 L45 43 L35 43 L32 33 Z" fill="#2E7D32"/><path d="M40 26 L40 10 M48 33 L64 24 M45 43 L58 56 M35 43 L22 56 M32 33 L16 24" stroke="#2E7D32" stroke-width="2.5"/></svg>',
        C: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 40 L40 18 L64 40 Z" fill="#D84315" stroke="#BF360C" stroke-width="3" stroke-linejoin="round"/><rect x="22" y="38" width="36" height="30" rx="3" fill="#FFE0B2" stroke="#BF360C" stroke-width="3"/><rect x="34" y="48" width="12" height="20" rx="2" fill="#8D6E63" stroke="#5D4037" stroke-width="2"/><circle cx="42" cy="58" r="1.5" fill="#FFE082"/><rect x="44" y="42" width="10" height="10" rx="1" fill="#BBDEFB" stroke="#1565C0" stroke-width="1.5"/></svg>',
        D: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="15" width="50" height="50" rx="10" fill="#FFFFFF" stroke="#C2185B" stroke-width="3.5"/><circle cx="28" cy="28" r="4.5" fill="#C2185B"/><circle cx="52" cy="28" r="4.5" fill="#C2185B"/><circle cx="40" cy="40" r="4.5" fill="#C2185B"/><circle cx="28" cy="52" r="4.5" fill="#C2185B"/><circle cx="52" cy="52" r="4.5" fill="#C2185B"/></svg>',
        E: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M40 12 L48 30 L67 31 L52 43 L57 62 L40 50 L23 62 L28 43 L13 31 L32 30 Z" fill="#FBC02D" stroke="#F57F17" stroke-width="3" stroke-linejoin="round"/></svg>',
        F: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 25 L50 25 C62 25 65 38 48 40 L20 40 Z" fill="#CFD8DC" stroke="#455A64" stroke-width="2.5"/><rect x="10" y="27" width="16" height="11" rx="2" fill="#795548" stroke="#4E342E" stroke-width="2.5"/><circle cx="15" cy="32" r="1.5" fill="#FFF"/><circle cx="21" cy="32" r="1.5" fill="#FFF"/><path d="M22 55 L58 55" stroke="#B0BEC5" stroke-width="2" stroke-dasharray="3 3"/></svg>',
        G: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="44" r="24" fill="#FFE082" stroke="#F57C00" stroke-width="3"/><path d="M22 30 L30 14 L36 28 Z" fill="#FFA726" stroke="#F57C00" stroke-width="2.5"/><path d="M58 30 L50 14 L44 28 Z" fill="#FFA726" stroke="#F57C00" stroke-width="2.5"/><circle cx="32" cy="40" r="3.5" fill="#3E2723"/><circle cx="48" cy="40" r="3.5" fill="#3E2723"/><ellipse cx="40" cy="48" rx="3.5" ry="2.5" fill="#E91E63"/><path d="M37 50 Q40 55 43 50" stroke="#3E2723" stroke-width="2" fill="none"/><line x1="16" y1="44" x2="28" y2="46" stroke="#3E2723" stroke-width="1.8"/><line x1="16" y1="49" x2="28" y2="49" stroke="#3E2723" stroke-width="1.8"/><line x1="52" y1="46" x2="64" y2="44" stroke="#3E2723" stroke-width="1.8"/><line x1="52" y1="49" x2="64" y2="49" stroke="#3E2723" stroke-width="1.8"/></svg>',
        H: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 48 L25 68 L55 68 L60 48 Z" fill="#8D6E63" stroke="#4E342E" stroke-width="3"/><ellipse cx="40" cy="48" rx="20" ry="6" fill="#A1887F" stroke="#4E342E" stroke-width="2"/><path d="M40 48 C30 35 25 22 38 18 C45 25 41 38 40 48 Z" fill="#4CAF50" stroke="#2E7D32" stroke-width="2.5"/><path d="M40 48 C50 35 55 22 42 18 C35 25 39 38 40 48 Z" fill="#81C784" stroke="#2E7D32" stroke-width="2.5"/></svg>',
        I: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="40" cy="56" rx="26" ry="10" fill="#FFF59D" stroke="#FBC02D" stroke-width="2.5"/><path d="M40 56 Q38 38 42 24" stroke="#795548" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M42 24 Q30 14 20 20" stroke="#4CAF50" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M42 24 Q54 14 60 20" stroke="#4CAF50" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M42 24 Q42 10 38 8" stroke="#388E3C" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="64" cy="18" r="6" fill="#FDD835"/></svg>',
        J: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="18" y="16" width="44" height="48" rx="4" fill="#BBDEFB" stroke="#1565C0" stroke-width="3"/><line x1="40" y1="16" x2="40" y2="64" stroke="#1565C0" stroke-width="3"/><line x1="18" y1="40" x2="62" y2="40" stroke="#1565C0" stroke-width="3"/><rect x="14" y="62" width="52" height="6" rx="2" fill="#90CAF9" stroke="#1565C0" stroke-width="2"/><path d="M48 24 L56 32" stroke="#E3F2FD" stroke-width="2"/></svg>',
        K: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="28" fill="#81C784" stroke="#2E7D32" stroke-width="3"/><ellipse cx="40" cy="40" rx="16" ry="16" fill="#A5D6A7"/><circle cx="40" cy="40" r="6" fill="#FFF59D"/><circle cx="34" cy="34" r="1.5" fill="#1B5E20"/><circle cx="46" cy="34" r="1.5" fill="#1B5E20"/><circle cx="34" cy="46" r="1.5" fill="#1B5E20"/><circle cx="46" cy="46" r="1.5" fill="#1B5E20"/></svg>',
        L: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="24" y="24" width="32" height="44" rx="4" fill="#E3F2FD" stroke="#1976D2" stroke-width="3"/><rect x="22" y="18" width="36" height="8" rx="2" fill="#90CAF9" stroke="#1976D2" stroke-width="2.5"/><ellipse cx="40" cy="46" rx="10" ry="12" fill="#FFFFFF" stroke="#42A5F5" stroke-width="2"/><text x="40" y="52" font-family="Nunito, sans-serif" font-size="12" font-weight="900" fill="#1976D2" text-anchor="middle">LEITE</text></svg>',
        M: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="16" y="26" width="48" height="38" rx="6" fill="#8D6E63" stroke="#4E342E" stroke-width="3"/><path d="M32 26 L32 16 C32 14 48 14 48 16 L48 26" stroke="#4E342E" stroke-width="3" fill="none"/><line x1="28" y1="26" x2="28" y2="64" stroke="#4E342E" stroke-width="2.5"/><line x1="52" y1="26" x2="52" y2="64" stroke="#4E342E" stroke-width="2.5"/><rect x="37" y="42" width="6" height="6" rx="1" fill="#FFD54F" stroke="#4E342E" stroke-width="1.5"/></svg>',
        N: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 48 L22 66 L58 66 L68 48 Z" fill="#E53935" stroke="#B71C1C" stroke-width="3"/><rect x="30" y="28" width="20" height="20" fill="#FFFFFF" stroke="#455A64" stroke-width="2.5"/><rect x="36" y="14" width="8" height="14" fill="#FB8C00" stroke="#E65100" stroke-width="2"/><path d="M6 68 Q20 62 40 68 Q60 74 74 68" stroke="#1E88E5" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
        O: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="40" cy="42" rx="22" ry="28" fill="#FFF9C4" stroke="#FBC02D" stroke-width="3.5"/><ellipse cx="34" cy="32" rx="5" ry="8" fill="#FFFFFF" opacity="0.6"/></svg>',
        P: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="36" cy="48" rx="20" ry="14" fill="#FFEB3B" stroke="#F57F17" stroke-width="3"/><circle cx="50" cy="34" r="12" fill="#FFEB3B" stroke="#F57F17" stroke-width="3"/><path d="M58 34 L72 37 L58 42 Z" fill="#FF9800" stroke="#E65100" stroke-width="2"/><circle cx="52" cy="31" r="2.5" fill="#3E2723"/><path d="M10 64 Q26 58 46 64 Q66 70 76 64" stroke="#29B6F6" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
        Q: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 54 L66 54 L54 22 Z" fill="#FDD835" stroke="#F57F17" stroke-width="3" stroke-linejoin="round"/><ellipse cx="30" cy="44" rx="4" ry="4" fill="#FBC02D"/><ellipse cx="46" cy="42" rx="3.5" ry="3.5" fill="#FBC02D"/><ellipse cx="38" cy="32" rx="3" ry="3" fill="#FBC02D"/></svg>',
        R: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="40" cy="46" rx="20" ry="15" fill="#B0BEC5" stroke="#455A64" stroke-width="3"/><circle cx="28" cy="32" r="8" fill="#CFD8DC" stroke="#455A64" stroke-width="2.5"/><circle cx="46" cy="32" r="8" fill="#CFD8DC" stroke="#455A64" stroke-width="2.5"/><circle cx="34" cy="42" r="2.5" fill="#212121"/><ellipse cx="22" cy="48" rx="3" ry="2.5" fill="#E91E63"/><path d="M58 50 Q72 52 74 40" stroke="#455A64" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>',
        S: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="40" cy="48" rx="24" ry="18" fill="#81C784" stroke="#2E7D32" stroke-width="3"/><circle cx="28" cy="30" r="9" fill="#81C784" stroke="#2E7D32" stroke-width="3"/><circle cx="52" cy="30" r="9" fill="#81C784" stroke="#2E7D32" stroke-width="3"/><circle cx="28" cy="30" r="3.5" fill="#1B5E20"/><circle cx="52" cy="30" r="3.5" fill="#1B5E20"/><path d="M28 50 Q40 60 52 50" stroke="#1B5E20" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
        T: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 52 C18 28 62 28 62 52 Z" fill="#A1887F" stroke="#5D4037" stroke-width="3"/><path d="M30 36 C30 30 50 30 50 36" stroke="#4E342E" stroke-width="2" fill="none"/><path d="M24 44 C24 38 56 38 56 44" stroke="#4E342E" stroke-width="2" fill="none"/><ellipse cx="64" cy="48" rx="6" ry="4" fill="#A1887F" stroke="#5D4037" stroke-width="2"/><circle cx="65" cy="46" r="1.5" fill="#3E2723"/><path d="M16 52 L10 55" stroke="#5D4037" stroke-width="2.5" stroke-linecap="round"/></svg>',
        U: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M40 16 L40 24 M36 20 C42 16 46 20 50 18" stroke="#33691E" stroke-width="3" stroke-linecap="round"/><circle cx="34" cy="30" r="7" fill="#7B1FA2" stroke="#4A148C" stroke-width="2"/><circle cx="46" cy="30" r="7" fill="#7B1FA2" stroke="#4A148C" stroke-width="2"/><circle cx="28" cy="42" r="7" fill="#8E24AA" stroke="#4A148C" stroke-width="2"/><circle cx="40" cy="42" r="7" fill="#8E24AA" stroke="#4A148C" stroke-width="2"/><circle cx="52" cy="42" r="7" fill="#8E24AA" stroke="#4A148C" stroke-width="2"/><circle cx="34" cy="54" r="7" fill="#7B1FA2" stroke="#4A148C" stroke-width="2"/><circle cx="46" cy="54" r="7" fill="#7B1FA2" stroke="#4A148C" stroke-width="2"/><circle cx="40" cy="65" r="7" fill="#6A1B9A" stroke="#4A148C" stroke-width="2"/></svg>',
        V: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="40" cy="44" rx="22" ry="18" fill="#FFFFFF" stroke="#3E2723" stroke-width="3"/><ellipse cx="40" cy="52" rx="14" ry="10" fill="#FFCDD2" stroke="#E57373" stroke-width="2"/><circle cx="32" cy="36" r="3" fill="#3E2723"/><circle cx="48" cy="36" r="3" fill="#3E2723"/><path d="M22 26 L16 16 C16 16 26 22 24 28 Z" fill="#B0BEC5" stroke="#37474F" stroke-width="2"/><path d="M58 26 L64 16 C64 16 54 22 56 28 Z" fill="#B0BEC5" stroke="#37474F" stroke-width="2"/><circle cx="36" cy="52" r="1.5" fill="#C2185B"/><circle cx="44" cy="52" r="1.5" fill="#C2185B"/></svg>',
        W: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="18" y="24" width="44" height="32" rx="5" fill="#FFE082" stroke="#FF8F00" stroke-width="3"/><line x1="18" y1="34" x2="62" y2="34" stroke="#FFA000" stroke-width="1.8"/><line x1="18" y1="44" x2="62" y2="44" stroke="#FFA000" stroke-width="1.8"/><line x1="32" y1="24" x2="32" y2="56" stroke="#FFA000" stroke-width="1.8"/><line x1="48" y1="24" x2="48" y2="56" stroke="#FFA000" stroke-width="1.8"/></svg>',
        X: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="18" y="30" width="34" height="28" rx="4" fill="#FFFFFF" stroke="#4E342E" stroke-width="3"/><path d="M52 36 C60 36 62 48 52 50" stroke="#4E342E" stroke-width="3" fill="none"/><ellipse cx="35" cy="62" rx="24" ry="5" fill="#D7CCC8" stroke="#4E342E" stroke-width="2"/><path d="M26 22 Q29 16 26 12" stroke="#8D6E63" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M35 22 Q38 16 35 12" stroke="#8D6E63" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M44 22 Q47 16 44 12" stroke="#8D6E63" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
        Y: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="28" fill="#F8BBD0" stroke="#C2185B" stroke-width="3"/><circle cx="40" cy="28" r="5" fill="#880E4F"/><path d="M30 46 C34 38 46 38 50 46" stroke="#880E4F" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="28" cy="46" r="3" fill="#880E4F"/><circle cx="52" cy="46" r="3" fill="#880E4F"/></svg>',
        Z: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="26" fill="#FFFFFF" stroke="#212121" stroke-width="3"/><path d="M20 34 L32 37 M20 44 L34 44 M22 52 L36 49" stroke="#212121" stroke-width="3" stroke-linecap="round"/><path d="M60 34 L48 37 M60 44 L46 44 M58 52 L44 49" stroke="#212121" stroke-width="3" stroke-linecap="round"/><circle cx="34" cy="28" r="3" fill="#212121"/><circle cx="46" cy="28" r="3" fill="#212121"/></svg>'
    };

    return svgs[letter] || svgs.A;
}

// ============================================================================
// GERAÇÃO DINÂMICA DOS CARDS, FILTRAGEM E LEITURA GUIADA DO ALFABETO
// ============================================================================
var currentAlphabetFilter = 'all';
var autoplayActive = false;
var autoplayIndex = 0;
var autoplayTimer = null;

function renderAlphabetCards(filter) {
    filter = filter || currentAlphabetFilter || 'all';
    currentAlphabetFilter = filter;
    var grid = document.getElementById('lettersGrid');
    if (!grid) return;
    grid.innerHTML = '';

    var keys = Object.keys(alphabetData);
    keys.forEach(function(k) {
        var item = alphabetData[k];
        if (filter === 'vowels' && item.type !== 'vowel') return;
        if (filter === 'consonants' && item.type !== 'consonant') return;

        var isVowel = item.type === 'vowel';
        var typeLabel = isVowel ? 'Vogal' : 'Consoante';
        var card = document.createElement('div');
        card.className = 'letter-card';
        card.setAttribute('data-letter', k);
        card.setAttribute('data-type', item.type);
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', 'Letra ' + k + ' maiúscula e ' + item.lower + ' minúscula, de ' + item.word + '. É uma ' + typeLabel + '. Toque para abrir a cartilha ilustrada.');
        card.setAttribute('onclick', "abrirCartilha('" + k + "')");
        card.setAttribute('onkeydown', "if(event.key==='Enter'||event.key===' ')abrirCartilha('" + k + "')");

        var mediaHtml = item.hasCustomImage
            ? '<div class="letter-card-thumb-wrap" aria-hidden="true">' +
                '<img src="' + item.imageSrc + '" alt="" class="letter-card-thumb" loading="lazy">' +
              '</div>'
            : '<div class="letter-badge-icon" aria-hidden="true">' +
                '<i class="fas ' + item.icon + '"></i>' +
              '</div>';

        card.innerHTML =
            '<span class="letter-tag ' + item.type + '" aria-hidden="true">' + typeLabel + '</span>' +
            mediaHtml +
            '<div class="letter-letters" aria-hidden="true">' +
                '<span class="letter-upper">' + item.upper + '</span>' +
                '<span class="letter-lower">' + item.lower + '</span>' +
            '</div>' +
            '<div class="letter-word" aria-hidden="true">' +
                '<span class="highlight">' + item.upper + '</span>' +
                '<span class="letter-word-rest">de ' + item.word + '</span>' +
            '</div>' +
            '<div class="letter-cartilha-badge" aria-hidden="true">' +
                '<i class="fas fa-book-open"></i> <span>Ver Cartilha</span>' +
            '</div>';

        grid.appendChild(card);
    });
}

function filterAlphabet(type) {
    if (autoplayActive) stopAutoplay();
    document.querySelectorAll('.filter-tab').forEach(function(tab) {
        var isActive = tab.getAttribute('data-filter') === type;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    renderAlphabetCards(type);
    var label = type === 'all'
        ? 'Exibindo todas as 26 letras do alfabeto.'
        : type === 'vowels'
        ? 'Exibindo as 5 vogais: A, E, I, O, U.'
        : 'Exibindo as 21 consoantes do alfabeto.';
    announceSR(label);
}

function togglePlayAllLetters() {
    if (autoplayActive) {
        stopAutoplay();
    } else {
        startAutoplay();
    }
}

function startAutoplay() {
    autoplayActive = true;
    autoplayIndex = 0;
    var btn = document.getElementById('btnPlayAll');
    if (btn) {
        btn.classList.add('playing');
        btn.innerHTML = '<i class="fas fa-stop"></i> Parar Leitura';
        btn.setAttribute('aria-label', 'Parar leitura automática do alfabeto');
    }
    speak('Iniciando leitura guiada do alfabeto.', function() {
        if (!autoplayActive) return;
        setTimeout(playNextAutoplayLetter, 450);
    });
}

function stopAutoplay() {
    autoplayActive = false;
    if (autoplayTimer) { clearTimeout(autoplayTimer); autoplayTimer = null; }
    stopAllAudio();
    document.querySelectorAll('.letter-card.speaking').forEach(function(c) { c.classList.remove('speaking'); });
    var btn = document.getElementById('btnPlayAll');
    if (btn) {
        btn.classList.remove('playing');
        btn.innerHTML = '<i class="fas fa-play"></i> Ouvir o Alfabeto Completo';
        btn.setAttribute('aria-label', 'Ouvir o alfabeto completo de A até Z');
    }
}

function playNextAutoplayLetter() {
    if (!autoplayActive) return;
    var cards = document.querySelectorAll('.letter-card');
    if (autoplayIndex >= cards.length) {
        stopAutoplay();
        speak('Parabéns! Você ouviu todas as letras selecionadas.');
        return;
    }
    var card = cards[autoplayIndex];
    var letter = card.getAttribute('data-letter');
    var item = alphabetData[letter];
    if (!item) {
        autoplayIndex++;
        playNextAutoplayLetter();
        return;
    }

    document.querySelectorAll('.letter-card.speaking').forEach(function(c) { c.classList.remove('speaking'); });
    card.classList.add('speaking');
    try { card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch(e) {}

    speak(item.speech, function() {
        if (card) card.classList.remove('speaking');
        if (!autoplayActive) return;
        autoplayIndex++;
        autoplayTimer = setTimeout(playNextAutoplayLetter, 650);
    });
}

// ============================================================================
// VISOR INTERATIVO DA CARTILHA (ESTILO CAMINHO SUAVE)
// Desenvolvido com foco no idoso: letras grandes, áudio pausado e apoio visual.
// ============================================================================
var cartilhaKeys = Object.keys(alphabetData);
var cartilhaCurrentIndex = 0;
var lastFocusedElementBeforeModal = null;

function abrirCartilha(letter) {
    if (!letter) letter = 'A';
    var idx = cartilhaKeys.indexOf(letter.toUpperCase());
    if (idx === -1) idx = 0;
    cartilhaCurrentIndex = idx;

    lastFocusedElementBeforeModal = document.activeElement;

    var modal = document.getElementById('cartilhaModal');
    if (!modal) return;

    modal.removeAttribute('hidden');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    renderCartilhaCurrent();

    // Sincroniza parâmetro da URL sem recarregar a página (?letra=A)
    try {
        var url = new URL(window.location.href);
        url.searchParams.set('letra', cartilhaKeys[cartilhaCurrentIndex]);
        window.history.replaceState({ letra: cartilhaKeys[cartilhaCurrentIndex] }, '', url.toString());
    } catch (e) {}

    // Foca no botão de fechar para acessibilidade
    var closeBtn = modal.querySelector('.cartilha-btn-close');
    if (closeBtn) closeBtn.focus();
}

function fecharCartilha() {
    stopAllAudio();
    var modal = document.getElementById('cartilhaModal');
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';

    // Limpa parâmetro da URL de forma limpa
    try {
        var url = new URL(window.location.href);
        url.searchParams.delete('letra');
        window.history.replaceState({}, '', url.pathname);
    } catch (e) {}

    if (lastFocusedElementBeforeModal && typeof lastFocusedElementBeforeModal.focus === 'function') {
        lastFocusedElementBeforeModal.focus();
    }
}

function renderCartilhaCurrent() {
    var letter = cartilhaKeys[cartilhaCurrentIndex];
    var item = alphabetData[letter];
    if (!item) return;

    // Atualiza cabeçalho
    var title = document.getElementById('cartilhaModalTitle');
    if (title) title.textContent = 'Cartilha Ilustrada — Letra ' + letter;

    var badge = document.getElementById('cartilhaTipoLetra');
    if (badge) {
        badge.className = 'cartilha-badge ' + item.type;
        badge.textContent = item.type === 'vowel' ? 'Vogal' : 'Consoante';
    }

    // Atualiza imagem ou placeholder (defensivo com fallback automático)
    var img = document.getElementById('cartilhaImage');
    var placeholder = document.getElementById('cartilhaPlaceholder');
    var svgWrap = document.getElementById('cartilhaPlaceholderSvgWrap');
    var placeholderText = document.getElementById('cartilhaPlaceholderText');

    if (item.hasCustomImage) {
        if (img) {
            img.style.display = 'block';
            img.src = item.imageSrc;
            img.alt = 'Página da Cartilha Caminho Suave da letra ' + letter + ' de ' + item.word;
            img.onerror = function() {
                img.style.display = 'none';
                if (placeholder) {
                    placeholder.style.display = 'flex';
                    if (svgWrap) svgWrap.innerHTML = getSvgForLetter(letter);
                    if (placeholderText) placeholderText.textContent = item.word + ' (Letra ' + letter + ')';
                }
            };
        }
        if (placeholder) placeholder.style.display = 'none';
    } else {
        if (img) img.style.display = 'none';
        if (placeholder) {
            placeholder.style.display = 'flex';
            if (svgWrap) svgWrap.innerHTML = getSvgForLetter(letter);
            if (placeholderText) placeholderText.textContent = item.word + ' (Letra ' + letter + ')';
        }
    }

    // Letras gigantes e palavra
    var bigUpper = document.getElementById('cartilhaBigUpper');
    if (bigUpper) bigUpper.textContent = item.upper;

    var bigLower = document.getElementById('cartilhaBigLower');
    if (bigLower) bigLower.textContent = item.lower;

    var wordTag = document.getElementById('cartilhaWordTag');
    if (wordTag) wordTag.textContent = item.word;

    // Frase da lição
    var phraseQuote = document.getElementById('cartilhaPhraseText');
    if (phraseQuote) phraseQuote.textContent = '"' + item.phrase + '"';

    // Grid de palavras da lição
    var wordsGrid = document.getElementById('cartilhaWordsGrid');
    if (wordsGrid) {
        wordsGrid.innerHTML = '';
        if (item.words && item.words.length > 0) {
            item.words.forEach(function(w) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'cartilha-word-pill';
                btn.setAttribute('aria-label', 'Ouvir a palavra ' + w);
                btn.innerHTML = '<i class="fas fa-volume-high" aria-hidden="true"></i> <span>' + w + '</span>';
                btn.onclick = function() { tocarPalavraCartilha(w, btn); };
                wordsGrid.appendChild(btn);
            });
        }
    }

    // Contador e botões de navegação
    var counter = document.getElementById('cartilhaCounter');
    if (counter) counter.textContent = 'Letra ' + (cartilhaCurrentIndex + 1) + ' de ' + cartilhaKeys.length;

    var btnPrev = document.getElementById('btnCartilhaPrev');
    if (btnPrev) {
        btnPrev.disabled = (cartilhaCurrentIndex === 0);
        btnPrev.style.opacity = (cartilhaCurrentIndex === 0) ? '0.45' : '1';
        btnPrev.style.cursor = (cartilhaCurrentIndex === 0) ? 'not-allowed' : 'pointer';
    }

    var btnNext = document.getElementById('btnCartilhaNext');
    if (btnNext) {
        btnNext.disabled = (cartilhaCurrentIndex === cartilhaKeys.length - 1);
        btnNext.style.opacity = (cartilhaCurrentIndex === cartilhaKeys.length - 1) ? '0.45' : '1';
        btnNext.style.cursor = (cartilhaCurrentIndex === cartilhaKeys.length - 1) ? 'not-allowed' : 'pointer';
    }

    // Atualiza URL
    try {
        var url = new URL(window.location.href);
        url.searchParams.set('letra', letter);
        window.history.replaceState({ letra: letter }, '', url.toString());
    } catch (e) {}

    // Anúncio acessível para leitores de tela
    announceSR('Exibindo cartilha da letra ' + letter + ' de ' + item.word);
}

function cartilhaProxima() {
    if (cartilhaCurrentIndex < cartilhaKeys.length - 1) {
        cartilhaCurrentIndex++;
        renderCartilhaCurrent();
        tocarFraseCartilha();
    }
}

function cartilhaAnterior() {
    if (cartilhaCurrentIndex > 0) {
        cartilhaCurrentIndex--;
        renderCartilhaCurrent();
        tocarFraseCartilha();
    }
}

function tocarFraseCartilha() {
    var letter = cartilhaKeys[cartilhaCurrentIndex];
    var item = alphabetData[letter];
    if (!item) return;

    var box = document.getElementById('cartilhaPhraseBox');
    if (box) box.classList.add('speaking');

    speak(item.phrase, function() {
        if (box) box.classList.remove('speaking');
    });
}

function tocarPalavraCartilha(palavra, btn) {
    if (btn) btn.classList.add('speaking');
    speak(palavra, function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function tocarAudioCompletoCartilha() {
    var letter = cartilhaKeys[cartilhaCurrentIndex];
    var item = alphabetData[letter];
    if (!item) return;

    var btn = document.getElementById('btnCartilhaAudioCompleto');
    if (btn) btn.classList.add('speaking');

    var texto = 'Letra ' + letter + '. ' + item.upper + ' de ' + item.word + '. ' + item.phrase;
    if (item.words && item.words.length > 0) {
        texto += '. Palavras com ' + letter + ': ' + item.words.slice(0, 6).join(', ') + '.';
    }

    speak(texto, function() {
        if (btn) btn.classList.remove('speaking');
    });
}

// Teclado para acessibilidade: Setas passam página e Esc fecha modal
document.addEventListener('keydown', function(e) {
    var modal = document.getElementById('cartilhaModal');
    if (!modal || modal.hasAttribute('hidden') || !modal.classList.contains('active')) return;

    if (e.key === 'Escape') {
        fecharCartilha();
    } else if (e.key === 'ArrowRight') {
        cartilhaProxima();
    } else if (e.key === 'ArrowLeft') {
        cartilhaAnterior();
    }
});

// Expõe no escopo global (window) para compatibilidade completa
window.speak = speak;
window.speakLetter = speakLetter;
window.playInstruction = playInstruction;
window.playQuestionAudio = playQuestionAudio;
window.playHelpExercise = playHelpExercise;
window.checkAnswer = checkAnswer;
window.nextQuestion = nextQuestion;
window.restartExercise = restartExercise;
window.salvarProgressoLetras = salvarProgressoLetras;
window.salvarEVerOutras = salvarEVerOutras;
window.toggleMenu = toggleMenu;
window.getSvgForLetter = getSvgForLetter;
window.renderAlphabetCards = renderAlphabetCards;
window.filterAlphabet = filterAlphabet;
window.togglePlayAllLetters = togglePlayAllLetters;
window.abrirCartilha = abrirCartilha;
window.fecharCartilha = fecharCartilha;
window.cartilhaProxima = cartilhaProxima;
window.cartilhaAnterior = cartilhaAnterior;
window.tocarFraseCartilha = tocarFraseCartilha;
window.tocarPalavraCartilha = tocarPalavraCartilha;
window.tocarAudioCompletoCartilha = tocarAudioCompletoCartilha;

// Inicialização automática ao carregar a página
function inicializarPaginaLetras() {
    renderAlphabetCards('all');
    initExercise();
    verificarLicaoConcluida();

    // Se houver parâmetro ?letra=X na URL, abre automaticamente a cartilha daquela letra
    try {
        var urlParams = new URLSearchParams(window.location.search);
        var paramLetra = urlParams.get('letra');
        if (paramLetra) {
            abrirCartilha(paramLetra);
        }
    } catch (e) {}
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarPaginaLetras);
} else {
    inicializarPaginaLetras();
}
