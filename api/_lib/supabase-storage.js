// Service optimisé pour l'upload de fichiers PowerPoint vers Supabase Storage
const fs = require('fs');
const path = require('path');
const { supabaseAdmin, BUCKET_NAME, setupSupabase } = require('./supabase-setup');

// Types MIME supportés pour les fichiers PowerPoint
const SUPPORTED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/vnd.ms-powerpoint' // .ppt (ancien format)
];

// Taille maximale de fichier (100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

/**
 * Vérifie que le bucket existe et le crée si nécessaire
 * @returns {Promise<boolean>} - true si le bucket est prêt
 */
async function ensureBucketExists() {
  try {
    // Vérifier si le bucket existe
    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
    
    if (error) {
      console.error('Erreur lors de la vérification des buckets:', error);
      return false;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      console.log(`Création du bucket "${BUCKET_NAME}"...`);
      
      // Créer le bucket avec une limite de 100MB par fichier
      const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: SUPPORTED_MIME_TYPES
      });
      
      if (createError) {
        console.error(`Erreur lors de la création du bucket "${BUCKET_NAME}":`, createError);
        return false;
      }
      
      console.log(`Bucket "${BUCKET_NAME}" créé avec succès`);
    } else {
      console.log(`Bucket "${BUCKET_NAME}" existant`);
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification/création du bucket:', error);
    return false;
  }
}

/**
 * Valide un fichier PowerPoint
 * @param {Object} file - Objet représentant le fichier
 * @returns {Object} - Résultat de validation {valid: boolean, message: string}
 */
function validateFile(file) {
  // Vérifier si le fichier existe
  if (!file) {
    return { valid: false, message: 'Aucun fichier fourni' };
  }
  
  // Vérifier la taille du fichier
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      message: `Le fichier est trop volumineux (${Math.round(file.size / 1024 / 1024 * 100) / 100}MB). Maximum: ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }
  
  // Vérifier l'extension du fichier
  const fileName = file.originalFilename || file.name || '';
  if (!fileName) {
    return { 
      valid: false, 
      message: 'Nom de fichier manquant' 
    };
  }
  
  const extension = path.extname(fileName).toLowerCase();
  
  if (extension !== '.pptx' && extension !== '.ppt') {
    return { 
      valid: false, 
      message: 'Format de fichier non supporté. Seuls les fichiers PowerPoint (.pptx, .ppt) sont acceptés' 
    };
  }
  
  // Vérifier le type MIME si disponible
  if (file.headers && file.headers['content-type']) {
    const mimeType = file.headers['content-type'];
    if (!SUPPORTED_MIME_TYPES.includes(mimeType)) {
      console.warn(`Type MIME non reconnu: ${mimeType}, mais l'extension est valide. Accepté.`);
      // On continue malgré tout car l'extension est valide
    }
  }
  
  return { valid: true, message: 'Fichier valide' };
}

/**
 * Upload un fichier vers Supabase Storage
 * @param {Buffer|string} fileData - Contenu du fichier ou chemin
 * @param {Object} fileInfo - Informations sur le fichier
 * @returns {Promise<Object>} - Résultat de l'upload
 */
async function uploadFile(fileData, fileInfo) {
  try {
    // S'assurer que le bucket existe
    const bucketReady = await ensureBucketExists();
    if (!bucketReady) {
      return { 
        success: false, 
        error: 'Bucket non disponible. Veuillez réessayer plus tard.' 
      };
    }
    
    // Valider le fichier
    const validation = validateFile(fileInfo);
    if (!validation.valid) {
      return { success: false, error: validation.message };
    }
    
    // Préparer le contenu du fichier
    let fileBuffer;
    if (typeof fileData === 'string') {
      // Si fileData est un chemin de fichier
      fileBuffer = fs.readFileSync(fileData);
    } else {
      // Si fileData est déjà un Buffer
      fileBuffer = fileData;
    }
    
    // Générer un nom de fichier unique pour éviter les collisions
    const fileName = fileInfo.originalFilename || fileInfo.name;
    const uniqueFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = `templates/${uniqueFileName}`;
    
    // Déterminer le type MIME
    const contentType = fileInfo.mimetype || fileInfo.headers?.['content-type'] || 
                      'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    
    console.log(`Début de l'upload vers Supabase Storage: ${filePath} (${fileBuffer.length} octets)`);
    
    // Upload vers Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType,
        cacheControl: '3600'
      });
    
    if (error) {
      console.error('Erreur lors de l\'upload:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur lors de l\'upload du fichier' 
      };
    }
    
    // Récupérer l'URL publique
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    console.log('Upload réussi:', urlData.publicUrl);
    
    return {
      success: true,
      filePath,
      fileName: uniqueFileName,
      originalName: fileName,
      fileSize: fileBuffer.length,
      contentType,
      publicUrl: urlData.publicUrl
    };
  } catch (error) {
    console.error('Erreur imprévue lors de l\'upload:', error);
    return { 
      success: false, 
      error: error.message || 'Erreur imprévue lors de l\'upload' 
    };
  }
}

/**
 * Supprime un fichier de Supabase Storage
 * @param {string} filePath - Chemin du fichier à supprimer
 * @returns {Promise<Object>} - Résultat de la suppression
 */
async function deleteFile(filePath) {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    
    if (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erreur imprévue lors de la suppression:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Liste les fichiers dans un dossier
 * @param {string} folderPath - Chemin du dossier (optionnel)
 * @returns {Promise<Object>} - Liste des fichiers
 */
async function listFiles(folderPath = 'templates/') {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .list(folderPath);
    
    if (error) {
      console.error('Erreur lors de la récupération des fichiers:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, files: data };
  } catch (error) {
    console.error('Erreur imprévue lors du listage des fichiers:', error);
    return { success: false, error: error.message };
  }
}

// Initialiser Supabase au démarrage
setupSupabase()
  .then(result => {
    if (result) {
      console.log('🚀 Service de stockage Supabase initialisé avec succès');
    } else {
      console.error('⚠️ Impossible d\'initialiser le service de stockage Supabase');
    }
  })
  .catch(error => {
    console.error('❌ Erreur lors de l\'initialisation du service de stockage:', error);
  });

module.exports = {
  uploadFile,
  deleteFile,
  listFiles,
  ensureBucketExists,
  validateFile,
  BUCKET_NAME
};
