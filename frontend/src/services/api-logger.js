/**
 * API Logger - Service de journalisation des requêtes API
 * Ce module intercepte et enregistre toutes les requêtes et réponses API
 * pour faciliter le diagnostic des problèmes en production.
 */

// Configuration du logger
const API_LOGGER_CONFIG = {
  enabled: true, // Activer/désactiver la journalisation
  logLevel: 'info', // 'debug', 'info', 'warn', 'error'
  logToConsole: true, // Journal dans la console du navigateur
  logToStorage: true, // Enregistrer dans le localStorage
  maxLogEntries: 50, // Nombre maximum d'entrées à conserver
  storageName: 'api_logs', // Nom de la clé localStorage
  includeHeaders: true, // Inclure les en-têtes dans les logs
  includeBody: true, // Inclure les corps des requêtes/réponses
  filterSensitiveInfo: true, // Filtrer les informations sensibles (tokens, etc.)
  sensitiveKeys: ['token', 'password', 'authorization', 'auth'] // Clés à filtrer
};

// Classes pour représenter les logs
class ApiLogEntry {
  constructor(type, url, method, timestamp) {
    this.id = generateId();
    this.type = type; // 'request' ou 'response'
    this.url = url;
    this.method = method;
    this.timestamp = timestamp || new Date().toISOString();
    this.duration = null; // Pour les requêtes terminées
  }
}

class RequestLog extends ApiLogEntry {
  constructor(url, method, headers, body) {
    super('request', url, method);
    this.headers = filterSensitiveInfo(headers);
    this.body = API_LOGGER_CONFIG.includeBody ? filterSensitiveInfo(body) : '[BODY OMITTED]';
  }
}

class ResponseLog extends ApiLogEntry {
  constructor(url, method, status, headers, body, duration) {
    super('response', url, method);
    this.status = status;
    this.headers = filterSensitiveInfo(headers);
    this.body = API_LOGGER_CONFIG.includeBody ? filterSensitiveInfo(body) : '[BODY OMITTED]';
    this.duration = duration;
    this.success = status >= 200 && status < 300;
  }
}

class ErrorLog extends ApiLogEntry {
  constructor(url, method, error, requestData) {
    super('error', url, method);
    this.errorMessage = error.message;
    this.errorName = error.name;
    this.errorStack = error.stack;
    this.requestData = requestData;
  }
}

