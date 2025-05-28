const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

// Créer l'application Express
const app = express();
const PORT = process.env.PORT || 4444;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log des requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Charger dynamiquement les fichiers API
const apiPath = path.join(__dirname, 'api');

// Route pour la santé du serveur
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API server is running', timestamp: new Date().toISOString() });
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

// Route pour les dossiers
app.get('/api/folders', (req, res) => {
  res.json({
    status: 'success',
    data: [
      { id: 1, name: 'Dossier Principal', parent_id: null },
      { id: 2, name: 'Projets Internes', parent_id: 1 },
      { id: 3, name: 'Clients', parent_id: 1 },
      { id: 4, name: 'Archives', parent_id: null }
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
      }
    ]
  });
});

// Fallback pour les autres routes API
app.all('/api/*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route non implémentée: ${req.method} ${req.url}`
  });
});

// Servir le frontend pour les autres routes
app.use(express.static(path.join(__dirname, 'frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur API démarré sur http://localhost:${PORT}`);
  console.log(`🔗 Frontend accessible sur http://localhost:3000`);
  console.log(`📡 API accessible sur http://localhost:${PORT}/api`);
});
