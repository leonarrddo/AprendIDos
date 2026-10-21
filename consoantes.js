/**
 * ============================================================================
 * AprendIDos - Consoantes e Sons
 * Arquivo: consoantes.js
 *
 * Sistema de Áudio Duplo (Google TTS + Web Speech API Nativo)
 * Desenvolvido especialmente para idosos em processo de alfabetização.
 * Voz calma, lenta (rate 0.82) e de alta clareza em Português do Brasil.
 * ============================================================================
 */

// ============================================================================
// DADOS DAS 21 CONSOANTES DO ALFABETO (Mesmas palavras e imagens de letras.js)
// ============================================================================
var consonantData = {
    B: {
        upper: 'B', lower: 'b', word: 'Bola', icon: 'fa-futbol',
        phrase: 'A bola é colorida.',
        words: ['bola', 'balão', 'bala', 'bico', 'boneca', 'baixo', 'berço', 'bule', 'bolo'],
        capaSrc: 'capaletras/Cartão educativo B de Bola.png',
        imageSrc: 'imagenscartilha/b.png', hasCustomImage: true,
        speech: 'Letra B. B de Bola. A bola é colorida.'
    },
    C: {
        upper: 'C', lower: 'c', word: 'Casa', icon: 'fa-house',
        phrase: 'A casa é o meu lar.',
        words: ['casa', 'copo', 'cavalo', 'cobra', 'cabelo', 'caneta', 'coelho', 'caderno', 'café'],
        capaSrc: 'capaletras/Cartaz educativo da letra C com casa.png',
        imageSrc: 'imagenscartilha/c.png', hasCustomImage: true,
        speech: 'Letra C. C de Casa. A casa é o meu lar.'
    },
    D: {
        upper: 'D', lower: 'd', word: 'Dado', icon: 'fa-dice',
        phrase: 'O dado é divertido.',
        words: ['dado', 'dedo', 'dia', 'doce', 'dente', 'dama', 'dinheiro', 'dúvida'],
        capaSrc: 'capaletras/Cartão Educativo da Letra D.png',
        imageSrc: 'imagenscartilha/d.png', hasCustomImage: true,
        speech: 'Letra D. D de Dado. O dado é divertido.'
    },
    F: {
        upper: 'F', lower: 'f', word: 'Faca', icon: 'fa-utensils',
        phrase: 'A faca é afiada.',
        words: ['faca', 'fada', 'fogo', 'fita', 'foca', 'fundo', 'família', 'futebol'],
        capaSrc: 'capaletras/Cartaz Educativo da Letra F com Faca.png',
        imageSrc: 'imagenscartilha/f.png', hasCustomImage: true,
        speech: 'Letra F. F de Faca. A faca é afiada.'
    },
    G: {
        upper: 'G', lower: 'g', word: 'Gato', icon: 'fa-cat',
        phrase: 'O gato dorme.',
        words: ['gato', 'garrafa', 'geladeira', 'gema', 'girafa', 'grama', 'galinha', 'geleia', 'gemada'],
        capaSrc: 'capaletras/Cartão educativo_ Letra G e gato.png',
        imageSrc: 'imagenscartilha/g.png', hasCustomImage: true,
        speech: 'Letra G. G de Gato. O gato dorme.'
    },
    H: {
        upper: 'H', lower: 'h', word: 'Homem', icon: 'fa-user',
        phrase: 'A letra H é de homem.',
        words: ['homem', 'hotel', 'história', 'hora', 'honra', 'helicóptero', 'hábito', 'harpa'],
        capaSrc: 'capaletras/Cartão do Alfabeto_ H de Homem.png',
        imageSrc: 'imagenscartilha/h.png', hasCustomImage: true,
        speech: 'Letra H. H de Homem. A letra H é de homem.'
    },
    J: {
        upper: 'J', lower: 'j', word: 'Jacaré', icon: 'fa-table-cells-large',
        phrase: 'O jacaré é grande.',
        words: ['jacaré', 'jogo', 'joaninha', 'janela', 'jardim', 'juntos', 'jaca', 'jeito'],
        capaSrc: 'capaletras/Cartão educativo da letra J com jacaré.png',
        imageSrc: 'imagenscartilha/j.png', hasCustomImage: true,
        speech: 'Letra J. J de Jacaré. O jacaré é grande.'
    },
    K: {
        upper: 'K', lower: 'k', word: 'Kiwi', icon: 'fa-lemon',
        phrase: 'O kiwi é gostoso.',
        words: ['kiwi', 'kart', 'ketchup', 'karatê'],
        capaSrc: 'capaletras/Cartaz Infantil da Letra K com Kiwi.png',
        imageSrc: 'capaletras/Cartaz Infantil da Letra K com Kiwi.png', hasCustomImage: true,
        speech: 'Letra K. K de Kiwi. O kiwi é gostoso.'
    },
    L: {
        upper: 'L', lower: 'l', word: 'Lua', icon: 'fa-moon',
        phrase: 'A lua é bonita.',
        words: ['lua', 'lápis', 'leão', 'lago', 'livro', 'lombo', 'lima', 'lata', 'leite'],
        capaSrc: 'capaletras/Cartaz Infantil da Letra L e da Lua.png',
        imageSrc: 'imagenscartilha/l.png', hasCustomImage: true,
        speech: 'Letra L. L de Lua. A lua é bonita.'
    },
    M: {
        upper: 'M', lower: 'm', word: 'Mulher', icon: 'fa-person-dress',
        phrase: 'A mulher é especial.',
        words: ['mala', 'mesa', 'macaco', 'mão', 'mar', 'melancia', 'mãe', 'meia', 'moto'],
        capaSrc: 'capaletras/Cartão educativo da letra M_ Mulher.png',
        imageSrc: 'imagenscartilha/m.png', hasCustomImage: true,
        speech: 'Letra M. M de Mulher. A mulher é especial.'
    },
    N: {
        upper: 'N', lower: 'n', word: 'Navio', icon: 'fa-ship',
        phrase: 'O navio é grande.',
        words: ['navio', 'nuvem', 'ninho', 'noite', 'norte', 'número', 'nada', 'nome', 'nariz'],
        capaSrc: 'capaletras/Cartão Educativo da Letra N com Navio.png',
        imageSrc: 'imagenscartilha/n.png', hasCustomImage: true,
        speech: 'Letra N. N de Navio. O navio é grande.'
    },
    P: {
        upper: 'P', lower: 'p', word: 'Pato', icon: 'fa-feather',
        phrase: 'O pato é simpático.',
        words: ['pato', 'pão', 'peixe', 'pipa', 'porta', 'pipoca', 'pijama', 'pote', 'pulga'],
        capaSrc: 'capaletras/Cartaz Educativo do Pato.png',
        imageSrc: 'imagenscartilha/p.png', hasCustomImage: true,
        speech: 'Letra P. P de Pato. O pato é simpático.'
    },
    Q: {
        upper: 'Q', lower: 'q', word: 'Queijo', icon: 'fa-cheese',
        phrase: 'O queijo é delicioso.',
        words: ['queijo', 'quadro', 'quase', 'quilo', 'quina', 'quente', 'quati', 'queixo', 'quinta'],
        capaSrc: 'capaletras/Cartão do Q de Queijo.png',
        imageSrc: 'imagenscartilha/q.png', hasCustomImage: true,
        speech: 'Letra Q. Q de Queijo. O queijo é delicioso.'
    },
    R: {
        upper: 'R', lower: 'r', word: 'Rato', icon: 'fa-paw',
        phrase: 'O rato é esperto.',
        words: ['rato', 'rede', 'rio', 'roda', 'rima', 'roupa', 'relógio', 'raposa', 'rua'],
        capaSrc: 'capaletras/Cartaz Educativo da Letra R com Rato.png',
        imageSrc: 'imagenscartilha/r.png', hasCustomImage: true,
        speech: 'Letra R. R de Rato. O rato é esperto.'
    },
    S: {
        upper: 'S', lower: 's', word: 'Sapo', icon: 'fa-frog',
        phrase: 'O sapo é saltitante.',
        words: ['sapo', 'sol', 'saia', 'sino', 'seda', 'sabonete', 'suco', 'sorvete'],
        capaSrc: 'capaletras/Cartão Educativo_ S de Sapo.png',
        imageSrc: 'imagenscartilha/s.png', hasCustomImage: true,
        speech: 'Letra S. S de Sapo. O sapo é saltitante.'
    },
    T: {
        upper: 'T', lower: 't', word: 'Tomate', icon: 'fa-apple-whole',
        phrase: 'O tomate é saudável.',
        words: ['tomate', 'tela', 'tigre', 'trem', 'tijolo', 'tesoura', 'touro', 'tarde', 'tapete'],
        capaSrc: 'capaletras/Cartaz Infantil da Letra T com Tomate.png',
        imageSrc: 'imagenscartilha/t.png', hasCustomImage: true,
        speech: 'Letra T. T de Tomate. O tomate é saudável.'
    },
    V: {
        upper: 'V', lower: 'v', word: 'Vaca', icon: 'fa-cow',
        phrase: 'A vaca é tranquila.',
        words: ['vaca', 'vela', 'vovô', 'viola', 'vento', 'vinho', 'violão', 'vassoura', 'vermelho'],
        capaSrc: 'capaletras/Cartaz educativo da letra V com vaca.png',
        imageSrc: 'imagenscartilha/v.png', hasCustomImage: true,
        speech: 'Letra V. V de Vaca. A vaca é tranquila.'
    },
    W: {
        upper: 'W', lower: 'w', word: 'WhatsApp', icon: 'fa-comment-dots',
        phrase: 'O WhatsApp é prático.',
        words: ['whatsapp', 'whisky', 'waffle', 'wi-fi', 'workshop', 'wolverine', 'walkie-talkie', 'web'],
        capaSrc: 'capaletras/Cartão Educativo da Letra W com WhatsApp.png',
        imageSrc: 'imagenscartilha/w.png', hasCustomImage: true,
        speech: 'Letra W. W de WhatsApp. O WhatsApp é prático.'
    },
    X: {
        upper: 'X', lower: 'x', word: 'Xadrez', icon: 'fa-chess-board',
        phrase: 'O xadrez é divertido.',
        words: ['xadrez', 'xícara', 'xilofone', 'xarope', 'xampu', 'xbox', 'xale', 'xerife', 'xenofobia'],
        capaSrc: 'imagenscartilha/x.png',
        imageSrc: 'imagenscartilha/x.png', hasCustomImage: true,
        speech: 'Letra X. X de Xadrez. O xadrez é divertido.'
    },
    Y: {
        upper: 'Y', lower: 'y', word: 'Yoga', icon: 'fa-heart',
        phrase: 'O yoga traz paz e saúde.',
        words: ['yoga', 'yakisoba', 'youtube'],
        capaSrc: '',
        imageSrc: '', hasCustomImage: false,
        speech: 'Letra Y. Y de Yoga. O yoga traz paz e saúde.'
    },
    Z: {
        upper: 'Z', lower: 'z', word: 'Zebra', icon: 'fa-horse',
        phrase: 'A zebra é linda.',
        words: ['zebra', 'zangão', 'zero', 'zíper', 'zumbi', 'zoológico', 'zente', 'zangado', 'zelador'],
        capaSrc: 'capaletras/Cartaz Educativo da Zebra e da Letra Z.png',
        imageSrc: 'imagenscartilha/z.png', hasCustomImage: true,
        speech: 'Letra Z. Z de Zebra. A zebra é linda.'
    }
};

