// Service de stockage pour les fichiers PowerPoint utilisant Supabase Storage
const { supabase, supabaseAdmin, STORAGE_BUCKET } = require('./supabase-client');
const path = require('path');
const crypto = require('crypto');

const BUCKET_NAME = 'ppt-templates';
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB (limite de Supabase)
const ALLOWED_MIME_TYPES = [
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.presentationml.template'
];
const ALLOWED_EXTENSIONS = ['.ppt', '.pptx', '.potx'];

/**
 * Initialise le bucket de stockage s'il n'existe pas
 */
const initStorage = async () => {
  try {
    // Vérifier si le bucket existe
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      console.log(`Création du bucket ${BUCKET_NAME}...`);
      const { error } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: false, // Fichiers privés par défaut
        fileSizeLimit: MAX_FILE_SIZE
      });
      
      if (error) {
        console.error('Erreur lors de la création du bucket:', error);
        return false;
      }
      
      console.log(`Bucket ${BUCKET_NAME} créé avec succès`);
    } else {
      console.log(`Bucket ${BUCKET_NAME} existe déjà`);
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du stockage:', error);
    return false;
  }
};

/**
 * Valide un fichier avant upload
 * @param {Object} file - Informations sur le fichier
 * @returns {Object} - Résultat de la validation {valid, error}
 */
const validateFile = (file) => {
  // Vérifier la taille du fichier
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Taille du fichier (${Math.round(file.size / 1024 / 1024 * 100) / 100}MB) dépasse la limite autorisée de ${MAX_FILE_SIZE / 1024 / 1024}MB.`
    };
  }
  
  // Vérifier le type MIME
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Type de fichier non autorisé: ${file.mimetype}. Types autorisés: PowerPoint (.ppt, .pptx, .potx)`
    };
  }
  
  // Vérifier l'extension
  const fileExt = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
    return {
      valid: false,
      error: `Extension de fichier non autorisée: ${fileExt}. Extensions autorisées: .ppt, .pptx, .potx`
    };
  }
  
  return { valid: true };
};

/**
 * Télécharge un fichier dans Supabase Storage
 * @param {Buffer} fileBuffer - Contenu du fichier
 * @param {Object} fileInfo - Informations sur le fichier
 * @returns {Object} - Résultat de l'upload
 */
const uploadFile = async (fileBuffer, fileInfo) => {
  try {
    // S'assurer que le stockage est initialisé
    await initStorage();
    
    // Valider le fichier
    const validation = validateFile(fileInfo);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // Générer un nom de fichier unique pour éviter les collisions
    const fileExt = path.extname(fileInfo.originalname);
    const uniqueId = crypto.randomUUID();
    const fileName = `${uniqueId}-${fileInfo.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = `templates/${fileName}`;
    
    // Télécharger le fichier
    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: fileInfo.mimetype,
        cacheControl: '3600'
      });
    
    if (error) {
      console.error('Erreur lors de l\'upload du fichier:', error);
      return { success: false, error: error.message };
    }
    
    // Obtenir l'URL publique (si besoin)
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    return {
      success: true,
      fileName,
      filePath,
      publicUrl,
      originalName: fileInfo.originalname,
      size: fileInfo.size,
      mimeType: fileInfo.mimetype
    };
  } catch (error) {
    console.error('Erreur lors de l\'upload du fichier:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Supprime un fichier du stockage
 * @param {string} filePath - Chemin du fichier à supprimer
 * @returns {Object} - Résultat de la suppression
 */
const deleteFile = async (filePath) => {
  try {
    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    
    if (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Obtient l'URL temporaire d'un fichier (valide pendant une durée limitée)
 * @param {string} filePath - Chemin du fichier
 * @param {number} expiresIn - Durée de validité en secondes (défaut: 60min)
 * @returns {Object} - URL temporaire
 */
const getSignedUrl = async (filePath, expiresIn = 3600) => {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn);
    
    if (error) {
      console.error('Erreur lors de la création de l\'URL signée:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, signedUrl: data.signedUrl };
  } catch (error) {
    console.error('Erreur lors de la création de l\'URL signée:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  initStorage,
  validateFile,
  uploadFile,
  deleteFile,
  getSignedUrl,
  BUCKET_NAME,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS
};
