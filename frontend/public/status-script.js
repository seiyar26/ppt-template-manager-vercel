/**
 * Script de diagnostic pour PPT Template Manager
 * Version: 1.0.0
 * Date: 2025-05-27
 * 
 * Ce script fournit des fonctionnalités de diagnostic pour l'application,
 * permettant aux utilisateurs et aux administrateurs de vérifier l'état du système
 * et de résoudre les problèmes potentiels.
 */

// Configuration
const CONFIG = {
  apiTimeout: 15000,         // Timeout pour les requêtes API (ms)
  refreshInterval: 60000,    // Intervalle de rafraîchissement automatique (ms)
  maxLogEntries: 100,        // Nombre maximum d'entrées de log à conserver
  resourcesList: [           // Ressources à vérifier
    '/index.html',
    '/manifest.json',
    '/sw.js',
    '/api/demo-api',
    '/api/demo-convert'
  ],
  endpoints: {               // Points d'API à tester
    demo: '/api/demo-api',
    convert: '/api/demo-convert',
    status: '/api/status'
  }
};

// État global
const STATE = {
  logs: [],                  // Journal des événements système
  testResults: {},           // Résultats des tests
  refreshTimer: null,        // Timer pour le rafraîchissement automatique
  swRegistration: null,      // Enregistrement du Service Worker
  initialized: false         // Indique si l'initialisation est terminée
};

// Utilitaires
const Utils = {
  // Formatter une date en chaîne lisible
  formatDate(date) {
    if (!date) date = new Date();
    return date.toISOString().replace('T', ' ').substr(0, 19);
  },
  
  // Ajouter une entrée au journal
  addLogEntry(level, message, details = null) {
    const logEntry = {
      timestamp: new Date(),
      level,
      message,
      details
    };
    
    STATE.logs.unshift(logEntry);
    
    // Limiter le nombre d'entrées
    if (STATE.logs.length > CONFIG.maxLogEntries) {
      STATE.logs = STATE.logs.slice(0, CONFIG.maxLogEntries);
    }
    
    // Mettre à jour l'affichage des logs
    UI.updateLogs();
    
    return logEntry;
  },
  
  // Exécuter une requête fetch avec timeout
  async fetchWithTimeout(url, options = {}, timeout = CONFIG.apiTimeout) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    options.signal = controller.signal;
    
    try {
      const response = await fetch(url, options);
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  },
  
  // Vérifier si une URL est accessible
  async isResourceAvailable(url) {
    try {
      const response = await this.fetchWithTimeout(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  },
  
  // Obtenir des informations sur le navigateur
  getBrowserInfo() {
    const ua = navigator.userAgent;
    let browserName = "Inconnu";
    let browserVersion = "";
    
    if (ua.indexOf("Firefox") > -1) {
      browserName = "Firefox";
      browserVersion = ua.match(/Firefox\/([0-9.]+)/)[1];
    } else if (ua.indexOf("SamsungBrowser") > -1) {
      browserName = "Samsung Internet";
      browserVersion = ua.match(/SamsungBrowser\/([0-9.]+)/)[1];
    } else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) {
      browserName = "Opera";
      browserVersion = ua.indexOf("Opera") > -1 ? ua.match(/Opera\/([0-9.]+)/)[1] : ua.match(/OPR\/([0-9.]+)/)[1];
    } else if (ua.indexOf("Edg") > -1) {
      browserName = "Microsoft Edge";
      browserVersion = ua.match(/Edg\/([0-9.]+)/)[1];
    } else if (ua.indexOf("Chrome") > -1) {
      browserName = "Chrome";
      browserVersion = ua.match(/Chrome\/([0-9.]+)/)[1];
    } else if (ua.indexOf("Safari") > -1) {
      browserName = "Safari";
      browserVersion = ua.match(/Version\/([0-9.]+)/)[1];
    }
    
    return {
      name: browserName,
      version: browserVersion,
      userAgent: ua,
      platform: navigator.platform,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled
    };
  },
  
  // Copier du texte dans le presse-papiers
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Erreur lors de la copie dans le presse-papiers:', error);
      return false;
    }
  },
  
  // Vider le cache du navigateur
  async clearCache() {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors du vidage du cache:', error);
      return false;
    }
  },
  
  // Vérifier et enregistrer le Service Worker
  async checkServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      return {
        supported: false,
        registered: false,
        message: "Le navigateur ne prend pas en charge les Service Workers"
      };
    }
    
    try {
      // Vérifier si un Service Worker est déjà enregistré
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      if (registrations.length > 0) {
        STATE.swRegistration = registrations[0];
        
        return {
          supported: true,
          registered: true,
          version: STATE.swRegistration.active ? 
            (await STATE.swRegistration.active.postMessage({ type: 'GET_VERSION' })) || 'v1' : 
            'inconnu',
          scope: STATE.swRegistration.scope,
          status: STATE.swRegistration.active ? 'actif' : 'en attente'
        };
      } else {
        // Essayer d'enregistrer le Service Worker
        try {
          STATE.swRegistration = await navigator.serviceWorker.register('/sw.js');
          
          return {
            supported: true,
            registered: true,
            version: 'v1 (nouveau)',
            scope: STATE.swRegistration.scope,
            status: 'enregistré'
          };
        } catch (regError) {
          return {
            supported: true,
            registered: false,
            message: `Échec de l'enregistrement: ${regError.message}`
          };
        }
      }
    } catch (error) {
      return {
        supported: true,
        registered: false,
        message: `Erreur de vérification: ${error.message}`
      };
    }
  }
};