var consonantKeys = Object.keys(consonantData);

// Banco de palavras para o exercício
var wordBank = [
    { word: 'Bola', consonant: 'B' }, { word: 'Boneca', consonant: 'B' }, { word: 'Bolo', consonant: 'B' }, { word: 'Bala', consonant: 'B' },
    { word: 'Casa', consonant: 'C' }, { word: 'Copo', consonant: 'C' }, { word: 'Cavalo', consonant: 'C' }, { word: 'Café', consonant: 'C' },
    { word: 'Dado', consonant: 'D' }, { word: 'Dedo', consonant: 'D' }, { word: 'Doce', consonant: 'D' }, { word: 'Dente', consonant: 'D' },
    { word: 'Faca', consonant: 'F' }, { word: 'Fada', consonant: 'F' }, { word: 'Fogo', consonant: 'F' }, { word: 'Fita', consonant: 'F' },
    { word: 'Gato', consonant: 'G' }, { word: 'Galinha', consonant: 'G' }, { word: 'Goiaba', consonant: 'G' }, { word: 'Gema', consonant: 'G' },
    { word: 'Homem', consonant: 'H' }, { word: 'Hotel', consonant: 'H' }, { word: 'Hora', consonant: 'H' }, { word: 'Horta', consonant: 'H' },
    { word: 'Jacaré', consonant: 'J' }, { word: 'Janela', consonant: 'J' }, { word: 'Jogo', consonant: 'J' }, { word: 'Jardim', consonant: 'J' },
    { word: 'Kiwi', consonant: 'K' }, { word: 'Kart', consonant: 'K' }, { word: 'Ketchup', consonant: 'K' },
    { word: 'Lua', consonant: 'L' }, { word: 'Lápis', consonant: 'L' }, { word: 'Livro', consonant: 'L' }, { word: 'Leite', consonant: 'L' },
    { word: 'Mulher', consonant: 'M' }, { word: 'Mala', consonant: 'M' }, { word: 'Mesa', consonant: 'M' }, { word: 'Macaco', consonant: 'M' },
    { word: 'Navio', consonant: 'N' }, { word: 'Nuvem', consonant: 'N' }, { word: 'Ninho', consonant: 'N' }, { word: 'Noite', consonant: 'N' },
    { word: 'Pato', consonant: 'P' }, { word: 'Pão', consonant: 'P' }, { word: 'Peixe', consonant: 'P' }, { word: 'Pipa', consonant: 'P' },
    { word: 'Queijo', consonant: 'Q' }, { word: 'Quadro', consonant: 'Q' }, { word: 'Quilo', consonant: 'Q' }, { word: 'Quente', consonant: 'Q' },
    { word: 'Rato', consonant: 'R' }, { word: 'Rede', consonant: 'R' }, { word: 'Rio', consonant: 'R' }, { word: 'Roda', consonant: 'R' },
    { word: 'Sapo', consonant: 'S' }, { word: 'Sol', consonant: 'S' }, { word: 'Saia', consonant: 'S' }, { word: 'Sino', consonant: 'S' },
    { word: 'Tomate', consonant: 'T' }, { word: 'Tela', consonant: 'T' }, { word: 'Tigre', consonant: 'T' }, { word: 'Tijolo', consonant: 'T' },
    { word: 'Vaca', consonant: 'V' }, { word: 'Vela', consonant: 'V' }, { word: 'Viola', consonant: 'V' }, { word: 'Vento', consonant: 'V' },
    { word: 'WhatsApp', consonant: 'W' }, { word: 'Waffle', consonant: 'W' }, { word: 'Wi-fi', consonant: 'W' },
    { word: 'Xadrez', consonant: 'X' }, { word: 'Xícara', consonant: 'X' }, { word: 'Xarope', consonant: 'X' }, { word: 'Xale', consonant: 'X' },
    { word: 'Yoga', consonant: 'Y' }, { word: 'Yakisoba', consonant: 'Y' },
    { word: 'Zebra', consonant: 'Z' }, { word: 'Zero', consonant: 'Z' }, { word: 'Zíper', consonant: 'Z' }, { word: 'Zoológico', consonant: 'Z' }
];

