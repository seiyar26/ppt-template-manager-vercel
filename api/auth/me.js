// Version simplifiée de l'API Me pour obtenir les informations de l'utilisateur connecté
const jwt = require('jsonwebtoken');

// Utilisateurs mockés pour démonstration (identique à login.js)
const DEMO_USERS = [
  {
    id: 1,
    email: 'admin@example.com',
    name: 'Administrateur',
    role: 'admin'
  },
  {
    id: 2,
    email: 'user@example.com',
    name: 'Utilisateur Test',
    role: 'user'
  }
];

// Fonction simplifiée pour vérifier le token JWT
const verifyToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET || 'ppt_template_manager_secret_key_vercel';
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    return null;
  }
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

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    // Vérifier si un token est présent dans les en-têtes
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Non autorisé - Token manquant' });
    }

    // Extraire et vérifier le token
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Token invalide ou expiré' });
    }

    // Rechercher l'utilisateur dans la liste des utilisateurs de démonstration
    const user = DEMO_USERS.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Retourner les informations de l'utilisateur
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    res.status(500).json({ 
      message: 'Erreur interne du serveur',
      error: error.message 
    });
  }
}
