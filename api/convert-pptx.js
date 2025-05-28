/**
 * API Route Vercel - Conversion PPTX vers JPG avec ConvertAPI
 * 
 * Cette route permet de :
 * 1. Récupérer un fichier PPTX depuis Supabase Storage
 * 2. Le convertir en images JPG via ConvertAPI
 * 3. Télécharger et stocker les images dans Supabase Storage
 * 4. Mettre à jour les métadonnées du template
 */

const axios = require('axios');
const FormData = require('form-data');
const { supabaseAdmin } = require('./_lib/supabase-client');

// Configuration ConvertAPI
// Nettoyer la clé pour enlever tout caractère de nouvelle ligne ou espace
const CONVERT_API_SECRET = process.env.CONVERT_API_SECRET ? process.env.CONVERT_API_SECRET.trim() : null;
const FALLBACK_API_KEY = 'HdA81Ku0TldLOV0v'; // Clé de secours pour le développement uniquement
const CONVERT_API_URL = 'https://v2.convertapi.com/convert/pptx/to/jpg';

// Vérification détaillée de la configuration
console.log('====== CONFIGURATION CONVERTAPI ======');
console.log('Environnement:', process.env.NODE_ENV || 'non défini');
console.log('CONVERT_API_SECRET défini:', process.env.CONVERT_API_SECRET ? 'Oui' : 'Non');
console.log('Clé API utilisée:', CONVERT_API_SECRET || FALLBACK_API_KEY ? 'Disponible' : 'MANQUANTE');
console.log('Variables d\'environnement disponibles:', Object.keys(process.env).filter(key => !key.includes('KEY') && !key.includes('SECRET')).join(', '));
console.log('====================================');

// Fonction pour obtenir une clé API valide
const getApiKey = () => {
  if (CONVERT_API_SECRET) return CONVERT_API_SECRET;
  console.warn('Utilisation de la clé de secours - À NE PAS UTILISER EN PRODUCTION');
  return FALLBACK_API_KEY; // Utiliser la clé de secours si aucune clé n'est configurée
}

/**
 * Vérifie l'état d'un template et met à jour son statut si nécessaire
 * @param {string} templateId - ID du template à vérifier
 * @returns {Promise<Object>} - Données du template mises à jour
 */
async function checkTemplateStatus(templateId) {
  try {
    // Récupérer les données du template
    const { data: template, error } = await supabaseAdmin
      .from('ppt_templates')
      .select('*')
      .eq('id', templateId)
      .single();
    
    if (error) throw error;
    
    // Vérifier si le template est bloqué en statut pending depuis trop longtemps
    if (template.conversion_status === 'pending') {
      const createdAt = new Date(template.created_at);
      const now = new Date();
      const minutesSinceCreation = Math.floor((now - createdAt) / (1000 * 60));
      
      console.log(`Template ${templateId} en attente depuis ${minutesSinceCreation} minutes`);
      
      // Si en attente depuis plus de 5 minutes, considérer comme échoué
      if (minutesSinceCreation > 5) {
        console.log(`Template ${templateId} bloqué en statut pending depuis trop longtemps - mise à jour en failed`);
        
        const { data: updatedTemplate, error: updateError } = await supabaseAdmin
          .from('ppt_templates')
          .update({
            conversion_status: 'failed',
            conversion_error: 'Timeout de conversion dépassé',
            updated_at: new Date().toISOString()
          })
          .eq('id', templateId)
          .select()
          .single();
        
        if (updateError) throw updateError;
        return updatedTemplate;
      }
    }
    
    return template;
  } catch (error) {
    console.error(`Erreur lors de la vérification du template ${templateId}:`, error);
    return null;
  }
}

