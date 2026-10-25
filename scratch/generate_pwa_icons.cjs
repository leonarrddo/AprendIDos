const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function generateIcons() {
  const iconsDir = path.resolve(__dirname, '..', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const logoPath = path.resolve(__dirname, 'remote_logo.png');
  if (!fs.existsSync(logoPath)) {
    console.error('scratch/remote_logo.png does not exist');
    process.exit(1);
  }

  const logoDataUrl = 'data:image/png;base64,' + fs.readFileSync(logoPath).toString('base64');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const configs = [
    { name: 'icon-192x192.png', size: 192, padRatio: 0.05, bg: null },
    { name: 'icon-512x512.png', size: 512, padRatio: 0.05, bg: null },
    { name: 'icon-maskable-512x512.png', size: 512, padRatio: 0.15, bg: '#FFFFFF' },
    { name: 'apple-touch-icon.png', size: 180, padRatio: 0.10, bg: '#FFFFFF' },
    { name: 'favicon-32x32.png', size: 32, padRatio: 0.05, bg: null }
  ];

  for (const cfg of configs) {
    const page = await browser.newPage();
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: transparent; width: ${cfg.size}px; height: ${cfg.size}px; overflow: hidden; }
          canvas { display: block; width: ${cfg.size}px; height: ${cfg.size}px; }
        </style>
      </head>
      <body>
        <canvas id="c" width="${cfg.size}" height="${cfg.size}"></canvas>
        <script>
          const canvas = document.getElementById('c');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.onload = () => {
            ${cfg.bg ? `
              ctx.fillStyle = '${cfg.bg}';
              ctx.fillRect(0, 0, ${cfg.size}, ${cfg.size});
            ` : ''}
            const pad = Math.round(${cfg.size} * ${cfg.padRatio});
            const drawSize = ${cfg.size} - (pad * 2);
            ctx.drawImage(img, pad, pad, drawSize, drawSize);
            window.__ICON_DONE__ = true;
          };
          img.onerror = (e) => {
            window.__ICON_ERROR__ = true;
          };
          img.src = '${logoDataUrl}';
        </script>
      </body>
      </html>
    `;

    await page.setViewport({ width: cfg.size, height: cfg.size, deviceScaleFactor: 1 });
    await page.setContent(html);
    await page.waitForFunction('window.__ICON_DONE__ === true', { timeout: 15000 });

    const outPath = path.join(iconsDir, cfg.name);
    await page.screenshot({
      path: outPath,
      omitBackground: cfg.bg === null,
      clip: { x: 0, y: 0, width: cfg.size, height: cfg.size }
    });

    const stat = fs.statSync(outPath);
    console.log(`Generated: ${cfg.name} (${cfg.size}x${cfg.size}) - ${stat.size} bytes`);
    await page.close();
  }

  await browser.close();
  console.log('All icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
