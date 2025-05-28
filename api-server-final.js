const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer l'application Express
const app = express();
const PORT = process.env.PORT || 12000;

// Configuration de multer pour gérer les uploads de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniquePrefix = Date.now() + '-';
    cb(null, uniquePrefix + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Base de données en mémoire pour les templates
let templates = [
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
];

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());

// Log des requêtes
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  if (req.file) {
    console.log('File:', req.file.originalname, req.file.size, 'octets');
  }
  next();
});

// Création du dossier uploads s'il n'existe pas
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Route racine
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'API PPT Template Manager - Prête',
    version: '1.0.0',
    endpoints: [
      { method: 'GET', path: '/health', description: 'Vérifier la santé de l\'API' },
      { method: 'POST', path: '/auth/login', description: 'Authentification' },
      { method: 'GET', path: '/auth/user', description: 'Obtenir l\'utilisateur courant' },
      { method: 'GET', path: '/categories', description: 'Liste des catégories' },
      { method: 'GET', path: '/templates', description: 'Liste des templates' },
      { method: 'POST', path: '/templates', description: 'Ajouter un template (FormData)' },
      { method: 'POST', path: '/templates/upload', description: 'Alias pour ajouter un template (FormData)' },
      { method: 'DELETE', path: '/templates/:id', description: 'Supprimer un template' }
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

// Route pour l'authentification
app.post('/auth/login', handleLogin);
app.post('/api/auth/login', handleLogin);

// Route pour les catégories
app.get('/categories', handleCategories);
app.get('/api/categories', handleCategories);

// Routes pour les templates
app.get('/templates', handleTemplates);
app.get('/api/templates', handleTemplates);

// Routes pour ajouter un template (deux endpoints pour compatibilité)
app.post('/templates', upload.single('file'), handleAddTemplate);
app.post('/api/templates', upload.single('file'), handleAddTemplate);
app.post('/templates/upload', upload.single('file'), handleAddTemplate);
app.post('/api/templates/upload', upload.single('file'), handleAddTemplate);

// Routes pour supprimer un template
app.delete('/templates/:id', handleDeleteTemplate);
app.delete('/api/templates/:id', handleDeleteTemplate);

// Obtenir l'utilisateur courant
app.get('/auth/user', handleCurrentUser);
app.get('/api/auth/user', handleCurrentUser);

// Accès aux fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Handlers
function handleLogin(req, res) {
  const { email, password } = req.body;
  console.log(`👤 Tentative de connexion avec: ${email}`);
  
  if (email === 'admin@admin.com' && password === 'admin123') {
    console.log(`✅ Authentification réussie pour ${email}`);
    // Format direct attendu par le frontend
    res.json({
      token: 'demo-token-1234567890',
      user: {
        id: 1,
        email: email,
        name: 'Administrateur',
        role: 'admin'
      }
    });
  } else {
    console.log(`❌ Échec d'authentification pour ${email}`);
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
      user: {
        id: 1,
        email: 'admin@admin.com',
        name: 'Administrateur',
        role: 'admin'
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
  console.log('📂 Requête pour les catégories');
  res.json([
    { id: 1, name: 'Présentation Commerciale', slug: 'commercial' },
    { id: 2, name: 'Rapport Financier', slug: 'financial' },
    { id: 3, name: 'Formation', slug: 'training' },
    { id: 4, name: 'Marketing', slug: 'marketing' }
  ]);
}

function handleTemplates(req, res) {
  console.log('📑 Requête pour les templates');
  
  // Récupérer les templates existants dans le dossier uploads
  const templatesFromUploads = getUploadedTemplates();
  
  // Combiner les templates prédéfinis avec ceux uploadés
  const allTemplates = [...templates, ...templatesFromUploads];
  
  // Format spécial attendu par le frontend - wrapper avec templates: []
  res.json({
    templates: allTemplates
  });
}

function handleAddTemplate(req, res) {
  console.log('📤 Réception d\'un nouveau template');
  
  if (!req.file) {
    return res.status(400).json({
      status: 'error',
      message: 'Aucun fichier n\'a été fourni'
    });
  }
  
  console.log('File info:', req.file);
  console.log('Form data:', req.body);
  
  const name = req.body.name || path.basename(req.file.originalname, path.extname(req.file.originalname));
  const description = req.body.description || '';
  const category_id = parseInt(req.body.category_id) || 1;
  
  // Créer l'entrée pour le nouveau template
  const id = Date.now();
  const newTemplate = {
    id: id,
    name: name,
    description: description,
    thumbnail: `https://placehold.co/300x200/4A90E2/FFFFFF?text=${encodeURIComponent(name.substring(0, 10))}`,
    category_id: category_id,
    folder_id: 1,
    file_path: `/uploads/${req.file.filename}`,
    created_at: new Date().toISOString()
  };
  
  // Format attendu par le frontend - retourner directement le template
  res.status(201).json(newTemplate);
}

function handleDeleteTemplate(req, res) {
  const id = parseInt(req.params.id);
  console.log(`🗑️ Demande de suppression du template ID: ${id}`);
  
  // Trouver le template dans notre liste prédéfinie
  const templateIndex = templates.findIndex(t => t.id === id);
  
  if (templateIndex !== -1) {
    // Suppression du template prédéfini
    const deletedTemplate = templates.splice(templateIndex, 1)[0];
    console.log(`✅ Template prédéfini supprimé: ${deletedTemplate.name}`);
    return res.status(200).json({
      status: 'success',
      message: 'Template supprimé avec succès',
      template: deletedTemplate
    });
  }
  
  // Si pas trouvé dans les prédéfinis, chercher dans les uploads
  const uploadDir = path.join(__dirname, 'uploads');
  let templatesFromUploads = [];
  
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir);
    
    templatesFromUploads = files
      .filter(file => path.extname(file).toLowerCase() === '.pptx')
      .map((file, index) => {
        const stats = fs.statSync(path.join(uploadDir, file));
        const name = path.basename(file, path.extname(file));
        
        return {
          id: 1000 + index,
          name: name.replace(/^\d+-\d+-/, ''),
          description: `Template uploadé: ${name}`,
          thumbnail: `https://placehold.co/300x200/4AE2B5/FFFFFF?text=${encodeURIComponent(name.substring(0, 10))}`,
          category_id: 1,
          folder_id: 1,
          file_path: `/uploads/${file}`,
          file_name: file,
          created_at: stats.mtime.toISOString()
        };
      });
  }
  
  // Chercher le template dans les uploads
  const uploadedTemplate = templatesFromUploads.find(t => t.id === id);
  
  if (uploadedTemplate) {
    // Supprimer le fichier physique
    try {
      fs.unlinkSync(path.join(uploadDir, uploadedTemplate.file_name));
      console.log(`✅ Fichier supprimé: ${uploadedTemplate.file_name}`);
      return res.status(200).json({
        status: 'success',
        message: 'Template uploadé supprimé avec succès',
        template: uploadedTemplate
      });
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression du fichier: ${error.message}`);
      return res.status(500).json({
        status: 'error',
        message: `Erreur lors de la suppression du fichier: ${error.message}`
      });
    }
  }
  
  // Si le template n'a pas été trouvé
  return res.status(404).json({
    status: 'error',
    message: `Template avec ID ${id} non trouvé`
  });
}

// Fonction pour récupérer les templates existants dans le dossier uploads
function getUploadedTemplates() {
  const uploadDir = path.join(__dirname, 'uploads');
  let templates = [];
  
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir);
    
    templates = files
      .filter(file => path.extname(file).toLowerCase() === '.pptx')
      .map((file, index) => {
        const stats = fs.statSync(path.join(uploadDir, file));
        const name = path.basename(file, path.extname(file));
        
        return {
          id: 1000 + index,
          name: name.replace(/^\d+-\d+-/, ''), // Enlever le préfixe timestamp
          description: `Template uploadé: ${name}`,
          thumbnail: `https://placehold.co/300x200/4AE2B5/FFFFFF?text=${encodeURIComponent(name.substring(0, 10))}`,
          category_id: 1,
          folder_id: 1,
          file_path: `/uploads/${file}`,
          created_at: stats.mtime.toISOString()
        };
      });
  }
  
  return templates;
}

// Catch-all pour les routes non-gérées
app.use((req, res) => {
  console.log(`⚠️ Route non gérée: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: 'error',
    message: `Route non implémentée: ${req.method} ${req.originalUrl}`
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`
✅ Serveur API final démarré sur http://localhost:${PORT}
📡 API accessible sur http://localhost:${PORT}/api
🔐 Identifiants de connexion: admin@admin.com / admin123
📁 Dossier pour les uploads: ${uploadDir}
🛠️ Fonctionnalités implémentées:
   - Authentification
   - Gestion des templates (liste, ajout, suppression)
   - Upload de fichiers PPTX
  `);
});
