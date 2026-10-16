import test from 'node:test';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';

test('Sistema de Temas: Modo Claro e Modo Escuro', async (t) => {
  const browser = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await t.test('1. Deve renderizar o seletor estratégico no menu.html com usuário logado', async () => {
    await page.goto('http://localhost:3000/menu.html');
    await page.evaluate(() => {
      localStorage.setItem('aprendidos_usuario', JSON.stringify({ nome: 'Dona Maria', email: 'maria@teste.com' }));
      localStorage.removeItem('aprendidos_theme');
    });
    await page.goto('http://localhost:3000/menu.html', { waitUntil: 'networkidle2' });

    const switchExists = await page.$('.aprendidos-theme-switch');
    assert.ok(switchExists, 'O componente do switch de tema deve estar presente no menu.html');

    const userName = await page.$eval('#menuUserDisplayName', el => el.textContent.trim());
    assert.equal(userName, 'Dona', 'O primeiro nome do usuário deve ser exibido');
  });

  await t.test('2. Deve alternar para o Modo Escuro ao clicar no botão escuro', async () => {
    await page.click('.theme-switch-btn.btn-escuro');
    await new Promise(r => setTimeout(r, 400));

    const isDark = await page.evaluate(() => {
      return document.body.classList.contains('dark-mode') &&
             localStorage.getItem('aprendidos_theme') === 'dark';
    });
    assert.equal(isDark, true, 'O Modo Escuro deve estar ativado na classe do body e no localStorage');

    const btnEscuroActive = await page.$eval('.theme-switch-btn.btn-escuro', el => el.classList.contains('active'));
    assert.equal(btnEscuroActive, true, 'O botão Modo Escuro deve ter classe active');
  });

  await t.test('3. Deve manter o Modo Escuro ao navegar para licoes.html (persistência)', async () => {
    await page.goto('http://localhost:3000/licoes.html', { waitUntil: 'networkidle2' });

    const isDarkInLicoes = await page.evaluate(() => document.body.classList.contains('dark-mode'));
    assert.equal(isDarkInLicoes, true, 'O Modo Escuro deve permanecer ativo ao abrir licoes.html');

    const switchInLicoes = await page.$('.navbar .aprendidos-theme-switch');
    assert.ok(switchInLicoes, 'O switch de tema deve estar presente na navbar de licoes.html');
  });

  await t.test('4. Deve alternar de volta para Modo Claro com sucesso', async () => {
    await page.click('.theme-switch-btn.btn-claro');
    await new Promise(r => setTimeout(r, 400));

    const isLight = await page.evaluate(() => {
      return !document.body.classList.contains('dark-mode') &&
             localStorage.getItem('aprendidos_theme') === 'light';
    });
    assert.equal(isLight, true, 'O Modo Claro deve ser restaurado corretamente');
  });

  await t.test('5. Deve garantir contraste correto de inputs e letras no meunome.html no Modo Escuro', async () => {
    await page.evaluate(() => {
      localStorage.setItem('aprendidos_theme', 'dark');
    });
    await page.goto('http://localhost:3000/meunome.html', { waitUntil: 'networkidle2' });

    // Foca no input e digita um nome
    await page.type('#nameInput', 'LEONARDO');
    
    // Verifica cores do input com foco
    const inputStyles = await page.evaluate(() => {
      const input = document.getElementById('nameInput');
      const style = window.getComputedStyle(input);
      return {
        bg: style.backgroundColor,
        color: style.color
      };
    });
    // Não pode ser fundo branco puro rgb(255, 255, 255)
    assert.notEqual(inputStyles.bg, 'rgb(255, 255, 255)', 'O campo de nome não deve ter fundo branco no Modo Escuro ao digitar');

    // Clica para descobrir as letras
    await page.click('#btnAnalyze');
    await new Promise(r => setTimeout(r, 300));

    // Verifica que os tracker-chips e o card de avaliação não são brancos
    const writingStyles = await page.evaluate(() => {
      const firstChip = document.querySelector('.tracker-chip');
      const chipChar = document.querySelector('.tracker-chip .chip-char');
      const evalCard = document.getElementById('writingEvalCard');
      return {
        chipBg: firstChip ? window.getComputedStyle(firstChip).backgroundColor : null,
        chipCharColor: chipChar ? window.getComputedStyle(chipChar).color : null,
        evalBg: evalCard ? window.getComputedStyle(evalCard).backgroundColor : null
      };
    });

    assert.notEqual(writingStyles.chipBg, 'rgb(255, 255, 255)', 'Os chips das letras não devem ter fundo branco no Modo Escuro');
    assert.notEqual(writingStyles.evalBg, 'rgb(255, 255, 255)', 'O card de avaliação não deve ter fundo branco puro no Modo Escuro');
  });

  await browser.close();
});
