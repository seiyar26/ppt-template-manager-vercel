const fs = require('fs');
const path = require('path');
const { Template, Slide, Field, Category, TemplateCategory } = require('../models');
const { convertPptxToImages } = require('../utils/pptxConverter');
const { generateDocument } = require('../utils/pptxGenerator');
const storageConfig = require('../utils/storageConfig');
const { Op } = require('sequelize');
const storageService = require('../utils/storageService');
const diagnosticLogger = require('../utils/diagnosticLogger');
const { uploadDiagnostic, runSystemDiagnostic } = require('../utils/diagnosticService');

// Exécuter le diagnostic du système au démarrage
runSystemDiagnostic().then(result => {
  console.log('Diagnostic système terminé:', 
    Object.keys(result.directories)
      .map(dir => `${dir}: ${result.directories[dir].exists ? 'existe' : 'n\'existe pas'}, ${result.directories[dir].writable ? 'accessible en écriture' : 'NON accessible en écriture'}`)
      .join('\n')
  );
});

/**
 * Get all templates for the current user
 * @route GET /api/templates
 */
const getTemplates = async (req, res) => {
  try {
    const { categoryId } = req.query;
    let whereClause = { user_id: req.user.id };
    let includeOptions = [
      {
        model: Slide,
        where: { slide_index: 0 },
        required: false,
        limit: 1
      },
      {
        model: Category,
        through: TemplateCategory,
        as: 'categories',
        required: false
      }
    ];
    
    // Si une catégorie est spécifiée, filtrer les templates de cette catégorie
    if (categoryId && categoryId !== 'null') {
      includeOptions = [
        {
          model: Slide,
          where: { slide_index: 0 },
          required: false,
          limit: 1
        },
        {
          model: Category,
          through: TemplateCategory,
          as: 'categories',
          where: { id: categoryId },
          required: true
        }
      ];
    }
    
    const templates = await Template.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      include: includeOptions
    });
    
    res.json({ templates });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get a template by ID
 * @route GET /api/templates/:id
 */
