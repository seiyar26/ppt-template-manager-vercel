// API Templates simplifiée pour Vercel
// Version sans base de données pour test initial

const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5MB limite Vercel

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
      // Retourner des templates d'exemple
      const templates = [
        {
          id: 1,
          name: 'Template Business Standard',
          description: 'Template pour présentations business',
          file_name: 'business-template.pptx',
          file_size: 2048000,
          created_at: new Date().toISOString(),
          user: { name: 'Admin', email: 'admin@default.com' },
          categories: [{ id: 1, name: 'Business', color: '#3B82F6' }]
        }
      ];

      res.status(200).json(templates);
    } else if (req.method === 'POST') {
      // Vérifier la taille du fichier
      const contentLength = parseInt(req.headers['content-length'] || '0');
      
      if (contentLength > MAX_FILE_SIZE) {
        return res.status(413).json({
          error: 'Fichier trop volumineux',
          message: `La taille du fichier (${Math.round(contentLength / 1024 / 1024 * 100) / 100}MB) dépasse la limite autorisée de ${MAX_FILE_SIZE / 1024 / 1024}MB sur Vercel.`,
          max_size: MAX_FILE_SIZE,
          received_size: contentLength,
          suggestion: 'Veuillez compresser votre fichier PowerPoint ou utiliser un fichier plus petit.'
        });
      }

      // Simuler la création d'un template
      const newTemplate = {
        id: Date.now(),
        name: req.body?.name || 'Nouveau Template',
        description: req.body?.description || '',
        file_name: 'uploaded-template.pptx',
        file_size: contentLength,
        created_at: new Date().toISOString(),
        status: 'uploaded',
        message: 'Template uploadé avec succès (mode démo)'
      };

      // Encapsuler dans un objet avec propriété 'template' comme attendu par le frontend
      res.status(201).json({ template: newTemplate });
    } else {
      res.status(405).json({ message: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Templates API error:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};
