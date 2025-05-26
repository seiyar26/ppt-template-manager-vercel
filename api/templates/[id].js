/**
 * API Route Vercel - Gestion des templates par ID
 * 
 * Cette route permet de récupérer, modifier ou supprimer un template spécifique
 * en utilisant son ID comme paramètre d'URL.
 */

const { supabaseAdmin } = require('../_lib/supabase-client');

export default async function handler(req, res) {
  // Gérer CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Récupérer l'ID du template depuis l'URL
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'ID du template requis'
    });
  }

  console.log(`Traitement de la requête ${req.method} pour le template ID: ${id}`);

  try {
    // GET - Récupérer un template par son ID
    if (req.method === 'GET') {
      console.log(`Récupération du template ${id} depuis Supabase`);
      
      // Récupérer le template avec ses relations
      const { data, error } = await supabaseAdmin
        .from('ppt_templates')
        .select(`
          *,
          ppt_categories(*),
          ppt_folders(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (!data) {
        return res.status(404).json({
          success: false,
          error: `Template avec ID ${id} introuvable`
        });
      }
      
      // Transformer les données pour maintenir la compatibilité avec le frontend
      let preview_images = [];
      
      // Si preview_images existe, le convertir en tableau s'il est au format JSON string
      if (data.preview_images) {
        try {
          if (typeof data.preview_images === 'string') {
            preview_images = JSON.parse(data.preview_images);
          } else {
            preview_images = data.preview_images;
          }
        } catch (e) {
          console.error('Erreur lors du parsing des preview_images:', e);
        }
      }
      
      // Générer les diapositives à partir des preview_images
      const Slides = preview_images.map((image, index) => ({
        id: `slide-${index}`,
        slide_index: index,
        slide_number: index + 1,
        image_path: image.url,
        url: image.url,
        fileName: image.fileName,
        fileSize: image.fileSize,
        page: image.page
      }));
      
      console.log(`Transformation de ${preview_images.length} images en ${Slides.length} diapositives`);
      
      const template = {
        ...data,
        categories: data.ppt_categories || [],
        folder: data.ppt_folders || null,
        // Ajouter les diapositives générées à partir des prévisualisations
        Slides: Slides.length > 0 ? Slides : [],
        // S'assurer que toutes les propriétés attendues sont présentes
        preview_url: data.preview_url || data.file_url,
        file_url: data.file_url || data.public_url || ''
      };
      
      return res.status(200).json({
        success: true,
        template
      });
    } 
    // PATCH - Mettre à jour un template
    else if (req.method === 'PATCH') {
      const updates = req.body;
      
      if (!updates) {
        return res.status(400).json({
          success: false,
          error: 'Données de mise à jour requises'
        });
      }
      
      // Mettre à jour le template
      const { data, error } = await supabaseAdmin
        .from('ppt_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return res.status(200).json({
        success: true,
        template: data
      });
    }
    // DELETE - Supprimer un template
    else if (req.method === 'DELETE') {
      // Option 1: Suppression douce (recommandée)
      const { error } = await supabaseAdmin
        .from('ppt_templates')
        .update({
          status: 'deleted',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      return res.status(200).json({
        success: true,
        message: `Template ${id} supprimé avec succès`
      });
    }
    // Méthode non supportée
    else {
      return res.status(405).json({
        success: false,
        error: `Méthode ${req.method} non supportée`
      });
    }
  } catch (error) {
    console.error(`Erreur lors du traitement du template ${id}:`, error);
    
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors du traitement de la requête',
      details: error.message
    });
  }
}