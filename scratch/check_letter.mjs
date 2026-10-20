import puppeteer from 'puppeteer';

async function checkLetter() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/palavras.html', { waitUntil: 'domcontentloaded' });
  
  const textBefore = await page.$eval('#showcaseTitle', el => el.textContent.trim());
  console.log('Before:', textBefore);

  await page.evaluate(() => {
    window.selectLetter('B');
  });

  const textAfter = await page.$eval('#showcaseTitle', el => el.textContent.trim());
  console.log('After selectLetter(B):', textAfter);

  const words = await page.$$eval('.word-card .word-name', els => els.map(e => e.textContent.trim()));
  console.log('Cards in B:', words);

  await browser.close();
}

checkLetter().catch(console.error);
