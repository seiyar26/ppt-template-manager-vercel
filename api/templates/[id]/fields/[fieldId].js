/**
 * API Route Vercel - Gestion d'un champ spécifique pour un template
 * 
 * Cette route permet de :
 * 1. Récupérer un champ spécifique (GET)
 * 2. Modifier un champ existant (PUT)
 * 3. Supprimer un champ (DELETE)
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

  // Récupérer les IDs depuis l'URL
  const { id: templateId, fieldId } = req.query;

  if (!templateId || !fieldId) {
    return res.status(400).json({
      success: false,
      error: 'ID du template et ID du champ requis'
    });
  }

  try {
    // GET - Récupérer un champ spécifique
    if (req.method === 'GET') {
      console.log(`Récupération du champ ${fieldId} pour le template ${templateId}`);
      
      const { data, error } = await supabaseAdmin
        .from('ppt_fields')
        .select('*')
        .eq('id', fieldId)
        .eq('template_id', templateId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            error: `Champ ${fieldId} introuvable pour le template ${templateId}`
          });
        }
        throw error;
      }
      
      return res.status(200).json({
        success: true,
        field: data
      });
    } 
    // PUT - Modifier un champ existant
    else if (req.method === 'PUT') {
      console.log(`Modification du champ ${fieldId} pour le template ${templateId}`);
      const fieldData = req.body;
      
      if (!fieldData) {
        return res.status(400).json({
          success: false,
          error: 'Données du champ requises'
        });
      }
      
      // Vérifier que le champ existe
      const { data: existingField, error: fieldError } = await supabaseAdmin
        .from('ppt_fields')
        .select('id')
        .eq('id', fieldId)
        .eq('template_id', templateId)
        .single();
      
      if (fieldError || !existingField) {
        console.error('Erreur champ inexistant:', fieldError);
        return res.status(404).json({
          success: false,
          error: `Champ ${fieldId} introuvable pour le template ${templateId}`
        });
      }
      
      // Préparer les données de mise à jour
      const updatedField = {
        ...fieldData,
        updated_at: new Date().toISOString()
      };
      
      // Ne pas permettre de modifier le template_id
      delete updatedField.template_id;
      
      // Mettre à jour le champ
      const { data: field, error: updateError } = await supabaseAdmin
        .from('ppt_fields')
        .update(updatedField)
        .eq('id', fieldId)
        .eq('template_id', templateId)
        .select()
        .single();
      
      if (updateError) {
        console.error('Erreur mise à jour champ:', updateError);
        throw updateError;
      }
      
      console.log(`Champ ${fieldId} mis à jour avec succès`);
      
      return res.status(200).json({
        success: true,
        field
      });
    }
    // DELETE - Supprimer un champ
    else if (req.method === 'DELETE') {
      console.log(`Suppression du champ ${fieldId} pour le template ${templateId}`);
      
      // Vérifier que le champ existe
      const { data: existingField, error: fieldError } = await supabaseAdmin
        .from('ppt_fields')
        .select('id')
        .eq('id', fieldId)
        .eq('template_id', templateId)
        .single();
      
      if (fieldError || !existingField) {
        console.error('Erreur champ inexistant:', fieldError);
        return res.status(404).json({
          success: false,
          error: `Champ ${fieldId} introuvable pour le template ${templateId}`
        });
      }
      
      // Supprimer le champ
      const { error: deleteError } = await supabaseAdmin
        .from('ppt_fields')
        .delete()
        .eq('id', fieldId)
        .eq('template_id', templateId);
      
      if (deleteError) {
        console.error('Erreur suppression champ:', deleteError);
        throw deleteError;
      }
      
      console.log(`Champ ${fieldId} supprimé avec succès`);
      
      return res.status(200).json({
        success: true,
        message: `Champ ${fieldId} supprimé avec succès`
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
    console.error(`Erreur lors du traitement du champ ${fieldId} pour le template ${templateId}:`, error);
    
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors du traitement de la requête',
      details: error.message
    });
  }
}
