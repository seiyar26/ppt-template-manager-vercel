// Version simplifiée de l'API d'authentification pour Vercel
const jwt = require('jsonwebtoken');

// Utilisateurs mockés pour démonstration
const DEMO_USERS = [
  {
    id: 1,
    email: 'admin@admin.com',
    name: 'Administrateur',
    password: 'admin123', // Ne jamais stocker des mots de passe en clair en production
    role: 'admin'
  },
  {
    id: 2,
    email: 'user@example.com',
    name: 'Utilisateur Test',
    password: 'user123',
    role: 'user'
  }
];

// Génération de token simplifié
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'ppt_template_manager_secret_key_vercel';
  return jwt.sign({ id: userId }, secret, { expiresIn: '30d' });
};

export default function handler(req, res) {
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
    console.log('Tentative de connexion avec:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Rechercher l'utilisateur dans les utilisateurs mockés
    const user = DEMO_USERS.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // Vérifier le mot de passe (simple comparaison pour démo)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // Générer le token
    const token = generateToken(user.id);

    res.status(200).json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ 
      message: 'Erreur de serveur lors de la connexion',
      error: error.message
    });
  }
}