// ============================================================================
// SISTEMA DE ÁUDIO DUPLO (Google TTS + Web Speech API Nativo)
// ============================================================================
var currentAudio = null;
var ptVoice = null;

function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    var v = window.speechSynthesis.getVoices();
    ptVoice = v.find(function(x) {
        return x.lang === 'pt-BR' || x.lang === 'pt_BR' || x.lang.startsWith('pt');
    }) || null;
}
if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
}

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
        } catch (e) {}
        currentAudio = null;
    }
    if ('speechSynthesis' in window) {
        try {
            window.speechSynthesis.cancel();
        } catch (e) {}
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
        var googleTtsUrl = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=pt-BR&client=tw-ob&q=' + encodeURIComponent(text);
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

        audio.src = googleTtsUrl;
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
    u.rate = 0.82; // Fala calma para idosos
    u.pitch = 1.0;
    u.volume = 1.0;

    if (!ptVoice) loadVoices();
    if (ptVoice) u.voice = ptVoice;

    u.onend = function() {
        if (gen !== undefined && gen !== speechGeneration) return;
        document.querySelectorAll('.speaking').forEach(function(el) { el.classList.remove('speaking'); });
        if (onEnd) onEnd();
    };

    u.onerror = function() {
        if (gen !== undefined && gen !== speechGeneration) return;
        document.querySelectorAll('.speaking').forEach(function(el) { el.classList.remove('speaking'); });
        if (onEnd) onEnd();
    };

    try {
        window.speechSynthesis.speak(u);
    } catch (e) {
        if (onEnd) onEnd();
    }
}

