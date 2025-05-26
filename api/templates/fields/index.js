/**
 * API Route Vercel - Gestion des champs pour tous les templates
 * 
 * Cette route permet de :
 * 1. Récupérer tous les champs (GET)
 */

const { supabaseAdmin } = require('../../_lib/supabase-client');

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

  try {
    // GET - Récupérer tous les champs
    if (req.method === 'GET') {
      const { templateId } = req.query;
      
      let query = supabaseAdmin.from('ppt_fields').select('*');
      
      // Filtrer par template si spécifié
      if (templateId) {
        query = query.eq('template_id', templateId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return res.status(200).json({
        success: true,
        fields: data || []
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
    console.error('Erreur lors de la récupération des champs:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors du traitement de la requête',
      details: error.message
    });
  }
}
