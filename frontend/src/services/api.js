import axios from 'axios';

// Configuration de l'URL de base de l'API pour Vercel
// Détection automatique de l'environnement
const getApiUrl = () => {
  // Force la détection de production Vercel
  const isVercelProduction = window.location.hostname.includes('vercel.app') || 
                           process.env.NODE_ENV === 'production' ||
                           process.env.VERCEL === '1';
  
  // En production sur Vercel
  if (isVercelProduction) {
    console.log('🚀 Mode production Vercel détecté - Utilisation des API routes /api');
    return '/api'; // Utilise les API routes Vercel
  }
  
  // En développement local
  if (process.env.REACT_APP_API_URL) {
    console.log('🔧 Mode développement - Utilisation de REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // Fallback pour développement local - utilise l'URL relative pour éviter les problèmes de port
  console.log('🔧 Mode développement fallback - utilisation de l\'URL relative /api');
  return '/api';
};

export const API_URL = getApiUrl();

// Base URL pour les images - adaptation Vercel optimisée
const getImageBaseUrl = () => {
  // En production sur Vercel, on utilise l'origine de la page
  if (process.env.NODE_ENV === 'production' || window.location.hostname.includes('vercel.app')) {
    return process.env.REACT_APP_IMAGE_BASE_URL || window.location.origin;
  }
  
  // En développement, on utilise l'URL relative pour éviter les problèmes de port
  return process.env.REACT_APP_IMAGE_BASE_URL || '';
};

const IMAGE_BASE_URL = getImageBaseUrl();

console.log('API URL configurée:', API_URL);
console.log('URL de base des images:', IMAGE_BASE_URL);

// Création d'une instance axios avec la configuration de base pour Vercel
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false, // Désactivé pour Vercel serverless
  timeout: 30000 // Timeout de 30s pour les serverless functions
});

