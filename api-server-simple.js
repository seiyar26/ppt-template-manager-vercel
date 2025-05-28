const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4444;

// Middleware basique
app.use(cors());
app.use(express.json());

// Log des requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API server is running', 
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Route d'authentification
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log(`Tentative de connexion: ${email}`);
  
  if (email === 'admin@admin.com' && password === 'admin123') {
    res.json({
      status: 'success',
      message: 'Authentification réussie',
      data: {
        token: 'demo-token-1234567890',
        user: {
          id: 1,
          email: email,
          name: 'Administrateur',
          role: 'admin'
        }
      }
    });
  } else {
    res.status(401).json({
      status: 'error',
      message: 'Email ou mot de passe incorrect'
    });
  }
});

// Route pour obtenir l'utilisateur actuel
app.get('/api/auth/user', (req, res) => {
  const token = req.headers.authorization;
  if (token && token.includes('demo-token')) {
    res.json({
      id: 1,
      email: 'admin@admin.com',
      name: 'Administrateur',
      role: 'admin'
    });
  } else {
    res.status(401).json({
      status: 'error',
      message: 'Token invalide'
    });
  }
});

// Route pour les catégories
app.get('/api/categories', (req, res) => {
  res.json([
    { id: 1, name: 'Présentation Commerciale', slug: 'commercial' },
    { id: 2, name: 'Rapport Financier', slug: 'financial' },
    { id: 3, name: 'Formation', slug: 'training' },
    { id: 4, name: 'Marketing', slug: 'marketing' }
  ]);
});

// Route pour les templates
app.get('/api/templates', (req, res) => {
  res.json([
    { 
      id: 1, 
      name: 'Template Commercial Standard', 
      description: 'Template pour les présentations commerciales standard',
      thumbnail: 'https://placehold.co/300x200/4A90E2/FFFFFF?text=Commercial',
      category_id: 1,
      folder_id: 2,
      file_path: '/files/template1.pptx',
      created_at: '2025-01-15T10:30:00Z'
    },
    { 
      id: 2, 
      name: 'Rapport Trimestriel', 
      description: 'Template pour les rapports financiers trimestriels',
      thumbnail: 'https://placehold.co/300x200/E24A78/FFFFFF?text=Finance',
      category_id: 2,
      folder_id: 3,
      file_path: '/files/template2.pptx',
      created_at: '2025-01-20T14:45:00Z'
    },
    { 
      id: 3, 
      name: 'Formation Produit', 
      description: 'Template pour les formations sur les nouveaux produits',
      thumbnail: 'https://placehold.co/300x200/4AE278/FFFFFF?text=Formation',
      category_id: 3,
      folder_id: 2,
      file_path: '/files/template3.pptx',
      created_at: '2025-02-05T09:15:00Z'
    },
    { 
      id: 4, 
      name: 'Présentation Marketing', 
      description: 'Template pour les campagnes marketing',
      thumbnail: 'https://placehold.co/300x200/F5A623/FFFFFF?text=Marketing',
      category_id: 4,
      folder_id: 1,
      file_path: '/files/template4.pptx',
      created_at: '2025-02-10T16:20:00Z'
    }
  ]);
});

// Route pour les dossiers
app.get('/api/folders', (req, res) => {
  res.json([
    { id: 1, name: 'Dossier Principal', parent_id: null },
    { id: 2, name: 'Projets Internes', parent_id: 1 },
    { id: 3, name: 'Clients', parent_id: 1 },
    { id: 4, name: 'Archives', parent_id: null }
  ]);
});

// Fallback pour les routes non trouvées
app.all('/api/*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route non trouvée: ${req.method} ${req.url}`
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({
    status: 'error',
    message: 'Erreur interne du serveur'
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur API démarré sur le port ${PORT}`);
  console.log(`📡 API accessible sur http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
