// API pour obtenir les informations sur les limites d'upload

module.exports = async function handler(req, res) {
  // Gérer CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    // Informations sur les limites d'upload
    const uploadLimits = {
      max_file_size: 4.5 * 1024 * 1024, // 4.5MB limite Vercel
      max_file_size_formatted: '4.5 MB',
      supported_formats: ['pptx', 'ppt'],
      message: 'Les fichiers dépassant 4.5 MB ne peuvent pas être téléchargés directement via Vercel.',
      alternatives: [
        {
          name: 'Compression PowerPoint',
          description: 'Compressez vos images dans PowerPoint avant de télécharger',
          instructions: 'Dans PowerPoint: Fichier > Compresser les images > Options: Qualité Web'
        },
        {
          name: 'Lien externe',
          description: 'Utilisez un lien vers Google Drive ou OneDrive',
          instructions: 'Partagez votre fichier via Google Drive/OneDrive et fournissez le lien'
        },
        {
          name: 'Diviser en plusieurs fichiers',
          description: 'Diviser la présentation en plusieurs fichiers plus petits',
          instructions: 'Créez plusieurs présentations de taille < 4.5MB'
        }
      ],
      vercel_limits_url: 'https://vercel.com/docs/concepts/functions/serverless-functions#size-limits'
    };

    res.status(200).json(uploadLimits);
  } catch (error) {
    console.error('Upload info API error:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};
