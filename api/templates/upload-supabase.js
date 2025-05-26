// API pour l'upload de fichiers volumineux via Supabase
const multiparty = require('multiparty');
const fs = require('fs');
const { supabaseAdmin } = require('../_lib/supabase-client');

const BUCKET_NAME = 'ppt-templates';

module.exports = async function handler(req, res) {
  // Gérer CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    // Fonction de parsing du formdata avec une taille maximale de 50MB
    const form = new multiparty.Form({
      maxFieldsSize: 2 * 1024 * 1024, // 2MB pour les champs
      maxFilesSize: 100 * 1024 * 1024  // 100MB pour les fichiers
    });
    
    // Parser le formdata de manière asynchrone
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });
    
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
    
    // Préparer les informations du fichier pour Supabase
    const fileBuffer = fs.readFileSync(file.path);
    const fileType = file.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    
    // Générer un nom de fichier unique pour éviter les collisions
    const uniqueFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = `templates/${uniqueFileName}`;
    
    // Upload vers Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: fileType,
        cacheControl: '3600'
      });
    
    if (error) {
      console.error('Erreur upload Supabase:', error);
      return res.status(500).json({
        error: 'Erreur upload Supabase',
        message: error.message
      });
    }
    
    // Générer l'URL publique
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    // Créer l'entrée dans la base de données Supabase
    const name = fields.name ? fields.name[0] : fileName.replace(/\.[^/.]+$/, '');
    const description = fields.description ? fields.description[0] : '';
    
    // Créer un objet template avec les informations du fichier
    const template = {
      id: Date.now().toString(),
      name: name,
      description: description,
      file_name: fileName,
      file_path: filePath,
      file_size: file.size,
      public_url: urlData.publicUrl,
      content_type: fileType,
      created_at: new Date().toISOString(),
      status: 'uploaded',
      message: 'Template uploadé avec succès via Supabase Storage'
    };
    
    // Répondre avec le template créé
    return res.status(201).json({ template });
    
  } catch (error) {
    console.error('Erreur lors du traitement de l\'upload:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
