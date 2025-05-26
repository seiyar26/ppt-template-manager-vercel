// Gestionnaire de fichiers statiques optimisé pour Vercel
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const STORAGE_BUCKET = 'ppt-templates';

/**
 * Fonction serverless Vercel pour servir les fichiers depuis Supabase Storage
 * Compatible avec l'architecture serverless de Vercel
 */
module.exports = async (req, res) => {
  // CORS headers pour permettre l'accès aux ressources
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  // Répondre immédiatement aux requêtes OPTIONS (pre-flight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Vérifier que la méthode est GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }
  
  try {
    // Récupérer le chemin du fichier depuis les query params
    const filePath = req.query.path;
    
    if (!filePath) {
      return res.status(400).json({ message: 'Chemin de fichier manquant' });
    }
    
    console.log(`[Vercel] Demande de fichier: ${filePath}`);
    
    // Déterminer le type MIME en fonction de l'extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream'; // Par défaut
    
    switch (ext) {
      case '.pptx':
        contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        break;
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
    }
    
    // Récupérer le fichier depuis Supabase Storage
    const { data, error } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .download(filePath);
      
    if (error) {
      console.error(`[Vercel] Erreur récupération fichier Supabase: ${error.message}`);
      
      // Si le fichier n'existe pas dans Supabase, on envoie une erreur 404
      return res.status(404).json({ 
        message: 'Fichier non trouvé',
        error: error.message
      });
    }
    
    // Conversion du fichier en Buffer
    const buffer = await data.arrayBuffer();
    
    // Définir les en-têtes de réponse pour le téléchargement
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache de 24h
    
    // Envoyer le fichier au client
    res.status(200).send(Buffer.from(buffer));
    
  } catch (error) {
    console.error(`[Vercel] Erreur lors du traitement du fichier: ${error.message}`);
    res.status(500).json({ 
      message: 'Erreur lors du traitement du fichier',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
};
