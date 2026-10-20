const fs = require('fs');

const dict = JSON.parse(fs.readFileSync('scratch/catalog_dict.json', 'utf8'));

const jsContent = `/**
 * AprendIDos — Palavras do Dia a Dia
 * Catálogo Visual A-Z com fotos ampliadas, divisão silábica e descrições didáticas
 * Desenvolvido para idosos em processo de alfabetização.
 */

var catalogData = ${JSON.stringify(dict, null, 4)};

var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
var currentLetter = "A";
var currentLotIndex = 0;

// ========================================================
// SISTEMA DE ÁUDIO BLINDADO CONTRA ECO E DUPLICIDADE
// ========================================================
var currentAudio = null;
var ptVoice = null;
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
    ptVoice = v.find(function(x) { return x.lang === 'pt-BR' || x.lang.startsWith('pt'); }) || null;
}
if ('speechSynthesis' in window) { loadVoices(); window.speechSynthesis.onvoiceschanged = loadVoices; }

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
    u.rate = 0.82; // Calmo e pausado para o idoso
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
    } catch(e) {
        if (onEnd) onEnd();
    }
}

function playInstruction() {
    var btn = document.getElementById('btnInstruction');
    if (btn) btn.classList.add('speaking');
    speak('Escolha uma letra para ver palavras fáceis do dia a dia. Toque na imagem para ver a foto maior e ouvir o que ela significa.', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function playCurrentLetterSound() {
    var item = catalogData[currentLetter];
    var phrase = item ? item.soundText : ("Letra " + currentLetter);
    speak(phrase);
}

function playWord(word) {
    speak(word);
}

// Renderiza a régua com botões de A a Z
function renderLetterNav() {
    var container = document.getElementById('letterNavContainer');
    if (!container) return;
    container.innerHTML = '';
    alphabet.forEach(function(letter) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'letter-nav-btn' + (letter === currentLetter ? ' active' : '');
        btn.textContent = letter;
        btn.setAttribute('aria-label', 'Letra ' + letter);
        btn.onclick = function() {
            selectLetter(letter);
        };
        container.appendChild(btn);
    });
}

function selectLetter(letter) {
    currentLetter = letter;
    currentLotIndex = 0;
    renderLetterNav();
    renderLetterShowcase();
    scrollActiveLetterIntoView();
}

function scrollActiveLetterIntoView() {
    var activeBtn = document.querySelector('.letter-nav-btn.active');
    if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
}

function nextLetter() {
    var idx = alphabet.indexOf(currentLetter);
    if (idx < alphabet.length - 1) {
        selectLetter(alphabet[idx + 1]);
    }
}

function prevLetter() {
    var idx = alphabet.indexOf(currentLetter);
    if (idx > 0) {
        selectLetter(alphabet[idx - 1]);
    }
}

// Alternar entre os lotes
function nextLot() {
    var item = catalogData[currentLetter];
    if (!item || !item.lots || item.lots.length <= 1) return;
    currentLotIndex = (currentLotIndex + 1) % item.lots.length;
    renderLetterShowcase();
}

function goToLot(index) {
    var item = catalogData[currentLetter];
    if (!item || !item.lots) return;
    currentLotIndex = index;
    renderLetterShowcase();
}

// Renderiza a vitrine de palavras
function renderLetterShowcase() {
    var badge = document.getElementById('showcaseLetterBadge');
    var title = document.getElementById('showcaseTitle');
    var grid = document.getElementById('wordsGrid');
    var lotIndicator = document.getElementById('lotIndicator');
    var lotDots = document.getElementById('lotDots');
    var prevBtn = document.getElementById('btnPrevLetter');
    var nextBtn = document.getElementById('btnNextLetter');
    var btnNextLot = document.querySelector('.btn-next-lot');

    if (badge) badge.textContent = currentLetter;
    if (title) title.innerHTML = 'Palavras com a Letra <span>' + currentLetter + '</span>';

    var curIdx = alphabet.indexOf(currentLetter);
    if (prevBtn) prevBtn.disabled = curIdx === 0;
    if (nextBtn) nextBtn.disabled = curIdx === alphabet.length - 1;

    var item = catalogData[currentLetter] || { lots: [[]] };
    var lots = item.lots || [[]];
    if (currentLotIndex >= lots.length) currentLotIndex = 0;
    var currentWords = lots[currentLotIndex] || lots[0] || [];

    if (lotIndicator) {
        lotIndicator.textContent = lots.length > 1
            ? 'Lote ' + (currentLotIndex + 1) + ' de ' + lots.length
            : currentWords.length + ' palavras disponíveis';
    }

    if (btnNextLot) {
        btnNextLot.style.display = lots.length > 1 ? 'inline-flex' : 'none';
    }

    if (lotDots) {
        lotDots.innerHTML = '';
        if (lots.length > 1) {
            for (var i = 0; i < lots.length; i++) {
                var dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'lot-dot' + (i === currentLotIndex ? ' active' : '');
                dot.setAttribute('aria-label', 'Ir para o Lote ' + (i + 1));
                dot.innerHTML = (i + 1);
                dot.onclick = (function(idx) { return function() { goToLot(idx); }; })(i);
                lotDots.appendChild(dot);
            }
        }
    }

    if (grid) {
        grid.innerHTML = '';
        currentWords.forEach(function(obj) {
            var card = document.createElement('div');
            card.className = 'word-card';
            card.tabIndex = 0;
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', 'Palavra ' + obj.word + '. Toque para abrir foto maior e descrição didática.');

            var imgWrap = document.createElement('div');
            imgWrap.className = 'word-img-wrapper';

            if (obj.img) {
                var img = document.createElement('img');
                img.src = obj.img;
                img.alt = obj.word;
                img.className = 'word-photo';
                img.loading = 'lazy';

                img.onerror = function() {
                    var tried = this.dataset.triedExt || 'none';
                    if (tried === 'none' && this.src.indexOf('.png') !== -1) {
                        this.dataset.triedExt = 'jpg';
                        this.src = this.src.replace(/\\.png$/, '.jpg');
                        return;
                    }
                    if (tried === 'none' && this.src.indexOf('.jpg') !== -1) {
                        this.dataset.triedExt = 'png';
                        this.src = this.src.replace(/\\.jpg$/, '.png');
                        return;
                    }
                    this.style.display = 'none';
                    if (!imgWrap.querySelector('.word-fallback-icon')) {
                        var fb = document.createElement('div');
                        fb.className = 'word-fallback-icon';
                        fb.innerHTML = '<i class="fas ' + (obj.icon || 'fa-image') + '"></i><span class="placeholder-tag">' + obj.word + '</span>';
                        imgWrap.appendChild(fb);
                    }
                };
                imgWrap.appendChild(img);
            } else {
                var fb = document.createElement('div');
                fb.className = 'word-fallback-icon';
                fb.innerHTML = '<i class="fas ' + (obj.icon || 'fa-image') + '"></i><span class="placeholder-tag">' + obj.word + '</span>';
                imgWrap.appendChild(fb);
            }

            var soundBadge = document.createElement('button');
            soundBadge.type = 'button';
            soundBadge.className = 'sound-pill';
            soundBadge.setAttribute('aria-label', 'Ouvir pronúncia de ' + obj.word);
            soundBadge.innerHTML = '<i class="fas fa-volume-up"></i> Ouvir';
            soundBadge.onclick = function(e) {
                e.stopPropagation();
                card.classList.add('playing');
                playWord(obj.word);
                setTimeout(function() { card.classList.remove('playing'); }, 600);
            };
            imgWrap.appendChild(soundBadge);

            var zoomBadge = document.createElement('span');
            zoomBadge.className = 'zoom-pill';
            zoomBadge.innerHTML = '<i class="fas fa-expand"></i> Ver maior';
            imgWrap.appendChild(zoomBadge);

            var titleDiv = document.createElement('div');
            titleDiv.className = 'word-name';
            var firstChar = obj.word.charAt(0);
            var rest = obj.word.slice(1);
            titleDiv.innerHTML = '<span class="first-char">' + firstChar + '</span>' + rest;

            card.appendChild(imgWrap);
            card.appendChild(titleDiv);

            card.onclick = function() {
                card.classList.add('playing');
                abrirModalPalavra(obj.word);
                setTimeout(function() { card.classList.remove('playing'); }, 400);
            };

            card.onkeydown = function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            };

            grid.appendChild(card);
        });
    }
}

// ========================================================
// MODAL DE PALAVRA AMPLIADA (FOTO MAIOR E EXPLICAÇÃO DIDÁTICA)
// ========================================================
var currentModalWords = [];
var currentModalIndex = 0;
var lastFocusedElementBeforeWordModal = null;

function getWordsForLetter(letter) {
    var item = catalogData[letter];
    if (!item || !item.lots) return [];
    var words = [];
    item.lots.forEach(function(lot) {
        lot.forEach(function(w) {
            words.push(w);
        });
    });
    return words;
}

function abrirModalPalavra(wordOrIndex) {
    currentModalWords = getWordsForLetter(currentLetter);
    if (!currentModalWords || currentModalWords.length === 0) return;

    if (typeof wordOrIndex === 'number') {
        currentModalIndex = Math.max(0, Math.min(wordOrIndex, currentModalWords.length - 1));
    } else if (typeof wordOrIndex === 'string') {
        var foundIdx = currentModalWords.findIndex(function(item) {
            return item.word.toUpperCase() === wordOrIndex.toUpperCase();
        });
        currentModalIndex = foundIdx !== -1 ? foundIdx : 0;
    } else {
        currentModalIndex = 0;
    }

    lastFocusedElementBeforeWordModal = document.activeElement;

    var modal = document.getElementById('palavraModal');
    if (!modal) return;

    modal.removeAttribute('hidden');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    renderModalPalavra();

    try {
        var url = new URL(window.location.href);
        url.searchParams.set('letra', currentLetter);
        url.searchParams.set('palavra', currentModalWords[currentModalIndex].word);
        window.history.replaceState({ letra: currentLetter, palavra: currentModalWords[currentModalIndex].word }, '', url.toString());
    } catch(e) {}

    var closeBtn = modal.querySelector('.palavra-btn-close');
    if (closeBtn) closeBtn.focus();
}

function fecharModalPalavra() {
    stopAllAudio();
    var modal = document.getElementById('palavraModal');
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';

    try {
        var url = new URL(window.location.href);
        url.searchParams.delete('palavra');
        window.history.replaceState({ letra: currentLetter }, '', url.toString());
    } catch(e) {}

    if (lastFocusedElementBeforeWordModal && typeof lastFocusedElementBeforeWordModal.focus === 'function') {
        lastFocusedElementBeforeWordModal.focus();
    }
}

function renderModalPalavra() {
    if (!currentModalWords || currentModalWords.length === 0) return;
    var item = currentModalWords[currentModalIndex];
    if (!item) return;

    var badgeLetter = document.getElementById('palavraModalBadge');
    if (badgeLetter) badgeLetter.textContent = 'Letra ' + currentLetter;

    var badgeCounter = document.getElementById('palavraModalCounter');
    if (badgeCounter) badgeCounter.textContent = 'Palavra ' + (currentModalIndex + 1) + ' de ' + currentModalWords.length;

    var img = document.getElementById('palavraModalImg');
    var fb = document.getElementById('palavraModalFallback');
    var fbIcon = document.getElementById('palavraModalFallbackIcon');
    var fbText = document.getElementById('palavraModalFallbackText');

    if (item.img) {
        if (img) {
            img.style.display = 'block';
            img.src = item.img;
            img.alt = 'Foto ampliada de ' + item.word;
            img.dataset.triedExt = '';
            img.onerror = function() {
                var tried = this.dataset.triedExt || 'none';
                if (tried === 'none' && this.src.indexOf('.png') !== -1) {
                    this.dataset.triedExt = 'jpg';
                    this.src = this.src.replace(/\\.png$/, '.jpg');
                    return;
                }
                if (tried === 'none' && this.src.indexOf('.jpg') !== -1) {
                    this.dataset.triedExt = 'png';
                    this.src = this.src.replace(/\\.jpg$/, '.png');
                    return;
                }
                this.style.display = 'none';
                if (fb) {
                    fb.style.display = 'flex';
                    if (fbIcon) fbIcon.className = 'fas ' + (item.icon || 'fa-image');
                    if (fbText) fbText.textContent = item.word;
                }
            };
        }
        if (fb) fb.style.display = 'none';
    } else {
        if (img) img.style.display = 'none';
        if (fb) {
            fb.style.display = 'flex';
            if (fbIcon) fbIcon.className = 'fas ' + (item.icon || 'fa-image');
            if (fbText) fbText.textContent = item.word;
        }
    }

    var firstCharSpan = document.getElementById('palavraFirstChar');
    var restCharsSpan = document.getElementById('palavraRestChars');
    if (firstCharSpan) firstCharSpan.textContent = item.word.charAt(0);
    if (restCharsSpan) restCharsSpan.textContent = item.word.slice(1);

    var sylCont = document.getElementById('palavraSyllablesPills');
    if (sylCont) {
        sylCont.innerHTML = '';
        var sylParts = item.syllables ? item.syllables.split('-').map(function(s) { return s.trim(); }) : [item.word];
        sylParts.forEach(function(s) {
            var pill = document.createElement('span');
            pill.className = 'palavra-syllable-pill';
            pill.textContent = s;
            sylCont.appendChild(pill);
        });
    }

    var descText = document.getElementById('palavraDescText');
    if (descText) {
        descText.textContent = item.desc || 'Palavra familiar do nosso cotidiano brasileiro com a letra ' + currentLetter + '.';
    }

    var prevBtn = document.getElementById('btnPalavraModalPrev');
    var nextBtn = document.getElementById('btnPalavraModalNext');
    if (prevBtn) prevBtn.disabled = currentModalIndex === 0;
    if (nextBtn) nextBtn.disabled = currentModalIndex === currentModalWords.length - 1;

    var dotsCont = document.getElementById('palavraStepDots');
    if (dotsCont) {
        dotsCont.innerHTML = '';
        currentModalWords.forEach(function(wObj, idx) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'palavra-step-dot' + (idx === currentModalIndex ? ' active' : '');
            dot.setAttribute('aria-label', 'Ir para palavra ' + (idx + 1) + ': ' + wObj.word);
            dot.textContent = (idx + 1);
            dot.onclick = function() {
                currentModalIndex = idx;
                renderModalPalavra();
            };
            dotsCont.appendChild(dot);
        });
    }

    announceSR('Exibindo ' + item.word + '. Palavra ' + (currentModalIndex + 1) + ' de ' + currentModalWords.length);
}

function palavraModalAnterior() {
    if (currentModalIndex > 0) {
        currentModalIndex--;
        renderModalPalavra();
    }
}

function palavraModalProxima() {
    if (currentModalIndex < currentModalWords.length - 1) {
        currentModalIndex++;
        renderModalPalavra();
    }
}

function tocarPalavraModal() {
    var item = currentModalWords[currentModalIndex];
    if (!item) return;
    speak(item.word);
}

function tocarExplicacaoModal() {
    var item = currentModalWords[currentModalIndex];
    if (!item) return;
    var phrase = item.word + '. ' + item.desc;
    speak(phrase);
}

function tocarAudioCompletoModal() {
    var item = currentModalWords[currentModalIndex];
    if (!item) return;
    var sylClean = item.syllables ? item.syllables.replace(/-/g, '... ') : item.word;
    var phrase = 'Palavra ' + item.word + '. Sílabas: ' + sylClean + '. O que significa: ' + item.desc;
    speak(phrase);
}

function tocarSilabasModal() {
    var item = currentModalWords[currentModalIndex];
    if (!item) return;
    var sylClean = item.syllables ? item.syllables.split('-').map(function(s) { return s.trim(); }).join('... ') : item.word;
    speak(sylClean + '... ' + item.word);
}

// Atalhos de teclado no modal
document.addEventListener('keydown', function(e) {
    var modal = document.getElementById('palavraModal');
    if (!modal || modal.hasAttribute('hidden') || !modal.classList.contains('active')) return;

    if (e.key === 'Escape') {
        e.preventDefault();
        fecharModalPalavra();
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        palavraModalAnterior();
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        palavraModalProxima();
    }
});

/* ========================================================
   EXERCÍCIO PRÁTICO DE FIXAÇÃO
======================================================== */
var TOTAL_EXERCISE = 10;
var exQuestions = [], exCurrentIdx = 0, hits = 0, misses = 0, answered = false, errorLog = [];

function getAllWordsFlat() {
    var all = [];
    Object.keys(catalogData).forEach(function(letter) {
        var lots = catalogData[letter].lots;
        lots.forEach(function(lot) {
            lot.forEach(function(item) {
                all.push(item);
            });
        });
    });
    return all;
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
    var all = getAllWordsFlat();
    var shuffledAll = shuffle(all);
    exQuestions = shuffledAll.slice(0, TOTAL_EXERCISE);
    exCurrentIdx = 0; hits = 0; misses = 0; answered = false; errorLog = [];

    var h = document.getElementById('hitsCount'); if (h) h.textContent = '0';
    var m = document.getElementById('missesCount'); if (m) m.textContent = '0';
    var layout = document.getElementById('exerciseLayout');
    var comp = document.getElementById('completionScreen');
    if (layout) layout.style.display = '';
    if (comp) comp.classList.remove('visible');
    loadExerciseQuestion();
}

function loadExerciseQuestion() {
    answered = false;
    var q = exQuestions[exCurrentIdx];
    if (!q) return;

    var pFill = document.getElementById('progressFill');
    var pBar = document.getElementById('progressBar');
    var pLabel = document.getElementById('progressLabel');
    var fbArea = document.getElementById('feedbackArea');

    var pct = (exCurrentIdx / TOTAL_EXERCISE) * 100;
    if (pFill) pFill.style.width = pct + '%';
    if (pBar) pBar.setAttribute('aria-valuenow', Math.round(pct));
    if (pLabel) pLabel.textContent = 'Pergunta ' + (exCurrentIdx + 1) + ' de ' + TOTAL_EXERCISE;
    if (fbArea) fbArea.innerHTML = '';

    var all = getAllWordsFlat();
    var distractors = all.filter(function(x) { return x.word !== q.word; });
    distractors = shuffle(distractors).slice(0, 2);

    var options = shuffle([q].concat(distractors));
    var optCont = document.getElementById('optionsContainer');
    if (optCont) {
        optCont.innerHTML = '';
        options.forEach(function(opt) {
            var btn = document.createElement('button');
            btn.className = 'btn-exercise-opt';
            btn.setAttribute('data-word', opt.word);
            btn.setAttribute('aria-label', 'Opção ' + opt.word);

            if (opt.img) {
                var optImg = document.createElement('img');
                optImg.src = opt.img;
                optImg.alt = opt.word;
                optImg.className = 'opt-mini-photo';
                optImg.onerror = function() {
                    this.style.display = 'none';
                };
                btn.appendChild(optImg);
            }

            var spanText = document.createElement('span');
            spanText.className = 'opt-text';
            spanText.textContent = opt.word;

            btn.appendChild(spanText);

            var isCorrect = opt.word === q.word;
            btn.onclick = function() { checkExerciseAnswer(isCorrect, opt.word, btn); };
            optCont.appendChild(btn);
        });
    }
}

function playExerciseAudio() {
    if (exCurrentIdx >= exQuestions.length) return;
    var q = exQuestions[exCurrentIdx];
    var btn = document.getElementById('btnExerciseAudio');
    if (btn) btn.classList.add('speaking');
    speak('Onde está: ' + q.word.toLowerCase() + '?', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function playHelpExercise() {
    var btn = document.getElementById('btnHelpExercise');
    if (btn) btn.classList.add('speaking');
    speak('Ouça o áudio da palavra e depois clique na opção correta.', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function checkExerciseAnswer(isCorrect, optWord, btn) {
    if (answered) return;
    answered = true;

    document.querySelectorAll('.btn-exercise-opt').forEach(function(b) { b.disabled = true; });
    btn.classList.add(isCorrect ? 'correct' : 'wrong');

    var currentQ = exQuestions[exCurrentIdx];
    if (!isCorrect) {
        var corrBtn = document.querySelector('.btn-exercise-opt[data-word="' + currentQ.word + '"]');
        if (corrBtn) corrBtn.classList.add('correct');
        errorLog.push({ word: currentQ.word, chosen: optWord });
    }

    if (isCorrect) {
        hits++;
        var h = document.getElementById('hitsCount'); if (h) h.textContent = hits;
        showFeedback('success', 'Muito bem! ' + currentQ.word);
        speak('Muito bem! ' + currentQ.word.toLowerCase());
    } else {
        misses++;
        var m = document.getElementById('missesCount'); if (m) m.textContent = misses;
        showFeedback('error', 'A resposta certa é ' + currentQ.word);
        speak('A resposta certa é ' + currentQ.word.toLowerCase());
    }

    var isLast = exCurrentIdx >= TOTAL_EXERCISE - 1;
    setTimeout(function() {
        var fb = document.getElementById('feedbackArea');
        if (fb) {
            fb.innerHTML += '<button class="btn-next" onclick="nextExerciseQuestion()" aria-label="' + (isLast ? 'Ver resultado' : 'Próxima') + '">' +
                '<i class="fas ' + (isLast ? 'fa-flag-checkered' : 'fa-arrow-right') + '"></i> ' + (isLast ? 'Ver resultado' : 'Próxima') + '</button>';
            var nb = document.querySelector('.btn-next'); if (nb) nb.focus();
        }
    }, isCorrect ? 250 : 750);
}

function showFeedback(type, msg) {
    var fb = document.getElementById('feedbackArea');
    if (fb) fb.innerHTML = '<div class="feedback-msg ' + type + '" role="alert"><i class="fas ' + (type === 'success' ? 'fa-check-circle' : 'fa-redo') + '"></i> ' + msg + '</div>';
}

function nextExerciseQuestion() {
    exCurrentIdx++;
    if (exCurrentIdx >= TOTAL_EXERCISE) showCompletion();
    else loadExerciseQuestion();
}

function showCompletion() {
    var layout = document.getElementById('exerciseLayout');
    var comp = document.getElementById('completionScreen');
    if (layout) layout.style.display = 'none';
    if (comp) comp.classList.add('visible');

    var fh = document.getElementById('finalHits'); if (fh) fh.textContent = hits;
    var fm = document.getElementById('finalMisses'); if (fm) fm.textContent = misses;
    var ft = document.getElementById('finalTotal'); if (ft) ft.textContent = TOTAL_EXERCISE;
    var pf = document.getElementById('progressFill'); if (pf) pf.style.width = '100%';

    var msg = hits === TOTAL_EXERCISE ? 'Excelente! Você acertou tudo!' : hits >= 7 ? 'Muito bem! Ótimo resultado!' : hits >= 5 ? 'Bom trabalho!' : 'Continue praticando!';
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
    speak('Parabéns! Você concluiu as palavras do dia a dia. ' + msg);
}

function salvarProgresso() {
    var data = { completed: true, score: hits, total: TOTAL_EXERCISE, misses: misses, savedAt: new Date().toISOString() };
    var user = null;
    try { var r = localStorage.getItem('aprendidos_usuario'); if (r) user = JSON.parse(r); } catch(e) {}
    var uk = (user && user.id) ? ('aprendidos_progresso_' + user.id) : null;
    [uk, 'aprendidos_progresso', 'aprendidos_progresso_anon'].filter(Boolean).forEach(function(k) {
        try { var c = JSON.parse(localStorage.getItem(k) || '{}'); c['palavras'] = data; localStorage.setItem(k, JSON.stringify(c)); } catch(e) {}
    });
    if (window.AprendIDosAuth && window.AprendIDosAuth.saveLessonProgress) {
        try { window.AprendIDosAuth.saveLessonProgress('palavras', data); } catch(e) {}
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
    var isDone = false, prevScore = null, prevTotal = TOTAL_EXERCISE;
    try {
        var user = null;
        try { var r = localStorage.getItem('aprendidos_usuario'); if (r) user = JSON.parse(r); } catch(e) {}
        var uk = (user && user.id) ? ('aprendidos_progresso_' + user.id) : null;
        var keys = [uk, 'aprendidos_progresso', 'aprendidos_progresso_anon'].filter(Boolean);
        for (var i = 0; i < keys.length; i++) {
            var raw = localStorage.getItem(keys[i]);
            if (raw) { var p = JSON.parse(raw); if (p && p.palavras && p.palavras.completed) { isDone = true; prevScore = p.palavras.score; prevTotal = p.palavras.total; break; } }
        }
    } catch(e) {}
    if (isDone) {
        var banner = document.getElementById('reviewBanner');
        var bt = document.getElementById('reviewBannerText');
        if (banner) { banner.style.display = 'flex'; if (bt) bt.innerHTML = 'Você já concluiu esta lição' + (prevScore !== null ? ' com <strong>' + prevScore + ' de ' + prevTotal + ' acertos</strong>' : '') + '! Sinta-se à vontade para praticar novamente.'; }
    }
}

function restartExercise() { initExercise(); verificarLicaoConcluida(); }

function announceSR(text) {
    var el = document.getElementById('srAnnouncer');
    if (el) {
        el.textContent = '';
        setTimeout(function() { el.textContent = text; }, 60);
    }
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

window.speak = speak;
window.playInstruction = playInstruction;
window.playCurrentLetterSound = playCurrentLetterSound;
window.playWord = playWord;
window.selectLetter = selectLetter;
window.nextLetter = nextLetter;
window.prevLetter = prevLetter;
window.nextLot = nextLot;
window.goToLot = goToLot;
window.abrirModalPalavra = abrirModalPalavra;
window.fecharModalPalavra = fecharModalPalavra;
window.palavraModalAnterior = palavraModalAnterior;
window.palavraModalProxima = palavraModalProxima;
window.tocarPalavraModal = tocarPalavraModal;
window.tocarExplicacaoModal = tocarExplicacaoModal;
window.tocarAudioCompletoModal = tocarAudioCompletoModal;
window.tocarSilabasModal = tocarSilabasModal;
window.playExerciseAudio = playExerciseAudio;
window.playHelpExercise = playHelpExercise;
window.nextExerciseQuestion = nextExerciseQuestion;
window.restartExercise = restartExercise;
window.salvarEVerOutras = salvarEVerOutras;
window.toggleMenu = toggleMenu;

function initializePage() {
    renderLetterNav();
    renderLetterShowcase();
    initExercise();
    verificarLicaoConcluida();

    try {
        var params = new URLSearchParams(window.location.search);
        var urlLetter = params.get('letra');
        if (urlLetter && alphabet.indexOf(urlLetter.toUpperCase()) !== -1) {
            selectLetter(urlLetter.toUpperCase());
        }
        var urlPalavra = params.get('palavra');
        if (urlPalavra) {
            setTimeout(function() {
                abrirModalPalavra(urlPalavra);
            }, 300);
        }
    } catch(e) {}
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}
`;

fs.writeFileSync('palavras.js', jsContent, 'utf8');
console.log('palavras.js regenerated with anti-duplication speak engine. Size:', jsContent.length);
