import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const activities = [
  { name: 'letras', file: 'letras.js', save: 'salvarProgressoLetras' },
  { name: 'consoantes', file: 'consoantes.js', save: 'salvarProgresso' },
  { name: 'meu nome', file: 'meunome.js', save: 'salvarProgresso' },
  { name: 'sílabas', file: 'silabas.js', save: 'salvarProgresso' },
  { name: 'palavras', file: 'palavras.js', save: 'salvarProgresso' },
  { name: 'frases', file: 'frases.js', save: 'salvarProgresso' },
  { name: 'leituras', file: 'leituras.js', save: 'salvarProgresso' },
  { name: 'escrita', file: 'escrita.js', save: 'salvarProgresso' }
];

function extractAsyncFunction(source, name) {
  const start = source.indexOf('async function ' + name + '(');
  assert.notEqual(start, -1, name + ' must exist');
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let index = open; index < source.length; index++) {
    if (source[index] === '{') depth++;
    if (source[index] === '}' && --depth === 0) return source.slice(start, index + 1);
  }
  throw new Error('Could not find the end of ' + name);
}

function createActivityHandler(source, saveFunction) {
  const handler = extractAsyncFunction(source, 'salvarEVerOutras');
  const window = { location: { href: 'activity.html' }, __saveResult: null };
  const button = { disabled: false, innerHTML: '', style: {} };
  const timers = [];
  const document = { getElementById: () => button };
  const setTimeout = callback => timers.push(callback);
  const harness = new Function('window', 'document', 'setTimeout',
    'async function ' + saveFunction + '() { return window.__saveResult; }\n' +
    handler + '\nreturn salvarEVerOutras;'
  )(window, document, setTimeout);
  return { window, button, timers, handler: harness };
}

test('each activity completion distinguishes cloud save, local-only save, and failure', async (t) => {
  for (const activity of activities) {
    await t.test(activity.name, async () => {
      const source = fs.readFileSync(activity.file, 'utf8');
      const harness = createActivityHandler(source, activity.save);
      let prevented = false;

      harness.window.__saveResult = { status: 'local_only', success: true, localSaved: true, synced: false };
      await harness.handler({ preventDefault() { prevented = true; } });
      assert.equal(prevented, true);
      assert.match(harness.button.innerHTML, /salvo somente neste aparelho/i);
      assert.equal(harness.timers.length, 1);

      const failed = createActivityHandler(source, activity.save);
      failed.window.__saveResult = { status: 'failed', success: false, localSaved: false, synced: false };
      await failed.handler({ preventDefault() {} });
      assert.match(failed.button.innerHTML, /falha ao salvar/i);
      assert.equal(failed.button.disabled, false);
      assert.equal(failed.timers.length, 0);

      const synced = createActivityHandler(source, activity.save);
      synced.window.__saveResult = { status: 'synced', success: true, localSaved: true, synced: true };
      await synced.handler({ preventDefault() {} });
      assert.match(synced.button.innerHTML, /salvo na nuvem/i);
      assert.equal(synced.timers.length, 1);
    });
  }
});

test('Vogais waits for its completion save before scheduling navigation', async () => {
  const html = fs.readFileSync('vogais.html', 'utf8');
  const inlineScripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(([, attributes]) => !/\btype\s*=\s*["']module["']/i.test(attributes));
  assert.ok(inlineScripts.length > 0, 'Vogais must keep its inline activity script');
  assert.doesNotThrow(() => new Function(inlineScripts.at(-1)[2]), 'Vogais inline activity script must parse');
  const handler = extractAsyncFunction(html, 'salvarEVerOutras');
  const window = { location: { href: 'vogais.html' } };
  const button = {
    innerHTML: '',
    attributes: new Set(),
    getAttribute(name) { return this.attributes.has(name) ? 'true' : null; },
    setAttribute(name) { this.attributes.add(name); },
    removeAttribute(name) { this.attributes.delete(name); }
  };
  const timers = [];
  let resolveSave;
  const savePromise = new Promise(resolve => { resolveSave = resolve; });
  const document = { getElementById: () => button };
  const setTimeout = callback => timers.push(callback);
  const harness = new Function('window', 'document', 'setTimeout',
    'var vogaisCompletionSavePromise = null;\n' +
    'function salvarProgressoVogaisInline() { return Promise.resolve({ status: \'failed\' }); }\n' +
    handler + '\nreturn { handler: salvarEVerOutras, setSavePromise(promise) { vogaisCompletionSavePromise = promise; } };'
  )(window, document, setTimeout);

  harness.setSavePromise(savePromise);
  const handlerPromise = harness.handler({ preventDefault() {} });
  await Promise.resolve();
  assert.equal(window.location.href, 'vogais.html');
  assert.equal(timers.length, 0);

  resolveSave({ status: 'synced', success: true, localSaved: true, synced: true });
  await handlerPromise;
  assert.match(button.innerHTML, /salvo na nuvem/i);
  assert.equal(timers.length, 1);
  timers[0]();
  assert.equal(window.location.href, 'licoes.html');
});
