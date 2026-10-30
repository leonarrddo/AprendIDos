/**
 * AprendIDos — Service Worker PWA
 * Gerencia cache de recursos estáticos e suporte offline seguro para idosos e adultos aprendizes.
 * 
 * DIRETRIZES DE SEGURANÇA:
 * - Não armazena dados de autenticação, tokens ou respostas do Supabase.
 * - Não intercepta requisições de autenticação externa (Google OAuth) ou APIs dinâmicas.
 * - Estratégia Network-First para páginas HTML (sempre prioriza conteúdo recente quando online).
 * - Estratégia Stale-While-Revalidate para recursos estáticos da aplicação.
 */

const CACHE_VERSION = 'v6';
const CACHE_PREFIX = 'aprendidos-';
const STATIC_CACHE = `${CACHE_PREFIX}static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}runtime-${CACHE_VERSION}`;

// Recursos estruturais essenciais pré-armazenados no install
// Total ~1.84 MB: garante funcionamento offline imediato de todas as atividades
const PRECACHE_ASSETS = [
  './',
  'index.html',
  'menu.html',
  'licoes.html',
  'vogais.html',
  'consoantes.html',
  'silabas.html',
  'palavras.html',
  'escrita.html',
  'frases.html',
  'leituras.html',
  'letras.html',
  'meunome.html',
  'login.html',
  'cadastro.html',
  'certificado.html',
  'certificado.js',
  'certificado-logic.js',
  'review-progress.js',
  'theme.css',
  'theme.js',
  'accessibility.css',
  'accessibility.js',
  'pwa.js',
  'letter-paths.js',
  'consoantes.js',
  'escrita.js',
  'frases.js',
  'leituras.js',
  'letras.js',
  'licoes.js',
  'meunome.js',
  'palavras.js',
  'silabas.js',
  'vogais.js',
  'auth.js',
  'supabase-config.js',
  'manifest.json',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png',
  'icons/icon-maskable-512x512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32x32.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      // Adiciona itens individualmente para maior resiliência em caso de falha de rede pontual
      const cachePromises = PRECACHE_ASSETS.map((asset) => {
        return cache.add(asset).catch((err) => {
          console.warn('[AprendIDos SW] Aviso ao pré-carregar recurso:', asset, err.message);
        });
      });
      await Promise.all(cachePromises);
    }).then(() => self.skipWaiting())
  );
});

// Ativação e limpeza de versões antigas do cache pertencentes ao AprendIDos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== STATIC_CACHE && key !== RUNTIME_CACHE)
          .map((key) => {
            console.log('[AprendIDos SW] Removendo cache obsoleto:', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Apenas métodos GET são seguros para manipulação de cache
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Ignora protocolos não-HTTP (ex: chrome-extension:, data:, blob:)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 1. ISOLAMENTO TOTAL DE SEGURANÇA:
  // Nunca intercepta nem armazena em cache requisições para o Supabase,
  // autenticação externa (Google OAuth), síntese remota de voz ou acessibilidade externa (VLibras)
  const isExternalApiOrAuth =
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('accounts.google.com') ||
    url.hostname.includes('googleusercontent.com') ||
    url.hostname.includes('translate.google.com') ||
    url.hostname.includes('vlibras.gov.br');

  if (isExternalApiOrAuth) {
    return; // Deixa o navegador executar a requisição na rede diretamente
  }

  // APIs locais também são dinâmicas: não armazenar estados de solicitações,
  // respostas de autenticação ou outros dados retornados por funções Vercel.
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) {
    return;
  }

  // 2. Requisições de navegação (páginas HTML):
  // Estratégia Network-First com fallback para cache offline
  const isHtmlNavigation =
    request.mode === 'navigate' ||
    (request.headers.get('accept') && request.headers.get('accept').includes('text/html'));

  if (isHtmlNavigation) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Se estiver offline ou a rede falhar, busca no cache estático ou runtime
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback para index.html se for navegação
          return caches.match('index.html') || caches.match('./');
        })
    );
    return;
  }

  // 3. Recursos estáticos do mesmo domínio (CSS, JS, imagens, ícones):
  // Estratégia Stale-While-Revalidate (retorno rápido do cache com revalidação em background)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Em caso de falha de rede sem cache, a promessa resolverá com o cache se existir
          });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 4. CDNs estáticas (Google Fonts, Bootstrap, FontAwesome):
  // Cache-First com atualização em background para performance
  if (url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com') ||
      url.hostname.includes('cdn.jsdelivr.net') ||
      url.hostname.includes('cdnjs.cloudflare.com')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            const responseClone = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => {
          // Fallback silencioso em falhas de fontes externas offline
        });
      })
    );
  }
});
