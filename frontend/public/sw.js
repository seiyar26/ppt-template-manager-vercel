// Service Worker pour intercepter et rediriger les requêtes problématiques
const CACHE_NAME = 'ppt-template-manager-v1';

// URLs à mettre en cache immédiatement
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/bridge.html',
  '/api/demo-convert',
  '/api/demo-api'
];

// Correspondances d'URLs à rediriger
const URL_REDIRECTS = [
  // Rediriger les requêtes à jonathanifrah.fr vers des placeholders
  { pattern: /jonathanifrah\.fr\/api\/slide-image/, replacement: 'https://via.placeholder.com/800x600/2196f3/FFFFFF?text=Diapositive+Demo' },
  { pattern: /jonathanifrah\.fr\/api\/convert-pptx/, replacement: '/api/demo-convert' },
  { pattern: /\/api\/slide-image/, replacement: 'https://via.placeholder.com/800x600/2196f3/FFFFFF?text=Diapositive+Demo' },
  { pattern: /\/api\/convert-pptx/, replacement: '/api/demo-convert' },
  { pattern: /\/storage\/v1\/object\/public\/ppt-templates\/templates\/(.*)/, replacement: 'https://via.placeholder.com/800x600/2196f3/FFFFFF?text=Diapositive+$1' }
];

// Installation du service worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installation en cours');
  
  // Précache des URLs importantes
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Mise en cache des fichiers essentiels');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Précache terminé');
        return self.skipWaiting();
      })
  );
});

// Activation du service worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activé');
  
  // Nettoyer les anciens caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Service Worker: Suppression de l\'ancien cache', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('Service Worker: Revendication des clients');
      return self.clients.claim();
    })
  );
});

// Interception des requêtes fetch
self.addEventListener('fetch', event => {
  // Vérifier si la requête doit être redirigée
  const redirectUrl = getRedirectUrl(event.request.url);
  
  if (redirectUrl) {
    console.log('Service Worker: Redirection de', event.request.url, 'vers', redirectUrl);
    
    // Rediriger la requête
    event.respondWith(
      fetch(redirectUrl, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }).catch(() => {
        // Fallback en cas d'échec
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Réponse de secours générée par le Service Worker',
            timestamp: new Date().toISOString()
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }
          }
        );
      })
    );
    return;
  }
  
  // Stratégie pour les autres requêtes : réseau d'abord, puis cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Mettre en cache la réponse réussie
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Essayer d'utiliser le cache en cas d'échec du réseau
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Fallback pour les API
            if (event.request.url.includes('/api/')) {
              // Vérifier s'il s'agit d'une requête pour un template spécifique
              const templateIdMatch = event.request.url.match(/\/api\/templates\/([\w-]+)$/);              
              
              if (templateIdMatch) {
                // C'est une requête pour un template spécifique, retourner une structure compatible
                const templateId = templateIdMatch[1];
                return new Response(
                  JSON.stringify({
                    id: templateId,
                    name: 'Template de secours',
                    description: 'Ce template est généré par le Service Worker en mode hors-ligne',
                    thumbnail: 'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Template+' + templateId,
                    category_id: '1',
                    file_url: 'https://via.placeholder.com/download.pptx',
                    created_at: new Date().toISOString(),
                    status: 'active',
                    conversion_status: 'completed',
                    preview_images: [
                      { url: 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Diapositive+1' },
                      { url: 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Diapositive+2' }
                    ],
                    // Ajouter des données pour la compatibilité avec TemplateFill.js
                    Slides: [
                      { id: '1', slide_index: 1, title: 'Diapositive 1', preview_url: 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Diapositive+1' },
                      { id: '2', slide_index: 2, title: 'Diapositive 2', preview_url: 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Diapositive+2' }
                    ],
                    Fields: [
                      { name: 'title', label: 'Titre', type: 'text', default_value: 'Titre par défaut' },
                      { name: 'subtitle', label: 'Sous-titre', type: 'text', default_value: 'Sous-titre par défaut' }
                    ]
                  }),
                  {
                    headers: {
                      'Content-Type': 'application/json',
                      'Cache-Control': 'no-cache'
                    }
                  }
                );
              } else {
                // Pour les autres API
                return new Response(
                  JSON.stringify({
                    success: true,
                    message: 'Réponse de secours générée par le Service Worker',
                    timestamp: new Date().toISOString()
                  }),
                  {
                    headers: {
                      'Content-Type': 'application/json',
                      'Cache-Control': 'no-cache'
                    }
                  }
                );
              }
            }
            
            // Fallback pour les images
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
              return fetch('https://via.placeholder.com/800x600/2196f3/FFFFFF?text=Image+Non+Disponible');
            }
            
            // Aucun fallback disponible
            return new Response('Ressource non disponible', {
              status: 404,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Fonction pour vérifier si une URL doit être redirigée
function getRedirectUrl(url) {
  for (const redirect of URL_REDIRECTS) {
    if (redirect.pattern.test(url)) {
      // Capturer les groupes de correspondance pour les utiliser dans le remplacement
      const match = url.match(redirect.pattern);
      if (match && match.length > 1) {
        // Remplacer $1, $2, etc. dans le modèle de remplacement
        return redirect.replacement.replace(/\$(\d+)/g, (_, index) => match[index] || '');
      }
      return redirect.replacement;
    }
  }
  return null;
}
