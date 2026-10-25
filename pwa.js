/**
 * AprendIDos — Registro e Gerenciamento do Progressive Web App (PWA)
 * Registra o Service Worker e monitora atualizações transparentes de cache.
 */

(function () {
  'use strict';

  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Registra o Service Worker após o carregamento completo da página
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('sw.js', { scope: './' })
      .then(function (registration) {
        // Monitora novas versões disponíveis do Service Worker
        registration.addEventListener('updatefound', function () {
          var installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', function () {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Nova versão instalada mantendo a atual ativa até recarregar
                console.log('[AprendIDos PWA] Nova versão disponível. O cache foi atualizado com sucesso.');
              } else {
                console.log('[AprendIDos PWA] Conteúdo em cache para funcionamento offline.');
              }
            }
          });
        });
      })
      .catch(function (error) {
        console.warn('[AprendIDos PWA] Não foi possível registrar o Service Worker:', error);
      });
  });
})();
