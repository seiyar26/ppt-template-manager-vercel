const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4444;

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
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
    message: 'API server is running with Supabase', 
    timestamp: new Date().toISOString(),
    port: PORT,
    supabase_configured: !!supabaseUrl
  });
});

// Route d'authentification avec Supabase
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Tentative de connexion: ${email}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.log('Erreur d\'authentification:', error.message);
      return res.status(401).json({
        status: 'error',
        message: error.message
      });
    }

    res.json({
      status: 'success',
      message: 'Authentification réussie',
      data: {
        token: data.session.access_token,
        user: data.user
      }
    });
  } catch (error) {
    console.error('Erreur serveur lors de l\'authentification:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur interne du serveur'
    });
  }
});

// Route pour obtenir l'utilisateur actuel
app.get('/api/auth/user', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Token manquant'
      });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        status: 'error',
        message: 'Token invalide'
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur interne du serveur'
    });
  }
});

// Route pour les catégories depuis Supabase
app.get('/api/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('position', { ascending: true })
      .order('name');

    if (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erreur lors de la récupération des catégories'
      });
    }

    // Transformer les données pour correspondre au format attendu par le frontend
    const transformedData = data.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color || '#3B82F6',
      icon: category.icon || 'folder',
      position: category.position,
      parent_id: category.parent_id,
      is_default: category.is_default,
      created_at: category.created_at
    }));

    res.json(transformedData || []);
  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur interne du serveur'
    });
  }
});

// Route pour les templates depuis Supabase
app.get('/api/templates', async (req, res) => {
  try {
    const { categoryId } = req.query;
    
    let query = supabase
      .from('ppt_templates')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des templates:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erreur lors de la récupération des templates'
      });
    }

    // Transformer les données pour correspondre au format attendu par le frontend
    const transformedData = data.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      thumbnail: template.preview_url || template.preview_images?.[0]?.url || 'https://placehold.co/300x200/4A90E2/FFFFFF?text=PPT',
      category_id: template.category_id,
      folder_id: template.folder_id,
      file_path: template.file_path,
      file_url: template.file_url,
      created_at: template.created_at,
      status: template.status,
      conversion_status: template.conversion_status
    }));

    res.json(transformedData || []);
  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur interne du serveur'
    });
  }
});

// Route pour créer un nouveau template
app.post('/api/templates', async (req, res) => {
  try {
    console.log('📤 Upload de template reçu:', req.body);
    const { name, description, category_id, folder_id, file_path, file_url, file_size, file_type, original_name } = req.body;

    // Validation des champs obligatoires
    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: 'Le nom du template est obligatoire'
      });
    }

    const fileName = original_name || `${name}.pptx`;
    const filePath = file_path || `public/${fileName}`;

    const { data, error } = await supabase
      .from('ppt_templates')
      .insert([
        {
          name: name,
          description: description || `Template uploadé le ${new Date().toLocaleString('fr-FR')}`,
          file_name: fileName,
          file_path: filePath,
          file_url: file_url || `https://placeholder.com/template/${fileName}`,
          file_size: file_size || 0,
          file_type: file_type || 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          original_name: fileName,
          category_id: category_id || null,
          folder_id: folder_id || null,
          user_id: null, // Pas d'utilisateur pour l'instant
          status: 'active',
          conversion_status: 'pending'
        }
      ])
      .select();

    if (error) {
      console.error('❌ Erreur lors de la création du template:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erreur lors de la création du template',
        details: error.message
      });
    }

    console.log('✅ Template créé avec succès:', data[0].id);
    res.status(201).json({
      status: 'success',
      data: data[0],
      message: 'Template créé avec succès'
    });

  } catch (error) {
    console.error('💥 Erreur serveur lors de l\'upload:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur interne du serveur',
      details: error.message
    });
  }
});

// Route pour récupérer un template par ID
app.get('/api/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('ppt_templates')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Erreur lors de la récupération du template:', error);
      return res.status(404).json({
        status: 'error',
        message: 'Template non trouvé'
      });
    }

    // Transformer les données pour correspondre au format attendu par le frontend
    const transformedData = {
      id: data.id,
      name: data.name,
      description: data.description,
      thumbnail: data.preview_url || data.preview_images?.[0]?.url || 'https://placehold.co/300x200/4A90E2/FFFFFF?text=PPT',
      category_id: data.category_id,
      folder_id: data.folder_id,
      file_path: data.file_path,
      file_url: data.file_url,
      created_at: data.created_at,
      status: data.status,
      conversion_status: data.conversion_status,
      preview_images: data.preview_images
    };

    res.json(transformedData);
  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur interne du serveur'
    });
  }
});

// Route pour les dossiers depuis Supabase
app.get('/api/folders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('name');

    if (error) {
      console.error('Erreur lors de la récupération des dossiers:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erreur lors de la récupération des dossiers'
      });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur interne du serveur'
    });
  }
});

// Fallback pour les routes non trouvées
app.all('/api/*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route non trouvée: ${req.method} ${req.url}`
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({
    status: 'error',
    message: 'Erreur interne du serveur'
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur API Supabase démarré sur le port ${PORT}`);
  console.log(`📡 API accessible sur http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️  Connecté à Supabase: ${supabaseUrl}`);
});

module.exports = app;
