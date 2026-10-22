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

test('Auditoria Global de Responsividade e Proporções em Diferentes Dispositivos', async (t) => {
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

  t.after(async () => {
    await browser.close();
  });

  const targetWidths = [320, 360, 375, 390, 430, 768, 1024, 1366, 1920];
  const pagesToTest = ['licoes.html', 'menu.html', 'escrita.html', 'meunome.html'];

  for (const pageName of pagesToTest) {
    await t.test(`Responsividade de ${pageName} nas larguras mobile, tablet e desktop`, async () => {
      const page = await browser.newPage();
      try {
        await page.goto(`http://localhost:${port}/${pageName}`, { waitUntil: 'networkidle2' });

        for (const width of targetWidths) {
          await page.setViewport({ width, height: 800 });
          await new Promise(r => setTimeout(r, 60));

          const pageMetrics = await page.evaluate(() => {
            const docWidth = document.documentElement.scrollWidth;
            const winWidth = window.innerWidth;
            const bodyWidth = document.body.scrollWidth;

            const themeSwitch = document.querySelector('.theme-toggle-btn');
            const themeBtnRect = themeSwitch ? themeSwitch.getBoundingClientRect() : null;

            const overflowing = [];
            document.querySelectorAll('*').forEach(el => {
              if (el.scrollWidth > winWidth + 1 || el.offsetWidth > winWidth + 1) {
                overflowing.push(`${el.tagName}#${el.id}.${el.className} (scrollW=${el.scrollWidth}, offsetW=${el.offsetWidth})`);
              }
            });

            return {
              hasHorizontalOverflow: docWidth > winWidth + 1 || bodyWidth > winWidth + 1,
              docWidth,
              winWidth,
              overflowing: overflowing.slice(0, 20),
              themeBtnRect: themeBtnRect ? { width: Math.round(themeBtnRect.width), height: Math.round(themeBtnRect.height) } : null
            };
          });

          assert.equal(
            pageMetrics.hasHorizontalOverflow,
            false,
            `Página ${pageName} não deve ter rolagem horizontal em ${width}px (docWidth=${pageMetrics.docWidth}, winWidth=${pageMetrics.winWidth})`
          );

          if (pageMetrics.themeBtnRect) {
            assert.ok(
              pageMetrics.themeBtnRect.width >= 40 && pageMetrics.themeBtnRect.width <= 50,
              `Botão de tema em ${pageName} deve manter área acessível em ${width}px (largura: ${pageMetrics.themeBtnRect.width}px)`
            );
          }
        }
      } finally {
        await page.close();
      }
    });
  }

  await t.test('Validação de proporções do cabeçalho, título e cartões em licoes.html (iPhone 390px)', async () => {
    const page = await browser.newPage();
    try {
      await page.setViewport({ width: 390, height: 844 });
      await page.goto(`http://localhost:${port}/licoes.html`, { waitUntil: 'networkidle2' });

      const licoesMetrics = await page.evaluate(() => {
        const navbar = document.querySelector('.navbar');
        const navRect = navbar.getBoundingClientRect();
        const headerTitle = document.querySelector('.page-header h1');
        const titleStyle = window.getComputedStyle(headerTitle);
        const progressCard = document.querySelector('.progress-section');
        const progressRect = progressCard.getBoundingClientRect();
        const firstCard = document.querySelector('.activity-card');
        const cardRect = firstCard.getBoundingClientRect();
        const iconCircle = firstCard.querySelector('.icon-circle');
        const iconRect = iconCircle.getBoundingClientRect();
        const btnIniciar = firstCard.querySelector('.card-btn');
        const btnRect = btnIniciar.getBoundingClientRect();

        return {
          navHeight: Math.round(navRect.height),
          navWidth: Math.round(navRect.width),
          titleFontSize: parseFloat(titleStyle.fontSize),
          progressWidth: Math.round(progressRect.width),
          cardHeight: Math.round(cardRect.height),
          cardWidth: Math.round(cardRect.width),
          iconWidth: Math.round(iconRect.width),
          btnHeight: Math.round(btnRect.height)
        };
      });

      // Cabeçalho deve ser compacto e caber confortavelmente
      assert.ok(licoesMetrics.navHeight <= 120, `Cabeçalho mobile deve ter altura proporcional (atual: ${licoesMetrics.navHeight}px)`);
      assert.ok(licoesMetrics.navWidth <= 390, `Cabeçalho mobile não deve ultrapassar a viewport (atual: ${licoesMetrics.navWidth}px)`);

      // Título "Olá, Leo!..." tipografia equilibrada
      assert.ok(licoesMetrics.titleFontSize <= 28, `Título não deve ter tamanho exagerado no celular (atual: ${licoesMetrics.titleFontSize}px)`);

      // Cartão de progresso dentro da viewport
      assert.ok(licoesMetrics.progressWidth <= 390, 'Cartão de progresso deve caber na largura');

      // Cartões de atividade proporcionais e botão com toque confortável
      assert.ok(licoesMetrics.cardHeight <= 420, `Cartão de atividade deve ser compacto para caber com Safari toolbar (atual: ${licoesMetrics.cardHeight}px)`);
      assert.ok(licoesMetrics.iconWidth <= 80, `Ícone do cartão deve ser proporcional (atual: ${licoesMetrics.iconWidth}px)`);
      assert.ok(licoesMetrics.btnHeight >= 46, `Botão Iniciar deve ter altura mínima acessível (atual: ${licoesMetrics.btnHeight}px)`);
    } finally {
      await page.close();
    }
  });
});