const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const template = await Template.findOne({
      where: { id, user_id: req.user.id },
      include: [
        {
          model: Slide,
          order: [['slide_index', 'ASC']]
        },
        {
          model: Field,
          order: [['slide_index', 'ASC'], ['id', 'ASC']]
        },
        {
          model: Category,
          through: TemplateCategory,
          as: 'categories'
        }
      ]
    });
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.json({ template });
  } catch (error) {
    console.error('Get template by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new template
 * @route POST /api/templates
 */
const createTemplate = async (req, res) => {
  try {
    // DEBUG INFO - UPLOAD
    console.log('\n====== DEBUG UPLOAD FICHIER PPTX ======');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('Fichier:', req.file);
    console.log('Session User:', req.user);
    
    // Vérification des répertoires
    const uploadTemp = path.join(__dirname, '../uploads/temp');
    const uploadTemplates = path.join(__dirname, '../uploads/templates');
    console.log('Répertoire temp existe:', fs.existsSync(uploadTemp));
    console.log('Répertoire templates existe:', fs.existsSync(uploadTemplates));
    if (req.file) {
      console.log('Chemin du fichier:', req.file.path);
      console.log('Fichier existe:', fs.existsSync(req.file.path));
      console.log('Permissions:', fs.statSync(req.file.path).mode.toString(8).slice(-3));
    }
    console.log('==============================\n');
    console.log('============== DÉBUT CRÉATION TEMPLATE ==============');
    console.log('Requête reçue pour création de template:', {
      body: req.body,
      file: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      } : 'Aucun fichier',
      headers: req.headers
    });
    
    // Journalisation du diagnostic détaillé
    diagnosticLogger.logUploadStart(req);
    
    const { name, description } = req.body;
    const userId = req.user.id;
    const file = req.file;
    
    console.log('Vérification du fichier:', file ? 'Fichier présent' : 'Fichier manquant');
    
    if (!file) {
      const erreur = 'Aucun fichier PPTX fourni';
      console.error(erreur);
      diagnosticLogger.logUploadError(new Error(erreur), req);
      return res.status(400).json({ message: erreur });
    }
    
    console.log('Fichier reçu:', file.originalname, file.mimetype, file.size, 'octets');
    
    // Vérification que le fichier existe physiquement
    const fileExists = fs.existsSync(file.path);
    console.log('Le fichier existe sur le disque:', fileExists ? 'Oui' : 'Non');
    if (!fileExists) {
      const erreur = 'Le fichier a été reçu mais n\'existe pas physiquement: ' + file.path;
      console.error(erreur);
      diagnosticLogger.logUploadError(new Error(erreur), req);
      return res.status(500).json({ message: 'Erreur lors du traitement du fichier' });
    }
    
    // Créer le template dans la base de données
    const template = await Template.create({
      name,
      description,
      user_id: userId,
      file_path: file.path,
      original_filename: file.originalname
    });
    
    console.log(`Template créé: ${template.id}`);
    
    // Télécharger le fichier PPTX vers Supabase - avec timeout et gestion d'erreurs améliorée
    const pptxDestPath = `templates/${userId}/${template.id}/${path.basename(file.path)}`;
    let supabaseUploadSuccess = false;
    
    try {
      // Ajouter un timeout pour l'upload Supabase (5 secondes max)
      const uploadPromise = storageService.uploadFile(file.path, pptxDestPath);
      
      // Créer une promesse de timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout lors de l\'upload vers Supabase')), 5000);
      });
      
      // Utiliser Promise.race pour implémenter le timeout
      const uploadResult = await Promise.race([uploadPromise, timeoutPromise])
        .catch(error => {
          console.warn(`Upload Supabase ignoré: ${error.message}`);
          return { success: false, error: error.message };
        });
      
      if (!uploadResult.success) {
        console.warn("L'upload vers Supabase a échoué ou a été ignoré:", uploadResult.error);
        // Continuer malgré l'erreur d'upload Supabase
      } else {
        // Mettre à jour le chemin du fichier dans la base de données
        await template.update({
          file_path: pptxDestPath,
          file_url: uploadResult.url
        });
        supabaseUploadSuccess = true;
      }
    } catch (uploadError) {
      // Journaliser l'erreur mais continuer le processus
      console.warn("Erreur lors de l'upload vers Supabase, le processus continue:", uploadError.message);
      diagnosticLogger.logUploadError(uploadError, req, 'supabase_upload');
      // Ne pas faire échouer le processus complet pour un problème Supabase
    }
    
    // Mettre à jour le template pour indiquer si l'upload Supabase a réussi
    await template.update({
      supabase_upload_success: supabaseUploadSuccess
    });
    
    // Convertir le PPTX en images - passage de l'ID du template
    console.log(`Conversion du PPTX en images pour le template ${template.id}...`);
    try {
      // Définir un timeout pour la conversion PPTX (60 secondes max)
      const conversionPromise = convertPptxToImages(file.path, template.id.toString());
      const conversionTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout lors de la conversion PPTX')), 60000);
      });
      
      // Utilisation de Promise.race pour implémenter le timeout
      const images = await Promise.race([conversionPromise, conversionTimeoutPromise])
        .catch(error => {
          console.error(`⚠️ Conversion PPTX échouée: ${error.message}`);
          diagnosticLogger.logConversionError(error, template.id);
          throw error; // Remonter l'erreur pour arrêter le processus
        });
      
      console.log(`✅ ${images.length} diapositives converties en images`);
      diagnosticLogger.logConversionSuccess(template.id, images.length);
      
      // Compteur pour savoir combien de diapositives ont été créées avec succès
      let successCount = 0;
      
      // Traiter les images par lots de 3 pour éviter de surcharger le serveur
      const processBatch = async (startIndex, batchSize) => {
        const endIndex = Math.min(startIndex + batchSize, images.length);
        const batchPromises = [];
        
        for (let i = startIndex; i < endIndex; i++) {
          batchPromises.push(processImage(images[i], i));
        }
        
        return Promise.allSettled(batchPromises);
      };
      
      // Traitement d'une image individuelle
      const processImage = async (image, i) => {
        try {
          // Vérification défensive de la structure de l'image
          if (!image || typeof image !== 'object') {
            console.error(`❌ Image invalide à l'index ${i}:`, image);
            return { success: false, error: 'Structure d\'image invalide' };
          }
          
          // Vérifier que le chemin de l'image existe
          const imagePath = image.path || '';
          if (!imagePath || !fs.existsSync(imagePath)) {
            console.error(`❌ Chemin d'image invalide à l'index ${i}:`, imagePath);
            return { success: false, error: 'Chemin d\'image invalide' };
          }
          
          // Définir les variables pour la base de données
          let finalImagePath = image.image_path; // Utiliser la propriété image_path fournie
          let imageUrl = '';
          
          // Télécharger l'image vers Supabase avec un timeout court (2 secondes max)
          try {
            const imageDestPath = `templates/${userId}/${template.id}/slides/slide_${i}.png`;
            
            const uploadImagePromise = storageService.uploadFile(imagePath, imageDestPath);
            const uploadImageTimeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Timeout d\'upload d\'image')), 2000);
            });
            
            const slideUploadResult = await Promise.race([uploadImagePromise, uploadImageTimeoutPromise])
              .catch(error => {
                console.warn(`Upload image ${i} ignoré: ${error.message}`);
                return { success: false, error: error.message };
              });
            
            if (slideUploadResult.success) {
              imageUrl = slideUploadResult.url;
              console.log(`✅ Image ${i} téléchargée vers Supabase`);
            } else {
              console.warn(`⚠️ Image ${i} non téléchargée vers Supabase:`, slideUploadResult.error);
            }
          } catch (uploadError) {
            console.warn(`⚠️ Erreur d'upload de l'image ${i}, mais le processus continue:`, uploadError.message);
          }
          
          // Obtenir les dimensions de l'image
          const width = image.width || 800; // Valeur par défaut
          const height = image.height || 600; // Valeur par défaut
          
          // Créer la diapositive dans la base de données
          try {
            await Slide.create({
              template_id: template.id,
              slide_index: i,
              image_path: finalImagePath, // Chemin local pour accès Express
              image_url: imageUrl,         // URL Supabase si disponible
              width: width,
              height: height,
              thumbnail_path: image.thumbnailPath || finalImagePath
            });
            console.log(`✅ Diapositive ${i} enregistrée en base de données`);
            successCount++;
            return { success: true, slide_index: i };
          } catch (dbError) {
            console.error(`❌ Erreur d'enregistrement de la diapositive ${i}:`, dbError.message);
            return { success: false, error: dbError.message, slide_index: i };
          }
        } catch (processError) {
          console.error(`❌ Erreur de traitement de l'image ${i}:`, processError.message);
          return { success: false, error: processError.message, slide_index: i };
        }
      };
      
      // Traitement par lots avec une taille de lot de 3
      const batchSize = 3;
      for (let startIdx = 0; startIdx < images.length; startIdx += batchSize) {
        await processBatch(startIdx, batchSize);
      }
      
      console.log(`✅ Traitement terminé: ${successCount}/${images.length} diapositives créées avec succès`);
      
      // Mettre à jour le template avec le nombre de diapositives
      await template.update({
        slide_count: successCount
      });
      
      console.log(`Traitement des images terminé pour le template ${template.id}`);
      diagnosticLogger.logSuccess(`Template ${template.id} créé avec succès, ${images.length} diapositives`);
    } catch (conversionError) {
      console.error('Erreur lors de la conversion du PPTX en images:', conversionError);
      // On continue même en cas d'erreur de conversion pour ne pas bloquer la création du template
    }
    
    // Récupérer le template complet avec les diapositives
    const createdTemplate = await Template.findOne({
      where: { id: template.id },
      include: [
        {
          model: Slide,
          order: [['slide_index', 'ASC']]
        }
      ]
    });
    
    res.status(201).json({ 
      message: 'Template créé avec succès',
      template: createdTemplate
    });
  } catch (error) {
    console.error('Erreur lors de la création du template:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * Update a template
 * @route PUT /api/templates/:id
 */
const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Find the template
    const template = await Template.findOne({
      where: { id, user_id: req.user.id }
    });
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Update the template
    await template.update({
      name: name || template.name,
      description: description || template.description
    });
    
    res.json({
      message: 'Template updated successfully',
      template
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ message: 'Server error during template update' });
  }
};

