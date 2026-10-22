import test from 'node:test';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

function createStaticServer() {
  const root = process.cwd();
  const mimes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  return http.createServer((req, res) => {
    let safePath = path.normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '\\') safePath = '/index.html';
    const filePath = path.join(root, safePath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimes[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
}

test('Sistema de Temas: Modo Claro e Modo Escuro', async (t) => {
  const server = createStaticServer();
  const port = await new Promise((resolve) => {
    server.listen(0, () => resolve(server.address().port));
  });

  t.after(() => {
    if (server) server.close();
  });

  const browser = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await t.test('1. Deve renderizar o seletor estratégico no menu.html com usuário logado', async () => {
    await page.goto(`http://localhost:${port}/menu.html`);
    await page.evaluate(() => {
      localStorage.setItem('aprendidos_usuario', JSON.stringify({ nome: 'Dona Maria', email: 'maria@teste.com' }));
      localStorage.removeItem('aprendidos_theme');
    });
    await page.goto(`http://localhost:${port}/menu.html`, { waitUntil: 'networkidle2' });

    const switchExists = await page.$('.aprendidos-theme-switch');
    assert.ok(switchExists, 'O componente do switch de tema deve estar presente no menu.html');

    // Validação de botão único e formato circular (PARTE 1)
    const buttonCount = await page.$$eval('.aprendidos-theme-switch button', btns => btns.length);
    assert.equal(buttonCount, 1, 'Deve possuir UM ÚNICO botão dentro do switch de tema');

    const buttonAttrs = await page.$eval('.theme-toggle-btn', el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        borderRadius: style.borderRadius,
        ariaLabel: el.getAttribute('aria-label'),
        textContent: el.textContent.trim()
      };
    });

    assert.ok(buttonAttrs.width >= 44 && buttonAttrs.width <= 50, 'Largura do botão deve estar entre 44px e 48px');
    assert.ok(buttonAttrs.height >= 44 && buttonAttrs.height <= 50, 'Altura do botão deve estar entre 44px e 48px');
    assert.equal(buttonAttrs.textContent, '☀️', 'No modo claro deve exibir o ícone de sol');
    assert.equal(buttonAttrs.ariaLabel, 'Ativar modo escuro', 'No modo claro aria-label deve ser Ativar modo escuro');

    const userName = await page.$eval('#menuUserDisplayName', el => el.textContent.trim());
    assert.equal(userName, 'Dona', 'O primeiro nome do usuário deve ser exibido');
  });

  await t.test('2. Deve alternar para o Modo Escuro ao clicar no botão circular de tema', async () => {
    await page.click('.theme-toggle-btn');
    await new Promise(r => setTimeout(r, 400));

    const isDark = await page.evaluate(() => {
      return document.body.classList.contains('dark-mode') &&
             localStorage.getItem('aprendidos_theme') === 'dark';
    });
    assert.equal(isDark, true, 'O Modo Escuro deve estar ativado na classe do body e no localStorage');

    const darkAttrs = await page.$eval('.theme-toggle-btn', el => ({
      ariaLabel: el.getAttribute('aria-label'),
      textContent: el.textContent.trim(),
      isActive: el.classList.contains('active')
    }));
    assert.equal(darkAttrs.isActive, true, 'O botão deve ter classe active no modo escuro');
    assert.equal(darkAttrs.textContent, '🌙', 'No modo escuro deve exibir o ícone de lua');
    assert.equal(darkAttrs.ariaLabel, 'Ativar modo claro', 'No modo escuro aria-label deve ser Ativar modo claro');
  });

  await t.test('3. Deve manter o Modo Escuro ao navegar para licoes.html (persistência)', async () => {
    await page.goto(`http://localhost:${port}/licoes.html`, { waitUntil: 'networkidle2' });

    const isDarkInLicoes = await page.evaluate(() => document.body.classList.contains('dark-mode'));
    assert.equal(isDarkInLicoes, true, 'O Modo Escuro deve permanecer ativo ao abrir licoes.html');

    const switchInLicoes = await page.$('.navbar .aprendidos-theme-switch');
    assert.ok(switchInLicoes, 'O switch de tema deve estar presente na navbar de licoes.html');

    const licoesIcon = await page.$eval('.navbar .theme-toggle-btn', el => el.textContent.trim());
    assert.equal(licoesIcon, '🌙', 'O ícone na navbar de licoes.html deve ser lua no modo escuro');
  });

  await t.test('4. Deve alternar de volta para Modo Claro com sucesso', async () => {
    await page.click('.theme-toggle-btn');
    await new Promise(r => setTimeout(r, 400));

    const isLight = await page.evaluate(() => {
      return !document.body.classList.contains('dark-mode') &&
             localStorage.getItem('aprendidos_theme') === 'light';
    });
    assert.equal(isLight, true, 'O Modo Claro deve ser restaurado corretamente');

    const lightAttrs = await page.$eval('.theme-toggle-btn', el => ({
      ariaLabel: el.getAttribute('aria-label'),
      textContent: el.textContent.trim()
    }));
    assert.equal(lightAttrs.textContent, '☀️', 'Ao retornar para o modo claro deve exibir sol');
    assert.equal(lightAttrs.ariaLabel, 'Ativar modo escuro', 'aria-label deve voltar para Ativar modo escuro');
  });

  await t.test('5. Deve garantir contraste correto de inputs e letras no meunome.html no Modo Escuro', async () => {
    await page.evaluate(() => {
      localStorage.setItem('aprendidos_theme', 'dark');
    });
    await page.goto(`http://localhost:${port}/meunome.html`, { waitUntil: 'networkidle2' });

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