module.exports = async function handler(req, res) {
  // En-têtes CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Gérer les requêtes OPTIONS pre-flight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    console.error(`Méthode ${req.method} non autorisée`);
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Seule la méthode POST est autorisée pour cette route'
    });
  }

  // Vérifier le Content-Type
  const contentType = req.headers['content-type'];
  if (!contentType || (!contentType.includes('application/json') && !contentType.includes('multipart/form-data'))) {
    console.error(`Content-Type invalide: ${contentType}`);
    return res.status(400).json({
      error: 'Invalid Content-Type',
      message: 'Le Content-Type doit être application/json ou multipart/form-data'
    });
  }

  try {
    console.log('Début du traitement de la requête de conversion PPTX:', JSON.stringify(req.body, null, 2));
    const { templateId, fileUrl } = req.body;
    
    // Vérifier l'état actuel du template
    if (templateId) {
      const templateStatus = await checkTemplateStatus(templateId);
      if (templateStatus && templateStatus.conversion_status === 'completed') {
        console.log(`Le template ${templateId} a déjà été converti avec succès`);
        return res.status(200).json({
          success: true,
          templateId,
          message: 'Template déjà converti',
          previewImages: templateStatus.preview_images || [],
          mainPreviewUrl: templateStatus.preview_url
        });
      }
      
      if (templateStatus && templateStatus.conversion_status === 'failed') {
        console.log(`Ré-essai de conversion pour le template ${templateId} précédemment échoué`);
        // Mettre à jour le statut en pending avant de ré-essayer
        await supabaseAdmin
          .from('ppt_templates')
          .update({
            conversion_status: 'pending',
            conversion_error: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', templateId);
      }
    }

    // Validation des paramètres requis
    if (!templateId) {
      console.error('templateId manquant dans la requête');
      return res.status(400).json({
        error: 'Missing parameter',
        message: 'Le paramètre templateId est requis'
      });
    }

    if (!fileUrl) {
      console.error('fileUrl manquant dans la requête');
      return res.status(400).json({
        error: 'Missing parameter',
        message: 'Le paramètre fileUrl est requis'
      });
    }

    // Validation de l'URL du fichier
    try {
      new URL(fileUrl);
    } catch (e) {
      console.error('URL du fichier invalide:', fileUrl);
      return res.status(400).json({
        error: 'Invalid file URL',
        message: 'L\'URL du fichier PPTX est invalide'
      });
    }

    // Vérification de la configuration ConvertAPI
    if (!CONVERT_API_SECRET) {
      console.error('Clé ConvertAPI non configurée');
      return res.status(500).json({
        error: 'Configuration error',
        message: 'La clé ConvertAPI n\'est pas configurée sur le serveur'
      });
    }

    console.log(`Début conversion PPTX vers JPG pour template ${templateId}`);
    console.log(`URL du fichier: ${fileUrl}`);

    try {
      // 1. Télécharger le fichier depuis l'URL
      console.log('Téléchargement du fichier PPTX...');
      let fileResponse;
      try {
        fileResponse = await axios.get(fileUrl, {
          responseType: 'arraybuffer',
          timeout: 30000, // 30 secondes timeout
          maxContentLength: 50 * 1024 * 1024 // 50MB max
        });
      } catch (error) {
        console.error('Erreur lors du téléchargement du fichier:', error.message);
        return res.status(500).json({
          error: 'Download failed',
          message: 'Impossible de télécharger le fichier PPTX',
          details: error.message
        });
      }

      // Vérifier le type de contenu
      const contentType = fileResponse.headers['content-type'];
      if (!contentType || !contentType.includes('presentation')) {
        console.error('Type de fichier invalide:', contentType);
        return res.status(400).json({
          error: 'Invalid file type',
          message: 'Le fichier doit être un PPTX valide'
        });
      }

      // 2. Utiliser l'API convertapi pour convertir PPTX en JPG
      console.log('Préparation de la requête de conversion...');

      // Créer un nouveau FormData
      const formData = new FormData();
      formData.append('File', Buffer.from(fileResponse.data), {
        filename: `template_${templateId}.pptx`,
        contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      });
      formData.append('StoreFile', 'true');
      formData.append('ImageQuality', '90'); // Réduire légèrement la qualité pour optimiser la taille

      // Construire l'URL avec la clé API valide
      const apiKey = getApiKey();
      const apiUrl = `${CONVERT_API_URL}?Secret=${apiKey}`;
      console.log('URL de conversion prête (sans afficher la clé)');
      
      // Vérifier que la clé API est bien disponible avant de continuer
      if (!apiKey) {
        console.error('ERREUR CRITIQUE: Aucune clé API disponible pour ConvertAPI');
        return res.status(500).json({
          error: 'Configuration error',
          message: 'La clé ConvertAPI n\'est pas disponible - impossible de continuer'
        });
      }

      console.log('Envoi de la requête à ConvertAPI...');

      let convertResponse;
      try {
        convertResponse = await axios({
          method: 'post',
          url: apiUrl,
          headers: {
            ...formData.getHeaders(),
            'Accept': 'application/json'
          },
          data: formData,
          maxContentLength: 100 * 1024 * 1024, // 100MB max
          maxBodyLength: 100 * 1024 * 1024,    // 100MB max
          timeout: 120000 // 2 minutes timeout
        });
      } catch (error) {
        console.error('Erreur lors de la conversion:', error.message);
        console.error('Détails:', error.response?.data || 'Pas de détails disponibles');
        return res.status(500).json({
          error: 'Conversion failed',
          message: 'La conversion du PPTX a échoué',
          details: error.message
        });
      }

      console.log('Réponse de ConvertAPI reçue:', convertResponse.status);
      const conversionResult = convertResponse.data;

      if (!conversionResult.Files || conversionResult.Files.length === 0) {
        console.error('Aucune image générée par ConvertAPI');
        return res.status(500).json({
          error: 'Conversion failed',
          message: 'La conversion n\'a généré aucune image',
          details: conversionResult
        });
      }

      console.log(`Conversion réussie: ${conversionResult.Files.length} images générées`);

      // 3. Télécharger les images depuis ConvertAPI et les stocker dans Supabase
      console.log(`Téléchargement et stockage de ${conversionResult.Files.length} images depuis ConvertAPI...`);

      const previewImages = [];
      const templateFolder = `templates/${templateId}`;

      // Vérifier/créer le dossier du template dans Supabase Storage
      try {
        const { data, error } = await supabaseAdmin.storage
          .from('ppt-templates')
          .list(templateFolder);

        if (error) {
          console.log('Création du dossier pour le template:', templateFolder);
        }
      } catch (error) {
        console.log('Le dossier sera créé automatiquement:', error.message);
      }
      let mainPreviewUrl = '';

      // Parcourir chaque fichier généré par ConvertAPI
      for (let i = 0; i < conversionResult.Files.length; i++) {
        const file = conversionResult.Files[i];
        const pageNumber = i + 1;

        try {
          // 3.1 Télécharger l'image depuis ConvertAPI
          console.log(`Téléchargement de l'image ${pageNumber}/${conversionResult.Files.length}: ${file.FileName}`);

          const imageResponse = await axios.get(file.Url, { responseType: 'arraybuffer' });
          const imageBuffer = Buffer.from(imageResponse.data);

          // 3.2 Générer un nom de fichier unique pour Supabase
          const safeFileName = file.FileName.replace(/[^a-zA-Z0-9.-]/g, '_');
          const storagePath = `previews/${templateId}/${safeFileName}`;

          // 3.3 Uploader l'image dans Supabase Storage
          console.log(`Stockage de l'image dans Supabase: ${storagePath}`);

          const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('ppt-templates')
            .upload(storagePath, imageBuffer, {
              contentType: 'image/jpeg',
              upsert: true
            });

          if (uploadError) {
            console.error(`Erreur lors de l'upload de l'image ${pageNumber}:`, uploadError);
            throw uploadError;
          }

          // 3.4 Générer l'URL publique pour l'image
          const { data: publicUrlData } = supabaseAdmin.storage
            .from('ppt-templates')
            .getPublicUrl(storagePath);

          // S'assurer que l'URL est absolue et correctement formatée
          const publicUrl = publicUrlData.publicUrl;
          console.log('URL publique générée par Supabase:', publicUrl);

          // 3.5 Stocker les informations de l'image
          previewImages.push({
            page: pageNumber,
            url: publicUrl,
            fileName: safeFileName,
            fileSize: file.FileSize,
            fileId: file.FileId,
            storagePath: storagePath
          });

          // Conserver l'URL de la première image comme prévisualisation principale
          if (i === 0) {
            mainPreviewUrl = publicUrl;
          }

          console.log(`Image ${pageNumber} traitée avec succès`);
        } catch (imageError) {
          console.error(`Erreur lors du traitement de l'image ${pageNumber}:`, imageError);
          // Continuer avec les autres images malgré l'erreur
        }
      }

      // 4. Mettre à jour le template en base avec les images de prévisualisation
      if (previewImages.length === 0) {
        throw new Error('Aucune image n\'a pu être traitée et stockée');
      }

      console.log(`Mise à jour du template avec ${previewImages.length} images`);
      const { error: updateError } = await supabaseAdmin
        .from('ppt_templates')
        .update({
          preview_images: previewImages,
          preview_url: mainPreviewUrl,
          conversion_status: 'completed',
          conversion_cost: conversionResult.ConversionCost || 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId);

      if (updateError) {
        console.error('Erreur mise à jour template:', updateError);
        throw updateError;
      }

      console.log(`Template ${templateId} mis à jour avec ${previewImages.length} images de prévisualisation`);
      console.log(`URL de prévisualisation principale: ${mainPreviewUrl}`);

      return res.status(200).json({
        success: true,
        templateId,
        conversionCost: conversionResult.ConversionCost,
        imagesGenerated: previewImages.length,
        previewImages,
        mainPreviewUrl
      });
    } catch (conversionError) {
      console.error('Erreur détaillée de conversion:', conversionError);

      if (conversionError.response) {
        console.error('Détails de l\'erreur API:', {
          status: conversionError.response.status,
          data: conversionError.response.data
        });
      }

      // Marquer la conversion comme échouée en base
      try {
        await supabaseAdmin
          .from('ppt_templates')
          .update({
            conversion_status: 'failed',
            conversion_error: conversionError.message || 'Erreur inconnue',
            updated_at: new Date().toISOString()
          })
          .eq('id', templateId);
      } catch (dbError) {
        console.error('Erreur mise à jour statut échec:', dbError);
      }

      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la conversion PPTX',
        message: conversionError.message,
        details: conversionError.response?.data || 'Pas de détails disponibles'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la conversion PPTX:', error);

    // Marquer la conversion comme échouée en base
    if (req.body && req.body.templateId) {
      try {
        await supabaseAdmin
          .from('ppt_templates')
          .update({
            conversion_status: 'failed',
            conversion_error: error.message || 'Erreur inconnue',
            updated_at: new Date().toISOString()
          })
          .eq('id', req.body.templateId);
      } catch (dbError) {
        console.error('Erreur mise à jour statut échec:', dbError);
      }
    }

    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la conversion PPTX',
      details: error.message || 'Erreur inconnue'
    });
  }
};