/**
 * Testes Automatizados de Acessibilidade e Contraste Real (Fase 2)
 * Calcula a relação de contraste real (WCAG 2.1) via Puppeteer e getComputedStyle
 * para silabas.html e palavras.html em modo escuro e modo claro.
 */

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

// Utilitário para parsear rgb/rgba e calcular luminância relativa e contraste real WCAG
function parseRgb(colorStr) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10)
  };
}

function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function getRelativeLuminance(rgb) {
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function calculateContrastRatio(fgRgb, bgRgb) {
  const l1 = getRelativeLuminance(fgRgb);
  const l2 = getRelativeLuminance(bgRgb);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

test('Fase 2: Medição Real de Contraste e Acessibilidade (silabas.html e palavras.html)', async (t) => {
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

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // -------------------------------------------------------------
  // Teste 1: silabas.html no Modo Escuro (Medição Real de Contraste)
  // -------------------------------------------------------------
  await t.test('silabas.html — Contraste real no Modo Escuro', async () => {
    await page.goto(`http://localhost:${port}/silabas.html`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      if (window.AprendIDosTheme && window.AprendIDosTheme.setTheme) {
        window.AprendIDosTheme.setTheme('dark');
      } else {
        localStorage.setItem('aprendidos_theme', 'dark');
        document.body.classList.add('dark-mode');
        document.documentElement.classList.add('dark-mode');
      }
    });
    await new Promise(r => setTimeout(r, 200));

    const measurements = await page.evaluate(() => {
      function getEffectiveColors(el) {
        const style = window.getComputedStyle(el);
        let bg = style.backgroundColor;
        let cur = el;
        // Se transparente, busca fundo do elemento pai
        while ((!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') && cur.parentElement) {
          cur = cur.parentElement;
          bg = window.getComputedStyle(cur).backgroundColor;
        }
        return {
          fg: style.color,
          bg: bg || 'rgb(18, 24, 32)',
          fontSize: parseFloat(style.fontSize) || 16,
          fontWeight: parseInt(style.fontWeight, 10) || 400
        };
      }

      const results = {};
      const card = document.querySelector('.syllable-card');
      const header = document.querySelector('.syllable-card-header');
      const box = document.querySelector('.creative-reinforcement-box');
      const boxText = document.querySelector('.creative-text');
      const btnOption = document.querySelector('.btn-option-syl');
      const navWrapper = document.querySelector('.letter-nav-wrapper');
      const navBtn = document.querySelector('.letter-nav-btn');
      const wordItem = document.querySelector('.word-item');
      const wordLeft = document.querySelector('.word-item-left');
      const wordSyllables = document.querySelector('.word-syllables');

      if (card) results.card = getEffectiveColors(card);
      if (header) results.header = getEffectiveColors(header);
      if (box && boxText) {
        const boxStyles = window.getComputedStyle(box);
        results.creativeBox = {
          fg: window.getComputedStyle(boxText).color,
          bg: boxStyles.backgroundColor,
          fontSize: parseFloat(window.getComputedStyle(boxText).fontSize) || 16,
          fontWeight: 700
        };
      }
      if (btnOption) results.btnOption = getEffectiveColors(btnOption);
      if (navWrapper && navBtn) {
        results.navBtn = getEffectiveColors(navBtn);
      }
      if (wordItem && wordLeft) {
        results.wordItem = getEffectiveColors(wordLeft);
      }
      if (wordItem && wordSyllables) {
        results.wordSyllables = getEffectiveColors(wordSyllables);
      }

      return results;
    });

    // Validações com cálculo real de razão de contraste
    for (const [key, data] of Object.entries(measurements)) {
      const fgRgb = parseRgb(data.fg);
      const bgRgb = parseRgb(data.bg);
      assert.ok(fgRgb, `Cor de primeiro plano válida para ${key}`);
      assert.ok(bgRgb, `Cor de fundo válida para ${key}`);

      const ratio = calculateContrastRatio(fgRgb, bgRgb);
      const isLarge = data.fontSize >= 24 || (data.fontSize >= 18.5 && data.fontWeight >= 700);
      const minRequired = isLarge ? 3.0 : 4.5;

      assert.ok(
        ratio >= minRequired,
        `${key} possui contraste real de ${ratio.toFixed(2)}:1 (exigido: >= ${minRequired}:1). FG=${data.fg}, BG=${data.bg}`
      );
    }
  });

  // -------------------------------------------------------------
  // Teste 2: palavras.html no Modo Escuro (Medição Real de Contraste)
  // -------------------------------------------------------------
  await t.test('palavras.html — Contraste real no Modo Escuro', async () => {
    await page.goto(`http://localhost:${port}/palavras.html`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      if (window.AprendIDosTheme && window.AprendIDosTheme.setTheme) {
        window.AprendIDosTheme.setTheme('dark');
      } else {
        localStorage.setItem('aprendidos_theme', 'dark');
        document.body.classList.add('dark-mode');
        document.documentElement.classList.add('dark-mode');
      }
    });
    await new Promise(r => setTimeout(r, 200));

    const measurements = await page.evaluate(() => {
      function getEffectiveColors(el) {
        const style = window.getComputedStyle(el);
        let bg = style.backgroundColor;
        let cur = el;
        while ((!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') && cur.parentElement) {
          cur = cur.parentElement;
          bg = window.getComputedStyle(cur).backgroundColor;
        }
        return {
          fg: style.color,
          bg: bg || 'rgb(18, 24, 32)',
          fontSize: parseFloat(style.fontSize) || 16,
          fontWeight: parseInt(style.fontWeight, 10) || 400
        };
      }

      const results = {};
      const wordCard = document.querySelector('.word-card');
      const wordName = document.querySelector('.word-name');
      const firstChar = document.querySelector('.word-name .first-char');
      const navBtn = document.querySelector('.letter-nav-btn');
      const showcaseTitle = document.querySelector('.showcase-title');
      const lotInfo = document.querySelector('.lot-info');
      const instructionText = document.querySelector('.instruction-card .instruction-text p');
      const optExercise = document.querySelector('.btn-exercise-opt .opt-text');

      if (wordCard && wordName) results.wordName = getEffectiveColors(wordName);
      if (wordCard && firstChar) results.firstChar = getEffectiveColors(firstChar);
      if (navBtn) results.navBtn = getEffectiveColors(navBtn);
      if (showcaseTitle) results.showcaseTitle = getEffectiveColors(showcaseTitle);
      if (lotInfo) results.lotInfo = getEffectiveColors(lotInfo);
      if (instructionText) results.instructionText = getEffectiveColors(instructionText);
      if (optExercise) results.optExercise = getEffectiveColors(optExercise);

      return results;
    });

    for (const [key, data] of Object.entries(measurements)) {
      const fgRgb = parseRgb(data.fg);
      const bgRgb = parseRgb(data.bg);
      assert.ok(fgRgb, `Cor de texto válida para ${key}`);
      assert.ok(bgRgb, `Cor de fundo válida para ${key}`);

      const ratio = calculateContrastRatio(fgRgb, bgRgb);
      const isLarge = data.fontSize >= 24 || (data.fontSize >= 18.5 && data.fontWeight >= 700);
      const minRequired = isLarge ? 3.0 : 4.5;

      assert.ok(
        ratio >= minRequired,
        `${key} possui contraste real de ${ratio.toFixed(2)}:1 (exigido: >= ${minRequired}:1). FG=${data.fg}, BG=${data.bg}`
      );
    }
  });

  // -------------------------------------------------------------
  // Teste 3: Preservação visual e de contraste do Modo Claro
  // -------------------------------------------------------------
  await t.test('Tema Claro — Preservação visual e legibilidade sem alterações', async () => {
    await page.evaluate(() => {
      localStorage.setItem('aprendidos_theme', 'light');
    });
    // Carrega silabas.html sem dark-mode
    await page.goto(`http://localhost:${port}/silabas.html`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      if (window.AprendIDosTheme && window.AprendIDosTheme.setTheme) {
        window.AprendIDosTheme.setTheme('light');
      }
    });
    const silabasLight = await page.evaluate(() => {
      const card = document.querySelector('.syllable-card');
      const header = document.querySelector('.syllable-card-header');
      const box = document.querySelector('.creative-reinforcement-box');
      return {
        cardBg: card ? window.getComputedStyle(card).backgroundColor : null,
        headerBg: header ? window.getComputedStyle(header).backgroundColor : null,
        boxBg: box ? window.getComputedStyle(box).backgroundColor : null
      };
    });

    // No tema claro, syllable-card é #FAFAFA (rgb(250, 250, 250))
    assert.equal(silabasLight.cardBg, 'rgb(250, 250, 250)', 'Syllable card deve manter fundo claro original no modo claro');
    // Header é #FFF9C4 (rgb(255, 249, 196))
    assert.equal(silabasLight.headerBg, 'rgb(255, 249, 196)', 'Header deve manter amarelo suave original no modo claro');

    // Carrega palavras.html sem dark-mode
    await page.goto(`http://localhost:${port}/palavras.html`);
    const palavrasLight = await page.evaluate(() => {
      const card = document.querySelector('.word-card');
      const name = document.querySelector('.word-name');
      return {
        cardBg: card ? window.getComputedStyle(card).backgroundColor : null,
        nameColor: name ? window.getComputedStyle(name).color : null
      };
    });

    assert.equal(palavrasLight.cardBg, 'rgb(255, 255, 255)', 'Word card deve manter fundo branco original no modo claro');
  });
});
