// API d'upload de templates optimisée pour Supabase Storage
// Conforme aux règles de qualité, sécurité et performance (Windsurf)
const jwt = require('jsonwebtoken');
const multiparty = require('multiparty');
const fs = require('fs');
const { uploadFile, validateFile } = require('../_lib/supabase-storage');

// La fonction ensureBucketExists a été déplacée dans le service supabase-storage.js

// Convertit une requête multipart en promesse pour faciliter le traitement
const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = new multiparty.Form({
      maxFieldsSize: 10 * 1024 * 1024,  // 10MB pour les champs
      maxFilesSize: 100 * 1024 * 1024   // 100MB pour les fichiers (limite augmentée)
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
    
    // Vérification du bucket gérée par le service de stockage

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
    
    // Préparer les informations du fichier
    const fileInfo = {
      originalFilename: file.originalFilename,
      name: file.originalFilename,
      mimetype: file.headers['content-type'],
      size: file.size,
      headers: file.headers
    };
    
    // Valider le fichier (type, taille) via le service
    const validation = validateFile(fileInfo);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Fichier invalide',
        message: validation.message
      });
    }
    
    console.log(`Fichier reçu: ${fileInfo.originalFilename}, taille: ${fileInfo.size} octets`);
    
    // Utiliser le service d'upload optimisé
    const uploadResult = await uploadFile(file.path, fileInfo);
    
    if (!uploadResult.success) {
      console.error('Erreur upload Supabase:', uploadResult.error);
      return res.status(500).json({
        error: 'Erreur d\'upload Supabase',
        message: uploadResult.error
      });
    }
    
    console.log(`Fichier uploadé avec succès: ${uploadResult.publicUrl}`);
    
    // Récupérer les données du formulaire
    const name = fields.name ? fields.name[0] : file.originalFilename.replace(/\\.[^/.]+$/, '');
    const description = fields.description ? fields.description[0] : '';
    const categoryId = fields.categoryId ? parseInt(fields.categoryId[0]) : null;
    const folderId = fields.folderId ? parseInt(fields.folderId[0]) : null;
    
    // En mode démo, on ne crée pas d'entrée dans la base de données
    // On génère simplement un objet template avec les informations nécessaires
    const template = {
      id: Date.now().toString(),
      name,
      description,
      file_name: uploadResult.originalName,
      file_path: uploadResult.filePath,
      file_size: uploadResult.fileSize,
      file_type: uploadResult.contentType,
      original_name: uploadResult.originalName,
      public_url: uploadResult.publicUrl,
      category_id: categoryId,
      folder_id: folderId,
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
        content_type: template.file_type,
        created_at: template.created_at,
        status: 'uploaded',
        message: 'Template uploadé avec succès dans Supabase Storage (100MB max supporté)'
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload de template:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};
