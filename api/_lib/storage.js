// Service de stockage utilisant Supabase Storage
const { uploadFile, deleteFile, getPublicUrl } = require('./supabase-storage');
const fs = require('fs');
const path = require('path');

// Configuration du stockage Supabase
class SupabaseStorage {
  constructor() {
    // Supabase est configuré via les variables d'environnement
    console.log(' Service de stockage Supabase initialisé');
  }

  // Upload un fichier vers Supabase Storage
  async uploadFile(file, fileName, folder = '') {
    try {
      console.log(` Upload de ${fileName} vers Supabase Storage...`);
      
      let fileBuffer;
      let fileInfo;

      if (typeof file === 'string') {
        // Si c'est un chemin de fichier
        fileBuffer = fs.readFileSync(file);
        fileInfo = {
          originalFilename: fileName,
          name: fileName,
          size: fileBuffer.length,
          path: file
        };
      } else if (file.buffer) {
        // Si c'est un objet multer
        fileBuffer = file.buffer;
        fileInfo = {
          originalFilename: file.originalname || fileName,
          name: file.originalname || fileName,
          size: file.size,
          mimetype: file.mimetype,
          path: 'upload-buffer'
        };
      } else {
        // Si c'est directement un buffer
        fileBuffer = file;
        fileInfo = {
          originalFilename: fileName,
          name: fileName,
          size: fileBuffer.length,
          path: 'direct-buffer'
        };
      }

      // Utiliser le service Supabase
      const result = await uploadFile(fileBuffer, fileInfo);
      
      if (result.success) {
        console.log(` Upload réussi: ${result.publicUrl}`);
        return {
          url: result.publicUrl,
          filePath: result.filePath,
          fileName: result.fileName,
          size: result.fileSize
        };
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error(' Erreur lors de l\'upload:', error);
      throw error;
    }
  }

  // Supprimer un fichier de Supabase Storage
  async deleteFile(filePath) {
    try {
      console.log(` Suppression de ${filePath} de Supabase Storage...`);
      
      const result = await deleteFile(filePath);
      
      if (result.success) {
        console.log(` Fichier supprimé: ${filePath}`);
        return true;
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error(' Erreur lors de la suppression:', error);
      throw error;
    }
  }

  // Obtenir l'URL publique d'un fichier
  getPublicUrl(filePath) {
    return getPublicUrl(filePath);
  }

  // Upload un fichier local (pour développement/fallback)
  async uploadFileLocal(file, fileName, folder = '') {
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads', folder);
      
      // Créer le dossier s'il n'existe pas
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, fileName);
      
      let fileBuffer;
      if (typeof file === 'string') {
        fileBuffer = fs.readFileSync(file);
      } else if (file.buffer) {
        fileBuffer = file.buffer;
      } else {
        fileBuffer = file;
      }

      fs.writeFileSync(filePath, fileBuffer);
      
      const localUrl = `/uploads/${folder}/${fileName}`.replace('//', '/');
      console.log(` Fichier sauvé localement: ${localUrl}`);
      
      return {
        url: localUrl,
        filePath: localUrl,
        fileName: fileName,
        size: fileBuffer.length
      };

    } catch (error) {
      console.error(' Erreur lors du stockage local:', error);
      throw error;
    }
  }

  // Lister les fichiers (si nécessaire)
  async listFiles(folder = '') {
    try {
      // Pour Supabase, on peut implémenter ça plus tard si nécessaire
      console.log(' Listing des fichiers non implémenté pour Supabase Storage');
      return [];
    } catch (error) {
      console.error(' Erreur lors du listing:', error);
      throw error;
    }
  }
}

// Export de l'instance du service
const storage = new SupabaseStorage();

module.exports = storage;
module.exports.SupabaseStorage = SupabaseStorage;