/**
 * Delete a template
 * @route DELETE /api/templates/:id
 */
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si le template existe et appartient à l'utilisateur
    const template = await Template.findOne({
      where: { id, user_id: req.user.id },
      include: [Slide, Field]
    });
    
    if (!template) {
      return res.status(404).json({ message: 'Template non trouvé' });
    }
    
    // Supprimer les fichiers du storage Supabase
    try {
      // Supprimer le fichier PPTX
      if (template.file_path && template.file_path.startsWith('templates/')) {
        await storageService.deleteFile(template.file_path);
      }
      
      // Supprimer les images des diapositives
      if (template.Slides && template.Slides.length > 0) {
        for (const slide of template.Slides) {
          if (slide.image_path && slide.image_path.startsWith('templates/')) {
            await storageService.deleteFile(slide.image_path);
          }
        }
      }
    } catch (storageError) {
      console.error('Erreur lors de la suppression des fichiers dans Supabase:', storageError);
      // Continuer malgré l'erreur de stockage
    }
    
    // Supprimer les fichiers locaux s'ils existent encore
    try {
      // Supprimer le fichier original s'il existe localement
      if (template.file_path && fs.existsSync(template.file_path) && !template.file_path.startsWith('templates/')) {
        fs.unlinkSync(template.file_path);
      }
      
      // Supprimer les images locales des diapositives
      if (template.Slides) {
        for (const slide of template.Slides) {
          if (slide.image_path && fs.existsSync(slide.image_path) && !slide.image_path.startsWith('templates/')) {
            fs.unlinkSync(slide.image_path);
          }
          
          if (slide.thumbnail_path && fs.existsSync(slide.thumbnail_path)) {
            fs.unlinkSync(slide.thumbnail_path);
          }
        }
      }
    } catch (fileError) {
      console.error('Erreur lors de la suppression des fichiers locaux:', fileError);
      // Continuer malgré l'erreur de fichier
    }
    
    // Supprimer les associations aux catégories
    await TemplateCategory.destroy({
      where: { template_id: id }
    });
    
    // Supprimer les diapositives et champs
    await Slide.destroy({ where: { template_id: id } });
    await Field.destroy({ where: { template_id: id } });
    
    // Supprimer le template lui-même
    await template.destroy();
    
    res.json({ message: 'Template supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du template:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * Add a field to a template
 * @route POST /api/templates/:id/fields
 */
const addField = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, label, type, default_value, slide_index, position_x, position_y, width, height } = req.body;
    
    // Find the template
    const template = await Template.findOne({
      where: { id, user_id: req.user.id }
    });
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Create the field
    const field = await Field.create({
      template_id: id,
      name,
      label: label || name,
      type: type || 'text',
      default_value: default_value || '',
      slide_index,
      position_x,
      position_y,
      width: width || null,
      height: height || null
    });
    
    res.status(201).json({
      message: 'Field added successfully',
      field
    });
  } catch (error) {
    console.error('Add field error:', error);
    res.status(500).json({ message: 'Server error during field creation' });
  }
};

