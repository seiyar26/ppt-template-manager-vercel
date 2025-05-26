// API Fields simplifiée pour Vercel
// Gestion des champs de templates

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
      // Retourner des champs d'exemple
      const fields = [
        {
          id: 1,
          name: 'company_name',
          label: 'Nom de l\'entreprise',
          type: 'text',
          placeholder: 'Entrez le nom de l\'entreprise',
          required: true,
          template_id: 1,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'presentation_date',
          label: 'Date de présentation',
          type: 'date',
          placeholder: 'Sélectionnez la date',
          required: false,
          template_id: 1,
          created_at: new Date().toISOString()
        }
      ];

      res.status(200).json(fields);
    } else if (req.method === 'POST') {
      // Créer un nouveau champ
      const { name, label, type, placeholder, required, template_id } = req.body;
      
      const newField = {
        id: Date.now(),
        name,
        label,
        type: type || 'text',
        placeholder: placeholder || '',
        required: required || false,
        template_id: template_id || 1,
        created_at: new Date().toISOString()
      };

      res.status(201).json(newField);
    } else {
      res.status(405).json({ message: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Fields API error:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};
