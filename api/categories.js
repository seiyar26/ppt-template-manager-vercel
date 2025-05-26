// API Categories pour Vercel
// Gestion des catégories de templates

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
      // Retourner des catégories par défaut
      const categories = [
        {
          id: 1,
          name: 'Présentations Business',
          description: 'Templates pour présentations professionnelles',
          color: '#3B82F6',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Rapports',
          description: 'Templates pour rapports et analyses',
          color: '#10B981',
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Marketing',
          description: 'Templates pour supports marketing',
          color: '#F59E0B',
          created_at: new Date().toISOString()
        }
      ];

      res.status(200).json(categories);
    } else if (req.method === 'POST') {
      // Créer une nouvelle catégorie
      const { name, description, color } = req.body;
      
      const newCategory = {
        id: Date.now(),
        name,
        description,
        color: color || '#6B7280',
        created_at: new Date().toISOString()
      };

      res.status(201).json(newCategory);
    } else {
      res.status(405).json({ message: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Categories API error:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};
