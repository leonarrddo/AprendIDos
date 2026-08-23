
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

    function initExercise() {
        questions = shuffle([...wordBank]).slice(0, TOTAL);
        currentIdx = 0;
        hits = 0;
        misses = 0;
        answered = false;
        errorLog = [];
        document.getElementById('hitsCount').textContent = '0';
        document.getElementById('missesCount').textContent = '0';
        document.getElementById('exerciseCard').style.display = 'block';
        document.getElementById('completionScreen').classList.remove('visible');
        loadQuestion();
    }

    function loadQuestion() {
        answered = false;
        var q = questions[currentIdx];
        document.getElementById('questionWord').innerHTML = highlightFirstVowel(q.word);
        var pct = (currentIdx / TOTAL) * 100;
        document.getElementById('progressFill').style.width = pct + '%';
        document.getElementById('progressBar').setAttribute('aria-valuenow', Math.round(pct));
        document.getElementById('progressLabel').textContent = 'Pergunta ' + (currentIdx + 1) + ' de ' + TOTAL;
        document.getElementById('feedbackArea').innerHTML = '';
        document.querySelectorAll('.btn-option').forEach(function(btn) {
            btn.disabled = false;
            btn.classList.remove('correct', 'wrong');
        });
        setTimeout(function() { playQuestionAudio(); }, 350);
    }

    function playQuestionAudio() {
        if (currentIdx >= questions.length) return;
        var btn = document.getElementById('btnExerciseAudio');
        btn.classList.add('speaking');
        var word = questions[currentIdx].word;
        speak('Qual é a primeira vogal da palavra ' + word + '?', function() {
            btn.classList.remove('speaking');
        });
    }

    function playHelpExercise() {
        var btn = document.getElementById('btnHelpExercise');
        btn.classList.add('speaking');
        speak('Escolha a primeira vogal da palavra que aparece na tela.', function() {
            btn.classList.remove('speaking');
        });
    }

    function checkAnswer(selected) {
        if (answered) return;
        answered = true;
        var q = questions[currentIdx];
        var correct = selected === q.vowel;

        document.querySelectorAll('.btn-option').forEach(function(b) { b.disabled = true; });

        var selBtn = document.querySelector('.btn-option[data-vowel="' + selected + '"]');
        selBtn.classList.add(correct ? 'correct' : 'wrong');

        if (!correct) {
            document.querySelector('.btn-option[data-vowel="' + q.vowel + '"]').classList.add('correct');
            errorLog.push({ word: q.word, correctVowel: q.vowel, chosenVowel: selected });
        }

        if (correct) {
            hits++;
            document.getElementById('hitsCount').textContent = hits;
            showFeedback('success', 'Muito bem!');
            speak('Muito bem!');
        } else {
            misses++;
            document.getElementById('missesCount').textContent = misses;
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
            document.getElementById('feedbackArea').innerHTML +=
                '<button class="btn-next" onclick="nextQuestion()" aria-label="' + label + '">' +
                '<i class="fas ' + icon + '" aria-hidden="true"></i> ' + label + '</button>';
            var nb = document.querySelector('.btn-next');
            if (nb) nb.focus();
        }, correct ? 200 : 800);
    }

    function nextQuestion() {
        currentIdx++;
        if (currentIdx >= TOTAL) {
            showCompletion();
        } else {
            loadQuestion();
        }
    }

    function showFeedback(type, msg) {
        var icon = type === 'success' ? 'fa-check-circle' : 'fa-redo';
        document.getElementById('feedbackArea').innerHTML =
            '<div class="feedback-msg ' + type + '" role="alert">' +
            '<i class="fas ' + icon + '" aria-hidden="true"></i> ' + msg + '</div>';
    }

    function showCompletion() {
        document.getElementById('exerciseCard').style.display = 'none';
        document.getElementById('completionScreen').classList.add('visible');
        document.getElementById('finalHits').textContent = hits;
        document.getElementById('finalMisses').textContent = misses;
        document.getElementById('finalTotal').textContent = TOTAL;
        document.getElementById('progressFill').style.width = '100%';

        var msg;
        if (hits === TOTAL) msg = 'Perfeito! Você acertou todas!';
        else if (hits >= 7) msg = 'Muito bom! Continue assim!';
        else if (hits >= 5) msg = 'Bom trabalho! Revise e tente de novo.';
        else msg = 'Não desista! Refaça e vai ficar melhor.';
        document.getElementById('completionMsg').textContent = msg;

        var errorSummaryEl = document.getElementById('errorSummary');
        var errorListEl = document.getElementById('errorList');
        errorListEl.innerHTML = '';

        if (errorLog.length > 0) {
            errorSummaryEl.style.display = 'block';
            errorLog.forEach(function(err) {
                var li = document.createElement('li');
                li.innerHTML = err.word +
                    ' — você escolheu <span class="wrong-answer">' + err.chosenVowel + '</span>' +
                    ' <span class="arrow"><i class="fas fa-arrow-right" aria-hidden="true"></i></span> ' +
                    'o correto é <span class="correct-answer">' + err.correctVowel + '</span>';
                errorListEl.appendChild(li);
            });
        } else {
            errorSummaryEl.style.display = 'none';
        }

        speak('Parabéns! Você terminou! ' + msg);
        announceSR('Atividade concluída. ' + hits + ' acertos de ' + TOTAL + '. ' + msg);

        setTimeout(function() {
            var b = document.querySelector('.btn-restart');
            if (b) b.focus();
        }, 300);
    }

    function restartExercise() { initExercise(); }

    function speakVowel(key) {
        var data = vowelData[key];
        if (!data) return;
        document.querySelectorAll('.vowel-card').forEach(function(c) { c.classList.remove('speaking'); });
        var card = document.querySelector('.vowel-card[data-vowel="' + key + '"]');
        if (card) card.classList.add('speaking');
        speak(data.letter + '. ' + data.letter + ' de ' + data.example + '.', function() {
            if (card) card.classList.remove('speaking');
        });
    }

    function playInstruction() {
        var btn = document.getElementById('btnInstruction');
        btn.classList.add('speaking');
        speak('Ouça e repita cada vogal. Toque nos cards para aprender.', function() {
            btn.classList.remove('speaking');
        });
    }

    function speak(text, onEnd) {
        if (!('speechSynthesis' in window)) {
            if (onEnd) onEnd();
            return;
        }
        window.speechSynthesis.cancel();
        document.querySelectorAll('.speaking').forEach(function(el) {
            el.classList.remove('speaking');
        });
        var u = new SpeechSynthesisUtterance(text);
        u.lang = 'pt-BR';
        u.rate = 0.82;
        u.pitch = 1.0;
        u.volume = 1.0;
        var voices = window.speechSynthesis.getVoices();
        var ptVoice = voices.find(function(v) { return v.lang.startsWith('pt'); });
        if (ptVoice) u.voice = ptVoice;
        if (onEnd) u.onend = onEnd;
        u.onerror = function() {
            document.querySelectorAll('.speaking').forEach(function(el) {
                el.classList.remove('speaking');
            });
        };
        window.speechSynthesis.speak(u);
    }

    function announceSR(text) {
        var el = document.getElementById('srAnnouncer');
        el.textContent = '';
        setTimeout(function() { el.textContent = text; }, 60);
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

    function toggleMenu() {
        var menu = document.getElementById('mobileMenu');
        var btn = document.querySelector('.navbar-hamburger');
        var isOpen = menu.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen);
    }

    document.addEventListener('click', function(e) {
        var menu = document.getElementById('mobileMenu');
        var btn = document.querySelector('.navbar-hamburger');
        if (menu.classList.contains('open') &&
            !menu.contains(e.target) &&
            !btn.contains(e.target)) {
            menu.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        }
    });

    document.querySelector('.options-grid').addEventListener('keydown', function(e) {
        var btns = Array.from(this.querySelectorAll('.btn-option:not(:disabled)'));
        var idx = btns.indexOf(document.activeElement);
        if (idx < 0) return;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            btns[(idx + 1) % btns.length].focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            btns[(idx - 1 + btns.length) % btns.length].focus();
        }
    });

    if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = function() {
            window.speechSynthesis.getVoices();
        };
    }   

// Aguarda a página carregar completamente
document.addEventListener('DOMContentLoaded', function () {
    initExercise();
});