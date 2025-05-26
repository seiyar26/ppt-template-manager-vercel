// API d'upload de templates utilisant Vercel Blob Storage
// Solution robuste et sans limitations pour fichiers volumineux
const jwt = require('jsonwebtoken');
const multiparty = require('multiparty');
const fs = require('fs');
const { put } = require('@vercel/blob');

// Convertit une requête multipart en promesse pour faciliter le traitement
const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = new multiparty.Form({
      maxFieldsSize: 10 * 1024 * 1024,  // 10MB pour les champs
      maxFilesSize: 100 * 1024 * 1024   // 100MB pour les fichiers
    });
    
    console.log('Parsing form data avec multiparty...');
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Erreur parsing multiparty:', err);
        return reject(err);
      }
      console.log('Form data parsed avec succès');
      resolve({ fields, files });
    });
  });
};

// Vérifie le token JWT
const verifyToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET || 'ppt_template_manager_secret_key_vercel';
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

module.exports = async function handler(req, res) {
  // Gérer CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    // Vérifier l'authentification
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Non autorisé',
        message: 'Authentification requise'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        error: 'Token invalide',
        message: 'Session expirée ou token invalide'
      });
    }

    // Analyse de la requête multipart
    const { fields, files } = await parseForm(req);
    
    // Récupérer le fichier PowerPoint et les métadonnées
    const file = files.file ? files.file[0] : null;
    if (!file) {
      return res.status(400).json({
        error: 'Fichier manquant',
        message: 'Aucun fichier n\'a été fourni'
      });
    }
    
    // Valider le type de fichier (PPTX uniquement)
    const fileName = file.originalFilename;
    if (!fileName.toLowerCase().endsWith('.pptx')) {
      return res.status(400).json({
        error: 'Type de fichier non supporté',
        message: 'Seuls les fichiers PowerPoint (.pptx) sont acceptés'
      });
    }
    
    console.log(`Fichier reçu: ${fileName}, taille: ${file.size} octets`);
    
    // Préparer les informations du fichier pour Vercel Blob
    const fileBuffer = fs.readFileSync(file.path);
    const fileType = file.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    
    // Générer un nom de fichier unique pour éviter les collisions
    const uniqueFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    
    console.log('Début upload vers Vercel Blob Storage...');
    
    // Upload vers Vercel Blob Storage
    const blob = await put(uniqueFileName, fileBuffer, {
      contentType: fileType,
      access: 'public'
    });
    
    console.log('Upload vers Vercel Blob réussi:', blob.url);
    
    // Récupérer les données du formulaire
    const name = fields.name ? fields.name[0] : fileName.replace(/\.[^/.]+$/, '');
    const description = fields.description ? fields.description[0] : '';
    const categoryId = fields.categoryId ? parseInt(fields.categoryId[0]) : null;
    
    // Créer un objet template avec les informations du fichier
    const template = {
      id: Date.now().toString(),
      name,
      description,
      file_name: fileName,
      file_path: uniqueFileName,
      file_size: file.size,
      public_url: blob.url,
      content_type: fileType,
      category_id: categoryId,
      user_id: decoded.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'uploaded'
    };
    
    console.log('Template créé avec succès:', template.id);
    
    // Réponse avec l'objet template créé (encapsulé comme attendu par le frontend)
    res.status(201).json({ 
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
        file_name: template.file_name,
        file_size: template.file_size,
        file_path: template.file_path,
        public_url: template.public_url,
        content_type: template.content_type,
        created_at: template.created_at,
        status: 'uploaded',
        message: 'Template uploadé avec succès dans Vercel Blob Storage (100MB max supporté)'
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload de template:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message || 'Une erreur est survenue lors de l\'upload'
    });
  }
};
