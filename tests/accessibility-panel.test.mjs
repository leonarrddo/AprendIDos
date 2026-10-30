import test from 'node:test';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

function createStaticServer() {
  const root = process.cwd();
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
  const fixture = '<!doctype html><html lang="pt-BR"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Teste acessibilidade</title><style>@keyframes testPulse{to{opacity:.5}}.test-animation{animation:testPulse 1s infinite}</style></head><body><header><a href="#main">AprendIDos</a></header><main id="main"><h1>Leitura acessível</h1><p>Este texto ajuda a verificar o tamanho da fonte e o espaçamento entre linhas.</p><img id="test-image" alt="Imagem de teste" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="><div id="test-animation" class="test-animation">Animação de teste</div><button id="main-fixed-control" style="position:fixed;right:80px;bottom:12px;width:48px;height:48px">Controle fixo</button></main><footer class="rodape-ajuda"><a href="mailto:aprendidos.suporte@gmail.com">aprendidos.suporte@gmail.com</a></footer><script src="accessibility.js"></script></body></html>';
  return http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/a11y-fixture.html') { res.writeHead(200, { 'Content-Type': types['.html'] }); res.end(fixture); return; }
    const file = path.join(root, pathname === '/' ? 'index.html' : pathname.slice(1));
    fs.readFile(file, (error, data) => {
      if (error) { res.writeHead(404); res.end('Not Found'); return; }
      res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
      const html = pathname === '/menu.html' ? data.toString().replace(/<script type="module">[\s\S]*?<\/script>/, '') : data;
      res.end(html);
    });
  });
}