// ============================================================================
// VETORES SVG DE APOIO / FALLBACK
// ============================================================================
function getSvgForLetter(letter) {
    var svgs = {
        B: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="30" fill="#FFFFFF" stroke="#2E7D32" stroke-width="3"/><path d="M40 26 L48 33 L45 43 L35 43 L32 33 Z" fill="#2E7D32"/><path d="M40 26 L40 10 M48 33 L64 24 M45 43 L58 56 M35 43 L22 56 M32 33 L16 24" stroke="#2E7D32" stroke-width="2.5"/></svg>',
        C: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 40 L40 18 L64 40 Z" fill="#D84315" stroke="#BF360C" stroke-width="3" stroke-linejoin="round"/><rect x="22" y="38" width="36" height="30" rx="3" fill="#FFE0B2" stroke="#BF360C" stroke-width="3"/><rect x="34" y="48" width="12" height="20" rx="2" fill="#8D6E63" stroke="#5D4037" stroke-width="2"/><circle cx="42" cy="58" r="1.5" fill="#FFE082"/><rect x="44" y="42" width="10" height="10" rx="1" fill="#BBDEFB" stroke="#1565C0" stroke-width="1.5"/></svg>',
        D: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="15" width="50" height="50" rx="10" fill="#FFFFFF" stroke="#C2185B" stroke-width="3.5"/><circle cx="28" cy="28" r="4.5" fill="#C2185B"/><circle cx="52" cy="28" r="4.5" fill="#C2185B"/><circle cx="40" cy="40" r="4.5" fill="#C2185B"/><circle cx="28" cy="52" r="4.5" fill="#C2185B"/><circle cx="52" cy="52" r="4.5" fill="#C2185B"/></svg>',
        F: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 25 L50 25 C62 25 65 38 48 40 L20 40 Z" fill="#CFD8DC" stroke="#455A64" stroke-width="2.5"/><rect x="10" y="27" width="16" height="11" rx="2" fill="#795548" stroke="#4E342E" stroke-width="2.5"/><circle cx="15" cy="32" r="1.5" fill="#FFF"/><circle cx="21" cy="32" r="1.5" fill="#FFF"/></svg>',
        G: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="44" r="24" fill="#FFE082" stroke="#F57C00" stroke-width="3"/><path d="M22 30 L30 14 L36 28 Z" fill="#FFA726" stroke="#F57C00" stroke-width="2.5"/><path d="M58 30 L50 14 L44 28 Z" fill="#FFA726" stroke="#F57C00" stroke-width="2.5"/><circle cx="32" cy="40" r="3.5" fill="#3E2723"/><circle cx="48" cy="40" r="3.5" fill="#3E2723"/><ellipse cx="40" cy="48" rx="3.5" ry="2.5" fill="#E91E63"/></svg>',
        H: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="32" r="16" fill="#FFE0B2" stroke="#5D4037" stroke-width="3"/><path d="M24 64 C24 50 56 50 56 64" fill="#2E7D32" stroke="#1B5E20" stroke-width="3"/></svg>',
        J: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="40" cy="45" rx="30" ry="15" fill="#66BB6A" stroke="#2E7D32" stroke-width="3"/><circle cx="28" cy="36" r="4" fill="#1B5E20"/><circle cx="52" cy="36" r="4" fill="#1B5E20"/></svg>',
        K: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="28" fill="#81C784" stroke="#2E7D32" stroke-width="3"/><ellipse cx="40" cy="40" rx="16" ry="16" fill="#A5D6A7"/><circle cx="40" cy="40" r="6" fill="#FFF59D"/><circle cx="34" cy="34" r="1.5" fill="#1B5E20"/><circle cx="46" cy="34" r="1.5" fill="#1B5E20"/><circle cx="34" cy="46" r="1.5" fill="#1B5E20"/><circle cx="46" cy="46" r="1.5" fill="#1B5E20"/></svg>',
        L: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M48 20 C34 20 24 30 24 44 C24 58 34 68 48 68 C38 64 32 54 32 44 C32 34 38 24 48 20 Z" fill="#FDD835" stroke="#F57F17" stroke-width="3"/></svg>',
        M: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="30" r="14" fill="#FFE0B2" stroke="#5D4037" stroke-width="2.5"/><path d="M26 64 C26 48 54 48 54 64" fill="#C2185B" stroke="#880E4F" stroke-width="2.5"/></svg>',
        N: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 48 L22 66 L58 66 L68 48 Z" fill="#E53935" stroke="#B71C1C" stroke-width="3"/><rect x="30" y="28" width="20" height="20" fill="#FFFFFF" stroke="#455A64" stroke-width="2.5"/></svg>',
        P: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="36" cy="48" rx="20" ry="14" fill="#FFEB3B" stroke="#F57F17" stroke-width="3"/><circle cx="50" cy="34" r="12" fill="#FFEB3B" stroke="#F57F17" stroke-width="3"/><path d="M58 34 L72 37 L58 42 Z" fill="#FF9800" stroke="#E65100" stroke-width="2"/></svg>',
        Q: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 54 L66 54 L54 22 Z" fill="#FDD835" stroke="#F57F17" stroke-width="3" stroke-linejoin="round"/><ellipse cx="30" cy="44" rx="4" ry="4" fill="#FBC02D"/><ellipse cx="46" cy="42" rx="3.5" ry="3.5" fill="#FBC02D"/></svg>',
        R: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="40" cy="46" rx="20" ry="15" fill="#B0BEC5" stroke="#455A64" stroke-width="3"/><circle cx="28" cy="32" r="8" fill="#CFD8DC" stroke="#455A64" stroke-width="2.5"/><circle cx="46" cy="32" r="8" fill="#CFD8DC" stroke="#455A64" stroke-width="2.5"/></svg>',
        S: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="40" cy="48" rx="24" ry="18" fill="#81C784" stroke="#2E7D32" stroke-width="3"/><circle cx="28" cy="30" r="9" fill="#81C784" stroke="#2E7D32" stroke-width="3"/><circle cx="52" cy="30" r="9" fill="#81C784" stroke="#2E7D32" stroke-width="3"/></svg>',
        T: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="44" r="24" fill="#E53935" stroke="#C62828" stroke-width="3"/><path d="M38 18 Q40 24 40 26 M34 22 Q40 24 46 22" stroke="#2E7D32" stroke-width="3.5" stroke-linecap="round"/></svg>',
        V: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="40" cy="44" rx="22" ry="18" fill="#FFFFFF" stroke="#3E2723" stroke-width="3"/><ellipse cx="40" cy="52" rx="14" ry="10" fill="#FFCDD2" stroke="#E57373" stroke-width="2"/></svg>',
        W: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="28" fill="#25D366" stroke="#128C7E" stroke-width="3"/><path d="M30 42 C32 46 36 50 40 50 C44 50 48 46 50 42" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
        X: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="20" width="40" height="40" rx="4" fill="#FFFFFF" stroke="#3E2723" stroke-width="3"/><rect x="20" y="20" width="20" height="20" fill="#3E2723"/><rect x="40" y="40" width="20" height="20" fill="#3E2723"/></svg>',
        Y: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="28" fill="#F8BBD0" stroke="#C2185B" stroke-width="3"/><circle cx="40" cy="28" r="5" fill="#880E4F"/><path d="M30 46 C34 38 46 38 50 46" stroke="#880E4F" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
        Z: '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="26" fill="#FFFFFF" stroke="#212121" stroke-width="3"/><path d="M20 34 L32 37 M20 44 L34 44 M22 52 L36 49" stroke="#212121" stroke-width="3" stroke-linecap="round"/><path d="M60 34 L48 37 M60 44 L46 44 M58 52 L44 49" stroke="#212121" stroke-width="3" stroke-linecap="round"/></svg>'
    };
    return svgs[letter] || svgs.B;
}