// Stockage des logs
const apiLogs = {
  logs: [],
  requestTimers: {},

  // Ajouter un log
  addLog(log) {
    if (!API_LOGGER_CONFIG.enabled) return;

    this.logs.unshift(log);
    
    // Limiter le nombre d'entrées
    if (this.logs.length > API_LOGGER_CONFIG.maxLogEntries) {
      this.logs = this.logs.slice(0, API_LOGGER_CONFIG.maxLogEntries);
    }

    // Journaliser dans la console
    if (API_LOGGER_CONFIG.logToConsole) {
      this.logToConsole(log);
    }

    // Sauvegarder dans le localStorage
    if (API_LOGGER_CONFIG.logToStorage) {
      this.saveToStorage();
    }
  },

  // Journaliser dans la console
  logToConsole(log) {
    const styles = {
      request: 'color: #61affe; font-weight: bold;',
      response: 'color: #4caf50; font-weight: bold;',
      error: 'color: #f44336; font-weight: bold;'
    };

    console.group(`%c${log.type.toUpperCase()} - ${log.method} ${log.url}`, styles[log.type]);
    
    if (log.type === 'request') {
      console.log('Headers:', log.headers);
      console.log('Body:', log.body);
    } else if (log.type === 'response') {
      console.log(`Status: ${log.status} (${log.success ? 'Success' : 'Failed'})`);
      console.log(`Duration: ${log.duration}ms`);
      console.log('Headers:', log.headers);
      console.log('Body:', log.body);
    } else if (log.type === 'error') {
      console.error('Error:', log.errorMessage);
      console.error('Stack:', log.errorStack);
      console.log('Request Data:', log.requestData);
    }
    
    console.groupEnd();
  },

  // Sauvegarder dans le localStorage
  saveToStorage() {
    try {
      localStorage.setItem(API_LOGGER_CONFIG.storageName, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des logs API:', error);
    }
  },

  // Charger les logs depuis le localStorage
  loadFromStorage() {
    try {
      const storedLogs = localStorage.getItem(API_LOGGER_CONFIG.storageName);
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des logs API:', error);
    }
  },

  // Démarrer un timer pour une requête
  startTimer(id, url, method) {
    this.requestTimers[id] = {
      startTime: performance.now(),
      url,
      method
    };
  },

  // Arrêter un timer pour une requête
  stopTimer(id) {
    const timer = this.requestTimers[id];
    if (timer) {
      const duration = Math.round(performance.now() - timer.startTime);
      delete this.requestTimers[id];
      return {
        duration,
        url: timer.url,
        method: timer.method
      };
    }
    return null;
  },

  // Obtenir tous les logs
  getLogs() {
    return this.logs;
  },

  // Effacer tous les logs
  clearLogs() {
    this.logs = [];
    if (API_LOGGER_CONFIG.logToStorage) {
      localStorage.removeItem(API_LOGGER_CONFIG.storageName);
    }
  },

  // Télécharger les logs en JSON
  downloadLogs() {
    const dataStr = JSON.stringify(this.logs, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportName = `api_logs_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
  }
};

// Fonctions utilitaires
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function filterSensitiveInfo(data) {
  if (!API_LOGGER_CONFIG.filterSensitiveInfo || !data) {
    return data;
  }

  if (typeof data === 'string') {
    try {
      // Tenter de parser la chaîne JSON
      const parsed = JSON.parse(data);
      return JSON.stringify(filterSensitiveInfo(parsed));
    } catch {
      // Ce n'est pas du JSON, retourner la chaîne
      return data;
    }
  }

  if (typeof data !== 'object') {
    return data;
  }

  const filtered = Array.isArray(data) ? [...data] : {...data};

  for (const key in filtered) {
    if (API_LOGGER_CONFIG.sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      filtered[key] = '[REDACTED]';
    } else if (typeof filtered[key] === 'object' && filtered[key] !== null) {
      filtered[key] = filterSensitiveInfo(filtered[key]);
    }
  }

  return filtered;
}

// Initialisation
apiLogs.loadFromStorage();

// API pour configurer le logger
const configureApiLogger = (config) => {
  Object.assign(API_LOGGER_CONFIG, config);
};

// Exportation des fonctions et classes
export {
  apiLogs,
  configureApiLogger,
  RequestLog,
  ResponseLog,
  ErrorLog
};

// Fonction pour créer un intercepteur pour axios
export const createAxiosInterceptors = (axios) => {
  // Garder les références aux intercepteurs pour pouvoir les enlever plus tard
  const interceptors = {
    request: null,
    response: null
  };

  // Fonction d'initialisation des intercepteurs
  const initInterceptors = () => {
    // Intercepteur de requête
    interceptors.request = axios.interceptors.request.use(
      (config) => {
        const requestId = generateId();
        const requestLog = new RequestLog(
          config.url,
          config.method.toUpperCase(),
          config.headers,
          config.data
        );
        
        // Ajouter le requestId au config pour associer la réponse
        config.requestId = requestId;
        
        // Démarrer le timer
        apiLogs.startTimer(requestId, config.url, config.method.toUpperCase());
        
        // Enregistrer la requête
        apiLogs.addLog(requestLog);
        
        return config;
      },
      (error) => {
        const errorLog = new ErrorLog(
          error.config?.url || 'unknown',
          error.config?.method?.toUpperCase() || 'unknown',
          error,
          {
            headers: error.config?.headers,
            data: error.config?.data
          }
        );
        
        apiLogs.addLog(errorLog);
        
        return Promise.reject(error);
      }
    );

    // Intercepteur de réponse
    interceptors.response = axios.interceptors.response.use(
      (response) => {
        const requestId = response.config.requestId;
        const timerData = apiLogs.stopTimer(requestId);
        
        if (timerData) {
          const responseLog = new ResponseLog(
            timerData.url,
            timerData.method,
            response.status,
            response.headers,
            response.data,
            timerData.duration
          );
          
          apiLogs.addLog(responseLog);
        }
        
        return response;
      },
      (error) => {
        const requestId = error.config?.requestId;
        const timerData = requestId ? apiLogs.stopTimer(requestId) : null;
        
        const errorLog = new ErrorLog(
          error.config?.url || 'unknown',
          error.config?.method?.toUpperCase() || 'unknown',
          error,
          {
            headers: error.config?.headers,
            data: error.config?.data,
            status: error.response?.status,
            responseData: error.response?.data
          }
        );
        
        if (timerData) {
          errorLog.duration = timerData.duration;
        }
        
        apiLogs.addLog(errorLog);
        
        return Promise.reject(error);
      }
    );
  };

  // Initialiser les intercepteurs immédiatement
  initInterceptors();

  return {
    // Configurer le logger
    configureLogger: (config) => {
      configureApiLogger(config);
    },
    
    // Réinitialiser les intercepteurs
    resetInterceptors: () => {
      // Utiliser la méthode locale removeInterceptors
      if (interceptors.request !== null) {
        axios.interceptors.request.eject(interceptors.request);
        interceptors.request = null;
      }
      if (interceptors.response !== null) {
        axios.interceptors.response.eject(interceptors.response);
        interceptors.response = null;
      }
      
      // Puis réinitialiser
      initInterceptors();
    },
    
    // Supprimer les intercepteurs
    removeInterceptors: () => {
      if (interceptors.request !== null) {
        axios.interceptors.request.eject(interceptors.request);
        interceptors.request = null;
      }
      if (interceptors.response !== null) {
        axios.interceptors.response.eject(interceptors.response);
        interceptors.response = null;
      }
    },
    
    // Accès direct au service de logs
    getLogs: () => apiLogs.getLogs(),
    clearLogs: () => apiLogs.clearLogs(),
    downloadLogs: () => apiLogs.downloadLogs()
  };
};

// Exporter un composant de débogage pour afficher les logs dans l'interface
export const ApiLogViewer = {
  open: () => {
    if (typeof window === 'undefined') return;
    
    // Créer un élément de dialogue modal
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.right = '0';
    modal.style.bottom = '0';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modal.style.zIndex = '10000';
    modal.style.overflow = 'auto';
    modal.style.padding = '20px';
    modal.style.fontFamily = 'monospace';
    modal.style.color = 'white';
    
    // Titre et boutons
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '20px';
    
    const title = document.createElement('h2');
    title.textContent = 'API Logs';
    title.style.margin = '0';
    
    const buttonsContainer = document.createElement('div');
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Fermer';
    closeButton.style.marginLeft = '10px';
    closeButton.onclick = () => document.body.removeChild(modal);
    
    const downloadButton = document.createElement('button');
    downloadButton.textContent = 'Télécharger';
    downloadButton.onclick = () => apiLogs.downloadLogs();
    
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Effacer';
    clearButton.style.marginLeft = '10px';
    clearButton.onclick = () => {
      apiLogs.clearLogs();
      logContainer.innerHTML = '<p>Logs effacés</p>';
    };
    
    buttonsContainer.appendChild(downloadButton);
    buttonsContainer.appendChild(clearButton);
    buttonsContainer.appendChild(closeButton);
    
    header.appendChild(title);
    header.appendChild(buttonsContainer);
    
    // Conteneur des logs
    const logContainer = document.createElement('div');
    logContainer.style.backgroundColor = '#1e1e1e';
    logContainer.style.padding = '10px';
    logContainer.style.borderRadius = '5px';
    logContainer.style.maxHeight = '80vh';
    logContainer.style.overflow = 'auto';
    
    // Afficher les logs
    const logs = apiLogs.getLogs();
    if (logs.length === 0) {
      logContainer.innerHTML = '<p>Aucun log disponible</p>';
    } else {
      logs.forEach(log => {
        const logEntry = document.createElement('div');
        logEntry.style.marginBottom = '10px';
        logEntry.style.padding = '10px';
        logEntry.style.borderRadius = '5px';
        
        if (log.type === 'request') {
          logEntry.style.backgroundColor = '#2d3748';
          logEntry.innerHTML = `
            <div style="color: #61affe; font-weight: bold;">${log.method} ${log.url}</div>
            <div style="color: #d4d4d4;">${log.timestamp}</div>
            <pre style="margin-top: 5px; white-space: pre-wrap;">${JSON.stringify(log.headers, null, 2)}</pre>
            <pre style="margin-top: 5px; white-space: pre-wrap;">${JSON.stringify(log.body, null, 2)}</pre>
          `;
        } else if (log.type === 'response') {
          logEntry.style.backgroundColor = log.success ? '#2c3e2e' : '#3e2c2c';
          logEntry.innerHTML = `
            <div style="color: ${log.success ? '#4caf50' : '#f44336'}; font-weight: bold;">
              ${log.method} ${log.url} - ${log.status}
            </div>
            <div style="color: #d4d4d4;">${log.timestamp} (${log.duration}ms)</div>
            <pre style="margin-top: 5px; white-space: pre-wrap;">${JSON.stringify(log.headers, null, 2)}</pre>
            <pre style="margin-top: 5px; white-space: pre-wrap;">${JSON.stringify(log.body, null, 2)}</pre>
          `;
        } else if (log.type === 'error') {
          logEntry.style.backgroundColor = '#3e2c2c';
          logEntry.innerHTML = `
            <div style="color: #f44336; font-weight: bold;">${log.method} ${log.url} - ERROR</div>
            <div style="color: #d4d4d4;">${log.timestamp}</div>
            <div style="color: #f44336; margin-top: 5px;">${log.errorName}: ${log.errorMessage}</div>
            <pre style="margin-top: 5px; white-space: pre-wrap; color: #d4d4d4;">${log.errorStack}</pre>
            <pre style="margin-top: 5px; white-space: pre-wrap;">${JSON.stringify(log.requestData, null, 2)}</pre>
          `;
        }
        
        logContainer.appendChild(logEntry);
      });
    }
    
    // Assembler le modal
    modal.appendChild(header);
    modal.appendChild(logContainer);
    
    // Ajouter au body
    document.body.appendChild(modal);
  }
};