/**
 * Update a field
 * @route PUT /api/templates/:id/fields/:fieldId
 */
const updateField = async (req, res) => {
  try {
    const { id, fieldId } = req.params;
    const { name, label, type, default_value, slide_index, position_x, position_y, width, height } = req.body;
    
    // Find the template
    const template = await Template.findOne({
      where: { id, user_id: req.user.id }
    });
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Find the field
    const field = await Field.findOne({
      where: { id: fieldId, template_id: id }
    });
    
    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }
    
    // Update the field
    await field.update({
      name: name || field.name,
      label: label || field.label,
      type: type || field.type,
      default_value: default_value !== undefined ? default_value : field.default_value,
      slide_index: slide_index !== undefined ? slide_index : field.slide_index,
      position_x: position_x !== undefined ? position_x : field.position_x,
      position_y: position_y !== undefined ? position_y : field.position_y,
      width: width !== undefined ? width : field.width,
      height: height !== undefined ? height : field.height
    });
    
    res.json({
      message: 'Field updated successfully',
      field
    });
  } catch (error) {
    console.error('Update field error:', error);
    res.status(500).json({ message: 'Server error during field update' });
  }
};

/**
 * Delete a field
 * @route DELETE /api/templates/:id/fields/:fieldId
 */
const deleteField = async (req, res) => {
  try {
    const { id, fieldId } = req.params;
    
    // Find the template
    const template = await Template.findOne({
      where: { id, user_id: req.user.id }
    });
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Find the field
    const field = await Field.findOne({
      where: { id: fieldId, template_id: id }
    });
    
    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }
    
    // Delete the field
    await field.destroy();
    
    res.json({ message: 'Field deleted successfully' });
  } catch (error) {
    console.error('Delete field error:', error);
    res.status(500).json({ message: 'Server error during field deletion' });
  }
};