// ============================================================================
// RENDERIZAÇÃO DOS CARDS DAS CONSOANTES NA GRADE (LETRA + FOTO LADO A LADO)
// ============================================================================
function renderConsonantCards() {
    var grid = document.getElementById('consonantsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    consonantKeys.forEach(function(k) {
        var item = consonantData[k];
        var card = document.createElement('div');
        card.className = 'consonant-card';
        card.setAttribute('data-consonant', k);
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', 'Letra ' + k + ' maiúscula e ' + item.lower + ' minúscula, de ' + item.word + '. Toque para abrir a cartilha ilustrada.');
        card.setAttribute('onclick', "abrirCartilha('" + k + "')");
        card.setAttribute('onkeydown', "if(event.key==='Enter'||event.key===' ')abrirCartilha('" + k + "')");

        var thumbSrc = item.capaSrc || (item.hasCustomImage ? item.imageSrc : null);
        var mediaHtml = thumbSrc
            ? '<div class="consonant-card-thumb-wrap" aria-hidden="true">' +
                '<img src="' + thumbSrc + '" alt="' + item.word + '" class="consonant-card-thumb" loading="lazy" onerror="this.parentElement.innerHTML=\'<i class=\\\'fas ' + item.icon + '\\\'></i>\'">' +
              '</div>'
            : '<div class="consonant-badge-icon" aria-hidden="true">' +
                '<i class="fas ' + item.icon + '"></i>' +
              '</div>';

        // Cabeçalho lado a lado: Letra grande e a foto da palavra
        card.innerHTML =
            '<div class="consonant-card-header" aria-hidden="true">' +
                '<div class="consonant-letters">' +
                    '<span class="letter-upper">' + item.upper + '</span>' +
                    '<span class="letter-lower">' + item.lower + '</span>' +
                '</div>' +
                mediaHtml +
            '</div>' +
            '<div class="consonant-word" aria-hidden="true">' +
                '<span class="highlight">' + item.upper + '</span> de ' + item.word +
            '</div>' +
            '<div class="consonant-cartilha-badge" aria-hidden="true">' +
                '<i class="fas fa-book-open"></i> <span>Ver Lição</span>' +
            '</div>';

        grid.appendChild(card);
    });
}

// ============================================================================
// VISOR INTERATIVO DA CARTILHA (MODAL ESTILO CAMINHO SUAVE)
// ============================================================================
var cartilhaCurrentIndex = 0;
var lastFocusedElementBeforeModal = null;

