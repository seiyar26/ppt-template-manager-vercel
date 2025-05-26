const { sequelize } = require('./_lib/models');

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

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    // Vérifier si c'est un appel autorisé (avec secret)
    const { secret } = req.body;
    if (secret !== process.env.MIGRATION_SECRET) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    console.log('Démarrage de la migration de la base de données...');

    // Synchroniser tous les modèles avec la base de données
    await sequelize.sync({ force: false, alter: true });

    console.log('Migration terminée avec succès');

    res.status(200).json({
      message: 'Migration de la base de données réussie',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    res.status(500).json({
      message: 'Erreur lors de la migration',
      error: error.message
    });
  }
}
