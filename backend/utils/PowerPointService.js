/**
 * Service responsable de la génération de documents PowerPoint
 * Respecte le principe de responsabilité unique (SRP)
 */
const PptxGenJS = require('pptxgenjs');
const fs = require('fs');
const path = require('path');
const { logger } = require('./logger');

// Facteurs de conversion pour les coordonnées
const SLIDE_WIDTH_PIXELS = 960;  // Largeur standard de l'affichage des diapositives dans l'interface
const SLIDE_HEIGHT_PIXELS = 540; // Hauteur standard de l'affichage des diapositives dans l'interface
const SLIDE_WIDTH_INCHES = 10;   // Largeur standard d'une diapositive PowerPoint en pouces
const SLIDE_HEIGHT_INCHES = 5.625; // Hauteur standard d'une diapositive PowerPoint en pouces

class PowerPointService {
  constructor() {
    this.pptx = new PptxGenJS();
  }

  /**
   * Convertit les coordonnées de pixels (interface) vers pouces (PowerPoint)
   * @param {number} pixelX - Position X en pixels
   * @param {number} pixelY - Position Y en pixels
   * @param {number} pixelWidth - Largeur en pixels (optionnel)
   * @param {number} pixelHeight - Hauteur en pixels (optionnel)
   * @returns {Object} - Coordonnées converties en pouces pour PowerPoint
   */
  convertToInches(pixelX, pixelY, pixelWidth = null, pixelHeight = null) {
    if (pixelX < 0 || pixelY < 0) {
      throw new Error('Les coordonnées ne peuvent pas être négatives');
    }
    
    // Conversion des coordonnées avec les ratios appropriés
    const inchX = (pixelX / SLIDE_WIDTH_PIXELS) * SLIDE_WIDTH_INCHES;
    const inchY = (pixelY / SLIDE_HEIGHT_PIXELS) * SLIDE_HEIGHT_INCHES;
    
    const result = { x: inchX, y: inchY };
    
    // Conversion des dimensions si fournies
    if (pixelWidth !== null) {
      result.w = (pixelWidth / SLIDE_WIDTH_PIXELS) * SLIDE_WIDTH_INCHES;
    }
    
    if (pixelHeight !== null) {
      result.h = (pixelHeight / SLIDE_HEIGHT_PIXELS) * SLIDE_HEIGHT_INCHES;
    }
    
    return result;
  }

  /**
   * Génère une diapositive PowerPoint
   * @param {Object} pptxSlide - Référence à la diapositive PowerPoint
   * @param {Object} slide - Données de la diapositive
   * @param {Array} fields - Liste des champs à ajouter
   * @param {Object} values - Valeurs des champs
   * @returns {Promise<Object>} - Diapositive complétée
   */
  async generateSlide(pptxSlide, slide, fields, values) {
    try {
      // Ajouter l'image de fond
      await this.applyBackground(pptxSlide, slide);
      
      // Ajouter les champs
      const slideFields = fields.filter(field => field.slide_index === slide.slide_index);
      await this.addFields(pptxSlide, slideFields, values);
      
      return pptxSlide;
    } catch (error) {
      logger.error(`Erreur lors de la génération de la diapositive ${slide.slide_index}:`, error);
      throw error;
    }
  }

  /**
   * Applique l'image d'arrière-plan à une diapositive
   * @param {Object} pptxSlide - Référence à la diapositive PowerPoint
   * @param {Object} slide - Données de la diapositive
   * @returns {Promise<void>}
   */
  async applyBackground(pptxSlide, slide) {
    try {
      const imagePath = path.join(__dirname, '..', slide.image_path);
      if (!fs.existsSync(imagePath)) {
        logger.warn(`L'image de fond n'existe pas: ${imagePath}`);
        // Continuer sans image de fond
        return;
      }
      
      pptxSlide.background = { path: imagePath };
    } catch (error) {
      logger.error('Erreur lors de l\'application de l\'image de fond:', error);
      // Continuer sans image de fond
    }
  }

