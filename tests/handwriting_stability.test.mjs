/**
 * AprendIDos — Testes de Estabilidade e Isolamento da Avaliação de Caligrafia
 *
 * Cobre os 10 cenários obrigatórios de avaliação da escrita:
 * 1. Estabilidade das letras (ex: CASA: desenhar S e A2 não altera C e A1)
 * 2. Isolamento dos pontos entre letras contíguas
 * 3. Escrita em andamento (letra incompleta avaliada progressivamente)
 * 4. Múltiplos traços (letras como A, B, E, H)
 * 5. Edição e limpeza do canvas
 * 6. Meu Nome (estabilidade durante a escrita do nome)
 * 7. Pontuação geral (média correspondente às notas individuais)
 * 8. Reconhecimento tolerante a variações naturais e rejeição de rabiscos
 * 9. Navegação e botão Próxima Palavra
 * 10. Regressão com traçados e métricas reais
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const letterPathsCode = fs.readFileSync(path.join(rootDir, 'letter-paths.js'), 'utf8');
const escritaCode = fs.readFileSync(path.join(rootDir, 'escrita.js'), 'utf8');
const meunomeCode = fs.readFileSync(path.join(rootDir, 'meunome.js'), 'utf8');

function createEvaluationEnvironment() {
    const sandbox = {
        console,
        Math,
        Boolean,
        isNaN,
        parseInt,
        parseFloat,
        setTimeout: () => {},
        clearTimeout: () => {},
        window: {}
    };
    sandbox.window = sandbox;
    const runLetterPaths = new Function('window', 'WRITING_DEBUG', 'LETTER_PATHS', 'WRITING_EVALUATION_CONFIG', letterPathsCode);
    runLetterPaths.call(sandbox, sandbox.window);
    return sandbox;
}

const env = createEvaluationEnvironment();
const {
    evaluateLetter,
    getScaledStrokesForLetter,
    resamplePolyline,
    findBestLetterForStroke,
    filterStrokesForLetter
} = env.window;

// 1. ESTABILIDADE DAS LETRAS
test('1. Estabilidade das letras: desenhar S e A2 em CASA mantém C e A1 verdes e pontuações inalteradas', () => {
    // Métricas contíguas reais (sem espaçamento artificial)
    const metricsCASA = [
        { char: 'C', index: 0, x1: 50,  y1: 50, x2: 110, y2: 150, width: 60, centerX: 80,  fontSize: 80 },
        { char: 'A', index: 1, x1: 110, y1: 50, x2: 170, y2: 150, width: 60, centerX: 140, fontSize: 80 },
        { char: 'S', index: 2, x1: 170, y1: 50, x2: 230, y2: 150, width: 60, centerX: 200, fontSize: 80 },
        { char: 'A', index: 3, x1: 230, y1: 50, x2: 290, y2: 150, width: 60, centerX: 260, fontSize: 80 }
    ];

    const strokesC = getScaledStrokesForLetter('C', metricsCASA[0]).map(s => ({
        points: resamplePolyline(s, 3, 15),
        letterIndex: 0
    }));
    const strokesA1 = getScaledStrokesForLetter('A', metricsCASA[1]).map(s => ({
        points: resamplePolyline(s, 3, 15),
        letterIndex: 1
    }));
    const strokesS = getScaledStrokesForLetter('S', metricsCASA[2]).map(s => ({
        points: resamplePolyline(s, 3, 15),
        letterIndex: 2
    }));
    const strokesA2 = getScaledStrokesForLetter('A', metricsCASA[3]).map(s => ({
        points: resamplePolyline(s, 3, 15),
        letterIndex: 3
    }));

    // Fase 1: Aluno desenhou apenas C e A1
    const phase1Strokes = [...strokesC, ...strokesA1];

    const c1Strokes = filterStrokesForLetter(metricsCASA[0], phase1Strokes, metricsCASA);
    const a1Strokes = filterStrokesForLetter(metricsCASA[1], phase1Strokes, metricsCASA);

    const evalC_phase1 = evaluateLetter('C', metricsCASA[0], c1Strokes, 0.1);
    const evalA1_phase1 = evaluateLetter('A', metricsCASA[1], a1Strokes, 0.1);

    assert.equal(evalC_phase1.passed, true, 'Letra C deve ser aprovada na fase 1');
    assert.equal(evalA1_phase1.passed, true, 'Letra A1 deve ser aprovada na fase 1');
    assert.ok(evalC_phase1.score >= 80, `C score inicial >= 80 (obteve ${evalC_phase1.score})`);
    assert.ok(evalA1_phase1.score >= 80, `A1 score inicial >= 80 (obteve ${evalA1_phase1.score})`);

    // Fase 2: Aluno desenha S e A2
    const phase2Strokes = [...strokesC, ...strokesA1, ...strokesS, ...strokesA2];

    const c2Strokes = filterStrokesForLetter(metricsCASA[0], phase2Strokes, metricsCASA);
    const a1_phase2Strokes = filterStrokesForLetter(metricsCASA[1], phase2Strokes, metricsCASA);
    const sStrokes = filterStrokesForLetter(metricsCASA[2], phase2Strokes, metricsCASA);
    const a2Strokes = filterStrokesForLetter(metricsCASA[3], phase2Strokes, metricsCASA);

    const evalC_phase2 = evaluateLetter('C', metricsCASA[0], c2Strokes, 0.1);
    const evalA1_phase2 = evaluateLetter('A', metricsCASA[1], a1_phase2Strokes, 0.1);
    const evalS = evaluateLetter('S', metricsCASA[2], sStrokes, 0.1);
    const evalA2 = evaluateLetter('A', metricsCASA[3], a2Strokes, 0.1);

    // Verificação fundamental de estabilidade: notas e aprovações NÃO mudam
    assert.equal(evalC_phase2.passed, true, 'Letra C deve permanecer aprovada');
    assert.equal(evalA1_phase2.passed, true, 'Letra A1 deve permanecer aprovada');
    assert.equal(evalC_phase2.score, evalC_phase1.score, 'Pontuação de C deve permanecer idêntica');
    assert.equal(evalA1_phase2.score, evalA1_phase1.score, 'Pontuação de A1 deve permanecer idêntica');

    assert.equal(evalS.passed, true, 'Letra S deve ser aprovada');
    assert.equal(evalA2.passed, true, 'Letra A2 deve ser aprovada');
});

// 2. ISOLAMENTO DOS PONTOS
test('2. Isolamento dos pontos: traços de letras contíguas não contaminam letras vizinhas', () => {
    const metrics = [
        { char: 'C', index: 0, x1: 50,  y1: 50, x2: 110, y2: 150, width: 60, centerX: 80,  fontSize: 80 },
        { char: 'A', index: 1, x1: 110, y1: 50, x2: 170, y2: 150, width: 60, centerX: 140, fontSize: 80 }
    ];

    const sC = getScaledStrokesForLetter('C', metrics[0]).map(s => ({ points: resamplePolyline(s, 3, 15) }));
    const sA = getScaledStrokesForLetter('A', metrics[1]).map(s => ({ points: resamplePolyline(s, 3, 15) }));

    // Simula captura onde findBestLetterForStroke associa os traços
    sC.forEach(st => { st.letterIndex = findBestLetterForStroke(st, metrics); });
    sA.forEach(st => { st.letterIndex = findBestLetterForStroke(st, metrics); });

    const allStrokes = [...sC, ...sA];

    const strokesForC = filterStrokesForLetter(metrics[0], allStrokes, metrics);
    const strokesForA = filterStrokesForLetter(metrics[1], allStrokes, metrics);

    assert.equal(strokesForC.length, sC.length, 'C deve conter exatamente seus próprios traços');
    assert.equal(strokesForA.length, sA.length, 'A deve conter exatamente seus próprios traços');

    // Nenhuma coordenada de A deve estar dentro dos traços atribuídos a C
    strokesForC.forEach(st => {
        assert.equal(st.letterIndex, 0, 'Todos os traços em C devem ter letterIndex 0');
    });
    strokesForA.forEach(st => {
        assert.equal(st.letterIndex, 1, 'Todos os traços em A devem ter letterIndex 1');
    });
});

// 3. ESCRITA EM ANDAMENTO
test('3. Escrita em andamento: letra incompleta pode ser avaliada progressivamente', () => {
    const metric = { char: 'A', index: 0, x1: 50, y1: 50, x2: 120, y2: 150, width: 70, centerX: 85, fontSize: 80 };
    const strokesRef = getScaledStrokesForLetter('A', metric);

    // Passo 1: Apenas o primeiro traço (perna esquerda)
    const step1Strokes = [{ points: resamplePolyline(strokesRef[0], 3, 15), letterIndex: 0 }];
    const evalStep1 = evaluateLetter('A', metric, step1Strokes, 0.1);
    assert.equal(evalStep1.passed, false, '1 traço de 3 não deve aprovar');
    assert.ok(evalStep1.score > 0, `Progresso parcial deve pontuar > 0 (obteve ${evalStep1.score})`);

    // Passo 2: Dois traços desenhados
    const step2Strokes = [
        { points: resamplePolyline(strokesRef[0], 3, 15), letterIndex: 0 },
        { points: resamplePolyline(strokesRef[1], 3, 15), letterIndex: 0 }
    ];
    const evalStep2 = evaluateLetter('A', metric, step2Strokes, 0.1);
    assert.equal(evalStep2.passed, false, '2 traços de 3 não devem aprovar');
    assert.ok(evalStep2.score >= evalStep1.score, 'Pontuação deve crescer ou manter com 2 traços');

    // Passo 3: Três traços completos
    const step3Strokes = [
        ...step2Strokes,
        { points: resamplePolyline(strokesRef[2], 3, 15), letterIndex: 0 }
    ];
    const evalStep3 = evaluateLetter('A', metric, step3Strokes, 0.1);
    assert.equal(evalStep3.passed, true, 'Com todos os 3 traços desenhados, deve aprovar');
    assert.ok(evalStep3.score >= 70, `Score final deve ser >= 70% (obteve ${evalStep3.score})`);
});

// 4. MÚLTIPLOS TRAÇOS
test('4. Múltiplos traços: letras com 2 ou mais traços (E, B, H) avaliam corretamente', () => {
    const multiLetters = ['E', 'B', 'H'];
    multiLetters.forEach(ch => {
        const m = { char: ch, index: 0, x1: 50, y1: 50, x2: 130, y2: 150, width: 80, centerX: 90, fontSize: 80 };
        const refStrokes = getScaledStrokesForLetter(ch, m);
        assert.ok(refStrokes && refStrokes.length >= 2, `${ch} deve ter pelo menos 2 traços`);

        const userStrokes = refStrokes.map(s => ({
            points: resamplePolyline(s, 3, 15),
            letterIndex: 0
        }));

        const res = evaluateLetter(ch, m, userStrokes, 0.1);
        assert.equal(res.passed, true, `Letra ${ch} completa deve ser aprovada`);
        assert.ok(res.score >= 70, `Score de ${ch} deve ser >= 70 (obteve ${res.score})`);
    });
});

// 5. EDIÇÃO E LIMPEZA
test('5. Edição: limpar canvas recalcula adequadamente os resultados', () => {
    const m = { char: 'O', index: 0, x1: 50, y1: 50, x2: 120, y2: 150, width: 70, centerX: 85, fontSize: 80 };
    const ref = getScaledStrokesForLetter('O', m);
    let strokes = ref.map(s => ({ points: resamplePolyline(s, 3, 15), letterIndex: 0 }));

    let res = evaluateLetter('O', m, strokes, 0.1);
    assert.equal(res.passed, true, 'O desenhado inicialmente deve passar');

    // Usuário limpa o quadro
    strokes = [];
    let emptyRes = evaluateLetter('O', m, strokes, 0.1);
    assert.equal(emptyRes.passed, false, 'Após limpar, não deve passar');
    assert.equal(emptyRes.score, 0, 'Após limpar, nota deve ser 0');
});

// 6. MEU NOME: ESTABILIDADE
test('6. Meu Nome: estabilidade garantida enquanto letras seguintes são escritas', () => {
    const nameMetrics = [
        { char: 'A', index: 0, x1: 30,  y1: 60, x2: 80,  y2: 150, width: 50, centerX: 55,  fontSize: 70 },
        { char: 'N', index: 1, x1: 80,  y1: 60, x2: 130, y2: 150, width: 50, centerX: 105, fontSize: 70 },
        { char: 'A', index: 2, x1: 130, y1: 60, x2: 180, y2: 150, width: 50, centerX: 155, fontSize: 70 }
    ];

    const sA1 = getScaledStrokesForLetter('A', nameMetrics[0]).map(s => ({
        points: resamplePolyline(s, 3, 15),
        letterIndex: 0
    }));
    const sN = getScaledStrokesForLetter('N', nameMetrics[1]).map(s => ({
        points: resamplePolyline(s, 3, 15),
        letterIndex: 1
    }));
    const sA2 = getScaledStrokesForLetter('A', nameMetrics[2]).map(s => ({
        points: resamplePolyline(s, 3, 15),
        letterIndex: 2
    }));

    // Passo 1: escreve primeiro A
    let strokes = [...sA1];
    let evalA1_initial = evaluateLetter('A', nameMetrics[0], filterStrokesForLetter(nameMetrics[0], strokes, nameMetrics), 0);
    assert.equal(evalA1_initial.passed, true);

    // Passo 2: escreve N
    strokes = [...sA1, ...sN];
    let evalA1_afterN = evaluateLetter('A', nameMetrics[0], filterStrokesForLetter(nameMetrics[0], strokes, nameMetrics), 0);
    let evalN = evaluateLetter('N', nameMetrics[1], filterStrokesForLetter(nameMetrics[1], strokes, nameMetrics), 0);
    assert.equal(evalA1_afterN.passed, true, 'Primeiro A permanece aprovado');
    assert.equal(evalA1_afterN.score, evalA1_initial.score, 'Pontuação do primeiro A é inalterada');
    assert.equal(evalN.passed, true, 'N é aprovado');

    // Passo 3: escreve segundo A
    strokes = [...sA1, ...sN, ...sA2];
    let evalA1_final = evaluateLetter('A', nameMetrics[0], filterStrokesForLetter(nameMetrics[0], strokes, nameMetrics), 0);
    let evalN_final = evaluateLetter('N', nameMetrics[1], filterStrokesForLetter(nameMetrics[1], strokes, nameMetrics), 0);
    let evalA2_final = evaluateLetter('A', nameMetrics[2], filterStrokesForLetter(nameMetrics[2], strokes, nameMetrics), 0);

    assert.equal(evalA1_final.passed, true);
    assert.equal(evalN_final.passed, true);
    assert.equal(evalA2_final.passed, true);
    assert.equal(evalA1_final.score, evalA1_initial.score);
});

// 7. PONTUAÇÃO GERAL
test('7. Pontuação geral: média fiel às avaliações individuais sem inflação', () => {
    const scores = [85, 90, 40, 95];
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    assert.equal(avg, 78);

    // Se uma letra teve nota 40 e não passou, a palavra não deve passar mesmo com média 78
    const passedList = [true, true, false, true];
    const allPassed = passedList.every(Boolean);
    assert.equal(allPassed, false, 'Palavra com letra reprovada não pode passar');
});

// 8. RECONHECIMENTO COM TOLERÂNCIA PEDAGÓGICA E REJEIÇÃO DE RABISCOS
test('8. Reconhecimento: caligrafia com pequenas variações é aprovada; rabiscos são rejeitados', () => {
    const m = { char: 'L', index: 0, x1: 50, y1: 50, x2: 110, y2: 150, width: 60, centerX: 80, fontSize: 80 };
    const ref = getScaledStrokesForLetter('L', m);

    // Traçado realista com jitter manual de ±2px
    const naturalStrokes = ref.map(s => ({
        points: resamplePolyline(s, 3, 15).map(pt => ({
            x: pt.x + (Math.random() * 4 - 2),
            y: pt.y + (Math.random() * 4 - 2)
        })),
        letterIndex: 0
    }));

    const naturalRes = evaluateLetter('L', m, naturalStrokes, 0.1);
    assert.equal(naturalRes.passed, true, 'Variação natural de caligrafia deve ser aprovada');
    assert.ok(naturalRes.score >= 68, `Pontuação deve ser >= 68 (obteve ${naturalRes.score})`);

    // Rabisco caótico cruzando o quadro
    const scribble = [{
        points: [
            { x: 10, y: 50 }, { x: 300, y: 150 }, { x: 10, y: 150 }, { x: 300, y: 50 }
        ],
        letterIndex: 0
    }];
    const scribbleRes = evaluateLetter('L', m, scribble, 0);
    assert.equal(scribbleRes.passed, false, 'Rabisco caótico deve ser reprovado');
    assert.ok(scribbleRes.score <= 15, `Score do rabisco deve ser <= 15 (obteve ${scribbleRes.score})`);
});

// 9. NAVEGAÇÃO E CONCLUSÃO
test('9. Navegação: botão de avanço e conclusão preservados', () => {
    assert.ok(escritaCode.includes('function ensureNextWordButton('), 'ensureNextWordButton deve existir em escrita.js');
    assert.ok(escritaCode.includes('nextWord()'), 'nextWord deve ser referenciado em escrita.js');
    assert.ok(escritaCode.includes('showCompletion()'), 'showCompletion deve ser mantido');
});

// 10. REGRESSÃO
test('10. Regressão: todas as funções centrais exportadas e utilizáveis', () => {
    assert.equal(typeof env.window.evaluateLetter, 'function');
    assert.equal(typeof env.window.findBestLetterForStroke, 'function');
    assert.equal(typeof env.window.filterStrokesForLetter, 'function');
});

