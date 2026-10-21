import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Sílabas — Verificação de Estrutura de Dados e Sintaxe JS', async (t) => {
    const silabasJs = fs.readFileSync('silabas.js', 'utf8');

    // 1. Não pode conter o ReferenceError "correct ? 200 : 800"
    assert.equal(
        silabasJs.includes('correct ? 200 : 800'),
        false,
        'Não deve conter a variável inexistente "correct ?" em silabas.js'
    );
    assert.ok(
        silabasJs.includes('isCorrect ?'),
        'Deve utilizar "isCorrect ?" como condição de delay/feedback'
    );

    // 2. Extrai e testa wordBank
    const match = silabasJs.match(/var wordBank = (\[[\s\S]*?\n\];)/);
    assert.ok(match, 'wordBank deve estar definido em silabas.js');

    let wordBank;
    eval('wordBank = ' + match[1]);

    assert.ok(Array.isArray(wordBank), 'wordBank deve ser um array');
    assert.ok(wordBank.length >= 10, 'wordBank deve conter pelo menos 10 palavras');

    for (const item of wordBank) {
        assert.ok(item.word && typeof item.word === 'string', 'Cada item deve ter word');
        assert.ok(item.syl1 && typeof item.syl1 === 'string', `${item.word} deve ter syl1`);
        assert.ok(item.syl2 && typeof item.syl2 === 'string', `${item.word} deve ter syl2`);
        assert.ok(Array.isArray(item.distractors) && item.distractors.length >= 4, `${item.word} deve ter distractors`);
    }
});

test('Sílabas — Verificação do Sistema de Áudio Blindado Contra Repetição e Eco', async (t) => {
    const silabasJs = fs.readFileSync('silabas.js', 'utf8');

    // Deve possuir o gerador de controle de áudio e cancelamento global
    assert.ok(silabasJs.includes('speechGeneration'), 'Deve implementar speechGeneration');
    assert.ok(silabasJs.includes('function stopAllAudio()'), 'Deve implementar stopAllAudio()');
    assert.ok(silabasJs.includes('fallbackTriggered'), 'Deve possuir a flag fallbackTriggered para impedir fala duplicada');
    assert.ok(silabasJs.includes('window.stopAllAudio = stopAllAudio'), 'Deve exportar stopAllAudio no window');
});

test('Sílabas — Verificação de HTML, Acessibilidade e Content Security Policy (CSP)', async (t) => {
    const silabasHtml = fs.readFileSync('silabas.html', 'utf8');

    // CSP com permissão de áudio
    assert.ok(
        silabasHtml.includes("media-src 'self' data: blob: https://translate.google.com;"),
        'silabas.html deve autorizar https://translate.google.com em media-src na CSP'
    );

    // Elementos essenciais do fluxo de exercício
    assert.ok(silabasHtml.includes('id="exerciseLayout"'), 'Deve conter exerciseLayout');
    assert.ok(silabasHtml.includes('id="optionsContainer"'), 'Deve conter optionsContainer');
    assert.ok(silabasHtml.includes('id="feedbackArea"'), 'Deve conter feedbackArea');
    assert.ok(silabasHtml.includes('id="completionScreen"'), 'Deve conter completionScreen');
    assert.ok(silabasHtml.includes('id="hitsCount"'), 'Deve conter hitsCount');
    assert.ok(silabasHtml.includes('id="missesCount"'), 'Deve conter missesCount');
    assert.ok(silabasHtml.includes('id="progressFill"'), 'Deve conter progressFill');
    assert.ok(silabasHtml.includes('id="progressBar"'), 'Deve conter progressBar');
    assert.ok(silabasHtml.includes('.btn-next {'), 'Deve conter estilo CSS para a classe .btn-next');
});

test('Sílabas — Simulação do Fluxo do Exercício e Geração de Opções', async (t) => {
    const silabasJs = fs.readFileSync('silabas.js', 'utf8');

    // Criamos um ambiente mock leve para testar buildOptions e fluxo
    const mockWindow = {
        speechSynthesis: {
            cancel: () => {},
            speak: () => {},
            getVoices: () => []
        }
    };
    const mockDoc = {
        addEventListener: () => {},
        querySelectorAll: () => [],
        querySelector: () => null,
        getElementById: () => null,
        readyState: 'complete'
    };

    // Avalia as funções puras de silabas.js em escopo simulado
    const sandboxFn = new Function('window', 'document', `
        ${silabasJs}
        return { wordBank, buildOptions, shuffle };
    `);

    const { wordBank, buildOptions } = sandboxFn(mockWindow, mockDoc);

    for (const q of wordBank.slice(0, 5)) {
        const opts = buildOptions(q);
        assert.equal(opts.length, 3, 'Cada pergunta deve gerar exatamente 3 opções');
        
        const correctCount = opts.filter(o => o.s1 === q.syl1 && o.s2 === q.syl2).length;
        assert.equal(correctCount, 1, `Deve existir exatamente 1 opção correta para a palavra ${q.word}`);

        opts.forEach(opt => {
            assert.ok(opt.s1 && typeof opt.s1 === 'string', 'Sílaba 1 deve existir');
            assert.ok(opt.s2 && typeof opt.s2 === 'string', 'Sílaba 2 deve existir');
        });
    }
});
