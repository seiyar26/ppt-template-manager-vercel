import axios from 'axios';
import { createAxiosInterceptors, ApiLogViewer } from './api-logger';

// Configuration de l'environnement de production
const configureEnvironment = () => {
  const hostname = window.location.hostname;
  const isVercelEnvironment = hostname.includes('vercel.app') || hostname.includes('netlify.app');
  const isLocalDevelopment = hostname === 'localhost' || hostname === '127.0.0.1';
  
  // Toujours en mode production
  console.log('🔌 Application en mode PRODUCTION - Connexion à un backend réel');
  
  return {
    hostname,
    isVercelApp: true,
    nodeEnv: process.env.NODE_ENV,
    isVercel: isVercelEnvironment || true,
    reactAppApiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000/api'
  };
};

// Configuration de l'environnement
const ENV = configureEnvironment();

// Configuration de l'URL de base de l'API - VERSION PRODUCTION
const getApiBaseUrl = () => {
  // URL API spécifiée dans les variables d'environnement avec fallback pour production
  const configuredApiUrl = process.env.REACT_APP_API_URL || '/api';
  
  console.log('🔍 Environnement détecté: ', ENV);
  
  // Sur Vercel, utiliser le chemin relatif /api
  if (ENV.isVercel) {
    console.log('🚀 Mode production Vercel détecté - Utilisation de l\'URL relative: /api');
    return '/api';
  }
  
  // Si une URL API est explicitement configurée dans les variables d'environnement, l'utiliser
  if (configuredApiUrl) {
    console.log('🚀 URL API configurée: ', configuredApiUrl);
    return configuredApiUrl;
  }
  
  // Fallback: Toujours utiliser l'URL relative API pour assurer une compatibilité maximale
  return '/api';
};

export const API_URL = getApiBaseUrl();

// Base URL pour les images - adaptation Vercel optimisée
const getImageBaseUrl = () => {
  // Force l'utilisation de l'URL du site courant
  return window.location.origin;
};

const IMAGE_BASE_URL = getImageBaseUrl();

console.log('API URL configurée:', API_URL);
console.log('URL de base des images:', IMAGE_BASE_URL);

// Création d'une instance axios avec la configuration de base pour Vercel
// Exportée pour être utilisée directement par certains composants
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false, // Désactivé pour Vercel serverless
  timeout: 30000 // Timeout de 30s pour les serverless functions
});

// Initialisation du système de journalisation des API
const apiLoggerManager = createAxiosInterceptors(apiClient);

// Configuration du logger API en fonction de l'environnement
if (process.env.NODE_ENV === 'production') {
  // En production, moins verbeux mais toujours actif pour le débogage
  apiLoggerManager.configureLogger({
    logToConsole: false,  // Désactiver les logs console en production
    logToStorage: true,   // Mais conserver l'historique dans localStorage
    maxLogEntries: 100    // Augmenter le nombre d'entrées pour production
  });
} else {
  // En développement, journalisation complète
  apiLoggerManager.configureLogger({
    logToConsole: true,   // Activer les logs console en développement
    logToStorage: true,   // Et conserver l'historique dans localStorage
    maxLogEntries: 50     // Limiter le nombre d'entrées en développement
  });
}

// Exportation de l'interface ApiLogViewer pour les composants React
export { ApiLogViewer };

// Intercepteur pour la gestion des tokens d'authentification
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token trouvé, ajout aux en-têtes:', token.substring(0, 15) + '...');
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Erreur d\'interception de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs API de manière centralisée
apiClient.interceptors.response.use(
  response => {
    console.log(`Réponse ${response.config.method} ${response.config.url.replace(API_URL, '')}: ${response.status}`);
    // Si response.data existe, le retourner, sinon retourner response directement
    return response.data !== undefined ? response.data : response;
  },
  error => {
    // Format d'erreur unifié pour l'application
    let errorResponse = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || 'Erreur inconnue',
      details: error.response?.data?.details || null
    };
    
    // Log détaillé de l'erreur avec informations contextuelles
    console.error(`Erreur de réponse API: ${errorResponse.status}`, errorResponse);
    
    // En cas d'erreur d'authentification (401), nettoyer le stockage local
    if (errorResponse.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    return Promise.reject(errorResponse);
  }
);

// Fonction utilitaire pour générer des URLs d'image correctes
export const getImageUrl = (imagePath) => {
  // Si null ou undefined, retourner une image SVG encodée en Data URI
  if (!imagePath) {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23336699'/%3E%3Ctext x='400' y='300' font-family='Arial' font-size='30' fill='white' text-anchor='middle' dominant-baseline='middle'%3EImage non disponible%3C/text%3E%3C/svg%3E`;
  }
  
  // Si l'URL est déjà absolue, la retourner telle quelle
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Si l'URL est un Data URI, la retourner telle quelle
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Pour les chemins relatifs, construire l'URL complète
  if (imagePath.startsWith('/')) {
    return `${window.location.origin}${imagePath}`;
  }
  
  // Pour les chemins de stockage Supabase (format: storage/v1/...)
  if (imagePath.includes('storage/v1/')) {
    // Si l'URL contient déjà storage/v1, on vérifie si elle est complète
    if (imagePath.startsWith('storage/v1/')) {
      return `${process.env.REACT_APP_SUPABASE_URL}/${imagePath}`;
    }
    return imagePath;
  }
  
  // Fallback pour tout autre format de chemin - construire une URL relative à l'API
  return `${API_URL}/images/${imagePath}`;
};