test('painel de acessibilidade funciona e cabe em todas as larguras solicitadas', async (t) => {
  const server = createStaticServer();
  const port = await new Promise(resolve => server.listen(0, () => resolve(server.address().port)));
  t.after(() => server.close());
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    window.__speechMock = { spoken: [], cancelled: 0 };
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      speak(utterance) { window.__speechMock.spoken.push(utterance); },
      cancel() { window.__speechMock.cancelled += 1; },
      getVoices() { return [{ lang: 'pt-BR', name: 'Voz de teste' }]; }
    } });
    window.__voiceRecognition = null;
    window.SpeechRecognition = class {
      start() { window.__voiceRecognition = this; this.onstart?.(); }
      stop() { this.onend?.(); }
    };
  });

  await page.setRequestInterception(true);
  page.on('request', request => {
    if (new URL(request.url()).hostname === 'localhost') request.continue();
    else request.abort();
  });
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`http://localhost:${port}/a11y-fixture.html`, { waitUntil: 'domcontentloaded' });

  await t.test('controles, persistência e leitura acessível estão disponíveis', async () => {
    const email = await page.$eval('.rodape-ajuda a[href="mailto:aprendidos.suporte@gmail.com"]', node => node.textContent.trim());
    assert.equal(email, 'aprendidos.suporte@gmail.com');
    const menu = fs.readFileSync(path.join(process.cwd(), 'menu.html'), 'utf8');
    assert.match(menu, /href="mailto:aprendidos\.suporte@gmail\.com"/);
    for (const name of fs.readdirSync(process.cwd()).filter(name => name.endsWith('.html'))) {
      assert.match(fs.readFileSync(path.join(process.cwd(), name), 'utf8'), /<script src="accessibility\.js"><\/script>/, `${name} deve carregar o painel compartilhado`);
    }
    const serviceWorker = fs.readFileSync(path.join(process.cwd(), 'sw.js'), 'utf8');
    assert.match(serviceWorker, /const CACHE_VERSION = 'v6';/);
    assert.match(serviceWorker, /'accessibility\.js'/);
    assert.match(serviceWorker, /'accessibility\.css'/);
    await page.waitForSelector('#aprendidos-a11y-toggle');
    const controls = await page.$$eval('#aprendidos-a11y-panel [data-action]', buttons => buttons.map(button => button.dataset.action));
    for (const name of ['font-increase', 'font-decrease', 'font-reset', 'contrast', 'text-align', 'color-filter', 'text-spacing', 'line-spacing', 'font-family', 'saturation', 'dyslexia-font', 'large-cursor', 'hide-images', 'pause-animations', 'highlight-links', 'reading-ruler', 'read-aloud', 'voice-commands', 'reset-all']) {
      assert.ok(controls.includes(name), `controle ${name} deve estar disponível`);
    }
    const labels = await page.$$eval('#aprendidos-a11y-panel .a11y-card h3', cards => cards.map(card => card.textContent.trim()));
    for (const name of ['Tamanho do Texto', 'Alto Contraste', 'Alinhamento do Texto', 'Filtro de Cor', 'Espaçamento de Texto', 'Altura da Linha', 'Seleção de Fonte', 'Saturação', 'Fonte para Dislexia', 'Cursor Maior', 'Ocultar Imagens', 'Pausar Animações', 'Leitor de Tela', 'Comando de Voz', 'Destacar Links', 'Régua de Leitura']) {
      assert.ok(labels.includes(name), `cartão ${name} deve estar visível`);
    }
    const header = await page.$eval('#aprendidos-a11y-panel .a11y-header', element => getComputedStyle(element).backgroundColor);
    assert.equal(header, 'rgb(11, 92, 171)', 'cabeçalho azul da referência');
    assert.equal(await page.$$eval('#aprendidos-a11y-language option', options => options.map(option => option.value).join(',')), 'pt-BR', 'somente o idioma realmente suportado é oferecido');

    await page.click('#aprendidos-a11y-toggle');
    const originalFont = await page.$eval('#main p', element => parseFloat(getComputedStyle(element).fontSize));
    await page.click('[data-action="font-increase"]');
    await page.click('[data-action="contrast"]');
    await page.click('[data-action="line-spacing"]');
    const persisted = await page.evaluate(() => ({
      prefs: JSON.parse(localStorage.getItem('aprendidos_accessibility')),
      contrast: document.body.classList.contains('a11y-high-contrast'),
      spacing: document.body.classList.contains('a11y-line-spacing')
    }));
    assert.equal(persisted.prefs.fontScale, 1.1);
    assert.ok(await page.$eval('#main p', element => parseFloat(getComputedStyle(element).fontSize)) > originalFont, 'a fonte do conteúdo aumenta de fato');
    assert.equal(persisted.contrast, true);
    assert.equal(await page.$eval('[data-card="contrast"]', element => element.classList.contains('is-active')), true, 'cartão mostra o alto contraste ativo');
    assert.equal(persisted.spacing, true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#aprendidos-a11y-toggle');
    assert.equal(await page.evaluate(() => document.body.classList.contains('a11y-high-contrast')), true);
    await page.click('#aprendidos-a11y-toggle');
    await page.focus('[data-action="reading-ruler"]');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.action), 'reset-all', 'Tab circula para o primeiro controle do painel');
    await page.keyboard.down('Shift');
    await page.keyboard.press('Tab');
    await page.keyboard.up('Shift');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.action), 'reading-ruler', 'Shift+Tab circula para o último controle');
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.getElementById('aprendidos-a11y-toggle').getAttribute('aria-expanded')), 'false');
  });

  await t.test('escala de cinza preserva o botão fixo, o painel e o VLibras em celular e computador', async () => {
    for (const width of [320, 1366]) {
      await page.setViewport({ width, height: 844 });
      await page.evaluate(() => localStorage.removeItem('aprendidos_accessibility'));
      await page.goto(`http://localhost:${port}/a11y-fixture.html`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#aprendidos-a11y-toggle');
      await page.evaluate(() => {
        const widget = document.createElement('div');
        widget.id = 'test-vlibras-widget';
        widget.setAttribute('vw-access-button', '');
        Object.assign(widget.style, { position: 'fixed', right: '12px', bottom: '12px', width: '60px', height: '60px', zIndex: '10021', background: '#333' });
        window.__vlibrasTestClicks = 0;
        widget.addEventListener('click', () => { window.__vlibrasTestClicks += 1; });
        document.body.append(widget);
      });

      const before = await page.evaluate(() => {
        const toggle = document.getElementById('aprendidos-a11y-toggle').getBoundingClientRect();
        const widget = document.getElementById('test-vlibras-widget').getBoundingClientRect();
        return { toggle: { x: toggle.x, y: toggle.y, width: toggle.width, height: toggle.height }, widget: { x: widget.x, y: widget.y, width: widget.width, height: widget.height } };
      });
      await page.click('#aprendidos-a11y-toggle');
      await page.select('[data-action="color-filter"]', 'grayscale');
      const active = await page.evaluate(() => ({
        panelOpen: !document.getElementById('aprendidos-a11y-panel').hidden,
        bodyFilter: getComputedStyle(document.body).filter,
        contentFilter: getComputedStyle(document.querySelector('main p')).filter,
        fixedControlFilter: getComputedStyle(document.getElementById('main-fixed-control')).filter,
        panelFilter: getComputedStyle(document.getElementById('aprendidos-a11y-panel')).filter,
        persisted: JSON.parse(localStorage.getItem('aprendidos_accessibility')).grayscale
      }));
      assert.equal(active.panelOpen, true, 'o painel permanece aberto após ativar a opção');
      assert.equal(active.bodyFilter, 'none', 'o body não recebe grayscale nem cria contexto para elementos fixos');
      assert.match(active.contentFilter, /grayscale/);
      assert.equal(active.fixedControlFilter, 'none', 'elemento position: fixed dentro do main fica fora do filtro');
      assert.equal(active.panelFilter, 'none', 'o painel fica fora da escala de cinza');
      assert.equal(active.persisted, true, 'a preferência continua salva no localStorage');

      await page.click('#aprendidos-a11y-close');
      const after = await page.evaluate(() => {
        const button = document.getElementById('aprendidos-a11y-toggle');
        const toggle = button.getBoundingClientRect();
        const widget = document.getElementById('test-vlibras-widget').getBoundingClientRect();
        return { visible: getComputedStyle(button).visibility === 'visible' && getComputedStyle(button).display !== 'none', clickable: getComputedStyle(button).pointerEvents !== 'none', toggle: { x: toggle.x, y: toggle.y, width: toggle.width, height: toggle.height }, widget: { x: widget.x, y: widget.y, width: widget.width, height: widget.height } };
      });
      assert.equal(after.visible, true, 'botão flutuante continua visível');
      assert.equal(after.clickable, true, 'botão flutuante continua clicável');
      assert.deepEqual(after.toggle, before.toggle, 'botão mantém a posição e o tamanho originais');
      assert.deepEqual(after.widget, before.widget, 'VLibras retorna à posição original ao fechar o painel');
      await page.click('#test-vlibras-widget');
      assert.equal(await page.evaluate(() => window.__vlibrasTestClicks), 1, 'widget do VLibras segue clicável com escala de cinza ativa');

      await page.click('#aprendidos-a11y-toggle');
      await page.select('[data-action="color-filter"]', 'none');
      assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('main p')).filter), 'none', 'escala de cinza pode ser desativada');
      await page.click('[data-action="font-increase"]');
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('aprendidos_accessibility')).fontScale), 1.1);
      await page.click('[data-action="font-decrease"]');
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('aprendidos_accessibility')).fontScale), 1);
      await page.click('[data-action="contrast"]');
      assert.equal(await page.evaluate(() => document.body.classList.contains('a11y-high-contrast')), true);
      await page.click('[data-action="contrast"]');
      assert.equal(await page.evaluate(() => document.body.classList.contains('a11y-high-contrast')), false);
      await page.click('#aprendidos-a11y-close');
      await page.click('#aprendidos-a11y-toggle');
      assert.equal(await page.evaluate(() => document.getElementById('aprendidos-a11y-panel').hidden), false, 'botão continua abrindo o painel depois de desativar o filtro');
      await page.click('#aprendidos-a11y-close');
    }
  });

  await t.test('painel e alvo de toque não se sobrepõem ao VLibras nas larguras móveis', async () => {
    for (const width of [320, 360, 390, 430, 768, 1366, 1920]) {
      await page.setViewport({ width, height: 900 });
      await page.evaluate(() => {
        let widget = document.getElementById('test-vlibras-widget');
        if (!widget) {
          widget = document.createElement('div');
          widget.id = 'test-vlibras-widget';
          widget.setAttribute('vw-access-button', '');
          Object.assign(widget.style, { position: 'fixed', right: '12px', bottom: '12px', width: '60px', height: '60px', zIndex: '99999' });
          document.body.append(widget);
        }
      });
      const metrics = await page.evaluate(() => {
        const button = document.getElementById('aprendidos-a11y-toggle').getBoundingClientRect();
        const widget = document.getElementById('test-vlibras-widget').getBoundingClientRect();
        return { width: document.documentElement.scrollWidth, viewport: innerWidth, button: { x: button.x, y: button.y, width: button.width, height: button.height }, widget: { x: widget.x, y: widget.y, width: widget.width, height: widget.height } };
      });
      assert.ok(metrics.width <= metrics.viewport + 1, `sem rolagem horizontal em ${width}px`);
      assert.ok(metrics.button.width >= 48 && metrics.button.height >= 48, `alvo de toque >=48px em ${width}px`);
      assert.ok(metrics.button.x + metrics.button.width < metrics.widget.x, `acesso e VLibras sem sobreposição em ${width}px`);

      await page.click('#aprendidos-a11y-toggle');
      const panel = await page.$eval('#aprendidos-a11y-panel', element => {
        const rect = element.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, scroll: element.scrollHeight, client: element.clientHeight };
      });
      assert.ok(panel.x >= 0 && panel.x + panel.width <= width, `painel cabe horizontalmente em ${width}px`);
      if (width < 768) assert.ok(panel.height <= 900 && panel.y >= 0, `bottom sheet cabe na tela em ${width}px`);
      assert.equal(await page.$eval('#aprendidos-a11y-panel .a11y-grid', element => getComputedStyle(element).gridTemplateColumns.split(' ').length), 2, `cartões em duas colunas em ${width}px`);
      const overlaps = await page.evaluate(() => {
        const panelRect = document.getElementById('aprendidos-a11y-panel').getBoundingClientRect();
        const widgetRect = document.getElementById('test-vlibras-widget').getBoundingClientRect();
        if (getComputedStyle(document.getElementById('test-vlibras-widget')).visibility === 'hidden') return false;
        return panelRect.left < widgetRect.right && panelRect.right > widgetRect.left && panelRect.top < widgetRect.bottom && panelRect.bottom > widgetRect.top;
      });
      assert.equal(overlaps, false, `painel aberto sem cobrir VLibras em ${width}px`);
      if (width < 768) assert.equal(await page.$eval('#test-vlibras-widget', element => getComputedStyle(element).visibility), 'hidden');
      await page.click('#aprendidos-a11y-close');
      assert.equal(await page.$eval('#test-vlibras-widget', element => getComputedStyle(element).visibility), 'visible');
    }
  });

  await t.test('todos os cartões executam ações reais e indicam seu estado', async () => {
    await page.setViewport({ width: 390, height: 844 });
    await page.evaluate(() => localStorage.removeItem('aprendidos_accessibility'));
    await page.goto(`http://localhost:${port}/a11y-fixture.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#aprendidos-a11y-toggle');
    await page.click('#aprendidos-a11y-toggle');
    const gridColumns = await page.$eval('#aprendidos-a11y-panel .a11y-grid', element => getComputedStyle(element).gridTemplateColumns.split(' ').length);
    assert.equal(gridColumns, 2, 'cartões são organizados em duas colunas');
    const chromeTop = await page.$eval('#aprendidos-a11y-panel .a11y-panel-chrome', element => element.getBoundingClientRect().top);
    await page.$eval('#aprendidos-a11y-panel .a11y-content', element => { element.scrollTop = 500; });
    assert.equal(await page.$eval('#aprendidos-a11y-panel .a11y-panel-chrome', element => element.getBoundingClientRect().top), chromeTop, 'cabeçalho e idioma não rolam com os cartões');

    await page.click('[data-action="text-align"]');
    assert.equal(await page.$eval('#main p', element => getComputedStyle(element).textAlign), 'center');
    assert.equal(await page.$eval('[data-card="text-align"]', element => element.classList.contains('is-active')), true);
    await page.click('[data-action="text-align"]');
    await page.click('[data-action="text-align"]');
    await page.click('[data-action="text-align"]');
    assert.notEqual(await page.$eval('#main p', element => getComputedStyle(element).textAlign), 'center');

    await page.click('[data-action="text-spacing"]');
    assert.notEqual(await page.$eval('#main p', element => getComputedStyle(element).letterSpacing), 'normal');
    await page.click('[data-action="line-spacing"]');
    assert.ok(parseFloat(await page.$eval('#main p', element => getComputedStyle(element).lineHeight)) > 24, 'altura da linha aumenta');
    await page.select('[data-action="font-family"]', 'verdana');
    assert.match(await page.$eval('#main p', element => getComputedStyle(element).fontFamily), /Verdana/);
    await page.select('[data-action="font-family"]', 'system');
    await page.click('[data-action="dyslexia-font"]');
    assert.match(await page.$eval('#main p', element => getComputedStyle(element).fontFamily), /Verdana/);
    assert.equal(await page.$eval('[data-card="dyslexia-font"]', element => element.classList.contains('is-active')), true);
    await page.click('[data-action="dyslexia-font"]');

    await page.select('[data-action="color-filter"]', 'sepia');
    assert.match(await page.$eval('#main p', element => getComputedStyle(element).filter), /sepia/);
    assert.equal(await page.$eval('[data-card="color-filter"]', element => element.classList.contains('is-active')), true, 'cartão do filtro indica ativação');
    await page.click('[data-action="saturation"]');
    assert.match(await page.$eval('#main p', element => getComputedStyle(element).filter), /saturate\(0\.5\)/);
    await page.select('[data-action="color-filter"]', 'none');
    await page.click('[data-action="saturation"]');
    await page.click('[data-action="saturation"]');
    await page.click('[data-action="saturation"]');
    assert.equal(await page.$eval('#main p', element => getComputedStyle(element).filter), 'none');

    await page.click('[data-action="large-cursor"]');
    assert.match(await page.evaluate(() => getComputedStyle(document.body).cursor), /^url\(/);
    await page.click('[data-action="large-cursor"]');
    await page.click('[data-action="hide-images"]');
    assert.equal(await page.$eval('#test-image', element => getComputedStyle(element).opacity), '0');
    await page.click('[data-action="hide-images"]');
    assert.equal(await page.$eval('#test-image', element => getComputedStyle(element).opacity), '1');
    await page.click('[data-action="pause-animations"]');
    assert.equal(await page.$eval('#test-animation', element => getComputedStyle(element).animationPlayState), 'paused');
    await page.click('[data-action="pause-animations"]');
    assert.notEqual(await page.$eval('#test-animation', element => getComputedStyle(element).animationPlayState), 'paused');

    await page.click('[data-action="voice-commands"]');
    assert.equal(await page.$eval('[data-card="voice-commands"]', element => element.classList.contains('is-active')), true);
    await page.evaluate(() => {
      window.__voiceRecognition.onresult({ results: [[{ transcript: 'aumentar texto' }]] });
      window.__voiceRecognition.onend();
    });
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('aprendidos_accessibility')).fontScale), 1.1);
    await page.evaluate(() => { delete window.SpeechRecognition; delete window.webkitSpeechRecognition; });
    await page.click('[data-action="voice-commands"]');
    assert.match(await page.$eval('#aprendidos-a11y-status', element => element.textContent), /controle por voz do sistema/);

    await page.click('[data-action="reset-all"]');
    const restored = await page.evaluate(() => JSON.parse(localStorage.getItem('aprendidos_accessibility')));
    assert.equal(restored.textAlign, 'start');
    assert.equal(restored.colorFilter, 'none');
    assert.equal(restored.fontFamily, 'system');
    assert.equal(restored.saturation, 100);
    assert.equal(restored.hideImages, false);
    assert.equal(restored.pauseAnimations, false);
    await page.click('#aprendidos-a11y-close');
  });

  await t.test('contraste, cinza, links, régua, leitura, redefinição e rolagem funcionam', async () => {
    await page.setViewport({ width: 320, height: 568 });
    await page.click('#aprendidos-a11y-toggle');
    const scroll = await page.$eval('#aprendidos-a11y-panel .a11y-content', element => ({ scroll: element.scrollHeight, client: element.clientHeight }));
    assert.ok(scroll.scroll > scroll.client, 'a lista de recursos rola dentro do bottom sheet');
    assert.ok(await page.$eval('#aprendidos-a11y-close', element => element.getBoundingClientRect().height >= 48), 'fechar permanece com alvo grande');

    await page.select('[data-action="color-filter"]', 'grayscale');
    assert.match(await page.evaluate(() => getComputedStyle(document.querySelector('main p')).filter), /grayscale/);
    await page.click('[data-action="highlight-links"]');
    assert.equal(await page.evaluate(() => document.body.classList.contains('a11y-highlight-links')), true);
    await page.click('[data-action="reading-ruler"]');
    assert.equal(await page.$eval('#aprendidos-a11y-ruler', element => element.classList.contains('is-active')), true);
    await page.mouse.move(150, 240);
    assert.equal(await page.$eval('#aprendidos-a11y-ruler', element => parseFloat(element.style.top)), 217);
    await page.focus('[data-action="reading-ruler"]');
    await page.keyboard.press('ArrowDown');
    assert.equal(await page.$eval('#aprendidos-a11y-ruler', element => parseFloat(element.style.top)), 241, 'a régua também pode ser movida pelo teclado');

    await page.click('[data-action="read-aloud"]');
    const spoken = await page.evaluate(() => ({ text: window.__speechMock.spoken.at(-1)?.text, lang: window.__speechMock.spoken.at(-1)?.lang, rate: window.__speechMock.spoken.at(-1)?.rate }));
    assert.match(spoken.text, /Leitura acessível/);
    assert.equal(spoken.lang, 'pt-BR');
    assert.equal(spoken.rate, .88);
    await page.click('[data-action="read-aloud"]');
    await page.click('[data-action="read-aloud"]');
    assert.equal(await page.evaluate(() => window.__speechMock.spoken.length), 2, 'reiniciar a leitura substitui a fala anterior');
    assert.equal(await page.evaluate(() => window.__speechMock.cancelled), 3, 'cada início interrompe fala anterior e parar interrompe a atual');
    await page.evaluate(() => { window.speechSynthesis.getVoices = () => []; });
    await page.click('[data-action="read-aloud"]');
    await page.click('[data-action="read-aloud"]');
    assert.equal(await page.evaluate(() => window.__speechMock.spoken.length), 3, 'o navegador ainda inicia com a voz padrão quando não há voz pt-BR detectada');
    await page.click('[data-action="read-aloud"]');

    await page.click('[data-action="reset-all"]');
    const reset = await page.evaluate(() => ({ prefs: JSON.parse(localStorage.getItem('aprendidos_accessibility')), classes: ['a11y-high-contrast','a11y-text-spacing','a11y-line-spacing','a11y-highlight-links'].some(name => document.body.classList.contains(name)), filtered: document.querySelector('.a11y-content-filter-target') !== null, ruler: document.getElementById('aprendidos-a11y-ruler').classList.contains('is-active') }));
    assert.equal(reset.prefs.fontScale, 1);
    assert.equal(reset.prefs.contrast, false);
    assert.equal(reset.classes, false);
    assert.equal(reset.filtered, false);
    assert.equal(reset.ruler, false);
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.getElementById('aprendidos-a11y-panel').hidden), true);
    await page.click('#aprendidos-a11y-toggle');
    await page.mouse.click(1, 1);
    assert.equal(await page.evaluate(() => document.getElementById('aprendidos-a11y-panel').hidden), true, 'clique fora fecha o painel');
  });

  await t.test('Ajuda no menu mantém o e-mail clicável e sem corte em telas estreitas', async () => {
    await page.setViewport({ width: 320, height: 844 });
    await page.goto(`http://localhost:${port}/menu.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#aprendidos-a11y-toggle');
    for (const width of [320, 360, 390, 430, 768, 1366, 1920]) {
      await page.setViewport({ width, height: 844 });
      const metrics = await page.$eval('.rodape-ajuda a[href="mailto:aprendidos.suporte@gmail.com"]', element => {
        const rect = element.getBoundingClientRect();
        return { text: element.textContent.trim(), left: rect.left, right: rect.right, viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth };
      });
      assert.equal(metrics.text, 'aprendidos.suporte@gmail.com');
      assert.ok(metrics.left >= 0 && metrics.right <= width + 1, `endereço inteiro dentro da tela em ${width}px`);
      assert.ok(metrics.scrollWidth <= metrics.viewport + 1, `menu sem rolagem horizontal em ${width}px`);
    }
  });
});

