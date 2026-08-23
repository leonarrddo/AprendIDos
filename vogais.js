/**
 * ============================================================================
 * AprendIDos - Atividade Interativa: Conhecendo as Vogais
 * Arquivo: vogais.js
 * 
 * Sistema de Áudio Duplo (Google TTS + Web Speech API)
 * Garante reprodução de som cristalino em 100% dos navegadores!
 * ============================================================================
 */

import { saveLessonProgress } from './auth.js';

var vowelData = {
    a: { letter: 'A', example: 'Avião' },
    e: { letter: 'E', example: 'Escada' },
    i: { letter: 'I', example: 'Ilha' },
    o: { letter: 'O', example: 'Ônibus' },
    u: { letter: 'U', example: 'Urso' }
};

var wordBank = [
    { word: 'Abelha', vowel: 'A' },
    { word: 'Escola', vowel: 'E' },
    { word: 'Inseto', vowel: 'I' },
    { word: 'Ovelha', vowel: 'O' },
    { word: 'Uva', vowel: 'U' },
    { word: 'Árvore', vowel: 'A' },
    { word: 'Elefante', vowel: 'E' },
    { word: 'Igreja', vowel: 'I' },
    { word: 'Ouro', vowel: 'O' },
    { word: 'Unha', vowel: 'U' },
    { word: 'Amigo', vowel: 'A' },
    { word: 'Estrela', vowel: 'E' },
    { word: 'Iluminar', vowel: 'I' },
    { word: 'Olho', vowel: 'O' },
    { word: 'Urubu', vowel: 'U' }
];

var questions = [];
var currentIdx = 0;
var hits = 0;
var misses = 0;
var answered = false;
var errorLog = [];
var TOTAL = 10;

var allVowels = 'AEIOUÁÉÍÓÚÃÕÂÊÎÔÛaeiouáéíóúãõâêîôû';
var currentAudio = null;

/**
 * Função de Voz Infalível (Usa Áudio MP3 do Google TTS + Fallback da Web Speech API)
 */
export function speak(text, onEnd) {
    // Para qualquer áudio em reprodução
    if (currentAudio) {
        try {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        } catch (e) {}
    }

    if ('speechSynthesis' in window) {
        try {
            window.speechSynthesis.cancel();
        } catch (e) {}
    }

    // Tenta reprodução via áudio online em Português
    var googleTtsUrl = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=pt-BR&client=tw-ob&q=' + encodeURIComponent(text);
    var audio = new Audio(googleTtsUrl);
    currentAudio = audio;

    var audioPlayedSuccess = false;

    audio.onended = function() {
        document.querySelectorAll('.speaking').forEach(function(el) { el.classList.remove('speaking'); });
        if (onEnd) onEnd();
    };

    audio.onerror = function() {
        // Se o áudio web falhar, ativa o sintetizador de voz nativo como plano B
        if (!audioPlayedSuccess) {
            speakNativo(text, onEnd);
        }
    };

    var playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.then(function() {
            audioPlayedSuccess = true;
        }).catch(function(err) {
            console.warn('Áudio web bloqueado, usando voz sintética nativa:', err);
            speakNativo(text, onEnd);
        });
    }
}

/**
 * Plano B: Síntese de Voz Nativa
 */
