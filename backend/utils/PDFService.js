/**
 * Service responsable de la génération de documents PDF
 * Respecte le principe de responsabilité unique (SRP)
 */
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { logger } = require('./logger');

// Facteurs de conversion pour les coordonnées
const SLIDE_WIDTH_PIXELS = 960;  // Largeur standard de l'affichage des diapositives dans l'interface
const SLIDE_HEIGHT_PIXELS = 540; // Hauteur standard de l'affichage des diapositives dans l'interface

class PDFService {
  /**
   * Génère un document PDF à partir des données du template
   * @param {Array} slides - Liste des diapositives
   * @param {Array} fields - Liste des champs
   * @param {Object} values - Valeurs des champs
   * @param {string} outputPath - Chemin de sortie du fichier
   * @returns {Promise<void>}
   */
  async generatePDF(slides, fields, values, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        // Création d'un nouveau document PDF
        const doc = new PDFDocument({ autoFirstPage: false });
        const writeStream = fs.createWriteStream(outputPath);
        
        // Pipe le PDF vers le fichier
        doc.pipe(writeStream);
        
        // Tri des diapositives par index
        const sortedSlides = [...slides].sort((a, b) => a.slide_index - b.slide_index);
        
        // Génération de chaque diapositive
        for (const slide of sortedSlides) {
          this.generatePDFPage(doc, slide, fields, values);
        }
        
        // Finalisation du PDF
        doc.end();
        
        writeStream.on('finish', () => {
          logger.info(`Document PDF généré avec succès: ${outputPath}`);
          resolve();
        });
        
        writeStream.on('error', (error) => {
          logger.error(`Erreur lors de l'écriture du fichier PDF ${outputPath}:`, error);
          reject(new Error(`Impossible d'écrire le fichier PDF: ${error.message}`));
        });
      } catch (error) {
        logger.error('Erreur lors de la génération du document PDF:', error);
        reject(new Error(`Impossible de générer le document PDF: ${error.message}`));
      }
    });
  }

  /**
   * Génère une page PDF pour une diapositive
   * @param {Object} doc - Document PDF
   * @param {Object} slide - Données de la diapositive
   * @param {Array} fields - Liste des champs
   * @param {Object} values - Valeurs des champs
   */
  generatePDFPage(doc, slide, fields, values) {
    try {
      // Ajouter une nouvelle page pour chaque diapositive
      doc.addPage();
      
      // Ajouter l'image de fond
      this.applyBackground(doc, slide);
      
      // Ajouter les champs pour cette diapositive
      const slideFields = fields.filter(field => field.slide_index === slide.slide_index);
      this.addFields(doc, slideFields, values);
    } catch (error) {
      logger.error(`Erreur lors de la génération de la page PDF pour la diapositive ${slide.slide_index}:`, error);
      // Continuer avec les autres diapositives
    }
  }

  /**
   * Applique l'image d'arrière-plan à une page PDF
   * @param {Object} doc - Document PDF
   * @param {Object} slide - Données de la diapositive
   */
  applyBackground(doc, slide) {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const imagePath = path.join(__dirname, '..', slide.image_path);
      if (fs.existsSync(imagePath)) {
        doc.image(imagePath, 0, 0, { width: doc.page.width, height: doc.page.height });
      } else {
        logger.warn(`L'image de fond n'existe pas: ${imagePath}`);
      }
    } catch (error) {
      logger.error('Erreur lors de l\'application de l\'image de fond:', error);
    }
  }

  /**
   * Ajoute des champs à une page PDF
   * @param {Object} doc - Document PDF
   * @param {Array} fields - Liste des champs
   * @param {Object} values - Valeurs des champs
   */
  addFields(doc, fields, values) {
    // Facteur de mise à l'échelle pour convertir les pixels en points PDF
    const scaleX = doc.page.width / SLIDE_WIDTH_PIXELS;
    const scaleY = doc.page.height / SLIDE_HEIGHT_PIXELS;
    
    for (const field of fields) {
      try {
        // Sécuriser l'accès aux valeurs
        const value = values && values[field.name] !== undefined ? values[field.name] : (field.default_value || '');
        
        // Convertir les coordonnées de pixels vers points PDF
        const pdfX = field.position_x * scaleX;
        const pdfY = field.position_y * scaleY;
        const pdfWidth = (field.width || 300) * scaleX;
        const pdfHeight = (field.height || 100) * scaleY;
        
        switch (field.type) {
          case 'text':
          case 'date':
            this.addTextField(doc, value, pdfX, pdfY, pdfWidth, pdfHeight);
            break;
          case 'checkbox':
            this.addCheckboxField(doc, value, pdfX, pdfY);
            break;
          // Note: Les champs image dans PDF nécessiteraient un traitement plus complexe
          default:
            logger.warn(`Type de champ non supporté dans PDF: ${field.type}`);
        }
      } catch (error) {
        logger.error(`Erreur lors de l'ajout du champ ${field.name} au PDF:`, error);
        // Continuer avec les autres champs
      }
    }
  }

  /**
   * Ajoute un champ texte à une page PDF
   * @param {Object} doc - Document PDF
   * @param {string} value - Valeur du champ
   * @param {number} x - Position X en points PDF
   * @param {number} y - Position Y en points PDF
   * @param {number} width - Largeur en points PDF
   * @param {number} height - Hauteur en points PDF
   */
  addTextField(doc, value, x, y, width, height) {
    doc.fontSize(14)
       .fillColor('black')
       .text(value, x, y, {
         width: width,
         height: height
       });
  }

  /**
   * Ajoute un champ case à cocher à une page PDF
   * @param {Object} doc - Document PDF
   * @param {boolean|string} value - Valeur du champ
   * @param {number} x - Position X en points PDF
   * @param {number} y - Position Y en points PDF
   */
  addCheckboxField(doc, value, x, y) {
    if (value === true || value === 'true' || value === '1') {
      doc.fontSize(14)
         .fillColor('black')
         .text('✓', x, y);
    }
  }
}

module.exports = PDFService;
