// API Folders pour Vercel
// Gestion des dossiers de templates

module.exports = async function handler(req, res) {
  // Gérer CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Retourner des dossiers par défaut
      const folders = [
        {
          id: 1,
          name: 'Templates Principaux',
          description: 'Dossier principal pour les templates',
          parent_id: null,
          created_at: new Date().toISOString(),
          template_count: 0
        },
        {
          id: 2,
          name: 'Brouillons',
          description: 'Templates en cours de développement',
          parent_id: null,
          created_at: new Date().toISOString(),
          template_count: 0
        },
        {
          id: 3,
          name: 'Archives',
          description: 'Anciens templates archivés',
          parent_id: null,
          created_at: new Date().toISOString(),
          template_count: 0
        }
      ];

      res.status(200).json(folders);
    } else if (req.method === 'POST') {
      // Créer un nouveau dossier
      const { name, description, parent_id } = req.body;
      
      const newFolder = {
        id: Date.now(),
        name,
        description,
        parent_id: parent_id || null,
        created_at: new Date().toISOString(),
        template_count: 0
      };

      res.status(201).json(newFolder);
    } else {
      res.status(405).json({ message: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Folders API error:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};
