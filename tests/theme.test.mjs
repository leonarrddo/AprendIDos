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

  await browser.close();
});