// Interface utilisateur
const UI = {
  // Mettre à jour les indicateurs de statut
  updateStatusIndicators(statuses) {
    const updateIndicator = (id, status, message, details) => {
      const dotElement = document.getElementById(`${id}-status-dot`);
      const textElement = document.getElementById(`${id}-status-text`);
      const detailsElement = document.getElementById(`${id}-status-details`);
      
      if (dotElement) {
        dotElement.className = `status-dot ${status}`;
      }
      
      if (textElement) {
        textElement.textContent = message;
      }
      
      if (detailsElement) {
        detailsElement.textContent = details;
      }
    };
    
    if (statuses.app) {
      updateIndicator('app', statuses.app.status, statuses.app.message, statuses.app.details);
    }
    
    if (statuses.api) {
      updateIndicator('api', statuses.api.status, statuses.api.message, statuses.api.details);
    }
    
    if (statuses.sw) {
      updateIndicator('sw', statuses.sw.status, statuses.sw.message, statuses.sw.details);
    }
    
    if (statuses.storage) {
      updateIndicator('storage', statuses.storage.status, statuses.storage.message, statuses.storage.details);
    }
  },
  
  // Mettre à jour la table de configuration
  updateConfigTable(config) {
    document.getElementById('env-mode').textContent = config.mode || '-';
    document.getElementById('app-url').textContent = config.appUrl || '-';
    document.getElementById('api-url').textContent = config.apiUrl || '-';
    document.getElementById('demo-mode').textContent = config.demoMode || '-';
    document.getElementById('sw-version').textContent = config.swVersion || '-';
    document.getElementById('browser-info').textContent = config.browserInfo || '-';
    document.getElementById('current-datetime').textContent = config.currentDatetime || '-';
  },
  
  // Mettre à jour l'affichage des logs
  updateLogs() {
    const logsContainer = document.getElementById('system-logs');
    
    if (!logsContainer) return;
    
    logsContainer.innerHTML = '';
    
    STATE.logs.forEach(log => {
      const logEntry = document.createElement('div');
      logEntry.className = 'log-entry';
      
      const timestamp = document.createElement('span');
      timestamp.className = 'timestamp';
      timestamp.textContent = Utils.formatDate(log.timestamp);
      
      const level = document.createElement('span');
      level.className = `log-${log.level.toLowerCase()}`;
      level.textContent = `[${log.level.toUpperCase()}]`;
      
      logEntry.appendChild(timestamp);
      logEntry.appendChild(document.createTextNode(' '));
      logEntry.appendChild(level);
      logEntry.appendChild(document.createTextNode(' ' + log.message));
      
      if (log.details) {
        const details = document.createElement('div');
        details.style.paddingLeft = '1.5rem';
        details.style.fontSize = '0.9em';
        details.style.opacity = '0.8';
        details.textContent = typeof log.details === 'object' ? 
          JSON.stringify(log.details, null, 2) : log.details;
        logEntry.appendChild(details);
      }
      
      logsContainer.appendChild(logEntry);
    });
  },
  
  // Afficher une notification temporaire
  showNotification(message, type = 'info', duration = 3000) {
    const notificationArea = document.getElementById('notification-area') || (() => {
      const area = document.createElement('div');
      area.id = 'notification-area';
      area.style.position = 'fixed';
      area.style.top = '20px';
      area.style.right = '20px';
      area.style.zIndex = '9999';
      document.body.appendChild(area);
      return area;
    })();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.backgroundColor = type === 'error' ? '#E02424' : 
                                        type === 'warning' ? '#FF7D00' : 
                                        type === 'success' ? '#00C896' : '#0081C7';
    notification.style.color = '#FFFFFF';
    notification.style.padding = '10px 15px';
    notification.style.borderRadius = '4px';
    notification.style.marginBottom = '10px';
    notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    notification.style.transition = 'opacity 0.3s, transform 0.3s';
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(50px)';
    
    notificationArea.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Disparition automatique
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(50px)';
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, duration);
  }
};

