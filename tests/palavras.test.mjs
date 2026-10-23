import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Palavras do Dia a Dia — Verificação da Estrutura de Dados e Imagens', async (t) => {
    const palavrasJs = fs.readFileSync('palavras.js', 'utf8');
    const match = palavrasJs.match(/var catalogData = (\{[\s\S]*?\n\};)/);
    assert.ok(match, 'catalogData deve estar definido em palavras.js');

    let catalogData;
    eval('catalogData = ' + match[1]);

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    assert.equal(Object.keys(catalogData).length, 26, 'Deve conter as 26 letras do alfabeto');

    let totalWords = 0;
    let withValidImage = 0;
    let withSyllables = 0;
    let withDescription = 0;

    for (const letter of alphabet) {
        assert.ok(catalogData[letter], `catalogData deve conter a letra ${letter}`);
        assert.ok(Array.isArray(catalogData[letter].lots), `Letra ${letter} deve ter array de lotes`);

        const expectedLots = (letter === 'X' || letter === 'Y') ? 1 : 2;
        assert.equal(catalogData[letter].lots.length, expectedLots, `Letra ${letter} deve ter ${expectedLots} lote(s)`);

        for (const lot of catalogData[letter].lots) {
            const expectedWordsInLot = (letter === 'Y') ? 3 : 4;
            assert.equal(lot.length, expectedWordsInLot, `Lote da letra ${letter} deve conter ${expectedWordsInLot} palavras`);
            for (const item of lot) {
                totalWords++;
                assert.ok(item.word && typeof item.word === 'string', 'Cada item deve ter uma palavra');
                assert.ok(item.syllables && typeof item.syllables === 'string', `${item.word} deve ter separação silábica`);
                assert.ok(item.desc && typeof item.desc === 'string', `${item.word} deve ter descrição didática`);
                assert.ok(item.desc.length >= 20, `${item.word} deve ter uma descrição didática rica e completa`);

                withSyllables++;
                withDescription++;

                if (item.img && fs.existsSync(item.img)) {
                    withValidImage++;
                }
            }
        }
    }

    assert.equal(totalWords, 199, 'Deve haver 199 palavras (24 letras x 8 + 4 de X + 3 de Y)');
    assert.equal(withSyllables, 199, 'Todas as 199 palavras devem ter divisão silábica');
    assert.equal(withDescription, 199, 'Todas as 199 palavras devem ter descrição didática');
    assert.ok(withValidImage >= 195, `Pelo menos 195 palavras devem possuir arquivos de imagem válidos no disco (encontrados: ${withValidImage})`);
});

test('Palavras do Dia a Dia — Verificação da Interface HTML do Modal', async (t) => {
    const palavrasHtml = fs.readFileSync('palavras.html', 'utf8');

    // Elementos fundamentais do modal didático
    assert.ok(palavrasHtml.includes('id="palavraModal"'), 'Deve conter o modal palavraModal');
    assert.ok(palavrasHtml.includes('class="palavra-backdrop"'), 'Deve conter o backdrop do modal');
    assert.ok(palavrasHtml.includes('class="palavra-dialog"'), 'Deve conter o diálogo do modal');
    assert.ok(palavrasHtml.includes('id="palavraModalImg"'), 'Deve conter a foto maior palavraModalImg');
    assert.ok(palavrasHtml.includes('id="palavraBigWord"'), 'Deve conter o título da palavra');
    assert.ok(palavrasHtml.includes('id="palavraSyllablesPills"'), 'Deve conter as pílulas de sílabas');
    assert.ok(palavrasHtml.includes('id="palavraDescText"'), 'Deve conter o texto da descrição didática');
    assert.ok(palavrasHtml.includes('id="btnPalavraModalPrev"'), 'Deve conter o botão de palavra anterior');
    assert.ok(palavrasHtml.includes('id="btnPalavraModalNext"'), 'Deve conter o botão de próxima palavra');
    assert.ok(palavrasHtml.includes('id="palavraStepDots"'), 'Deve conter os indicadores das palavras');
    assert.ok(palavrasHtml.includes('btn-open-modal-palavras'), 'Deve conter o botão para abrir o modal na vitrine');
});