function abrirCartilha(letter) {
    if (!letter) letter = consonantKeys[0];
    var idx = consonantKeys.indexOf(letter.toUpperCase());
    if (idx === -1) idx = 0;
    cartilhaCurrentIndex = idx;

    lastFocusedElementBeforeModal = document.activeElement;

    var modal = document.getElementById('cartilhaModal');
    if (!modal) return;

    modal.removeAttribute('hidden');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    renderCartilhaCurrent();

    var closeBtn = modal.querySelector('.cartilha-btn-close');
    if (closeBtn) closeBtn.focus();

    // Toca a frase ao abrir para uma experiência agradável
    setTimeout(tocarFraseCartilha, 350);
}

function fecharCartilha() {
    stopAllAudio();
    var modal = document.getElementById('cartilhaModal');
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';

    if (lastFocusedElementBeforeModal && typeof lastFocusedElementBeforeModal.focus === 'function') {
        lastFocusedElementBeforeModal.focus();
    }
}

function renderCartilhaCurrent() {
    var letter = consonantKeys[cartilhaCurrentIndex];
    var item = consonantData[letter];
    if (!item) return;

    // Cabeçalho
    var title = document.getElementById('cartilhaModalTitle');
    if (title) title.textContent = 'Cartilha Ilustrada — Consoante ' + letter;

    // Imagem da cartilha
    var img = document.getElementById('cartilhaImage');
    var placeholder = document.getElementById('cartilhaPlaceholder');
    var svgWrap = document.getElementById('cartilhaPlaceholderSvgWrap');
    var placeholderText = document.getElementById('cartilhaPlaceholderText');

    if (item.hasCustomImage) {
        if (img) {
            img.style.display = 'block';
            img.src = item.imageSrc;
            img.alt = 'Página da cartilha da consoante ' + letter + ' de ' + item.word;
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

    // Letras e Palavra
    var bigUpper = document.getElementById('cartilhaBigUpper');
    if (bigUpper) bigUpper.textContent = item.upper;

    var bigLower = document.getElementById('cartilhaBigLower');
    if (bigLower) bigLower.textContent = item.lower;

    var wordTag = document.getElementById('cartilhaWordTag');
    if (wordTag) wordTag.textContent = item.word;

    // Frase da lição
    var phraseText = document.getElementById('cartilhaPhraseText');
    if (phraseText) phraseText.textContent = '"' + item.phrase + '"';

    // Lista de palavras
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

    // Navegação e contador
    var counter = document.getElementById('cartilhaCounter');
    if (counter) counter.textContent = 'Consoante ' + (cartilhaCurrentIndex + 1) + ' de ' + consonantKeys.length;

    var btnPrev = document.getElementById('btnCartilhaPrev');
    if (btnPrev) {
        btnPrev.disabled = (cartilhaCurrentIndex === 0);
        btnPrev.style.opacity = (cartilhaCurrentIndex === 0) ? '0.45' : '1';
        btnPrev.style.cursor = (cartilhaCurrentIndex === 0) ? 'not-allowed' : 'pointer';
    }

    var btnNext = document.getElementById('btnCartilhaNext');
    if (btnNext) {
        btnNext.disabled = (cartilhaCurrentIndex === consonantKeys.length - 1);
        btnNext.style.opacity = (cartilhaCurrentIndex === consonantKeys.length - 1) ? '0.45' : '1';
        btnNext.style.cursor = (cartilhaCurrentIndex === consonantKeys.length - 1) ? 'not-allowed' : 'pointer';
    }

    announceSR('Exibindo cartilha da consoante ' + letter + ' de ' + item.word);
}

function cartilhaProxima() {
    if (cartilhaCurrentIndex < consonantKeys.length - 1) {
        cartilhaCurrentIndex++;
        renderCartilhaCurrent();
        setTimeout(tocarFraseCartilha, 250);
    }
}

function cartilhaAnterior() {
    if (cartilhaCurrentIndex > 0) {
        cartilhaCurrentIndex--;
        renderCartilhaCurrent();
        setTimeout(tocarFraseCartilha, 250);
    }
}

function tocarAudioCompletoCartilha() {
    var letter = consonantKeys[cartilhaCurrentIndex];
    var item = consonantData[letter];
    if (!item) return;

    var btn = document.getElementById('btnCartilhaAudioCompleto');
    if (btn) btn.classList.add('speaking');
    var phraseBox = document.getElementById('cartilhaPhraseBox');
    if (phraseBox) phraseBox.classList.add('speaking');

    speak(item.speech, function() {
        if (btn) btn.classList.remove('speaking');
        if (phraseBox) phraseBox.classList.remove('speaking');
    });
}

function tocarFraseCartilha() {
    var letter = consonantKeys[cartilhaCurrentIndex];
    var item = consonantData[letter];
    if (!item) return;

    var phraseBox = document.getElementById('cartilhaPhraseBox');
    if (phraseBox) phraseBox.classList.add('speaking');

    speak(item.phrase, function() {
        if (phraseBox) phraseBox.classList.remove('speaking');
    });
}

function tocarPalavraCartilha(palavra, btn) {
    if (btn) btn.classList.add('speaking');
    speak(palavra, function() {
        if (btn) btn.classList.remove('speaking');
    });
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        var modal = document.getElementById('cartilhaModal');
        if (modal && modal.classList.contains('active')) fecharCartilha();
    }
});

function playInstruction() {
    var btn = document.getElementById('btnInstruction');
    if (btn) btn.classList.add('speaking');
    var text = 'Conheça as consoantes do alfabeto. Toque em cada cartão para ver a imagem da cartilha e ouvir o som.';
    speak(text, function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function announceSR(text) {
    var el = document.getElementById('srAnnouncer');
    if (el) {
        el.textContent = '';
        setTimeout(function() { el.textContent = text; }, 60);
    }
}

function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i];
        a[i] = a[j];
        a[j] = t;
    }
    return a;
}

