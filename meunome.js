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

window.speak = speak; window.playInstruction = playInstruction; window.analyzeName = analyzeName;
window.speakName = speakName; window.speakNameSpelled = speakNameSpelled;
window.pickLetter = pickLetter; window.renderExercise = renderExercise;
window.salvarEVerOutras = salvarEVerOutras; window.restartExercise = restartExercise; window.toggleMenu = toggleMenu;

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', verificarLicaoConcluida); }
else { verificarLicaoConcluida(); }
