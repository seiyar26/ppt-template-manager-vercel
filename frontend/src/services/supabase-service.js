import { createClient } from '@supabase/supabase-js';

// Configuration de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://mbwurtmvdgmnrizxfouf.supabase.co';
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzcwNTgwMCwiZXhwIjoyMDYzMjgxODAwfQ.Ojvhv2gXUNiv5NmdMniJyZKgY9d-MqjN3_3p9KIJFsY'; // Pas la clé anon !

// Création du client Supabase
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration pour le stockage
// Bucket name utilisé côté serveur uniquement

/**
 * Service pour gérer l'authentification via Supabase
 */
export const authService = {
  /**
   * Connexion utilisateur avec email/mot de passe
   * @param {Object} credentials - {email, password}
   * @returns {Promise<Object>} - Informations utilisateur et token
   */
  async login(credentials) {
    try {
      console.log('Tentative de connexion Supabase avec:', credentials.email);
      
      // Appel API traditionnel pour la compatibilité avec l'existant
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Échec de connexion');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  },
  
  /**
   * Récupère les informations de l'utilisateur courant
   * @returns {Promise<Object>} - Informations utilisateur
   */
  async getCurrentUser() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Non authentifié');
      }
      
      // Utiliser l'API existante pour récupérer l'utilisateur
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Session expirée');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  },
  
  /**
   * Déconnexion utilisateur
   */
  logout() {
    localStorage.removeItem('token');
  }
};

/**
 * Service pour gérer les templates via Supabase
 */
export const templateService = {
  /**
   * Récupère tous les templates
   * @returns {Promise<Array>} - Liste des templates
   */
  async getTemplates() {
    try {
      const { data, error } = await supabase
        .from('ppt_templates')
        .select('*, ppt_categories(*)');
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des templates:', error);
      throw error;
    }
  },
  
  /**
   * Upload un template sur Supabase
   * @param {File} file - Fichier à uploader
   * @param {string} fileName - Nom du fichier
   * @returns {Promise<Object>} - URL du fichier uploadé et métadonnées
   */
  async uploadTemplate(file, fileName) {
    try {
      console.log('Tentative d\'upload via Supabase...');
      
      // 1. Upload du fichier dans le storage
      const { data, error } = await supabase.storage
        .from('ppt-templates') // Nom exact du bucket existant
        .upload(`public/${fileName}`, file);

      if (error) throw new Error(error.message);
      
      const fileUrl = `${supabaseUrl}/storage/v1/object/public/ppt-templates/${data.path}`;
      
      // 2. Sauvegarder les métadonnées du template en base de données
      console.log('Sauvegarde des métadonnées du template en base...');
      
      const templateData = {
        name: file.name.replace(/\.[^/.]+$/, ""), // Nom sans extension
        description: `Template uploadé le ${new Date().toLocaleString()}`,
        file_url: fileUrl,
        file_path: data.path, // Ajout du chemin du fichier pour résoudre l'erreur de contrainte not-null
        file_name: fileName,
        original_name: file.name,
        file_size: file.size,
        file_type: file.type,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Insérer en base de données
      const { data: templateRecord, error: dbError } = await supabase
        .from('ppt_templates')
        .insert(templateData)
        .select()
        .single();
      
      if (dbError) {
        console.error('Erreur lors de la sauvegarde en base:', dbError);
        throw new Error(`Erreur base de données: ${dbError.message}`);
      }
      
      console.log('Template sauvegardé avec succès:', templateRecord);
      
      // 3. Déclencher la conversion PPTX vers JPG
      console.log('Déclenchement de la conversion PPTX vers JPG...');
      try {
        const conversionResponse = await fetch('/api/convert-pptx', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            templateId: templateRecord.id,
            fileUrl: fileUrl
          })
        });
        
        if (conversionResponse.ok) {
          const conversionResult = await conversionResponse.json();
          console.log('Conversion réussie:', conversionResult);
          
          // Mettre à jour les données locales avec les informations de conversion
          templateRecord.preview_url = conversionResult.mainPreviewUrl;
          templateRecord.preview_images = conversionResult.previewImages;
          templateRecord.conversion_status = 'completed';
        } else {
          console.warn('Conversion échouée, mais template sauvegardé');
        }
      } catch (conversionError) {
        console.warn('Erreur de conversion (non bloquante):', conversionError);
        // La conversion a échoué mais le template est sauvegardé
      }
      
      return {
        url: fileUrl,
        template: templateRecord,
        success: true,
        message: 'Template uploadé et sauvegardé avec succès'
      };
      
    } catch (error) {
      console.error('Erreur Supabase:', error);
      
      // Si Supabase échoue, on utilise l'API standard
      try {
        console.log('Échec de l\'upload via Supabase, tentative avec l\'API standard:', error);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', fileName);
        
        const response = await fetch('/api/templates/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Échec de l\'upload');
        }
        
        return await response.json();
      } catch (apiError) {
        console.error('Erreur lors de l\'upload via API:', apiError);
        throw new Error('Échec de l\'upload via Supabase');
      }
    }
  },
  
  /**
   * Récupère un template par son ID
   * @param {string} id - ID du template
   * @returns {Promise<Object>} - Informations sur le template
   */
  async getTemplateById(id) {
    try {
      const { data, error } = await supabase
        .from('ppt_templates')
        .select('*, ppt_categories(*), ppt_folders(*)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du template ${id}:`, error);
      throw error;
    }
  }
};

/**
 * Service pour gérer les catégories via Supabase
 */
export const categoryService = {
  /**
   * Récupère toutes les catégories
   * @returns {Promise<Array>} - Liste des catégories
   */
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('ppt_categories')
        .select('*');
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      throw error;
    }
  }
};

/**
 * Service pour gérer les dossiers via Supabase
 */
export const folderService = {
  /**
   * Récupère tous les dossiers
   * @returns {Promise<Array>} - Liste des dossiers
   */
  async getFolders() {
    try {
      const { data, error } = await supabase
        .from('ppt_folders')
        .select('*, ppt_categories(*)');
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des dossiers:', error);
      throw error;
    }
  }
};

// Création d'un objet pour l'export par défaut
const supabaseServices = {
  supabase,
  authService,
  templateService,
  categoryService,
  folderService
};

export default supabaseServices;