// ============================================================================
// ATIVIDADE DIDÁTICA (EXERCÍCIO DE RECONHECIMENTO DE CONSOANTES)
// ============================================================================
var TOTAL = 10;
var questions = [], currentIdx = 0, hits = 0, misses = 0, answered = false, errorLog = [];

function getOptionsFor(correct) {
    var others = consonantKeys.filter(function(k) { return k !== correct; });
    return shuffle(shuffle(others).slice(0, 4).concat([correct]));
}

function initExercise() {
    questions = shuffle(wordBank.slice()).slice(0, TOTAL);
    currentIdx = 0;
    hits = 0;
    misses = 0;
    answered = false;
    errorLog = [];

    var h = document.getElementById('hitsCount'); if (h) h.textContent = '0';
    var m = document.getElementById('missesCount'); if (m) m.textContent = '0';

    var layout = document.getElementById('exerciseLayout');
    var comp = document.getElementById('completionScreen');
    if (layout) layout.style.display = '';
    if (comp) comp.classList.remove('visible');

    loadQuestion();
}

function loadQuestion() {
    answered = false;
    var q = questions[currentIdx];
    if (!q) return;

    var qWord = document.getElementById('questionWord');
    var pFill = document.getElementById('progressFill');
    var pBar = document.getElementById('progressBar');
    var pLabel = document.getElementById('progressLabel');
    var fbArea = document.getElementById('feedbackArea');
    var optCont = document.getElementById('optionsContainer');

    if (qWord) qWord.textContent = q.word;

    var pct = (currentIdx / TOTAL) * 100;
    if (pFill) pFill.style.width = pct + '%';
    if (pBar) pBar.setAttribute('aria-valuenow', Math.round(pct));
    if (pLabel) pLabel.textContent = 'Pergunta ' + (currentIdx + 1) + ' de ' + TOTAL;
    if (fbArea) fbArea.innerHTML = '';

    var opts = getOptionsFor(q.consonant);
    if (optCont) {
        optCont.innerHTML = '';
        opts.forEach(function(c) {
            var btn = document.createElement('button');
            btn.className = 'btn-option';
            btn.setAttribute('data-consonant', c);
            btn.setAttribute('aria-label', 'Letra ' + c + ' maiúscula e ' + c.toLowerCase() + ' minúscula');
            btn.innerHTML = '<span class="opt-upper">' + c + '</span><span class="opt-lower">' + c.toLowerCase() + '</span>';
            btn.onclick = function() { checkAnswer(c); };
            optCont.appendChild(btn);
        });
    }
}

