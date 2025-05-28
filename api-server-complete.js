const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Créer l'application Express
const app = express();
const PORT = process.env.PORT || 12000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());

// Log des requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'API PPT Template Manager',
    version: '1.0.0',
    endpoints: [
      '/health',
      '/auth/login',
      '/auth/user',
      '/categories',
      '/templates'
    ]
  });
});

// Route pour la santé du serveur
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API server is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API server is running' });
});

// Route pour l'authentification - avec format de réponse corrigé
app.post('/auth/login', handleLogin);
app.post('/api/auth/login', handleLogin);

// Route pour les catégories
app.get('/categories', handleCategories);
app.get('/api/categories', handleCategories);

// Route pour les templates
app.get('/templates', handleTemplates);
app.get('/api/templates', handleTemplates);

// Obtenir l'utilisateur courant
app.get('/auth/user', handleCurrentUser);
app.get('/api/auth/user', handleCurrentUser);

// Handlers
function handleLogin(req, res) {
  const { email, password } = req.body;
  console.log(`👤 Tentative de connexion avec: ${email}`);
  
  if (email === 'admin@admin.com' && password === 'admin123') {
    // Format corrigé pour correspondre à ce qu'attend le frontend
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
}

function handleCurrentUser(req, res) {
  // Récupérer le token depuis l'en-tête Authorization
  const authHeader = req.headers.authorization;
  console.log('Entête Authorization:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Token non fourni ou invalide'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  // Pour ce prototype, on accepte n'importe quel token
  if (token) {
    console.log('🔓 Token reçu, utilisateur authentifié');
    return res.json({
      status: 'success',
      data: {
        user: {
          id: 1,
          email: 'admin@admin.com',
          name: 'Administrateur',
          role: 'admin'
        }
      }
    });
  } else {
    return res.status(401).json({
      status: 'error',
      message: 'Token invalide'
    });
  }
}

function handleCategories(req, res) {
  res.json({
    status: 'success',
    data: [
      { id: 1, name: 'Présentation Commerciale', slug: 'commercial' },
      { id: 2, name: 'Rapport Financier', slug: 'financial' },
      { id: 3, name: 'Formation', slug: 'training' },
      { id: 4, name: 'Marketing', slug: 'marketing' }
    ]
  });
}

function handleTemplates(req, res) {
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
        description: 'Template pour les sessions de formation sur les produits',
        thumbnail: 'https://placehold.co/300x200/4AE278/FFFFFF?text=Training',
        category_id: 3,
        folder_id: 2,
        file_path: '/files/template3.pptx',
        created_at: '2025-02-05T09:15:00Z'
      }
    ]
  });
}

// Catch-all pour les routes non-gérées
app.use((req, res) => {
  console.log(`Route non gérée: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: 'error',
    message: `Route non implémentée: ${req.method} ${req.originalUrl}`
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur API démarré sur http://localhost:${PORT}`);
  console.log(`📡 API accessible sur http://localhost:${PORT}/api et http://localhost:${PORT}/`);
  console.log(`🔐 Exemple de connexion: admin@admin.com / admin123`);
});