// Forcer à nouveau l'URL de base à chaque requête
apiClient.interceptors.request.use(
  config => {
    // Cette ligne force l'URL de base à chaque requête, ignorant tout cache
    config.baseURL = API_URL;
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Intercepteur pour ajouter le token d'authentification à toutes les requêtes
apiClient.interceptors.request.use(
  config => {
    // S'assurer que config.headers existe toujours
    config.headers = config.headers || {};
    
    // Gestion spéciale pour les FormData - ne pas définir Content-Type
    if (config.data instanceof FormData) {
      console.log('FormData détecté - suppression du Content-Type pour permettre la définition correcte de la boundary');
      
      // Supprimer Content-Type pour permettre à axios de définir la boundary correctement
      delete config.headers['Content-Type'];
      
      // S'assurer que headers.common existe avant d'essayer d'accéder à ses propriétés
      if (config.headers.common) {
        delete config.headers.common['Content-Type'];
      }
    }
    
    // Débug des uploads de fichiers
    if (config.data instanceof FormData) {
      console.log('Requête FormData détectée:', config.url);
      console.log('Contenu FormData:');
      let fileFound = false;
      let fileSize = 0;
      let fileName = '';
      
      for (let pair of config.data.entries()) {
        if (pair[0] === 'file') {
          fileFound = true;
          fileName = pair[1] ? pair[1].name : 'undefined';
          fileSize = pair[1] ? pair[1].size : 0;
          console.log(pair[0] + ':', fileName, fileSize ? 'taille: ' + fileSize + ' octets' : '');
        } else {
          console.log(pair[0] + ':', pair[1]);
        }
      }
      
      // Vérification supplémentaire pour s'assurer que le fichier est bien présent
      if (!fileFound || !fileSize) {
        console.error('ATTENTION: Fichier manquant ou de taille nulle dans FormData !');
      } else {
        console.log(`Fichier "${fileName}" de ${fileSize} octets prêt à être envoyé`); 
      }
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token trouvé, ajout aux en-têtes:', token.substring(0, 15) + '...');
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.log('Aucun token trouvé dans localStorage');
    }
    return config;
  },
  error => {
    console.error('Erreur dans l\'intercepteur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et les erreurs
apiClient.interceptors.response.use(
  response => {
    console.log(`Réponse ${response.config.method} ${response.config.url}:`, response.status);
    return response;
  },
  error => {
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'état en dehors de la plage 2xx
      console.error('Erreur de réponse API:', error.response.status, error.response.data);
      
      // Si le token a expiré (401 Unauthorized), on déconnecte l'utilisateur
      if (error.response.status === 401) {
        console.log('Token expiré ou invalide, déconnexion...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirection vers la page de connexion si ce n'est pas déjà le cas
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('Erreur réseau, pas de réponse du serveur:', error.request);
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error('Erreur lors de la configuration de la requête:', error.message);
    }
    return Promise.reject(error);
  }
);

// Service pour l'authentification
const authService = {
  register(userData) {
    return apiClient.post('/auth/register', userData).then(response => {
      return response.data;
    }).catch(error => {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    });
  },
  
  login(userData) {
    console.log('Tentative de connexion avec:', { email: userData.email, password: '****' });
    
    // Afficher des informations de diagnostic sur l'URL utilisée
    console.log('URL API utilisée pour la connexion:', `${API_URL}/auth/login`);
    console.log('Environnement détecté:', process.env.NODE_ENV || 'non défini');
    console.log('Hostname:', window.location.hostname);
    
    // Vérifier si les ports 5000 ou 12000 sont utilisés
    const currentUrl = new URL(window.location.href);
    if (currentUrl.port === '5000' || currentUrl.port === '12000') {
      console.warn('ATTENTION: Utilisation du port', currentUrl.port, 'qui peut causer des conflits');
    }
    
    return apiClient.post('/auth/login', userData)
      .then(response => {
        console.log('Réponse du serveur lors du login:', response);
        // Stocker l'utilisateur et le token dans le localStorage pour la persistance
        if (response.data && response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        if (response.data && response.data.token) {
          localStorage.setItem('token', response.data.token);
          console.log('Token stocké dans localStorage:', response.data.token.substring(0, 15) + '...');
        } else {
          console.error('Aucun token reçu du serveur');
        }
        return response.data;
      })
      .catch(error => {
        console.error('Erreur détaillée lors de la connexion:', error.response?.data || error.message);
        
        // Détection et gestion spécifique des erreurs réseau
        if (error.message === 'Network Error') {
          console.error('Erreur réseau détectée');
          console.error('URL API utilisée:', `${API_URL}/auth/login`);
          console.error('Vérifiez que vous n\'utilisez pas les ports 5000 ou 12000 qui peuvent être bloqués');
          
          // Créer une erreur plus descriptive pour l'utilisateur
          const enhancedError = new Error(
            'Impossible de se connecter au serveur. Votre connexion est peut-être instable ou un pare-feu bloque les requêtes.'
          );
          enhancedError.originalError = error;
          throw enhancedError;
        }
        
        // Gestion des erreurs 401 (non autorisé)
        if (error.response && error.response.status === 401) {
          console.error('Identifiants incorrects');
          const authError = new Error('Email ou mot de passe incorrect');
          authError.originalError = error;
          throw authError;
        }
        
        throw error;
      });
  },
  
  logout() {
    // Supprimer l'utilisateur du localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return Promise.resolve();
  },
  
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    console.log('User récupéré depuis localStorage:', user);
    return Promise.resolve({ user });
  }
};

// Service pour les requêtes de modèles (templates)
const templateService = {
  getAllTemplates(categoryId = null) {
    const params = {};
    if (categoryId) {
      params.categoryId = categoryId;
    }
    
    return apiClient.get('/templates', { params }).then(response => {
      // Adaptation du format de réponse pour correspondre à ce qu'attend le composant
      return {
        templates: response.data?.templates || []
      };
    }).catch(error => {
      console.error('Erreur lors de la récupération des modèles:', error);
      throw error;
    });
  },
  
  getTemplateById(id) {
    return apiClient.get(`/templates/${id}`).then(response => {
      return response.data;
    }).catch(error => {
      console.error(`Erreur lors de la récupération du modèle ${id}:`, error);
      throw error;
    });
  },
  
  createTemplate(templateData) {
    // Pour les uploads de fichiers, on doit utiliser multipart/form-data et non application/json
    return apiClient.post('/templates', templateData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(response => {
      return response.data;
    }).catch(error => {
      console.error('Erreur lors de la création du modèle:', error);
      throw error;
    });
  },
  
  updateTemplate(id, templateData) {
    return apiClient.put(`/templates/${id}`, templateData).then(response => {
      return response.data;
    }).catch(error => {
      console.error(`Erreur lors de la mise à jour du modèle ${id}:`, error);
      throw error;
    });
  },
  
  deleteTemplate(id) {
    return apiClient.delete(`/templates/${id}`).then(response => {
      return response.data;
    }).catch(error => {
      console.error(`Erreur lors de la suppression du modèle ${id}:`, error);
      throw error;
    });
  },
  
  updateTemplateCategory(templateId, categoryId) {
    return apiClient.post(`/templates/${templateId}/categories`, { categoryId }).then(response => {
      return response.data;
    }).catch(error => {
      console.error(`Erreur lors de l'assignation de la catégorie ${categoryId} au modèle ${templateId}:`, error);
      throw error;
    });
  },
  
  removeTemplateFromCategory(templateId, categoryId) {
    return apiClient.delete(`/templates/${templateId}/categories/${categoryId}`).then(response => {
      return response.data;
    }).catch(error => {
      console.error(`Erreur lors de la suppression du modèle ${templateId} de la catégorie ${categoryId}:`, error);
      throw error;
    });
  },
  
  // Gestion des champs (fields)
  addField(templateId, fieldData) {
    return apiClient.post(`/templates/${templateId}/fields`, fieldData).then(response => {
      return response.data;
    }).catch(error => {
      console.error(`Erreur lors de l'ajout du champ au modèle ${templateId}:`, error);
      throw error;
    });
  },
  
  updateField(templateId, fieldId, fieldData) {
    return apiClient.put(`/templates/${templateId}/fields/${fieldId}`, fieldData).then(response => {
      return response.data;
    }).catch(error => {
      console.error(`Erreur lors de la mise à jour du champ ${fieldId}:`, error);
      throw error;
    });
  },
  
  deleteField(templateId, fieldId) {
    return apiClient.delete(`/templates/${templateId}/fields/${fieldId}`).then(response => {
      return response.data;
    }).catch(error => {
      console.error(`Erreur lors de la suppression du champ ${fieldId}:`, error);
      throw error;
    });
  },
  
  // Génération de documents
  generateDocument(templateId, values, format = 'pptx', documentName = null) {
    const data = { values, format };
    if (documentName) {
      data.documentName = documentName;
    }
    
    return apiClient.post(`/templates/${templateId}/generate`, data, {
      responseType: 'blob'
    }).then(response => {
      return response;
    }).catch(error => {
      console.error(`Erreur lors de la génération du document pour le modèle ${templateId}:`, error);
      throw error;
    });
  }
};

// Service pour les catégories
const categoryService = {
  getAllCategories() {
    return apiClient.get('/categories').then(response => {
      return response.data;
    }).catch(error => {
      console.error('Erreur lors de la récupération des catégories:', error);
      throw error;
    });
  },
  
  getCategories() {
    return apiClient.get('/categories').then(response => {
      // Adaptation du format de réponse pour correspondre à ce qu'attend le composant Categories
      return {
        data: {
          categories: response.data?.categories || []
        }
      };
    }).catch(error => {
      console.error('Erreur lors de la récupération des catégories:', error);
      throw error;
    });
  },
  
  getCategoryById(id) {
    return apiClient.get(`/categories/${id}`).then(response => {
      return response.data;
    }).catch(error => {
      console.error(`Erreur lors de la récupération de la catégorie ${id}:`, error);
      throw error;
    });
  },
  
  createCategory(categoryData) {
    return apiClient.post('/categories', categoryData).then(response => {
      return response.data;
    }).catch(error => {
      console.error('Erreur lors de la création de la catégorie:', error);
      throw error;
    });
  },
  
  updateCategory(id, categoryData) {
    return apiClient.put(`/categories/${id}`, categoryData).then(response => {
      return response.data;
    }).catch(error => {
      console.error(`Erreur lors de la mise à jour de la catégorie ${id}:`, error);
      throw error;
    });
  },
  
  deleteCategory(id) {
    return apiClient.delete(`/categories/${id}`).then(response => {
      return response.data;
    }).catch(error => {
      console.error(`Erreur lors de la suppression de la catégorie ${id}:`, error);
      throw error;
    });
  },
  
  addTemplateToCategory(categoryId, templateId) {
    return apiClient.post(`/categories/${categoryId}/templates/${templateId}`).then(response => {
      return response.data;
    }).catch(error => {
      console.error(`Erreur lors de l'ajout du modèle ${templateId} à la catégorie ${categoryId}:`, error);
      throw error;
    });
  },
  
  removeTemplateFromCategory(categoryId, templateId) {
    return apiClient.delete(`/categories/${categoryId}/templates/${templateId}`).then(response => {
      return response.data;
    }).catch(error => {
      console.error(`Erreur lors du retrait du modèle ${templateId} de la catégorie ${categoryId}:`, error);
      throw error;
    });
  },
  
  reorderCategories(orderData) {
    return apiClient.put('/categories/reorder', orderData).then(response => {
      return response.data;
    }).catch(error => {
      console.error('Erreur lors de la réorganisation des catégories:', error);
      throw error;
    });
  }
};

// Service pour les exports
const exportService = {
  getAllExports(filters = {}) {
    return apiClient.get('/exports', { params: filters }).then(response => {
      // Adaptation du format de réponse pour correspondre à ce qu'attend le composant ExportHistory
      return {
        exports: response.data?.exports || [],
        total: response.data?.total || 0
      };
    }).catch(error => {
      console.error('Erreur lors de la récupération des exports:', error);
      throw error;
    });
  },
  
  getExportById(id) {
    return apiClient.get(`/exports/${id}`).then(response => {
      return response.data;
    }).catch(error => {
      console.error(`Erreur lors de la récupération de l'export ${id}:`, error);
      throw error;
    });
  },
  
  downloadExport(id) {
    return apiClient.get(`/exports/${id}/download`, {
      responseType: 'blob'
    }).then(response => {
      return response;
    }).catch(error => {
      console.error(`Erreur lors du téléchargement de l'export ${id}:`, error);
      throw error;
    });
  },
  
  deleteExport(id) {
    return apiClient.delete(`/exports/${id}`).then(response => {
      return response.data;
    }).catch(error => {
      console.error(`Erreur lors de la suppression de l'export ${id}:`, error);
      throw error;
    });
  },
  
  sendExportByEmail(id, emailData) {
    return apiClient.post(`/exports/${id}/send-email`, emailData).then(response => {
      return response.data;
    }).catch(error => {
      console.error(`Erreur lors de l'envoi par email de l'export ${id}:`, error);
      throw error;
    });
  }
};

// Service pour les emails
const emailService = {
  getEmailTemplates() {
    return apiClient.get('/email/templates').then(response => {
      return response.data;
    }).catch(error => {
      console.error('Erreur lors de la récupération des templates d\'email:', error);
      throw error;
    });
  },
  
  sendEmail(exportId, emailData) {
    // Utiliser FormData pour permettre l'envoi de fichiers
    const formData = new FormData();
    
    // Ajouter les champs de base
    formData.append('to', emailData.to);
    formData.append('subject', emailData.subject);
    formData.append('message', emailData.message);
    
    // Ajouter les champs CC s'ils existent
    if (emailData.cc) {
      formData.append('cc', emailData.cc);
    }
    
    // Ajouter les informations de template si utilisées
    if (emailData.useTemplate) {
      formData.append('useTemplate', 'true');
      formData.append('templateId', emailData.templateId);
      formData.append('templatePath', emailData.templatePath);
    }
    
    // Ajouter les pièces jointes s'il y en a
    if (emailData.attachments && emailData.attachments.length > 0) {
      emailData.attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }
    
    return apiClient.post(`/email/exports/${exportId}/send`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(response => {
      return response.data;
    }).catch(error => {
      console.error(`Erreur lors de l'envoi de l'email pour l'export ${exportId}:`, error);
      throw error;
    });
  }
};

// Fonction utilitaire pour construire des URLs d'images
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Déboguer le format du chemin d'image
  console.log('Construction URL d\'image à partir de:', imagePath);
  
  // Si l'URL est déjà absolue (commence par http:// ou https://), la retourner telle quelle
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('URL déjà absolue, retour sans modification');
    return imagePath;
  }
  
  // Si le chemin est un chemin absolu complet (à partir de /Users/...)
  if (imagePath.includes('/Users/')) {
    // Extraire seulement la partie après /uploads/
    const uploadsIndex = imagePath.indexOf('/uploads/');
    if (uploadsIndex !== -1) {
      const relativePath = imagePath.substring(uploadsIndex);
      console.log('Chemin relatif extrait:', relativePath);
      return `${IMAGE_BASE_URL}${relativePath}`;
    }
  }
  
  // Si le chemin contient déjà /api/ au début, ne pas ajouter le préfixe
  if (imagePath.startsWith('/api/')) {
    return `${IMAGE_BASE_URL.split('/api')[0]}${imagePath}`;
  }
  
  // Vérifier si le chemin commence par / pour éviter les doubles slashes
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  const finalUrl = `${IMAGE_BASE_URL}${path}`;
  console.log('URL d\'image finalisée:', finalUrl);
  return finalUrl;
};

export {
  apiClient,
  authService,
  templateService,
  categoryService,
  exportService,
  emailService,
  getImageUrl,
  IMAGE_BASE_URL
};