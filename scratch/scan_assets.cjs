const fs = require('fs');
const path = require('path');

const htmlFiles = [
  'index.html', 'cadastro.html', 'login.html', 'menu.html', 'licoes.html',
  'vogais.html', 'consoantes.html', 'silabas.html', 'palavras.html',
  'escrita.html', 'frases.html', 'leituras.html', 'letras.html', 'meunome.html'
];

const allAssets = new Set();
const details = {};

for (const hf of htmlFiles) {
  const content = fs.readFileSync(hf, 'utf8');
  const scripts = [...content.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map(m => m[1]);
  const links = [...content.matchAll(/<link[^>]+href=["']([^"']+)["']/g)].map(m => m[1]);
  const imgs = [...content.matchAll(/<img[^>]+src=["']([^"']+)["']/g)].map(m => m[1]);
  const imports = [...content.matchAll(/from\s+["'](\.\/[^"']+)["']/g)].map(m => m[1].replace('./', ''));

  const fileAssets = [...scripts, ...links, ...imgs, ...imports].filter(
    a => !a.startsWith('http') && !a.startsWith('//') && !a.startsWith('data:') && !a.startsWith('#')
  );

  details[hf] = fileAssets;
  fileAssets.forEach(a => allAssets.add(a.split('?')[0].split('#')[0]));
}

console.log('=== ASSETS POR ARQUIVO HTML ===');
for (const [f, assets] of Object.entries(details)) {
  console.log(`\n${f}:`);
  assets.forEach(a => console.log(`  - ${a}`));
}

console.log('\n=== TODOS OS ASSETS LOCAIS ENCONTRADOS ===');
const sorted = [...allAssets].sort();
let totalSize = 0;
for (const a of sorted) {
  const fp = path.resolve(a);
  if (fs.existsSync(fp)) {
    const size = fs.statSync(fp).size;
    totalSize += size;
    console.log(`[OK] ${a} (${(size / 1024).toFixed(1)} KB)`);
  } else {
    console.log(`[NOT FOUND] ${a}`);
  }
}

console.log(`\nTamanho total dos assets HTML: ${(totalSize / 1024).toFixed(1)} KB`);
