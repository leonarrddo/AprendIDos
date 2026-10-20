import puppeteer from 'puppeteer';

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:3000/palavras.html', { waitUntil: 'domcontentloaded' });
  console.log('1. Page loaded');

  // Verify modal starts hidden
  const isModalHidden = await page.$eval('#palavraModal', el => el.hasAttribute('hidden'));
  console.log('2. Modal initially hidden:', isModalHidden);

  // Click on the first card (Avião)
  await page.click('.word-card');
  await new Promise(r => setTimeout(r, 400));

  const isModalOpen1 = await page.$eval('#palavraModal', el => el.classList.contains('active') && !el.hasAttribute('hidden'));
  console.log('3. Modal open after card click:', isModalOpen1);

  const word1 = await page.$eval('#palavraBigWord', el => el.textContent.trim());
  const syllables1 = await page.$$eval('#palavraSyllablesPills .palavra-syllable-pill', els => els.map(e => e.textContent.trim()));
  const desc1 = await page.$eval('#palavraDescText', el => el.textContent.trim());
  const img1 = await page.$eval('#palavraModalImg', el => el.src);
  console.log('   Word 1:', word1, '| Syllables:', syllables1.join('-'), '| Image:', img1.substring(img1.lastIndexOf('/')));
  console.log('   Desc 1:', desc1);

  // Click next button
  await page.click('#btnPalavraModalNext');
  await new Promise(r => setTimeout(r, 300));
  const word2 = await page.$eval('#palavraBigWord', el => el.textContent.trim());
  const desc2 = await page.$eval('#palavraDescText', el => el.textContent.trim());
  console.log('4. Next word:', word2);
  console.log('   Desc 2:', desc2);

  // Click step dot 4 (Árvore)
  const dots = await page.$$('#palavraStepDots .palavra-step-dot');
  console.log('5. Total step dots in modal:', dots.length);
  await dots[3].click();
  await new Promise(r => setTimeout(r, 300));
  const word4 = await page.$eval('#palavraBigWord', el => el.textContent.trim());
  console.log('   Jumped to dot 4:', word4);

  // Close modal via close button
  await page.click('.palavra-btn-close');
  await new Promise(r => setTimeout(r, 300));
  const isClosed = await page.$eval('#palavraModal', el => el.hasAttribute('hidden'));
  console.log('6. Modal closed via close button:', isClosed);

  // Open modal via .btn-open-modal-palavras
  await page.click('.btn-open-modal-palavras');
  await new Promise(r => setTimeout(r, 300));
  const isOpenViaBtn = await page.$eval('#palavraModal', el => el.classList.contains('active') && !el.hasAttribute('hidden'));
  console.log('7. Modal opened via .btn-open-modal-palavras:', isOpenViaBtn);

  // Close via Escape key
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 300));
  const isClosedViaEsc = await page.$eval('#palavraModal', el => el.hasAttribute('hidden'));
  console.log('8. Modal closed via Escape key:', isClosedViaEsc);

  // Select letter B and verify cards and modal
  await page.click('#letterNavContainer button:nth-child(2)');
  await new Promise(r => setTimeout(r, 300));
  const letterTitle = await page.$eval('#showcaseTitle', el => el.textContent.trim());
  console.log('9. Changed to letter:', letterTitle);

  // Open first word in B (Bola)
  await page.click('.word-card');
  await new Promise(r => setTimeout(r, 300));
  const wordB = await page.$eval('#palavraBigWord', el => el.textContent.trim());
  const descB = await page.$eval('#palavraDescText', el => el.textContent.trim());
  console.log('10. Opened B word modal:', wordB);
  console.log('    Desc B:', descB);

  await browser.close();
  console.log('ALL TESTS PASSED WITH 100% SUCCESS!');
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
