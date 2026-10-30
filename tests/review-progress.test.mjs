import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

function createReviewHarness({ progress, user = null, initialStorage = {} } = {}) {
  const elements = {
    reviewBanner: { style: { display: 'none' } },
    reviewBannerText: { textContent: '' }
  };
  const storage = new Map(Object.entries(initialStorage));
  if (user) storage.set('aprendidos_usuario', JSON.stringify(user));
  if (progress) {
    const key = user?.id
      ? `${user.isDemo ? 'aprendidos_progresso_demo_' : 'aprendidos_progresso_'}${user.id}`
      : 'aprendidos_progresso_anonymous_v2';
    storage.set(key, JSON.stringify(progress));
  }
  const localStorage = {
    getItem(key) { return storage.get(key) ?? null; }
  };
  const document = { getElementById(id) { return elements[id] ?? null; } };
  const window = { document, localStorage };
  const source = fs.readFileSync('review-progress.js', 'utf8');
  new Function('window', 'document', 'localStorage', source)(window, document, localStorage);
  return { review: window.AprendIDosReview, elements };
}

test('exibe acertos quando ambos os valores são quantidades válidas', () => {
  const { review, elements } = createReviewHarness({ progress: { letras: { completed: true, score: 3, total: 10 } } });
  assert.equal(review.render('letras'), true);
  assert.match(elements.reviewBannerText.textContent, /3 de 10 acertos/);
});

test('exibe zero acertos como um resultado válido', () => {
  const { review, elements } = createReviewHarness({ progress: { frases: { completed: true, score: 0, total: 8 } } });
  review.render('frases');
  assert.match(elements.reviewBannerText.textContent, /0 de 8 acertos/);
});

test('usa a mensagem alternativa quando total é zero, ausente ou nulo', async (t) => {
  for (const [label, total] of [['zero', 0], ['undefined', undefined], ['null', null]]) {
    await t.test(label, () => {
      const record = { completed: true, score: 3 };
      if (label !== 'undefined') record.total = total;
      const { review, elements } = createReviewHarness({ progress: { letras: record } });
      review.render('letras');
      assert.equal(elements.reviewBannerText.textContent, review.fallbackMessage);
    });
  }
});

test('usa a mensagem alternativa quando acertos são ausentes ou nulos', async (t) => {
  for (const [label, score] of [['undefined', undefined], ['null', null]]) {
    await t.test(label, () => {
      const record = { completed: true, total: 10 };
      if (label !== 'undefined') record.score = score;
      const { review, elements } = createReviewHarness({ progress: { letras: record } });
      review.render('letras');
      assert.equal(elements.reviewBannerText.textContent, review.fallbackMessage);
    });
  }
});

test('não exibe banner para usuário sem histórico concluído', () => {
  const noHistory = createReviewHarness();
  assert.equal(noHistory.review.render('letras'), false);
  assert.equal(noHistory.elements.reviewBanner.style.display, 'none');

  const { review, elements } = createReviewHarness({ progress: { letras: { completed: false, score: 3, total: 10 } } });
  assert.equal(review.render('letras'), false);
  assert.equal(elements.reviewBanner.style.display, 'none');
});

test('um treino concluído com dados antigos inválidos mostra apenas a mensagem acessível alternativa', () => {
  const { review, elements } = createReviewHarness({ progress: { escrita: { completed: true, score: 3, total: 'NaN' } } });
  assert.equal(review.render('escrita'), true);
  assert.equal(elements.reviewBannerText.textContent, review.fallbackMessage);
  assert.doesNotMatch(elements.reviewBannerText.textContent, /undefined|null|NaN/);
});

test('o histórico de cada usuário é isolado e uma lição concluída é detectada ao reentrar', () => {
  const user = { id: 'user-a' };
  const { review: ownerReview, elements: ownerElements } = createReviewHarness({
    user,
    progress: { consoantes: { completed: true, score: 6, total: 10 } }
  });
  assert.equal(ownerReview.render('consoantes'), true);
  assert.equal(ownerElements.reviewBanner.style.display, 'flex');

  const { review: otherReview, elements: otherElements } = createReviewHarness({
    user: { id: 'user-b' },
    initialStorage: {
      'aprendidos_progresso_user-a': JSON.stringify({
        consoantes: { completed: true, score: 6, total: 10 }
      })
    }
  });
  assert.equal(otherReview.render('consoantes'), false);
  assert.equal(otherElements.reviewBanner.style.display, 'none');
});

test('todas as páginas de atividade carregam o renderizador comum de revisão', () => {
  const pages = ['letras', 'vogais', 'consoantes', 'meunome', 'silabas', 'palavras', 'frases', 'leituras', 'escrita'];
  for (const page of pages) {
    const html = fs.readFileSync(`${page}.html`, 'utf8');
    assert.match(html, /review-progress\.js/, `${page}.html must load the review helper`);
  }
});

test('todas as atividades chamam o renderizador com sua própria chave ao reentrar', () => {
  const modules = ['letras', 'vogais', 'consoantes', 'meunome', 'silabas', 'palavras', 'frases', 'leituras', 'escrita'];
  for (const lesson of modules) {
    const source = fs.readFileSync(`${lesson}.js`, 'utf8');
    assert.match(source, new RegExp(`AprendIDosReview\\.render\\('${lesson}'\\)`), `${lesson} must render its own review record`);
  }
  const vogaisPage = fs.readFileSync('vogais.html', 'utf8');
  assert.match(vogaisPage, /AprendIDosReview\?\.render\('vogais'\)/);
});

test('Vogais salva a quantidade de acertos, sem converter o resultado em porcentagem', () => {
  const html = fs.readFileSync('vogais.html', 'utf8');
  const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
    .map(match => match[1])
    .find(source => source.includes('function salvarProgressoVogaisInline()'));
  assert.ok(script, 'inline Vogais completion code must exist');
  const start = script.indexOf('function salvarProgressoVogaisInline()');
  const end = script.indexOf('\n}', start) + 2;
  const saveFunction = script.slice(start, end);
  let savedRecord = null;
  const window = { AprendIDosAuth: { saveLessonProgress(id, record) { savedRecord = { id, record }; } } };
  new Function('window', 'hits', 'TOTAL', saveFunction + '\nsalvarProgressoVogaisInline();')(window, 3, 10);
  assert.deepEqual(savedRecord, {
    id: 'vogais',
    record: { completed: true, score: 3, total: 10 }
  });
});