  /**
   * Ajoute des champs à une diapositive
   * @param {Object} pptxSlide - Référence à la diapositive PowerPoint
   * @param {Array} fields - Liste des champs à ajouter
   * @param {Object} values - Valeurs des champs
   * @returns {Promise<void>}
   */
  async addFields(pptxSlide, fields, values) {
    for (const field of fields) {
      try {
        // Sécuriser l'accès aux valeurs
        const value = values && values[field.name] !== undefined ? values[field.name] : (field.default_value || '');
        
        // Convertir les coordonnées de pixels vers pouces
        const coords = this.convertToInches(
          field.position_x, 
          field.position_y, 
          field.width || 120, 
          field.height || 40
        );
        
        switch (field.type) {
          case 'text':
          case 'date':
            this.addTextField(pptxSlide, value, coords);
            break;
          case 'image':
            await this.addImageField(pptxSlide, value, coords);
            break;
          case 'checkbox':
            this.addCheckboxField(pptxSlide, value, coords);
            break;
          default:
            logger.warn(`Type de champ non supporté: ${field.type}`);
        }
      } catch (error) {
        logger.error(`Erreur lors de l'ajout du champ ${field.name}:`, error);
        // Continuer avec les autres champs
      }
    }
  }

  /**
   * Ajoute un champ texte à une diapositive
   * @param {Object} pptxSlide - Référence à la diapositive PowerPoint
   * @param {string} value - Valeur du champ
   * @param {Object} coords - Coordonnées en pouces
   */
  addTextField(pptxSlide, value, coords) {
    pptxSlide.addText(value, {
      x: coords.x,
      y: coords.y,
      w: coords.w,
      h: coords.h,
      fontSize: 14
    });
  }

  /**
   * Ajoute un champ image à une diapositive
   * @param {Object} pptxSlide - Référence à la diapositive PowerPoint
   * @param {string} value - Chemin de l'image
   * @param {Object} coords - Coordonnées en pouces
   * @returns {Promise<void>}
   */
  async addImageField(pptxSlide, value, coords) {
    if (!value) return;
    
    try {
      // Pour les champs d'image, vérifier si le chemin existe
      const imagePath = typeof value === 'string' && fs.existsSync(value) ? value : null;
      if (imagePath) {
        pptxSlide.addImage({
          path: imagePath,
          x: coords.x,
          y: coords.y,
          w: coords.w,
          h: coords.h
        });
      } else {
        logger.warn(`Image non trouvée ou chemin invalide: ${value}`);
      }
    } catch (error) {
      logger.error('Erreur lors de l\'ajout de l\'image à la diapositive:', error);
    }
  }

  /**
   * Ajoute un champ case à cocher à une diapositive
   * @param {Object} pptxSlide - Référence à la diapositive PowerPoint
   * @param {boolean|string} value - Valeur du champ
   * @param {Object} coords - Coordonnées en pouces
   */
  addCheckboxField(pptxSlide, value, coords) {
    if (value === true || value === 'true' || value === '1') {
      pptxSlide.addText('✓', {
        x: coords.x,
        y: coords.y,
        fontSize: 14
      });
    }
  }

  /**
   * Génère un document PowerPoint complet
   * @param {Array} slides - Liste des diapositives
   * @param {Array} fields - Liste des champs
   * @param {Object} values - Valeurs des champs
   * @param {string} outputPath - Chemin de sortie du fichier
   * @returns {Promise<void>}
   */
  async generatePowerPoint(slides, fields, values, outputPath) {
    try {
      // Tri des diapositives par index
      const sortedSlides = [...slides].sort((a, b) => a.slide_index - b.slide_index);
      
      // Génération de chaque diapositive
      for (const slide of sortedSlides) {
        const pptxSlide = this.pptx.addSlide();
        await this.generateSlide(pptxSlide, slide, fields, values);
      }
      
      // Sauvegarde du document
      await this.pptx.writeFile({ fileName: outputPath });
      
      logger.info(`Document PowerPoint généré avec succès: ${outputPath}`);
    } catch (error) {
      logger.error('Erreur lors de la génération du document PowerPoint:', error);
      throw new Error(`Impossible de générer le document PowerPoint: ${error.message}`);
    }
  }
}

module.exports = PowerPointService;