// Tests du système
const Tests = {
  // Tester la connexion API
  async testApiConnection() {
    Utils.addLogEntry('info', 'Test de connexion API démarré');
    
    try {
      const demoEndpoint = CONFIG.endpoints.demo;
      const response = await Utils.fetchWithTimeout(demoEndpoint);
      
      if (response.ok) {
        const data = await response.json();
        
        STATE.testResults.apiConnection = {
          status: 'success',
          message: 'Connexion API réussie',
          details: data
        };
        
        Utils.addLogEntry('info', 'Test de connexion API réussi', data);
        return STATE.testResults.apiConnection;
      } else {
        throw new Error(`Statut HTTP: ${response.status}`);
      }
    } catch (error) {
      const errorDetails = {
        message: error.message,
        type: error.name,
        isTimeout: error.name === 'AbortError'
      };
      
      STATE.testResults.apiConnection = {
        status: 'error',
        message: 'Échec de connexion API',
        details: errorDetails
      };
      
      Utils.addLogEntry('error', 'Test de connexion API échoué', errorDetails);
      return STATE.testResults.apiConnection;
    }
  },
  
  // Tester les ressources
  async testResources() {
    Utils.addLogEntry('info', 'Test des ressources démarré');
    
    const results = {
      status: 'unknown',
      message: 'Vérification des ressources',
      details: {},
      success: 0,
      failed: 0,
      total: CONFIG.resourcesList.length
    };
    
    for (const resource of CONFIG.resourcesList) {
      try {
        const isAvailable = await Utils.isResourceAvailable(resource);
        
        results.details[resource] = {
          available: isAvailable,
          status: isAvailable ? 'success' : 'error'
        };
        
        if (isAvailable) {
          results.success++;
        } else {
          results.failed++;
        }
      } catch (error) {
        results.details[resource] = {
          available: false,
          status: 'error',
          error: error.message
        };
        results.failed++;
      }
    }
    
    // Déterminer le statut global
    if (results.failed === 0) {
      results.status = 'operational';
      results.message = 'Toutes les ressources sont disponibles';
    } else if (results.success === 0) {
      results.status = 'error';
      results.message = 'Aucune ressource n\'est disponible';
    } else {
      results.status = 'warning';
      results.message = `${results.success}/${results.total} ressources disponibles`;
    }
    
    STATE.testResults.resources = results;
    
    Utils.addLogEntry(
      results.failed === 0 ? 'info' : 'warning',
      `Test des ressources: ${results.message}`,
      results.details
    );
    
    return results;
  },
  
  // Tester la redirection
  async testRedirection() {
    Utils.addLogEntry('info', 'Test de redirection démarré');
    
    // URLs à tester pour la redirection
    const redirectTests = [
      {
        name: 'API jonathanifrah.fr',
        url: 'https://jonathanifrah.fr/api/slide-image',
        expectedRedirect: true
      },
      {
        name: 'Conversion PPTX',
        url: '/api/convert-pptx',
        expectedRedirect: true
      },
      {
        name: 'Image locale',
        url: '/api/demo-api',
        expectedRedirect: false
      }
    ];
    
    const results = {
      status: 'unknown',
      message: 'Vérification des redirections',
      details: {},
      success: 0,
      failed: 0,
      total: redirectTests.length
    };
    
    for (const test of redirectTests) {
      try {
        // Utiliser fetch avec l'option redirect: 'manual' pour détecter les redirections
        const response = await Utils.fetchWithTimeout(test.url, {
          redirect: 'manual',
          method: 'HEAD'
        });
        
        // Déterminer si une redirection a eu lieu
        const redirected = response.type === 'opaqueredirect' || 
                         response.redirected || 
                         [301, 302, 303, 307, 308].includes(response.status);
        
        // Comparer avec le résultat attendu
        const success = redirected === test.expectedRedirect;
        
        results.details[test.name] = {
          url: test.url,
          redirected,
          expectedRedirect: test.expectedRedirect,
          success,
          status: success ? 'success' : 'error'
        };
        
        if (success) {
          results.success++;
        } else {
          results.failed++;
        }
      } catch (error) {
        // En cas d'erreur CORS, cela peut indiquer une redirection réussie
        const isCorsError = error.message.includes('CORS') || error.message.includes('opaque');
        const success = (test.expectedRedirect && isCorsError) || (!test.expectedRedirect && !isCorsError);
        
        results.details[test.name] = {
          url: test.url,
          error: error.message,
          isCorsError,
          expectedRedirect: test.expectedRedirect,
          success,
          status: success ? 'success' : 'error'
        };
        
        if (success) {
          results.success++;
        } else {
          results.failed++;
        }
      }
    }
    
    // Déterminer le statut global
    if (results.failed === 0) {
      results.status = 'operational';
      results.message = 'Toutes les redirections fonctionnent correctement';
    } else if (results.success === 0) {
      results.status = 'error';
      results.message = 'Aucune redirection ne fonctionne correctement';
    } else {
      results.status = 'warning';
      results.message = `${results.success}/${results.total} redirections fonctionnent`;
    }
    
    STATE.testResults.redirections = results;
    
    Utils.addLogEntry(
      results.failed === 0 ? 'info' : 'warning',
      `Test des redirections: ${results.message}`,
      results.details
    );
    
    return results;
  },
  
  // Exécuter tous les tests
  async runAllTests() {
    Utils.addLogEntry('info', 'Exécution de tous les tests');
    
    UI.showNotification('Tests en cours...', 'info');
    
    const apiResult = await this.testApiConnection();
    const resourcesResult = await this.testResources();
    const redirectionResult = await this.testRedirection();
    
    // Mettre à jour les indicateurs de statut
    const statuses = {
      api: {
        status: apiResult.status === 'success' ? 'operational' : 'warning',
        message: apiResult.status === 'success' ? 'Opérationnel' : 'Mode démonstration',
        details: 'L\'API répond en mode démo'
      },
      app: {
        status: 'operational',
        message: 'Opérationnel',
        details: 'L\'application fonctionne normalement'
      },
      sw: {
        status: resourcesResult.details['/sw.js']?.available ? 'operational' : 'warning',
        message: resourcesResult.details['/sw.js']?.available ? 'Actif' : 'Inactif',
        details: resourcesResult.details['/sw.js']?.available ? 
          'Le Service Worker est opérationnel' : 'Le Service Worker n\'est pas actif'
      },
      storage: {
        status: redirectionResult.success > 0 ? 'operational' : 'warning',
        message: redirectionResult.success > 0 ? 'Connecté' : 'Mode local',
        details: redirectionResult.success > 0 ? 
          'Stockage et redirections fonctionnels' : 'Fonctionnement en mode local uniquement'
      }
    };
    
    UI.updateStatusIndicators(statuses);
    
    Utils.addLogEntry('info', 'Tous les tests terminés', {
      api: apiResult.status,
      resources: resourcesResult.status,
      redirections: redirectionResult.status
    });
    
    UI.showNotification('Tests terminés', 'success');
    
    return {
      api: apiResult,
      resources: resourcesResult,
      redirections: redirectionResult
    };
  }
};

