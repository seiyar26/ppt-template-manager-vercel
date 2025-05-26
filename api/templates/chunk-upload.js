// API pour gérer l'upload des fichiers PowerPoint volumineux en morceaux
// Solution pour contourner la limite de 4.5MB de Vercel

const jwt = require('jsonwebtoken');

// Stocker temporairement les morceaux en mémoire (en production, utiliser Vercel Blob Storage)
const chunkStorage = {};

module.exports = async function handler(req, res) {
  // Gérer CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-File-Id, X-Chunk-Index, X-Total-Chunks, X-File-Name');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Vérifier l'authentification
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Non autorisé',
        message: 'Authentification requise'
      });
    }

    const token = authHeader.split(' ')[1];
    try {
      const secret = process.env.JWT_SECRET || 'ppt_template_manager_secret_key_vercel';
      jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({ 
        error: 'Token invalide',
        message: 'Session expirée ou token invalide'
      });
    }

    if (req.method === 'POST') {
      // Récupérer les informations sur le chunk
      const fileId = req.headers['x-file-id'];
      const chunkIndex = parseInt(req.headers['x-chunk-index']);
      const totalChunks = parseInt(req.headers['x-total-chunks']);
      const fileName = req.headers['x-file-name'];

      if (!fileId || isNaN(chunkIndex) || isNaN(totalChunks) || !fileName) {
        return res.status(400).json({
          error: 'Paramètres manquants',
          message: 'fileId, chunkIndex, totalChunks et fileName sont requis dans les en-têtes'
        });
      }

      // Vérifier si le stockage pour ce fichier existe déjà
      if (!chunkStorage[fileId]) {
        chunkStorage[fileId] = {
          fileName,
          totalChunks,
          chunks: new Array(totalChunks).fill(null),
          receivedChunks: 0,
          createdAt: new Date()
        };
      }

      // Stocker le chunk
      let chunkData = '';
      req.on('data', chunk => {
        chunkData += chunk.toString();
      });

      req.on('end', () => {
        chunkStorage[fileId].chunks[chunkIndex] = chunkData;
        chunkStorage[fileId].receivedChunks++;

        // Vérifier si tous les chunks ont été reçus
        const isComplete = chunkStorage[fileId].receivedChunks === totalChunks;

        res.status(200).json({
          success: true,
          fileId,
          chunkIndex,
          totalChunks,
          isComplete,
          message: isComplete ? 'Tous les chunks ont été reçus' : `Chunk ${chunkIndex + 1}/${totalChunks} reçu`
        });

        // Nettoyer les chunks après 10 minutes pour éviter les fuites de mémoire
        setTimeout(() => {
          if (chunkStorage[fileId]) {
            delete chunkStorage[fileId];
          }
        }, 10 * 60 * 1000);
      });
    } else if (req.method === 'GET') {
      // Récupérer les informations sur un fichier
      const fileId = req.query.fileId;

      if (!fileId || !chunkStorage[fileId]) {
        return res.status(404).json({
          error: 'Fichier non trouvé',
          message: 'Le fichier spécifié n\'existe pas ou a expiré'
        });
      }

      const fileInfo = chunkStorage[fileId];
      res.status(200).json({
        fileId,
        fileName: fileInfo.fileName,
        totalChunks: fileInfo.totalChunks,
        receivedChunks: fileInfo.receivedChunks,
        isComplete: fileInfo.receivedChunks === fileInfo.totalChunks,
        createdAt: fileInfo.createdAt
      });
    } else {
      res.status(405).json({ message: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Chunk upload API error:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};