// Service pour l'authentification
const authService = {
  register(userData) {
    // Mode production uniquement
    return apiClient.post('/auth/register', userData).then(response => {
      return response.data;
    });
  },
  
  login(userData) {
    console.log('Tentative de connexion avec:', { email: userData.email, password: '****' });
    
    // Mode production uniquement
    return apiClient.post('/auth/login', userData).then(response => {
      // Si la réponse contient déjà token et user, c'est la bonne structure
      // sinon, essayer d'accéder à response.data si disponible
      if (response.token && response.user) {
        return response;
      }
      return response.data || response;
    });
  },
  
  logout() {
    // Mode production uniquement
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    return apiClient.post('/auth/logout').then(response => {
      return response.data;
    }).catch(err => {
      console.warn('Erreur de déconnexion API:', err);
      return { success: true, message: 'Déconnexion locale réussie' };
    });
  },
  
  getCurrentUser() {
    // Mode production uniquement
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('Aucun token trouvé dans localStorage');
      return Promise.reject(new Error('Non authentifié'));
    }
    
    console.log('Tentative de récupération de l\'utilisateur avec le endpoint correct');
    return apiClient.get('/auth/user').then(response => {
      const user = response.user || response;
      localStorage.setItem('user', JSON.stringify(user));
      return { user };
    });
  }
};

// Service pour les templates
const templateService = {
  getAllTemplates(categoryId = null) {
    // Mode production uniquement
    let url = '/templates';
    if (categoryId) {
      url += `?category=${categoryId}`;
    }
    
    return apiClient.get(url).then(response => {
      console.log('Réponse brute des templates:', response);
      
      // Adapter au format de notre API
      // Vérifier si la réponse a une structure data.status
      if (response && response.status === 'success' && Array.isArray(response.data)) {
        return { templates: response.data };
      }

      // Vérifier si la réponse est un tableau
      if (Array.isArray(response)) {
        return { templates: response };
      }
      
      // Structure de réponse avec templates directement
      if (response && Array.isArray(response.templates)) {
        return response;
      }

      // API directe pourrait retourner { data: [...] } 
      if (response && response.data && Array.isArray(response.data)) {
        return { templates: response.data };
      }
      
      // Format de compatibilité par défaut - encapsulation
      return { templates: response || [] };
    });
  },
  
  getTemplateById(id) {
    // Pour les IDs au format UUID v4 (format Supabase), utiliser l'API réelle
    return apiClient.get(`/templates/${id}`).then(response => {
      return response;
    });
  },
  
  createTemplate(templateData) {
    return apiClient.post('/templates', templateData).then(response => {
      return response;
    });
  },
  
  uploadTemplate(file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Ajouter les données supplémentaires au FormData
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });
    
    console.log('Début de l\'upload du template avec FormData');
    
    // Mode production: Utilisation de l'API Supabase via notre endpoint personnalisé
    return apiClient.post('/templates/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(response => {
      console.log('Upload réussi:', response);
      return response;
    });
  },
  
  updateTemplate(id, templateData) {
    // Mode production uniquement
    return apiClient.put(`/templates/${id}`, templateData).then(response => {
      return response;
    });
  },
  
  deleteTemplate(id) {
    // Mode production uniquement
    return apiClient.delete(`/templates/${id}`).then(response => {
      return response;
    });
  },
  
  // Génération de documents
  generateDocument(templateId, values, format = 'pptx', documentName = null) {
    // Mode production uniquement
    const params = {
      templateId,
      values,
      format,
      documentName
    };
    
    return apiClient.post('/templates/generate', params, {
      responseType: 'blob'
    }).then(response => {
      return response;
    });
  }
};

// Service pour les catégories
const categoryService = {
  getAllCategories() {
    // Mode production uniquement
    return apiClient.get('/categories').then(response => {
      return response;
    });
  },
  
  getCategories() {
    // Mode production uniquement
    return apiClient.get('/categories').then(response => {
      console.log('Réponse brute des catégories:', response);
      
      // Vérifier si la réponse est déjà un tableau (format API direct)
      if (Array.isArray(response)) {
        return response;
      }
      
      // Vérifier si la réponse a une propriété data (format classique)
      if (response && response.data) {
        return response.data;
      }
      
      // Format de compatibilité pour le code existant
      return response;
    });
  },
  
  getCategoryById(id) {
    // Mode production uniquement
    return apiClient.get(`/categories/${id}`).then(response => {
      return response;
    });
  }
};

// Création d'un objet pour l'export par défaut
const apiServices = {
  getImageUrl,
  authService,
  templateService,
  categoryService,
  API_URL,
  IMAGE_BASE_URL
};

// Service d'export - version production
const exportService = {
  getExportHistory() {
    return apiClient.get('/exports').then(response => {
      return response;
    });
  },
  
  deleteExport(id) {
    return apiClient.delete(`/exports/${id}`).then(response => {
      return response;
    });
  },
  
  downloadExport(id) {
    return apiClient.get(`/exports/${id}/download`, {
      responseType: 'blob'
    }).then(response => {
      return response;
    });
  }
};

// Service d'email - version production
const emailService = {
  sendEmail(data) {
    return apiClient.post('/email/send', data).then(response => {
      return response;
    });
  }
};

export {
  authService,
  templateService,
  categoryService,
  exportService,
  emailService,
  IMAGE_BASE_URL
};

export default apiServices;
