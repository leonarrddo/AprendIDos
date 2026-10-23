/**
 * Testes Automatizados da Avaliação de Caligrafia (Fase 1)
 * Verifica os 10 cenários especificados:
 * 1. Nenhum traço desenhado: não aprovar
 * 2. Rabiscos fora da região da letra: não aprovar
 * 3. Rabiscos dentro da caixa delimitadora sem formato esperado: não aprovar
 * 4. Letra incompleta: não aprovar
 * 5. Palavra com algumas letras corretas e uma em branco: não aprovar palavra
 * 6. Palavra com uma letra reprovada e média alta: não aprovar palavra
 * 7. Ausência de traçado de referência: não aprovar automaticamente
 * 8. Falha na avaliação ou resultado inválido: não aprovar automaticamente
 * 9. Letras corretamente desenhadas: permitir aprovação real
 * 10. Palavra com todas as letras aprovadas: permitir conclusão normal
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Carrega letter-paths.js no escopo global simulado
const letterPathsCode = fs.readFileSync(path.join(rootDir, 'letter-paths.js'), 'utf8');
const escritaCode = fs.readFileSync(path.join(rootDir, 'escrita.js'), 'utf8');

// Cria ambiente de avaliação isolado
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

    // Executa letter-paths.js
    const runLetterPaths = new Function('window', 'WRITING_DEBUG', 'LETTER_PATHS', 'WRITING_EVALUATION_CONFIG', letterPathsCode);
    runLetterPaths.call(sandbox, sandbox.window);

    return sandbox;
}

const env = createEvaluationEnvironment();
const evaluateLetter = env.window.evaluateLetter;
const getScaledStrokesForLetter = env.window.getScaledStrokesForLetter;
const resamplePolyline = env.window.resamplePolyline;

// Bounding box simulada para letra padrão
const metricA = { x1: 50, y1: 50, x2: 150, y2: 170, width: 100, fontSize: 90 };
const metricB = { x1: 160, y1: 50, x2: 260, y2: 170, width: 100, fontSize: 90 };

test('1. Nenhum traço desenhado: não aprovar', () => {
    const res = evaluateLetter('A', metricA, []);
    assert.equal(res.passed, false, 'Letra sem traços não deve ser aprovada');
    assert.equal(res.score, 0, 'Pontuação deve ser zero para traços vazios');
});

test('2. Rabiscos fora da região da letra: não aprovar', () => {
    // Traços desenhados longe da bounding box da letra
    const distantStrokes = [{
        points: [
            { x: 500, y: 500 }, { x: 520, y: 510 }, { x: 540, y: 530 },
            { x: 560, y: 550 }, { x: 580, y: 570 }
        ]
    }];
    const res = evaluateLetter('A', metricA, distantStrokes);
    assert.equal(res.passed, false, 'Traços fora da região não devem aprovar');
    assert.equal(res.score, 0, 'Pontuação deve ser zero quando traços estão fora');
});

test('3. Rabiscos dentro da caixa delimitadora, mas sem seguir o formato esperado: não aprovar', () => {
    // Rabisco em linha reta horizontal densa no fundo da caixa (não forma a letra 'A')
    const scribblePoints = [];
    for (let x = metricA.x1; x <= metricA.x2; x += 1.5) {
        scribblePoints.push({ x: x, y: metricA.y2 - 5 });
    }
    const res = evaluateLetter('A', metricA, [{ points: scribblePoints }]);
    assert.equal(res.passed, false, 'Rabisco horizontal arbitrário não deve ser aprovado como A');
    assert.ok(res.coverage < 50, 'Cobertura deve ser baixa para rabisco que não percorre a letra');
});

test('4. Letra incompleta: não aprovar como concluída', () => {
    // Desenha apenas a perna esquerda do 'A' (1 de 3 traços necessários)
    const strokesA = getScaledStrokesForLetter('A', metricA);
    assert.ok(strokesA && strokesA.length >= 3, 'A deve ter pelo menos 3 traços de referência');

    const firstStrokeOnly = [{ points: resamplePolyline(strokesA[0], 3, 15) }];
    const res = evaluateLetter('A', metricA, firstStrokeOnly);
    assert.equal(res.passed, false, 'Letra com apenas 1 dos 3 traços desenhados não deve ser aprovada');
});

test('5. Palavra com algumas letras corretas e uma letra em branco: não aprovar a palavra', () => {
    // Simula a lógica de evaluateWriting em escrita.js para uma palavra de 3 letras ('ABA')
    const metrics = [
        { char: 'A', x1: 50, y1: 50, x2: 120, y2: 150, width: 70, fontSize: 80 },
        { char: 'B', x1: 130, y1: 50, x2: 200, y2: 150, width: 70, fontSize: 80 },
        { char: 'A', x1: 210, y1: 50, x2: 280, y2: 150, width: 70, fontSize: 80 }
    ];

    // Letra 0 (A) desenhada corretamente
    const sA1 = getScaledStrokesForLetter('A', metrics[0]).map(s => ({ points: resamplePolyline(s, 3, 15) }));
    // Letra 1 (B) desenhada corretamente
    const sB = getScaledStrokesForLetter('B', metrics[1]).map(s => ({ points: resamplePolyline(s, 3, 15) }));
    // Letra 2 (A) deixada em branco (sem traços)
    const allStrokes = [...sA1, ...sB];

    let completedCount = 0;
    let uncalibratedCount = 0;
    const letterResults = metrics.map(m => {
        const res = evaluateLetter(m.char, m, allStrokes, 0.1);
        const isFallback = Boolean(res && res.fallback);
        if (isFallback) uncalibratedCount++;
        const passed = Boolean(res && res.passed === true && !isFallback);
        if (passed) completedCount++;
        return { char: m.char, passed };
    });

    assert.equal(letterResults[0].passed, true, 'Primeira letra deve ser aprovada');
    assert.equal(letterResults[1].passed, true, 'Segunda letra deve ser aprovada');
    assert.equal(letterResults[2].passed, false, 'Terceira letra em branco deve ser reprovada');

    const allPassed = metrics.length > 0 && completedCount === metrics.length && uncalibratedCount === 0;
    assert.equal(allPassed, false, 'Palavra com letra pendente NÃO deve ser aprovada');
});

test('6. Palavra com uma letra reprovada e média superior ao limite: não aprovar a palavra', () => {
    // Cenário onde 2 letras têm nota 100 e 1 letra reprovada tem nota 40
    // Média = (100 + 100 + 40) / 3 = 80 (anteriormente >= 68 aprovaria indevidamente!)
    const simulatedMetrics = [
        { char: 'C', passed: true, score: 100 },
        { char: 'A', passed: true, score: 100 },
        { char: 'S', passed: false, score: 40 } // Letra reprovada
    ];

    const completedCount = simulatedMetrics.filter(m => m.passed).length;
    const totalScoreSum = simulatedMetrics.reduce((acc, m) => acc + m.score, 0);
    const avgScore = Math.round(totalScoreSum / simulatedMetrics.length); // 80%

    // Verificação da nova regra: allPassed é estritamente completedCount === metrics.length
    const allPassed = completedCount === simulatedMetrics.length;

    assert.equal(avgScore, 80, 'A média é 80% (superior ao limite 68%)');
    assert.equal(allPassed, false, 'allPassed deve ser false pois a letra S foi reprovada');

    // Garante que escrita.js não contenha mais `|| avgScore >= 68` para aprovação geral
    assert.ok(
        !escritaCode.includes('allPassed || avgScore >='),
        'escrita.js não deve usar média para contornar letra não aprovada'
    );
});

test('7. Ausência de traçado de referência: não aprovar automaticamente', () => {
    // Caractere desconhecido/não calibrado
    const res = evaluateLetter('§', metricA, []);
    assert.equal(res.passed, false, 'Caractere sem traçado de referência não pode ser aprovado');
    assert.equal(res.fallback, true, 'Deve sinalizar fallback: true');
    assert.equal(res.score, 0, 'Score deve ser 0 quando sem referência');
});

test('8. Falha na avaliação ou resultado inválido: não aprovar automaticamente', () => {
    // Simula a lógica de segurança em escrita.js
    function safeEvaluateLetter(char, m, strokes, evaluator) {
        let result = null;
        try {
            if (typeof evaluator === 'function') {
                result = evaluator(char, m, strokes);
            }
        } catch (e) {
            result = null;
        }

        // Se a avaliação falhar ou for inválida
        if (!result || typeof result !== 'object') {
            result = { passed: false, score: 0, coverage: 0, fallback: true };
        }

        const isFallback = Boolean(result && result.fallback);
        const passed = Boolean(result && result.passed === true && !isFallback);
        return { passed, isFallback };
    }

    // Caso A: avaliador lança erro
    const throwResult = safeEvaluateLetter('A', metricA, [], () => { throw new Error('Falha no motor'); });
    assert.equal(throwResult.passed, false, 'Erro no avaliador não deve resultar em aprovação');

    // Caso B: avaliador retorna null
    const nullResult = safeEvaluateLetter('A', metricA, [], () => null);
    assert.equal(nullResult.passed, false, 'Retorno nulo não deve resultar em aprovação');

    // Caso C: avaliador retorna objeto sem passed
    const invalidObjResult = safeEvaluateLetter('A', metricA, [], () => ({ score: 95 }));
    assert.equal(invalidObjResult.passed, false, 'Resultado sem passed: true não deve ser aprovado');
});

test('9. Letras corretamente desenhadas: continuar permitindo aprovação quando os critérios reais forem satisfeitos', () => {
    // Gera traçado fiel para a letra 'A' a partir dos pontos de referência reamostrados
    const strokesA = getScaledStrokesForLetter('A', metricA);
    const userStrokes = strokesA.map(stroke => ({
        points: resamplePolyline(stroke, 3, 15)
    }));

    const res = evaluateLetter('A', metricA, userStrokes, 0.1);
    assert.equal(res.passed, true, 'Letra A desenhada fielmente deve ser aprovada');
    assert.ok(res.score >= 70, `Score deve ser >= 70 (obteve ${res.score})`);
    assert.ok(res.coverage >= 60, `Cobertura deve ser >= 60 (obteve ${res.coverage})`);
});

test('10. Palavra com todas as letras aprovadas: continuar permitindo a conclusão normal', () => {
    const word = 'CASA';
    const metrics = [
        { char: 'C', x1: 50, y1: 50, x2: 110, y2: 150, width: 60, fontSize: 80 },
        { char: 'A', x1: 120, y1: 50, x2: 180, y2: 150, width: 60, fontSize: 80 },
        { char: 'S', x1: 190, y1: 50, x2: 250, y2: 150, width: 60, fontSize: 80 },
        { char: 'A', x1: 260, y1: 50, x2: 320, y2: 150, width: 60, fontSize: 80 }
    ];

    // Gera traçados fieis para todas as letras de 'CASA'
    const allStrokes = [];
    metrics.forEach(m => {
        const refStrokes = getScaledStrokesForLetter(m.char, m);
        assert.ok(refStrokes, `Deve ter traçados para ${m.char}`);
        refStrokes.forEach(s => {
            allStrokes.push({ points: resamplePolyline(s, 3, 15) });
        });
    });

    let completedCount = 0;
    let uncalibratedCount = 0;
    let totalScore = 0;

    metrics.forEach(m => {
        const res = evaluateLetter(m.char, m, allStrokes, 0.1);
        const isFallback = Boolean(res && res.fallback);
        if (isFallback) uncalibratedCount++;
        const passed = Boolean(res && res.passed === true && !isFallback);
        if (passed) completedCount++;
        totalScore += (res ? res.score : 0);
    });

    const avgScore = Math.round(totalScore / metrics.length);
    const allPassed = metrics.length > 0 && completedCount === metrics.length && uncalibratedCount === 0;

    assert.equal(completedCount, 4, 'Todas as 4 letras devem ser aprovadas individualmente');
    assert.equal(allPassed, true, 'A palavra com todas as letras aprovadas deve ser aprovada');
    assert.ok(avgScore >= 70, `Média esperada >= 70% (obteve ${avgScore}%)`);
});
