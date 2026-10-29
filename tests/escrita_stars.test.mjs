/**
 * Testes Automatizados do Sistema de Estrelas da Atividade Escrita
 * Valida o alinhamento com a atividade Meu Nome:
 * 1. As estrelas correspondem à pontuação calculada (0, 1, 2, 3 estrelas)
 * 2. Limites pedagógicos de pontuação e proporção de letras (allPassed, partialRatio, avgScore)
 * 3. A interface atualiza as estrelas e usa a classe 'active' (não dependendo de .filled)
 * 4. Avançar para outra palavra ou limpar o quadro redefine as estrelas para 0
 * 5. A atividade Meu Nome continua funcionando com os mesmos critérios de estrelas
 * 6. Avaliação de letras e botão Próxima Palavra permanecem intactos
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const escritaCode = fs.readFileSync(path.join(rootDir, 'escrita.js'), 'utf8');
const meunomeCode = fs.readFileSync(path.join(rootDir, 'meunome.js'), 'utf8');

function extractFn(code, name, nextAnchor) {
    const start = code.indexOf(`function ${name}(`);
    if (start === -1) throw new Error(`Function ${name} not found`);
    const end = nextAnchor ? code.indexOf(nextAnchor, start) : code.length;
    return code.slice(start, end);
}

function createMockElement(id) {
    const classes = new Set();
    return {
        id,
        style: {},
        textContent: '',
        innerHTML: '',
        classList: {
            add: (c) => classes.add(c),
            remove: (c) => classes.delete(c),
            contains: (c) => classes.has(c),
            get value() { return Array.from(classes).join(' '); }
        },
        setAttribute: () => {},
        getAttribute: () => null,
        querySelector: () => null,
        insertAdjacentHTML: function(_pos, html) { this.innerHTML += html; }
    };
}

function createEscritaHarness() {
    const elements = {
        star1: createMockElement('star1'),
        star2: createMockElement('star2'),
        star3: createMockElement('star3'),
        evalProgressBarFill: createMockElement('evalProgressBarFill'),
        evalScoreLabel: createMockElement('evalScoreLabel'),
        evalFeedbackMsg: createMockElement('evalFeedbackMsg'),
        evalFeedbackText: createMockElement('evalFeedbackText'),
        feedbackArea: createMockElement('feedbackArea'),
        hitsCount: createMockElement('hitsCount'),
        targetWordTitle: createMockElement('targetWordTitle'),
        targetWordHint: createMockElement('targetWordHint'),
        progressFill: createMockElement('progressFill'),
        progressBar: createMockElement('progressBar'),
        progressLabel: createMockElement('progressLabel'),
        canvasHint: createMockElement('canvasHint'),
        exerciseLayout: createMockElement('exerciseLayout'),
        completionScreen: createMockElement('completionScreen')
    };

    const env = {
        document: {
            getElementById: (id) => elements[id] || null
        },
        window: {},
        Math,
        Boolean,
        isNaN,
        parseInt,
        parseFloat,
        currentEvalScore: 0,
        currentEvalStars: 0,
        currentEvalMessage: '',
        hasPassedCurrentWord: false,
        hits: 0,
        misses: 0,
        currentIdx: 0,
        TOTAL: 2,
        questions: [
            { word: 'SOL', hint: 'Brilha no céu', audio: 'SOL' },
            { word: 'LUA', hint: 'Brilha à noite', audio: 'LUA' }
        ],
        strokes: [],
        currentStroke: null,
        lastPoint: null,
        letterStatusMap: {},
        hideWordGuide: false,
        writingCanvas: {},
        getLetterMetrics: () => [
            { char: 'S', x1: 10, y1: 10, x2: 40, y2: 80, fontSize: 80 },
            { char: 'O', x1: 50, y1: 10, x2: 80, y2: 80, fontSize: 80 },
            { char: 'L', x1: 90, y1: 10, x2: 120, y2: 80, fontSize: 80 }
        ],
        filterStrokesForLetter: (m, strokes) => strokes.filter(s => s.letterIndex === undefined || s.char === m.char),
        renderLetterTracker: () => {},
        setupCanvasResolution: () => {},
        redrawWritingCanvas: () => {},
        speak: () => {},
        stopAllAudio: () => {},
        salvarProgresso: () => Promise.resolve({ status: 'synced' }),
        console
    };

    const fnUpdateUI = extractFn(escritaCode, 'updateEvaluationUI', '\nfunction ensureNextWordButton');
    const fnEnsureBtn = extractFn(escritaCode, 'ensureNextWordButton', '\nfunction evaluateWriting');
    const fnEvaluate = extractFn(escritaCode, 'evaluateWriting', '\nfunction evaluateLetterFallback');
    const fnFallback = extractFn(escritaCode, 'evaluateLetterFallback', '\n// ============================================================');
    const fnLoadWord = extractFn(escritaCode, 'loadWord', '\n// ============================================================');
    const fnClear = extractFn(escritaCode, 'clearWritingCanvas', '\n// ============================================================');
    const fnNextWord = extractFn(escritaCode, 'nextWord', '\nfunction showCompletion');

    const runner = new Function('env', `
        with (env) {
            ${fnUpdateUI}
            ${fnEnsureBtn}
            ${fnEvaluate}
            ${fnFallback}
            ${fnLoadWord}
            ${fnClear}
            ${fnNextWord}
            return {
                updateEvaluationUI,
                ensureNextWordButton,
                evaluateWriting,
                evaluateLetterFallback,
                loadWord,
                clearWritingCanvas,
                nextWord
            };
        }
    `);

    const methods = runner(env);
    return { env, elements, ...methods };
}

test('1. updateEvaluationUI ativa as classes "active" de acordo com a quantidade de estrelas (0 a 3)', () => {
    const h = createEscritaHarness();

    // 0 estrelas
    h.updateEvaluationUI(20, 0, 'Pratique mais', 'info');
    assert.equal(h.elements.star1.classList.contains('active'), false);
    assert.equal(h.elements.star2.classList.contains('active'), false);
    assert.equal(h.elements.star3.classList.contains('active'), false);
    assert.equal(h.env.currentEvalStars, 0);

    // 1 estrela
    h.updateEvaluationUI(40, 1, 'Bom começo', 'partial');
    assert.equal(h.elements.star1.classList.contains('active'), true);
    assert.equal(h.elements.star2.classList.contains('active'), false);
    assert.equal(h.elements.star3.classList.contains('active'), false);
    assert.equal(h.env.currentEvalStars, 1);

    // 2 estrelas
    h.updateEvaluationUI(65, 2, 'Muito bom', 'partial');
    assert.equal(h.elements.star1.classList.contains('active'), true);
    assert.equal(h.elements.star2.classList.contains('active'), true);
    assert.equal(h.elements.star3.classList.contains('active'), false);
    assert.equal(h.env.currentEvalStars, 2);

    // 3 estrelas
    h.updateEvaluationUI(90, 3, 'Excelente', 'success');
    assert.equal(h.elements.star1.classList.contains('active'), true);
    assert.equal(h.elements.star2.classList.contains('active'), true);
    assert.equal(h.elements.star3.classList.contains('active'), true);
    assert.equal(h.env.currentEvalStars, 3);
});

test('2. Compatibilidade retroativa: chamada com 3 parâmetros calcula estrelas sem quebrar', () => {
    const h = createEscritaHarness();

    h.updateEvaluationUI(89, 'Muito bom!', 'success');
    assert.equal(h.env.currentEvalStars, 3);
    assert.equal(h.elements.star1.classList.contains('active'), true);
    assert.equal(h.elements.star2.classList.contains('active'), true);
    assert.equal(h.elements.star3.classList.contains('active'), true);

    h.updateEvaluationUI(70, 'Quase lá!', 'partial');
    assert.equal(h.env.currentEvalStars, 2);
    assert.equal(h.elements.star1.classList.contains('active'), true);
    assert.equal(h.elements.star2.classList.contains('active'), true);
    assert.equal(h.elements.star3.classList.contains('active'), false);

    h.updateEvaluationUI(45, 'Bom começo!', 'partial');
    assert.equal(h.env.currentEvalStars, 1);
    assert.equal(h.elements.star1.classList.contains('active'), true);
    assert.equal(h.elements.star2.classList.contains('active'), false);
    assert.equal(h.elements.star3.classList.contains('active'), false);

    h.updateEvaluationUI(20, 'Continue tentando', 'info');
    assert.equal(h.env.currentEvalStars, 0);
    assert.equal(h.elements.star1.classList.contains('active'), false);
});

test('3. evaluateWriting calcula estrelas pedagogicamente (igual a Meu Nome)', () => {
    const h = createEscritaHarness();

    // Cenário A: Todas as letras aprovadas com nota média alta (>= 75) => 3 estrelas
    h.env.strokes = [
        { char: 'S', points: [{ x: 20, y: 30 }] },
        { char: 'O', points: [{ x: 60, y: 30 }] },
        { char: 'L', points: [{ x: 100, y: 30 }] }
    ];
    h.env.window.evaluateLetter = (_char) => ({ passed: true, score: 85, coverage: 90 });

    h.evaluateWriting(false);
    assert.equal(h.env.currentEvalStars, 3);
    assert.equal(h.elements.star1.classList.contains('active'), true);
    assert.equal(h.elements.star2.classList.contains('active'), true);
    assert.equal(h.elements.star3.classList.contains('active'), true);

    // Cenário B: Todas as letras aprovadas com média modesta (< 75) => 2 estrelas
    h.env.hasPassedCurrentWord = false;
    h.env.letterStatusMap = {};
    h.env.window.evaluateLetter = (_char) => ({ passed: true, score: 65, coverage: 70 });
    h.evaluateWriting(false);
    assert.equal(h.env.currentEvalStars, 2);
    assert.equal(h.elements.star1.classList.contains('active'), true);
    assert.equal(h.elements.star2.classList.contains('active'), true);
    assert.equal(h.elements.star3.classList.contains('active'), false);

    // Cenário C: 2 de 3 letras aprovadas (partialRatio = 0.67 < 0.70) com média 60 => 1 estrela
    h.env.letterStatusMap = {};
    h.env.window.evaluateLetter = (char) => {
        if (char === 'L') return { passed: false, score: 30, coverage: 30 };
        return { passed: true, score: 75, coverage: 80 };
    };
    h.evaluateWriting(false);
    assert.equal(h.env.currentEvalStars, 1);
    assert.equal(h.elements.star1.classList.contains('active'), true);
    assert.equal(h.elements.star2.classList.contains('active'), false);

    // Cenário D: Nenhuma letra desenhada / traços vazios => 0 estrelas
    h.env.strokes = [];
    h.evaluateWriting(false);
    assert.equal(h.env.currentEvalStars, 0);
    assert.equal(h.elements.star1.classList.contains('active'), false);
    assert.equal(h.elements.star2.classList.contains('active'), false);
    assert.equal(h.elements.star3.classList.contains('active'), false);
});

test('4. Limpar o quadro (clearWritingCanvas) zera as estrelas e remove a classe "active"', () => {
    const h = createEscritaHarness();

    // Simula avaliação com 3 estrelas
    h.updateEvaluationUI(90, 3, 'Excelente', 'success');
    assert.equal(h.elements.star3.classList.contains('active'), true);

    // Limpa o quadro
    h.clearWritingCanvas();
    assert.equal(h.env.currentEvalStars, 0);
    assert.equal(h.env.currentEvalScore, 0);
    assert.equal(h.elements.star1.classList.contains('active'), false);
    assert.equal(h.elements.star2.classList.contains('active'), false);
    assert.equal(h.elements.star3.classList.contains('active'), false);
});

test('5. Avançar para a próxima palavra (loadWord) reinicia as estrelas limpas', () => {
    const h = createEscritaHarness();

    // Atribui 2 estrelas na palavra atual
    h.updateEvaluationUI(70, 2, 'Muito bom', 'partial');
    assert.equal(h.env.currentEvalStars, 2);
    assert.equal(h.elements.star1.classList.contains('active'), true);
    assert.equal(h.elements.star2.classList.contains('active'), true);

    // Avança para a próxima palavra
    h.nextWord();
    assert.equal(h.env.currentIdx, 1);
    assert.equal(h.env.currentEvalStars, 0);
    assert.equal(h.elements.star1.classList.contains('active'), false);
    assert.equal(h.elements.star2.classList.contains('active'), false);
    assert.equal(h.elements.star3.classList.contains('active'), false);
});

test('6. Atividade Meu Nome mantém algoritmo idêntico de estrelas', () => {
    // Verifica se os thresholds pedagógicos de Meu Nome coincidem com o implementado
    assert.match(meunomeCode, /allPassed && avgScore >= 75/);
    assert.match(meunomeCode, /partialRatio >= 0\.70 && avgScore >= 55/);
    assert.match(meunomeCode, /partialRatio >= 0\.35 \|\| \(completedCount > 0 && avgScore >= 35\)/);
    assert.match(escritaCode, /allPassed && avgScore >= 75/);
    assert.match(escritaCode, /partialRatio >= 0\.70 && avgScore >= 55/);
    assert.match(escritaCode, /partialRatio >= 0\.35 \|\| \(completedCount > 0 && avgScore >= 35\)/);
});