/**
 * Generate a document from a template
 * @route POST /api/templates/:id/generate
 */
const generateTemplateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { values, format } = req.body;
    
    // Find the template with slides and fields
    const template = await Template.findOne({
      where: { id, user_id: req.user.id },
      include: [
        { model: Slide, order: [['slide_index', 'ASC']] },
        { model: Field, order: [['slide_index', 'ASC'], ['id', 'ASC']] }
      ]
    });
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Generate the document
    const filePath = await generateDocument(
      template,
      template.Slides,
      template.Fields,
      values,
      format || 'pdf',
      req.user.id
    );
    
    res.json({
      message: 'Document generated successfully',
      filePath
    });
  } catch (error) {
    console.error('Generate document error:', error);
    res.status(500).json({ message: 'Server error during document generation' });
  }
};

/**
 * Associer un template à une catégorie
 * @route POST /api/templates/:id/categories
 */
const addTemplateToCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId } = req.body;
    
    // Vérifier si le template existe et appartient à l'utilisateur
    const template = await Template.findOne({
      where: { id, user_id: req.user.id }
    });
    
    if (!template) {
      return res.status(404).json({ message: 'Modèle non trouvé' });
    }
    
    // Vérifier si la catégorie existe
    const category = await Category.findOne({
      where: { id: categoryId }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    
    // Vérifier si l'association existe déjà
    const existingAssociation = await TemplateCategory.findOne({
      where: { template_id: id, category_id: categoryId }
    });
    
    // S'il n'y a pas d'association, la créer
    if (!existingAssociation) {
      await TemplateCategory.create({
        template_id: id,
        category_id: categoryId
      });
      
      // Récupérer le template avec ses catégories pour le retourner
      const updatedTemplate = await Template.findOne({
        where: { id },
        include: [{
          model: Category,
          through: TemplateCategory,
          as: 'categories'
        }]
      });
      
      res.status(200).json({ 
        message: 'Modèle ajouté à la catégorie avec succès',
        template: updatedTemplate
      });
    } else {
      // Si l'association existe déjà, simplement renvoyer un succès
      res.status(200).json({ message: 'Le modèle est déjà dans cette catégorie' });
    }
  } catch (error) {
    console.error('Add template to category error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * Retirer un template d'une catégorie
 * @route DELETE /api/templates/:id/categories/:categoryId
 */
const removeTemplateFromCategory = async (req, res) => {
  try {
    const { id, categoryId } = req.params;
    
    // Vérifier si le template existe et appartient à l'utilisateur
    const template = await Template.findOne({
      where: { id, user_id: req.user.id }
    });
    
    if (!template) {
      return res.status(404).json({ message: 'Modèle non trouvé' });
    }
    
    // Supprimer l'association
    const deleted = await TemplateCategory.destroy({
      where: { template_id: id, category_id: categoryId }
    });
    
    if (deleted) {
      res.status(200).json({ message: 'Modèle retiré de la catégorie avec succès' });
    } else {
      res.status(404).json({ message: 'Association non trouvée' });
    }
  } catch (error) {
    console.error('Remove template from category error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  addField,
  updateField,
  deleteField,
  generateTemplateDocument,
  addTemplateToCategory,
  removeTemplateFromCategory
};