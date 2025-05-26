/**
 * Service responsable de la gestion des exports de documents
 * Respecte le principe de responsabilité unique (SRP)
 */
const fs = require('fs');
const path = require('path');
const { Export } = require('../models');
const { logger } = require('./logger');

class ExportService {
  /**
   * Enregistre un export dans la base de données
   * @param {number} userId - ID de l'utilisateur
   * @param {number} templateId - ID du template
   * @param {string} filePath - Chemin relatif du fichier
   * @param {string} fileName - Nom du fichier
   * @param {number} fileSize - Taille du fichier en octets
   * @param {string} format - Format du fichier (pdf, pptx)
   * @returns {Promise<Object>} - L'enregistrement d'export créé
   */
  async saveExport(userId, templateId, filePath, fileName, fileSize, format) {
    try {
      const exportRecord = await Export.create({
        user_id: userId,
        template_id: templateId,
        file_path: filePath,
        file_name: fileName,
        file_size: fileSize,
        format: format,
        export_date: new Date(),
        status: 'success'
      });
      
      logger.info(`Export enregistré avec succès: ${fileName} (ID: ${exportRecord.id})`);
      return exportRecord;
    } catch (error) {
      logger.error('Erreur lors de l\'enregistrement de l\'export:', error);
      throw new Error(`Impossible d'enregistrer l'export: ${error.message}`);
    }
  }

  /**
   * Crée le dossier de sortie s'il n'existe pas
   * @param {string} outputDir - Chemin du dossier de sortie
   * @returns {Promise<void>}
   */
  async ensureOutputDirectory(outputDir) {
    try {
      if (!fs.existsSync(outputDir)) {
        logger.info(`Création du dossier de sortie: ${outputDir}`);
        fs.mkdirSync(outputDir, { recursive: true });
      }
    } catch (error) {
      logger.error('Erreur lors de la création du dossier de sortie:', error);
      throw new Error(`Impossible de créer le dossier de sortie: ${error.message}`);
    }
  }

  /**
   * Calcule la taille d'un fichier
   * @param {string} filePath - Chemin absolu du fichier
   * @returns {number} - Taille du fichier en octets
   */
  getFileSize(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (error) {
      logger.error(`Erreur lors du calcul de la taille du fichier ${filePath}:`, error);
      return 0;
    }
  }

  /**
   * Supprime un export si nécessaire
   * @param {number} exportId - ID de l'export à supprimer
   * @returns {Promise<boolean>} - Vrai si la suppression a réussi
   */
  async deleteExport(exportId) {
    try {
      const exportRecord = await Export.findByPk(exportId);
      
      if (!exportRecord) {
        logger.warn(`Export non trouvé: ${exportId}`);
        return false;
      }
      
      // Supprimer le fichier
      if (exportRecord.file_path) {
        const filePath = path.join(__dirname, '..', exportRecord.file_path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          logger.info(`Fichier supprimé: ${filePath}`);
        }
      }
      
      // Supprimer l'enregistrement
      await exportRecord.destroy();
      logger.info(`Export supprimé: ${exportId}`);
      
      return true;
    } catch (error) {
      logger.error(`Erreur lors de la suppression de l'export ${exportId}:`, error);
      return false;
    }
  }
}

module.exports = ExportService;
