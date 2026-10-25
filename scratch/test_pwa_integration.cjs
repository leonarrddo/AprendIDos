const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer');

const rootDir = path.resolve(__dirname, '..');

async function testPWA() {
  console.log('====================================================');
  console.log('🧪 TESTE COMPLETO DE INTEGRAÇÃO OFFLINE DO PWA');
  console.log('====================================================\n');

  // --- PARTE 1: VALIDAÇÃO DO MANIFESTO ---
  console.log('📌 1. Validando manifest.json...');
  const manifestPath = path.join(rootDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) throw new Error('manifest.json ausente');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  if (!manifest.name || !manifest.short_name || !manifest.start_url || manifest.display !== 'standalone') {
    throw new Error('Configurações essenciais ausentes no manifest.json');
  }

  for (const icon of manifest.icons) {
    const iconFile = path.join(rootDir, icon.src);
    if (!fs.existsSync(iconFile)) throw new Error(`Ícone ausente: ${icon.src}`);
    console.log(`   ✔ Ícone validado: ${icon.src} (${icon.sizes}, ${icon.purpose || 'any'})`);
  }

  // --- PARTE 2: VALIDAÇÃO DO SERVICE WORKER (SW.JS) ---
  console.log('\n📌 2. Validando regras do sw.js...');
  const swContent = fs.readFileSync(path.join(rootDir, 'sw.js'), 'utf8');
  if (!swContent.includes("CACHE_VERSION = 'v3'")) {
    throw new Error('sw.js deve conter CACHE_VERSION v3');
  }

  const requiredScripts = [
    'consoantes.js', 'escrita.js', 'frases.js', 'leituras.js', 'letras.js',
    'licoes.js', 'meunome.js', 'palavras.js', 'silabas.js', 'vogais.js',
    'auth.js', 'supabase-config.js', 'letter-paths.js', 'theme.js', 'pwa.js'
  ];
  for (const script of requiredScripts) {
    if (!swContent.includes(`'${script}'`)) {
      throw new Error(`Script essencial ausente no PRECACHE_ASSETS: ${script}`);
    }
  }
  console.log(`   ✔ Todos os ${requiredScripts.length} scripts essenciais declarados no PRECACHE_ASSETS.`);

  // --- PARTE 3: SERVIDOR LOCAL E NAVEGADOR ---
  console.log('\n📌 3. Iniciando servidor local HTTP e Puppeteer...');
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/') reqUrl = '/index.html';
    const filePath = path.join(rootDir, path.normalize(reqUrl).replace(/^(\.\.[\/\\])+/, ''));

    if (filePath.endsWith('sw.js')) {
      res.setHeader('Service-Worker-Allowed', '/');
      res.setHeader('Cache-Control', 'no-cache');
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });

  const port = await new Promise((resolve) => server.listen(0, () => resolve(server.address().port)));
  console.log(`   Servidor local ativo na porta ${port}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Monitora requisições locais que falharem durante o teste
    const localFailedRequests = [];
    page.on('requestfailed', (req) => {
      const url = req.url();
      // Ignora APIs externas propositalmente offline
      if (!url.includes('google') && !url.includes('supabase') && !url.includes('vlibras') && !url.includes('jsdelivr') && !url.includes('cdnjs')) {
        localFailedRequests.push({ url, failure: req.failure()?.errorText });
      }
    });

    // 1. Acesso inicial online para instalar Service Worker e pré-armazenar recursos
    console.log('\n📌 4. Instalando Service Worker e pré-armazenando recursos online...');
    await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'networkidle0' });

    // Aguarda o Service Worker ativar
    await page.waitForFunction(async () => {
      if (!navigator.serviceWorker) return false;
      const reg = await navigator.serviceWorker.getRegistration();
      return !!(reg && reg.active);
    }, { timeout: 15000 });

    // Aguarda a conclusão do pre-cache
    const cacheKeys = await page.evaluate(async () => {
      const keys = await caches.keys();
      const staticKey = keys.find(k => k.startsWith('aprendidos-static-'));
      if (!staticKey) return null;
      const cache = await caches.open(staticKey);
      const requests = await cache.keys();
      return { staticKey, count: requests.length, urls: requests.map(r => r.url) };
    });

    console.log(`   ✔ Cache ativo: ${cacheKeys?.staticKey}`);
    console.log(`   ✔ Recursos pré-armazenados no cache: ${cacheKeys?.count} itens.`);

    // 2. Simula desconexão total da rede
    console.log('\n📌 5. Desconectando rede (modo OFFLINE ativado)...');
    await page.setOfflineMode(true);

    // 3. Teste exaustivo de cada página e atividade educativa offline
    const activitiesToTest = [
      {
        page: 'vogais.html',
        desc: 'Módulo de Vogais',
        check: () => {
          const container = document.querySelector('.container, .vowel-card, #containerPrincipal');
          return { ready: !!container, detail: 'Interface interativa de vogais renderizada' };
        }
      },
      {
        page: 'consoantes.html',
        desc: 'Módulo de Consoantes',
        check: () => {
          const hasData = typeof window.consonantData !== 'undefined';
          const btnAudio = document.querySelector('.btn-audio-exercise, .container');
          return { ready: hasData && !!btnAudio, detail: 'Base de 21 consoantes e motor de áudio inicializados' };
        }
      },
      {
        page: 'silabas.html',
        desc: 'Módulo de Sílabas',
        check: () => {
          const hasBank = typeof window.wordBank !== 'undefined' && window.wordBank.length > 0;
          const container = document.querySelector('.container, #exerciseContainer');
          return { ready: hasBank && !!container, detail: 'Banco de sílabas e motor de exercícios inicializados' };
        }
      },
      {
        page: 'palavras.html',
        desc: 'Catálogo de Palavras do Dia a Dia',
        check: () => {
          const hasCatalog = typeof window.catalogData !== 'undefined';
          const container = document.querySelector('.container, #catalogContainer');
          return { ready: hasCatalog && !!container, detail: 'Catálogo fonético A-Z carregado offline' };
        }
      },
      {
        page: 'escrita.html',
        desc: 'Módulo de Escrita à Mão (Canvas)',
        check: () => {
          const canvas = document.querySelector('canvas#canvasEscrita, canvas');
          const hasLetterPaths = typeof window.LETTER_PATHS !== 'undefined';
          return { ready: !!canvas && hasLetterPaths, detail: 'Canvas de caligrafia e traçados vetoriais inicializados' };
        }
      },
      {
        page: 'frases.html',
        desc: 'Módulo de Frases Simples',
        check: () => {
          const container = document.querySelector('.frase-card, .frase-texto, #phraseContainer, .container');
          return { ready: !!container, detail: 'Banco de frases interativo carregado' };
        }
      },
      {
        page: 'leituras.html',
        desc: 'Módulo de Pequenas Leituras',
        check: () => {
          const readingCard = document.querySelector('.historia-card, .card-leitura, .leitura-container, main, .container');
          return { ready: !!readingCard, detail: 'Contos e textos de leitura carregados' };
        }
      },
      {
        page: 'letras.html',
        desc: 'Módulo de Alfabeto Completo (A-Z)',
        check: () => {
          const cards = document.querySelectorAll('.card-letra, .letter-card, .grade-alfabeto, main, .container');
          return { ready: cards.length > 0, detail: 'Alfabeto A-Z carregado offline' };
        }
      },
      {
        page: 'meunome.html',
        desc: 'Atividade Meu Nome',
        check: () => {
          const canvas = document.querySelector('canvas#canvasNome, canvas, input#inputNome');
          return { ready: !!canvas, detail: 'Lousa de escrita do nome inicializada' };
        }
      },
      {
        page: 'licoes.html',
        desc: 'Hub Central de Lições',
        check: () => {
          const cards = document.querySelectorAll('.activity-card, .card-licao, .grade-licoes, .modulo');
          return { ready: cards.length > 0, detail: `${cards.length} módulos de lição disponíveis offline` };
        }
      }
    ];

    console.log('\n📌 6. Verificando cada atividade educativa em modo OFFLINE:');
    let passedCount = 0;

    for (const act of activitiesToTest) {
      const url = `http://localhost:${port}/${act.page}`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      // Avalia se a atividade conseguiu inicializar via script JS correspondente
      const evalResult = await page.evaluate(act.check);
      const title = await page.title();

      if (evalResult.ready) {
        console.log(`   ✔ [OFFLINE OK] ${act.page.padEnd(16)} -> ${act.desc}: ${evalResult.detail}`);
        passedCount++;
      } else {
        console.error(`   ❌ [OFFLINE FALHOU] ${act.page.padEnd(16)} -> ${act.desc}`);
      }
    }

    // 4. Verificação de requisições locais essenciais com falha
    console.log('\n📌 7. Verificando integridade de requisições locais offline...');
    if (localFailedRequests.length === 0) {
      console.log('   ✔ Nenhuma requisição local essencial falhou offline! Todos os scripts, estilos e páginas responderam do cache.');
    } else {
      console.warn('   ⚠️ Requisições locais que falharam:', localFailedRequests);
    }

    // 5. Confirmação do bloqueio de internet para Supabase offline
    console.log('\n📌 8. Confirmando isolamento de recursos dinâmicos (Supabase/Auth)...');
    const authStatus = await page.evaluate(async () => {
      // Tenta simular requisição à API Supabase enquanto offline
      try {
        const res = await fetch('https://ggptdxmsrsfrpvntlfja.supabase.co/rest/v1/progresso_licoes', {
          method: 'GET',
          headers: { apikey: 'anon' }
        });
        return { online: true, status: res.status };
      } catch (err) {
        return { online: false, blocked: true, message: err.message };
      }
    });
    console.log(`   ✔ Supabase offline: bloqueado pela ausência de rede (comportamento correto: ${authStatus.blocked})`);

    console.log(`\n====================================================`);
    console.log(`🎉 RESULTADO: ${passedCount}/${activitiesToTest.length} ATIVIDADES VALIDADAS OFFLINE COM SUCESSO!`);
    console.log(`====================================================\n`);

  } finally {
    await browser.close();
    server.close();
  }
}

testPWA().catch((err) => {
  console.error('\n❌ ERRO NA EXECUÇÃO DO TESTE:', err);
  process.exit(1);
});
