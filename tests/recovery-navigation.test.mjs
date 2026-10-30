import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import puppeteer from 'puppeteer';

const loginHtml = fs.readFileSync(new URL('../login.html', import.meta.url), 'utf8');
const authJs = fs.readFileSync(new URL('../auth.js', import.meta.url), 'utf8');
const serviceWorkerJs = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const menuHtml = fs.readFileSync(new URL('../menu.html', import.meta.url), 'utf8');
const licoesHtml = fs.readFileSync(new URL('../licoes.html', import.meta.url), 'utf8');

function createStaticServer() {
  const root = process.cwd();
  return http.createServer((request, response) => {
    const requestedPath = path.normalize(decodeURIComponent(request.url.split('?')[0])).replace(/^([/\\])+/, '');
    const filePath = path.join(root, requestedPath || 'index.html');
    fs.readFile(filePath, (error, contents) => {
      if (error) {
        response.writeHead(404);
        response.end();
        return;
      }
      response.writeHead(200, { 'Content-Type': filePath.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/javascript; charset=utf-8' });
      response.end(contents);
    });
  });
}

function extractAsyncFunction(source, name) {
  const start = source.indexOf(`async function ${name}(`);
  assert.notEqual(start, -1, `${name} deve existir`);
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let index = open; index < source.length; index++) {
    if (source[index] === '{') depth++;
    if (source[index] === '}' && --depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`Não foi possível extrair ${name}`);
}

test('recuperação de senha solicita reset por e-mail com retorno à página de login', async () => {
  const calls = [];
  const client = { auth: { resetPasswordForEmail: async (...args) => { calls.push(args); return { error: null }; } } };
  const fn = new Function('getSupabase', 'isSupabaseConfigured', 'window', 'URL',
    extractAsyncFunction(authJs, 'requestPasswordReset') + '; return requestPasswordReset;'
  )(async () => client, () => true, { location: { href: 'https://aprendidos.example/login.html' } }, URL);

  assert.equal(await fn('  Pessoa@Exemplo.com  '), true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'pessoa@exemplo.com');
  assert.equal(calls[0][1].redirectTo, 'https://aprendidos.example/login.html?redefinir-senha=true');
});

test('falha do Supabase na solicitação de recuperação é propagada', async () => {
  const expectedError = new Error('serviço indisponível');
  const client = { auth: { resetPasswordForEmail: async () => ({ error: expectedError }) } };
  const fn = new Function('getSupabase', 'isSupabaseConfigured', 'window', 'URL',
    extractAsyncFunction(authJs, 'requestPasswordReset') + '; return requestPasswordReset;'
  )(async () => client, () => true, { location: { href: 'https://aprendidos.example/login.html' } }, URL);

  await assert.rejects(fn('pessoa@exemplo.com'), expectedError);
});

test('nova senha só é considerada atualizada após sucesso confirmado pelo Supabase', async () => {
  let updatedPassword;
  const client = { auth: { updateUser: async ({ password }) => { updatedPassword = password; return { error: null }; } } };
  const fn = new Function('getSupabase', 'isSupabaseConfigured',
    extractAsyncFunction(authJs, 'updatePassword') + '; return updatePassword;'
  )(async () => client, () => true);

  assert.equal(await fn('senha-segura'), true);
  assert.equal(updatedPassword, 'senha-segura');
});

test('login oferece recuperação acessível e etapa para definir nova senha', () => {
  assert.match(loginHtml, /Esqueceu a senha\?/i);
  assert.match(loginHtml, /id="formRecuperarSenha"/);
  assert.match(loginHtml, /id="formNovaSenha"/);
  assert.match(loginHtml, /role="status"/);
  assert.match(authJs, /resetPasswordForEmail/);
  assert.match(authJs, /updateUser\(\{\s*password/);
  assert.match(loginHtml, /Se houver uma conta associada a esse e-mail/);
  assert.match(loginHtml, /Confira sua conexão e tente novamente/);
  const scripts = [...loginHtml.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(([, attributes]) => !/\bsrc\s*=/.test(attributes) && !/\btype\s*=\s*["']module["']/i.test(attributes));
  for (const [, , source] of scripts) assert.doesNotThrow(() => new Function(source), 'scripts inline da tela de login devem ser válidos');
});

test('Service Worker invalida os recursos JS antigos após a inclusão da recuperação de senha', () => {
  assert.match(serviceWorkerJs, /const CACHE_VERSION = 'v6';/);
});

test('formulário de recuperação envia o e-mail informado e apresenta confirmação genérica', async (t) => {
  const server = createStaticServer();
  const port = await new Promise(resolve => server.listen(0, () => resolve(server.address().port)));
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  t.after(async () => {
    await browser.close();
    server.close();
  });

  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.origin !== `http://localhost:${port}`) {
      if (url.pathname.endsWith('/vlibras-plugin.js')) {
        request.respond({ status: 200, contentType: 'application/javascript', body: 'window.VLibras = { Widget: function() {} };' });
      } else {
        request.abort();
      }
    } else if (url.pathname.endsWith('/pwa.js')) {
      request.respond({ status: 200, contentType: 'application/javascript', body: '' });
    } else if (url.pathname.endsWith('/supabase-config.js')) {
      request.respond({ status: 200, contentType: 'application/javascript', body: "export const SUPABASE_URL=''; export const SUPABASE_ANON_KEY=''; export const isSupabaseConfigured=()=>false;" });
    } else {
      request.continue();
    }
  });
  await page.goto(`http://localhost:${port}/login.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.AprendIDosAuth?.requestPasswordReset === 'function');
  await page.evaluate(() => {
    window.__recoveryCalls = [];
    window.AprendIDosAuth.requestPasswordReset = async email => {
      window.__recoveryCalls.push(email);
      await new Promise(resolve => setTimeout(resolve, 120));
      if (window.__recoveryCalls.length === 1) throw new Error('falha simulada');
      return true;
    };
  });
  await page.click('#btnAbrirModalEmail');
  await page.type('#loginEmail', 'pessoa@exemplo.com');
  await page.click('#btnEsqueceuSenha');
  const controlsEnabled = await page.evaluate(() => ({
    email: !document.getElementById('emailRecuperacao').disabled,
    submit: !document.getElementById('btnEnviarRecuperacao').disabled,
    back: !document.getElementById('btnVoltarLogin').disabled
  }));
  assert.deepEqual(controlsEnabled, { email: true, submit: true, back: true });
  await page.$eval('#emailRecuperacao', input => { input.value = 'email-invalido'; });
  assert.equal(await page.$eval('#formRecuperarSenha', form => form.checkValidity()), false);
  await page.$eval('#emailRecuperacao', input => { input.value = 'pessoa@exemplo.com'; });
  await page.click('#btnEnviarRecuperacao');
  await page.waitForFunction(() => window.__recoveryCalls?.length === 1);
  const loadingState = await page.evaluate(() => ({
    disabled: document.getElementById('btnEnviarRecuperacao').disabled,
    label: document.getElementById('btnEnviarRecuperacao').textContent
  }));
  assert.deepEqual(loadingState, { disabled: true, label: 'Enviando...' });
  await page.waitForFunction(() => document.getElementById('erroRecuperacao').hidden === false);
  const failedState = await page.evaluate(() => ({
    disabled: document.getElementById('btnEnviarRecuperacao').disabled,
    label: document.getElementById('btnEnviarRecuperacao').textContent,
    error: document.getElementById('erroRecuperacao').textContent
  }));
  assert.equal(failedState.disabled, false);
  assert.equal(failedState.label, 'Enviar instruções');
  assert.match(failedState.error, /tente novamente/i);

  await page.click('#btnEnviarRecuperacao');
  await page.waitForFunction(() => document.getElementById('statusRecuperacao').hidden === false);
  const result = await page.evaluate(() => ({
    emailSentToAction: window.__recoveryCalls,
    confirmation: document.getElementById('statusRecuperacao').textContent
  }));
  assert.deepEqual(result.emailSentToAction, ['pessoa@exemplo.com', 'pessoa@exemplo.com']);
  assert.match(result.confirmation, /Se houver uma conta associada/);
  await page.click('#btnVoltarLogin');
  assert.equal(await page.$eval('#formLoginEmail', form => form.hidden), false);
  assert.equal(await page.$eval('#formRecuperarSenha', form => form.hidden), true);
  await page.click('#btnEsqueceuSenha');
  assert.equal(await page.$eval('#btnEnviarRecuperacao', button => button.disabled), false);
  assert.deepEqual(pageErrors, []);
});

test('menu remove apenas o cartão Ouça e mantém os cartões principais', () => {
  assert.doesNotMatch(menuHtml, /<span class="texto-menu">Ouça<\/span>/i);
  assert.match(menuHtml, /<span class="texto-menu">Início<\/span>/);
  assert.match(menuHtml, /<span class="texto-menu">Lições<\/span>/);
  assert.match(menuHtml, /<span class="texto-menu">Ajuda<\/span>/);
  assert.match(menuHtml, /texto === 'Lições'/);
});

test('menu mantém recursos de áudio nas atividades', () => {
  const activityFiles = ['letras.js', 'vogais.js', 'consoantes.js', 'meunome.js', 'silabas.js', 'palavras.js', 'frases.js', 'leituras.js'];
  for (const file of activityFiles) {
    assert.match(fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'), /\bspeak\s*\(/, `${file} deve manter o áudio`);
  }
});

test('menu, lições e botão Voltar mantêm a navegação com sessão autenticada simulada', async (t) => {
  const server = createStaticServer();
  const port = await new Promise(resolve => server.listen(0, () => resolve(server.address().port)));
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  t.after(async () => {
    await browser.close();
    server.close();
  });

  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.origin !== `http://localhost:${port}`) {
      request.abort();
    } else if (url.pathname.endsWith('/auth.js')) {
      request.respond({
        status: 200,
        contentType: 'application/javascript',
        body: `export async function initSession(){return {user:{id:'demo-test',name:'Pessoa Teste'},isAuthenticated:true}}; export async function signOut(){}`
      });
    } else if (url.pathname.endsWith('/pwa.js')) {
      request.respond({ status: 200, contentType: 'application/javascript', body: '' });
    } else {
      request.continue();
    }
  });
  await page.goto(`http://localhost:${port}/login.html`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.setItem('aprendidos_usuario', JSON.stringify({ id: 'demo-test', name: 'Pessoa Teste', isDemo: true })));
  await page.goto(`http://localhost:${port}/menu.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.style.visibility === 'visible');

  const menuLabels = await page.$$eval('.menu-principal .texto-menu', elements => elements.map(element => element.textContent.trim()));
  assert.deepEqual(menuLabels, ['Início', 'Lições', 'Ajuda']);
  await page.click('.menu-principal a[href="#licoes"]');
  await page.waitForFunction(() => location.pathname.endsWith('/licoes.html'));
  await page.click('.btn-voltar');
  await page.waitForFunction(() => location.pathname.endsWith('/menu.html'));
  assert.equal(await page.$eval('#menuUserDisplayName', element => element.textContent.trim()), 'Pessoa');
});

test('Voltar em Lições navega explicitamente ao menu sem alterar retornos das atividades', () => {
  assert.ok(/href="menu\.html"[^>]*aria-label="Voltar para o menu principal"/.test(licoesHtml));
  for (const file of ['vogais.html', 'consoantes.html', 'meunome.html', 'silabas.html', 'palavras.html', 'frases.html', 'leituras.html', 'escrita.html']) {
    assert.ok(/history\.back\(\)/.test(fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')), `${file} mantém seu próprio botão Voltar`);
  }
  assert.ok(/href="licoes\.html"[^>]*class="btn-back"/.test(fs.readFileSync(new URL('../letras.html', import.meta.url), 'utf8')), 'letras.html mantém seu botão de retorno para Lições');
});
