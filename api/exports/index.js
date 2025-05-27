/**
 * API Route Vercel - Historique des exports
 * 
 * Cette route permet de récupérer l'historique des documents générés.
 */

const { supabaseAdmin } = require('../_lib/supabase-client');

export default async function handler(req, res) {
  // En-têtes CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Uniquement accepter les requêtes GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: `Méthode ${req.method} non supportée`
    });
  }

  try {
    console.log('Récupération de l\'historique des exports');

    // Récupérer la liste des fichiers dans le dossier exports de Supabase Storage
    const { data: folderData, error: folderError } = await supabaseAdmin.storage
      .from('ppt-templates')
      .list('exports', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'desc' }
      });

    if (folderError) {
      console.error('Erreur lors de la récupération des dossiers d\'exports:', folderError);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des dossiers d\'exports',
        details: folderError.message
      });
    }

    // Liste pour stocker tous les fichiers d'exports
    const allExports = [];

    // Parcourir les dossiers d'exports et récupérer les fichiers
    for (const folder of folderData || []) {
      if (folder.id) {
        const { data: filesData, error: filesError } = await supabaseAdmin.storage
          .from('ppt-templates')
          .list(`exports/${folder.name}`, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (filesError) {
          console.error(`Erreur lors de la récupération des fichiers dans ${folder.name}:`, filesError);
          continue;
        }

        // Ajouter les URL publiques pour chaque fichier
        for (const file of filesData || []) {
          const filePath = `exports/${folder.name}/${file.name}`;
          const { data: publicUrlData } = supabaseAdmin.storage
            .from('ppt-templates')
            .getPublicUrl(filePath);

          allExports.push({
            id: `${folder.name}-${file.name}`,
            name: file.name,
            created_at: file.created_at || new Date().toISOString(),
            folder: folder.name,
            path: filePath,
            url: publicUrlData.publicUrl,
            size: file.metadata?.size || 0,
            mime_type: file.metadata?.mimetype || 'application/octet-stream'
          });
        }
      }
    }

    // Trier par date de création décroissante
    allExports.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.status(200).json({
      success: true,
      exports: allExports
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des exports:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des exports',
      details: error.message || 'Erreur inconnue'
    });
  }
}