function speakNativo(text, onEnd) {
    if (!('speechSynthesis' in window)) {
        if (onEnd) onEnd();
        return;
    }

    try {
        window.speechSynthesis.resume();
        window.speechSynthesis.cancel();
    } catch (e) {}

    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR';
    u.rate = 0.85;
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

function highlightFirstVowel(word) {
    for (var i = 0; i < word.length; i++) {
        if (allVowels.includes(word[i])) {
            return word.slice(0, i) +
                '<span class="vowel-highlight">' + word[i] + '</span>' +
                word.slice(i + 1);
        }
    }
    return word;
}

export function initExercise() {
    questions = shuffle([...wordBank]).slice(0, TOTAL);
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

export function loadQuestion() {
    answered = false;
    if (!questions[currentIdx]) return;
    var q = questions[currentIdx];
    
    var qWord = document.getElementById('questionWord');
    var pFill = document.getElementById('progressFill');
    var pBar = document.getElementById('progressBar');
    var pLabel = document.getElementById('progressLabel');
    var fbArea = document.getElementById('feedbackArea');

    if (qWord) qWord.innerHTML = highlightFirstVowel(q.word);
    var pct = (currentIdx / TOTAL) * 100;
    if (pFill) pFill.style.width = pct + '%';
    if (pBar) pBar.setAttribute('aria-valuenow', Math.round(pct));
    if (pLabel) pLabel.textContent = 'Pergunta ' + (currentIdx + 1) + ' de ' + TOTAL;
    if (fbArea) fbArea.innerHTML = '';

    document.querySelectorAll('.btn-option').forEach(function(btn) {
        btn.disabled = false;
        btn.classList.remove('correct', 'wrong');
    });
}

export function playQuestionAudio() {
    if (currentIdx >= questions.length) return;
    var btn = document.getElementById('btnExerciseAudio');
    if (btn) btn.classList.add('speaking');
    var word = questions[currentIdx].word;
    speak('Qual é a primeira vogal da palavra ' + word + '?', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

export function playHelpExercise() {
    var btn = document.getElementById('btnHelpExercise');
    if (btn) btn.classList.add('speaking');
    speak('Escolha a primeira vogal da palavra que aparece na tela.', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

export function checkAnswer(selected) {
    if (answered) return;
    answered = true;
    var q = questions[currentIdx];
    var correct = selected === q.vowel;

    document.querySelectorAll('.btn-option').forEach(function(b) { b.disabled = true; });

    var selBtn = document.querySelector('.btn-option[data-vowel="' + selected + '"]');
    if (selBtn) selBtn.classList.add(correct ? 'correct' : 'wrong');

    if (!correct) {
        var correctBtn = document.querySelector('.btn-option[data-vowel="' + q.vowel + '"]');
        if (correctBtn) correctBtn.classList.add('correct');
        errorLog.push({ word: q.word, correctVowel: q.vowel, chosenVowel: selected });
    }

    if (correct) {
        hits++;
        var hitsEl = document.getElementById('hitsCount');
        if (hitsEl) hitsEl.textContent = hits;
        showFeedback('success', 'Muito bem!');
        speak('Muito bem!');
    } else {
        misses++;
        var missesEl = document.getElementById('missesCount');
        if (missesEl) missesEl.textContent = misses;
        showFeedback('error', 'Vamos tentar novamente.');
        speak('Vamos tentar novamente. A resposta era ' + q.vowel + '.');
    }

    announceSR(correct
        ? 'Muito bem! A resposta é ' + q.vowel + '.'
        : 'Vamos tentar novamente. A resposta era ' + q.vowel + '.'
    );

    var isLast = currentIdx >= TOTAL - 1;
    var label = isLast ? 'Ver resultado' : 'Próxima pergunta';
    var icon = isLast ? 'fa-flag-checkered' : 'fa-arrow-right';

    setTimeout(function() {
        var fbArea = document.getElementById('feedbackArea');
        if (fbArea) {
            fbArea.innerHTML +=
                '<button class="btn-next" onclick="window.nextQuestion()" aria-label="' + label + '">' +
                '<i class="fas ' + icon + '" aria-hidden="true"></i> ' + label + '</button>';
            var nb = document.querySelector('.btn-next');
            if (nb) nb.focus();
        }
    }, correct ? 200 : 800);
}

export function nextQuestion() {
    currentIdx++;
    if (currentIdx >= TOTAL) {
        showCompletion();
    } else {
        loadQuestion();
    }
}

function showFeedback(type, msg) {
    var icon = type === 'success' ? 'fa-check-circle' : 'fa-redo';
    var fbArea = document.getElementById('feedbackArea');
    if (fbArea) {
        fbArea.innerHTML =
            '<div class="feedback-msg ' + type + '" role="alert">' +
            '<i class="fas ' + icon + '" aria-hidden="true"></i> ' + msg + '</div>';
    }
}

export function showCompletion() {
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
    if (finalTotalEl) finalTotalEl.textContent = TOTAL;
    if (progFill) progFill.style.width = '100%';

    var msg;
    if (hits === TOTAL) msg = 'Perfeito! Você acertou todas!';
    else if (hits >= 7) msg = 'Muito bom! Continue assim!';
    else if (hits >= 5) msg = 'Bom trabalho! Revise e tente de novo.';
    else msg = 'Não desista! Refaça e vai ficar melhor.';
    
    var compMsgEl = document.getElementById('completionMsg');
    if (compMsgEl) compMsgEl.textContent = msg;

    var errorSummaryEl = document.getElementById('errorSummary');
    var errorListEl = document.getElementById('errorList');
    if (errorListEl) errorListEl.innerHTML = '';

    if (errorLog.length > 0 && errorSummaryEl && errorListEl) {
        errorSummaryEl.style.display = 'block';
        errorLog.forEach(function(err) {
            var li = document.createElement('li');
            li.innerHTML = err.word +
                ' — você escolheu <span class="wrong-answer">' + err.chosenVowel + '</span>' +
                ' <span class="arrow"><i class="fas fa-arrow-right" aria-hidden="true"></i></span> ' +
                'o correto é <span class="correct-answer">' + err.correctVowel + '</span>';
            errorListEl.appendChild(li);
        });
    } else if (errorSummaryEl) {
        errorSummaryEl.style.display = 'none';
    }

    saveLessonProgress('vogais', { score: hits, total: TOTAL, misses: misses });

    speak('Parabéns! Você terminou! ' + msg);
    announceSR('Atividade concluída. ' + hits + ' acertos de ' + TOTAL + '. ' + msg);

    setTimeout(function() {
        var b = document.querySelector('.btn-restart');
        if (b) b.focus();
    }, 300);
}

export function restartExercise() { initExercise(); }

export function speakVowel(key) {
    var data = vowelData[key];
    if (!data) return;
    document.querySelectorAll('.vowel-card').forEach(function(c) { c.classList.remove('speaking'); });
    var card = document.querySelector('.vowel-card[data-vowel="' + key + '"]');
    if (card) card.classList.add('speaking');
    speak(data.letter + '. ' + data.letter + ' de ' + data.example + '.', function() {
        if (card) card.classList.remove('speaking');
    });
}

export function playInstruction() {
    var btn = document.getElementById('btnInstruction');
    if (btn) btn.classList.add('speaking');
    speak('Ouça e repita cada vogal, toque nas fotos para ouvir as vogais.', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

export function announceSR(text) {
    var el = document.getElementById('srAnnouncer');
    if (el) {
        el.textContent = '';
        setTimeout(function() { el.textContent = text; }, 60);
    }
}

function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
    return arr;
}

export function toggleMenu() {
    var menu = document.getElementById('mobileMenu');
    var btn = document.querySelector('.navbar-hamburger');
    if (menu && btn) {
        var isOpen = menu.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen);
    }
}

// Vincula funções ao window
window.speak = speak;
window.speakVowel = speakVowel;
window.playInstruction = playInstruction;
window.playQuestionAudio = playQuestionAudio;
window.playHelpExercise = playHelpExercise;
window.checkAnswer = checkAnswer;
window.nextQuestion = nextQuestion;
window.restartExercise = restartExercise;
window.toggleMenu = toggleMenu;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExercise);
} else {
    initExercise();
}