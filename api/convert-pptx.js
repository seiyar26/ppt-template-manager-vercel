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
const CONVERT_API_URL = 'https://v2.convertapi.com/convert/pptx/to/jpg';
console.log('Clé ConvertAPI configurée:', CONVERT_API_SECRET ? 'Oui (masquée)' : 'Non');

module.exports = async function handler(req, res) {
  // En-têtes CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { templateId, fileUrl } = req.body;

    if (!templateId || !fileUrl) {
      return res.status(400).json({ 
        error: 'templateId et fileUrl sont requis' 
      });
    }

    if (!CONVERT_API_SECRET) {
      return res.status(500).json({ 
        error: 'ConvertAPI non configuré' 
      });
    }

    console.log(`Début conversion PPTX vers JPG pour template ${templateId}`);
    console.log(`URL du fichier: ${fileUrl}`);

    try {
      // 1. Télécharger le fichier depuis l'URL
      console.log('Téléchargement du fichier PPTX...');
      const fileResponse = await axios.get(fileUrl, { 
        responseType: 'arraybuffer' 
      });
      
      // 2. Utiliser l'API convertapi pour convertir PPTX en JPG
      console.log('Préparation de la requête de conversion...');
      
      // Créer un nouveau FormData
      const formData = new FormData();
      formData.append('File', Buffer.from(fileResponse.data), {
        filename: `template_${templateId}.pptx`,
        contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      });
      formData.append('StoreFile', 'true');
      formData.append('ImageQuality', '100');
      
      // Construire l'URL avec la clé API nettoyée
      const cleanedSecret = CONVERT_API_SECRET.trim();
      const apiUrl = `${CONVERT_API_URL}?Secret=${cleanedSecret}`;
      
      console.log('Envoi de la requête à ConvertAPI...');
      
      const convertResponse = await axios({
        method: 'post',
        url: apiUrl,
        headers: formData.getHeaders(),
        data: formData,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      
      console.log('Réponse de ConvertAPI reçue:', convertResponse.status);
      const conversionResult = convertResponse.data;
      
      if (!conversionResult.Files || conversionResult.Files.length === 0) {
        throw new Error('Aucune image générée par ConvertAPI');
      }

      console.log(`Conversion réussie: ${conversionResult.Files.length} images générées`);

      // 3. Télécharger les images depuis ConvertAPI et les stocker dans Supabase
      console.log(`Téléchargement et stockage de ${conversionResult.Files.length} images depuis ConvertAPI...`);
      
      const previewImages = [];
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
      
      throw conversionError;
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