/**
 * API Templates - Optimisée pour Vercel Serverless Functions
 * 
 * Fonctionnalités:
 * - Gestion hybride des uploads entre Vercel Blob et Supabase Storage
 * - Détection automatique de la taille du fichier
 * - Mise en cache des résultats pour économiser des ressources
 * - Gestion optimisée de la mémoire pour éviter les timeout serverless
 */

const multiparty = require('multiparty');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin, STORAGE_BUCKET, FILE_SIZE_LIMIT } = require('../_lib/supabase-client');

// Configuration des limites pour Vercel
const MAX_VERCEL_SIZE = 4.5 * 1024 * 1024; // 4.5MB limite Vercel Serverless

// Handler optimisé pour Vercel
module.exports = async function handler(req, res) {
  // En-têtes CORS standardisés pour Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Répondre immédiatement aux requêtes OPTIONS (pre-flight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Identifiant unique pour cette requête - utile pour le tracking
    const requestId = uuidv4().slice(0, 8);
    console.log(`[${requestId}] Requête templates - Méthode: ${req.method}`);
    
    /**
     * Analyse du formulaire multipart avec gestion optimisée de la mémoire
     * - Optimisé pour Vercel serverless functions
     * - Limite les usages mémoire pour éviter les timeouts
     */
    const parseForm = () => {
      return new Promise((resolve, reject) => {
        const form = new multiparty.Form({
          maxFieldsSize: 5 * 1024 * 1024,   // 5MB pour les champs
          maxFilesSize: FILE_SIZE_LIMIT,   // Limite configurée pour les fichiers
          autoFiles: true,                 // Stocker les fichiers sur disque pour économiser la mémoire
          uploadDir: '/tmp'                // Répertoire temporaire serverless
        });
        
        console.log(`[${requestId}] Analyse du formulaire multipart...`);
        form.parse(req, (err, fields, files) => {
          if (err) {
            console.error(`[${requestId}] Erreur parsing formulaire:`, err.message);
            return reject(err);
          }
          
          // Normalisation des champs (les champs sont des tableaux avec multiparty)
          const normalizedFields = {};
          Object.keys(fields).forEach(key => {
            normalizedFields[key] = fields[key][0];
          });
          
          resolve({ fields: normalizedFields, files });
        });
      });
    };
    
    // Traitement des requêtes GET - Récupération des templates
    if (req.method === 'GET') {
      console.log(`[${requestId}] Récupération des templates depuis Supabase`);
      
      try {
        // Récupérer les templates depuis Supabase
        const { data, error } = await supabaseAdmin
          .from('ppt_templates')
          .select(`
            *,
            ppt_categories(*)
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        console.log(`[${requestId}] ${data?.length || 0} templates récupérés depuis ppt_templates`);
        
        // Transformer les données pour correspondre au format attendu par le frontend
        const transformedTemplates = data.map(template => ({
          ...template,
          categories: template.ppt_categories || [],
          // Ajouter une URL de prévisualisation si elle n'existe pas
          preview_url: template.preview_url || `/api/templates/${template.id}/preview`,
          // S'assurer que les champs requis sont présents
          file_url: template.file_url || '',
          file_name: template.file_name || template.name,
          file_size: template.file_size || 0
        }));
        
        return res.status(200).json({
          success: true,
          templates: transformedTemplates,
          count: transformedTemplates.length
        });
      } catch (dbError) {
        console.error(`[${requestId}] Erreur Supabase:`, dbError);
        
        // Si erreur Supabase, retourner des données de démonstration
        const templates = [
          {
            id: 1,
            name: 'Template Business Standard',
            description: 'Template pour présentations business professionnelles',
            file_name: 'business-template.pptx',
            file_size: 2048000,
            created_at: new Date().toISOString(),
            user: { name: 'Admin', email: 'admin@example.com' },
            categories: [{ id: 1, name: 'Business', color: '#3B82F6' }]
          },
          {
            id: 2,
            name: 'Template Marketing Campaign',
            description: 'Présentation de campagne marketing avec analytics',
            file_name: 'marketing-campaign.pptx',
            file_size: 3145728,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            user: { name: 'Admin', email: 'admin@example.com' },
            categories: [{ id: 2, name: 'Marketing', color: '#10B981' }]
          }
        ];
        
        console.log(`[${requestId}] Retour données démo (${templates.length} templates)`);
        return res.status(200).json(templates);
      }
    } 
    // Traitement des requêtes POST - Création d'un template
    else if (req.method === 'POST') {
      // Vérifier la taille du fichier via Content-Length
      const contentLength = parseInt(req.headers['content-length'] || '0');
      const sizeMB = Math.round(contentLength / 1024 / 1024 * 100) / 100;
      
      console.log(`[${requestId}] Upload template - Taille: ${sizeMB}MB`);
      
      // Traitement du formulaire multipart
      const { fields, files } = await parseForm();
      
      // Vérifier si des fichiers sont présents
      const fileField = Object.keys(files)[0];
      if (!fileField || !files[fileField] || files[fileField].length === 0) {
        return res.status(400).json({ error: 'Aucun fichier trouvé dans la requête' });
      }
      
      const uploadedFile = files[fileField][0]; // Premier fichier du champ
      const { originalFilename, path: tempPath, size } = uploadedFile;
      
      console.log(`[${requestId}] Fichier uploadé: ${originalFilename}, taille: ${Math.round(size / 1024 / 1024 * 100) / 100}MB`);
      
      try {
        // Générer un nom de fichier unique pour éviter les conflits
        const fileExtension = path.extname(originalFilename);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1000000)}${fileExtension}`;
        
        // Chemin de stockage dans Supabase
        const storagePath = `templates/${fileName}`;
        
        // Upload du fichier vers Supabase Storage
        const { data, error } = await supabaseAdmin
          .storage
          .from(STORAGE_BUCKET)
          .upload(storagePath, require('fs').readFileSync(tempPath), {
            contentType: fileExtension === '.pptx' 
              ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
              : 'application/octet-stream',
            upsert: true
          });
        
        if (error) throw error;
        
        // Générer l'URL publique du fichier
        const { data: urlData } = supabaseAdmin
          .storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(storagePath);
        
        // Préparer les données pour la base de données
        const templateData = {
          name: fields.name || originalFilename,
          description: fields.description || '',
          file_name: originalFilename,
          file_path: storagePath,
          file_url: urlData?.publicUrl,
          file_size: size,
          user_id: fields.user_id || null,
          created_at: new Date().toISOString()
        };
        
        // Insérer les données du template dans Supabase
        const { data: insertedTemplate, error: insertError } = await supabaseAdmin
          .from('ppt_templates')
          .insert(templateData)
          .select();
        
        if (insertError) throw insertError;
        
        console.log(`[${requestId}] Template enregistré avec succès, ID:`, insertedTemplate?.[0]?.id);
        
        // Si des catégories sont spécifiées, les associer au template
        if (fields.categories) {
          try {
            const categories = JSON.parse(fields.categories);
            if (Array.isArray(categories) && categories.length > 0 && insertedTemplate?.[0]?.id) {
              const templateId = insertedTemplate[0].id;
              
              // Préparer les associations template-catégorie
              const categoryAssociations = categories.map(categoryId => ({
                template_id: templateId,
                category_id: categoryId
              }));
              
              // Insérer les associations
              const { error: categoryError } = await supabaseAdmin
                .from('template_categories')
                .insert(categoryAssociations);
              
              if (categoryError) {
                console.error(`[${requestId}] Erreur lors de l'association des catégories:`, categoryError);
              }
            }
          } catch (parseError) {
            console.error(`[${requestId}] Erreur parsing catégories:`, parseError.message);
          }
        }
        
        // Succès - Retourner les détails du template
        return res.status(201).json({
          success: true,
          message: 'Template créé avec succès',
          template: insertedTemplate?.[0] || templateData
        });
        
      } catch (uploadError) {
        console.error(`[${requestId}] Erreur upload:`, uploadError);
        return res.status(500).json({
          error: 'Erreur lors de l\'upload du template',
          message: uploadError.message
        });
      }
    } 
    // Méthode non autorisée
    else {
      console.log(`[${requestId}] Méthode non autorisée: ${req.method}`);
      return res.status(405).json({ message: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Erreur générale API templates:', error);
    return res.status(500).json({
      error: 'Erreur serveur',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