function playQuestionAudio() {
    if (currentIdx >= questions.length) return;
    var q = questions[currentIdx];
    var btn = document.getElementById('btnExerciseAudio');
    if (btn) btn.classList.add('speaking');
    speak('Qual é a primeira consoante da palavra: ' + q.word + '?', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function playHelpExercise() {
    var btn = document.getElementById('btnHelpExercise');
    if (btn) btn.classList.add('speaking');
    speak('Escolha a primeira consoante da palavra que aparece na tela.', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function checkAnswer(selected) {
    if (answered) return;
    answered = true;
    var q = questions[currentIdx];
    var correct = selected === q.consonant;

    document.querySelectorAll('.btn-option').forEach(function(b) { b.disabled = true; });

    var selBtn = document.querySelector('.btn-option[data-consonant="' + selected + '"]');
    if (selBtn) selBtn.classList.add(correct ? 'correct' : 'wrong');

    if (!correct) {
        var corrBtn = document.querySelector('.btn-option[data-consonant="' + q.consonant + '"]');
        if (corrBtn) corrBtn.classList.add('correct');
        errorLog.push({ word: q.word, correct: q.consonant, chosen: selected });
    }

    if (correct) {
        hits++;
        var h = document.getElementById('hitsCount'); if (h) h.textContent = hits;
        showFeedback('success', 'Muito bem! A letra é ' + q.consonant + '!');
        speak('Muito bem!');
    } else {
        misses++;
        var ms = document.getElementById('missesCount'); if (ms) ms.textContent = misses;
        showFeedback('error', 'A letra correta é ' + q.consonant + '.');
        speak('A letra correta é ' + q.consonant + '.');
    }

    announceSR(correct ? 'Certo!' : 'A resposta correta era ' + q.consonant);

    var isLast = currentIdx >= TOTAL - 1;
    setTimeout(function() {
        var fb = document.getElementById('feedbackArea');
        if (fb) {
            fb.innerHTML += '<button class="btn-next" onclick="nextQuestion()" aria-label="' + (isLast ? 'Ver resultado' : 'Próxima pergunta') + '"><i class="fas ' + (isLast ? 'fa-flag-checkered' : 'fa-arrow-right') + '"></i> ' + (isLast ? 'Ver resultado' : 'Próxima') + '</button>';
            var nb = document.querySelector('.btn-next'); if (nb) nb.focus();
        }
    }, correct ? 250 : 850);
}

function showFeedback(type, msg) {
    var fb = document.getElementById('feedbackArea');
    if (fb) {
        fb.innerHTML = '<div class="feedback-msg ' + type + '" role="alert"><i class="fas ' + (type === 'success' ? 'fa-check-circle' : 'fa-redo') + '"></i> ' + msg + '</div>';
    }
}

function nextQuestion() {
    currentIdx++;
    if (currentIdx >= TOTAL) {
        showCompletion();
    } else {
        loadQuestion();
    }
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

    var msg = hits === TOTAL
        ? 'Perfeito! Você acertou todas as consoantes!'
        : hits >= 7
        ? 'Muito bom! Você está aprendendo muito bem!'
        : hits >= 5
        ? 'Bom trabalho! Continue praticando!'
        : 'Continue praticando com a cartilha!';

    var cm = document.getElementById('completionMsg'); if (cm) cm.textContent = msg;

    var errSum = document.getElementById('errorSummary');
    var errList = document.getElementById('errorList');
    if (errList) errList.innerHTML = '';

    if (errorLog.length > 0 && errSum && errList) {
        errSum.style.display = 'block';
        errorLog.forEach(function(e) {
            var li = document.createElement('li');
            li.innerHTML = e.word + ' — você escolheu <span class="wrong-answer">' + e.chosen + '</span>, o correto é: <span class="correct-answer">' + e.correct + '</span>';
            errList.appendChild(li);
        });
    } else if (errSum) {
        errSum.style.display = 'none';
    }

    salvarProgresso();
    speak('Parabéns! Você terminou! ' + msg);
}

// ============================================================================
// PERSISTÊNCIA DE PROGRESSO (LocalStorage + AprendIDosAuth)
// ============================================================================
function salvarProgresso() {
    var data = {
        completed: true,
        score: hits,
        total: TOTAL,
        misses: misses,
        savedAt: new Date().toISOString()
    };

    var user = null;
    try {
        var r = localStorage.getItem('aprendidos_usuario');
        if (r) user = JSON.parse(r);
    } catch (e) {}

    var uk = (user && user.id) ? ('aprendidos_progresso_' + user.id) : null;
    var keys = [uk, 'aprendidos_progresso', 'aprendidos_progresso_anon'].filter(Boolean);

    keys.forEach(function(k) {
        try {
            var c = JSON.parse(localStorage.getItem(k) || '{}');
            c['consoantes'] = data;
            localStorage.setItem(k, JSON.stringify(c));
        } catch (e) {}
    });

    if (typeof window !== 'undefined' && window.AprendIDosAuth && window.AprendIDosAuth.saveLessonProgress) {
        try {
            window.AprendIDosAuth.saveLessonProgress('consoantes', data);
        } catch (e) {}
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
    setTimeout(function() {
        window.location.href = 'licoes.html';
    }, 350);
}

function verificarLicaoConcluida() {
    var isDone = false;
    var prevScore = null;
    var prevTotal = TOTAL;

    try {
        var user = null;
        try {
            var r = localStorage.getItem('aprendidos_usuario');
            if (r) user = JSON.parse(r);
        } catch (e) {}

        var uk = (user && user.id) ? ('aprendidos_progresso_' + user.id) : null;
        var keys = [uk, 'aprendidos_progresso', 'aprendidos_progresso_anon'].filter(Boolean);

        for (var i = 0; i < keys.length; i++) {
            var raw = localStorage.getItem(keys[i]);
            if (raw) {
                var p = JSON.parse(raw);
                if (p && p.consoantes && p.consoantes.completed) {
                    isDone = true;
                    prevScore = p.consoantes.score;
                    prevTotal = p.consoantes.total || TOTAL;
                    break;
                }
            }
        }
    } catch (e) {}

    if (isDone) {
        var banner = document.getElementById('reviewBanner');
        var bt = document.getElementById('reviewBannerText');
        if (banner) {
            banner.style.display = 'flex';
            if (bt) {
                bt.innerHTML = 'Você já concluiu esta lição' + (prevScore !== null ? ' com <strong>' + prevScore + ' de ' + prevTotal + ' acertos</strong>' : '') + '! Sinta-se à vontade para praticar novamente.';
            }
        }
    }
}

function restartExercise() {
    initExercise();
    verificarLicaoConcluida();
}

function toggleMenu() {
    var menu = document.getElementById('mobileMenu');
    var btn = document.querySelector('.navbar-hamburger');
    if (menu && btn) {
        var open = menu.classList.toggle('open');
        btn.setAttribute('aria-expanded', open);
    }
}

document.addEventListener('click', function(e) {
    var menu = document.getElementById('mobileMenu');
    var btn = document.querySelector('.navbar-hamburger');
    if (menu && btn && menu.classList.contains('open') && !menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
    }
});

// Expondo métodos no window
window.speak = speak;
window.abrirCartilha = abrirCartilha;
window.fecharCartilha = fecharCartilha;
window.cartilhaProxima = cartilhaProxima;
window.cartilhaAnterior = cartilhaAnterior;
window.tocarAudioCompletoCartilha = tocarAudioCompletoCartilha;
window.tocarFraseCartilha = tocarFraseCartilha;
window.tocarPalavraCartilha = tocarPalavraCartilha;
window.playInstruction = playInstruction;
window.playQuestionAudio = playQuestionAudio;
window.playHelpExercise = playHelpExercise;
window.checkAnswer = checkAnswer;
window.nextQuestion = nextQuestion;
window.restartExercise = restartExercise;
window.salvarEVerOutras = salvarEVerOutras;
window.verificarLicaoConcluida = verificarLicaoConcluida;
window.toggleMenu = toggleMenu;
window.stopAllAudio = stopAllAudio;

// Inicialização segura
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        renderConsonantCards();
        initExercise();
        verificarLicaoConcluida();
    });
} else {
    renderConsonantCards();
    initExercise();
    verificarLicaoConcluida();
}
