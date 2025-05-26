/**
 * API Route Vercel - Gestion des champs pour un template spécifique
 * 
 * Cette route permet de :
 * 1. Récupérer tous les champs d'un template (GET)
 * 2. Ajouter un nouveau champ à un template (POST)
 */

const { supabaseAdmin } = require('../../../_lib/supabase-client');

export default async function handler(req, res) {
  // En-têtes CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Récupérer l'ID du template depuis l'URL
  const { id: templateId } = req.query;

  if (!templateId) {
    return res.status(400).json({
      success: false,
      error: 'ID du template requis'
    });
  }

  try {
    // GET - Récupérer tous les champs d'un template
    if (req.method === 'GET') {
      console.log(`Récupération des champs pour le template ${templateId}`);
      
      const { data, error } = await supabaseAdmin
        .from('ppt_fields')
        .select('*')
        .eq('template_id', templateId)
        .order('position', { ascending: true });
      
      if (error) throw error;
      
      console.log(`${data?.length || 0} champs trouvés pour le template ${templateId}`);
      
      return res.status(200).json({
        success: true,
        fields: data || []
      });
    } 
    // POST - Ajouter un nouveau champ au template
    else if (req.method === 'POST') {
      console.log(`Ajout d'un nouveau champ au template ${templateId}`);
      const fieldData = req.body;
      
      if (!fieldData) {
        return res.status(400).json({
          success: false,
          error: 'Données du champ requises'
        });
      }
      
      // Vérifier d'abord si le template existe
      const { data: templateData, error: templateError } = await supabaseAdmin
        .from('ppt_templates')
        .select('id')
        .eq('id', templateId)
        .single();
      
      if (templateError || !templateData) {
        console.error('Erreur template inexistant:', templateError);
        return res.status(404).json({
          success: false,
          error: `Template avec ID ${templateId} introuvable`
        });
      }
      
      // Préparer les données du champ avec valeurs par défaut
      const newField = {
        name: fieldData.name || `field_${Date.now()}`,
        label: fieldData.label || 'Nouveau champ',
        type: fieldData.type || 'text',
        default_value: fieldData.default_value || '',
        position_x: fieldData.position_x || 0,
        position_y: fieldData.position_y || 0,
        width: fieldData.width || 200,
        height: fieldData.height || 50,
        font_family: fieldData.font_family || 'Arial',
        font_size: fieldData.font_size || 12,
        font_color: fieldData.font_color || '#000000',
        text_align: fieldData.text_align || 'left',
        font_style: fieldData.font_style || 'normal',
        slide_index: fieldData.slide_index || 0,
        position: fieldData.position || 0,
        template_id: templateId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Insérer le champ en base
      const { data: field, error: insertError } = await supabaseAdmin
        .from('ppt_fields')
        .insert(newField)
        .select()
        .single();
      
      if (insertError) {
        console.error('Erreur insertion champ:', insertError);
        throw insertError;
      }
      
      console.log(`Champ ajouté avec succès: ${field.id}`);
      
      return res.status(201).json({
        success: true,
        field
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
    console.error(`Erreur lors du traitement des champs pour le template ${templateId}:`, error);
    
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors du traitement de la requête',
      details: error.message
    });
  }
}
