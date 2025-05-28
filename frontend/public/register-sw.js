// Service Worker désactivé - Assure la compatibilité avec l'API Supabase
if ('serviceWorker' in navigator) {
  // Désenregistrer tous les service workers existants
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      console.log('Désenregistrement du Service Worker:', registration.scope);
      registration.unregister();
    }
  });
  
  // Intercepter toute tentative d'enregistrement futur
  const originalRegister = navigator.serviceWorker.register;
  navigator.serviceWorker.register = function() {
    console.warn('Tentative d\'enregistrement de Service Worker bloquée pour assurer la compatibilité avec l\'API');
    return Promise.reject(new Error('Service Worker délibérément désactivé pour assurer la compatibilité avec l\'API'));
  };
  
  console.info('🔄 Service Worker désactivé pour permettre l\'accès direct à l\'API Supabase');
}