// Fonctions d'initialisation
const App = {
  // Initialiser l'application
  async init() {
    // Vérifier si déjà initialisé
    if (STATE.initialized) return;
    
    Utils.addLogEntry('info', 'Initialisation de la page de statut');
    
    // Configurer les gestionnaires d'événements
    this.setupEventListeners();
    
    // Charger les informations de configuration
    await this.loadConfiguration();
    
    // Exécuter les tests initiaux
    await Tests.runAllTests();
    
    // Marquer comme initialisé
    STATE.initialized = true;
    
    Utils.addLogEntry('info', 'Initialisation terminée');
  },
  
  // Configurer les gestionnaires d'événements
  setupEventListeners() {
    // Bouton d'actualisation des statuts
    document.getElementById('refresh-status-btn')?.addEventListener('click', async () => {
      Utils.addLogEntry('info', 'Actualisation manuelle des statuts');
      await Tests.runAllTests();
    });
    
    // Bouton de test API
    document.getElementById('test-api-btn')?.addEventListener('click', async () => {
      Utils.addLogEntry('info', 'Test API manuel déclenché');
      const result = await Tests.testApiConnection();
      UI.showNotification(
        result.status === 'success' ? 'API accessible' : 'Problème d\'accès API',
        result.status === 'success' ? 'success' : 'error'
      );
    });
    
    // Bouton de vidage du cache
    document.getElementById('clear-cache-btn')?.addEventListener('click', async () => {
      Utils.addLogEntry('info', 'Vidage du cache déclenché');
      const success = await Utils.clearCache();
      UI.showNotification(
        success ? 'Cache vidé avec succès' : 'Échec du vidage du cache',
        success ? 'success' : 'error'
      );
    });
    
    // Bouton d'actualisation des logs
    document.getElementById('refresh-logs-btn')?.addEventListener('click', () => {
      Utils.addLogEntry('info', 'Actualisation manuelle des logs');
      UI.updateLogs();
    });
    
    // Bouton de copie des logs
    document.getElementById('copy-logs-btn')?.addEventListener('click', async () => {
      const logsText = STATE.logs.map(log => 
        `${Utils.formatDate(log.timestamp)} [${log.level.toUpperCase()}] ${log.message}${log.details ? ' - ' + JSON.stringify(log.details) : ''}`
      ).join('\n');
      
      const success = await Utils.copyToClipboard(logsText);
      UI.showNotification(
        success ? 'Logs copiés dans le presse-papiers' : 'Échec de la copie des logs',
        success ? 'success' : 'warning'
      );
    });
    
    // Bouton d'effacement des logs
    document.getElementById('clear-logs-btn')?.addEventListener('click', () => {
      STATE.logs = [];
      UI.updateLogs();
      Utils.addLogEntry('info', 'Logs effacés manuellement');
    });
    
    // Bouton de test de connexion
    document.getElementById('test-connection-btn')?.addEventListener('click', async () => {
      await Tests.testApiConnection();
    });
    
    // Bouton de vérification des ressources
    document.getElementById('check-resources-btn')?.addEventListener('click', async () => {
      await Tests.testResources();
    });
    
    // Bouton de test des redirections
    document.getElementById('redirect-test-btn')?.addEventListener('click', async () => {
      await Tests.testRedirection();
    });
    
    // Bouton d'affichage des logs API
    document.getElementById('show-api-logs-btn')?.addEventListener('click', () => {
      if (window.parent && typeof window.parent.showApiLogs === 'function') {
        window.parent.showApiLogs();
        Utils.addLogEntry('info', 'Affichage des logs API');
      } else {
        UI.showNotification('Fonction de logs API non disponible', 'warning');
        Utils.addLogEntry('warning', 'Fonction de logs API non disponible');
      }
    });
    
    // Bouton de réinitialisation de l'application
    document.getElementById('reset-app-btn')?.addEventListener('click', async () => {
      if (confirm('Êtes-vous sûr de vouloir réinitialiser l\'application ? Toutes les données locales seront effacées.')) {
        Utils.addLogEntry('warning', 'Réinitialisation de l\'application déclenchée');
        
        // Vider le cache
        await Utils.clearCache();
        
        // Vider le localStorage
        localStorage.clear();
        
        // Désinscrire les Service Workers
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }
        }
        
        Utils.addLogEntry('info', 'Application réinitialisée, rechargement de la page');
        
        // Recharger la page après un court délai
        setTimeout(() => {
          window.location.reload(true);
        }, 1000);
      }
    });
  },
  
  // Charger les informations de configuration
  async loadConfiguration() {
    Utils.addLogEntry('info', 'Chargement de la configuration');
    
    // Vérifier le Service Worker
    const swStatus = await Utils.checkServiceWorker();
    
    // Rassembler les informations de configuration
    const config = {
      mode: process.env.NODE_ENV || 'production',
      appUrl: window.location.origin,
      apiUrl: '/api',
      demoMode: 'Activé',
      swVersion: swStatus.registered ? swStatus.version : 'Non installé',
      browserInfo: `${Utils.getBrowserInfo().name} ${Utils.getBrowserInfo().version}`,
      currentDatetime: Utils.formatDate()
    };
    
    // Mettre à jour l'affichage de la configuration
    UI.updateConfigTable(config);
    
    Utils.addLogEntry('info', 'Configuration chargée', config);
    
    return config;
  }
};

// Initialiser l'application au chargement de la page
window.addEventListener('DOMContentLoaded', () => {
  App.init();
});
