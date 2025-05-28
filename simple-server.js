const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Créer l'application Express
const app = express();
const PORT = process.env.PORT || 12000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Log des requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Route pour la santé du serveur
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API server is running' });
});

// Route pour l'authentification
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log(`Tentative de connexion avec: ${email}`);
  
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

// Route pour les catégories
app.get('/api/categories', (req, res) => {
  res.json({
    status: 'success',
    data: [
      { id: 1, name: 'Présentation Commerciale', slug: 'commercial' },
      { id: 2, name: 'Rapport Financier', slug: 'financial' },
      { id: 3, name: 'Formation', slug: 'training' },
      { id: 4, name: 'Marketing', slug: 'marketing' }
    ]
  });
});

// Route pour les templates
app.get('/api/templates', (req, res) => {
  res.json({
    status: 'success',
    data: [
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
      }
    ]
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur API démarré sur http://localhost:${PORT}`);
  console.log(`📡 API accessible sur http://localhost:${PORT}/api`);
});
