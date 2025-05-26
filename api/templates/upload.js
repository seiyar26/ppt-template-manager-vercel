const { authenticateToken } = require('../_lib/auth');
const storage = require('../_lib/storage');
const { Template, sequelize } = require('../_lib/models');
const multer = require('multer');
const path = require('path');

// Configuration multer pour Vercel
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pptx', '.ppt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Seuls les fichiers PowerPoint sont acceptés.'));
    }
  }
});

// Middleware pour parser les fichiers
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req, res) {
  // Gérer CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  // S'assurer que la connexion à la base de données est établie
  await sequelize.authenticate();

  return new Promise((resolve) => {
    authenticateToken(req, res, async () => {
      try {
        // Parser le fichier uploadé
        await runMiddleware(req, res, upload.single('template'));

        if (!req.file) {
          res.status(400).json({ message: 'Aucun fichier fourni' });
          resolve();
          return;
        }

        const { name, description } = req.body;
        if (!name) {
          res.status(400).json({ message: 'Nom du template requis' });
          resolve();
          return;
        }

        // Générer un nom de fichier unique
        const timestamp = Date.now();
        const ext = path.extname(req.file.originalname);
        const fileName = `${timestamp}_${name.replace(/[^a-zA-Z0-9]/g, '_')}${ext}`;

        // Upload vers Vercel Blob ou stockage local
        const uploadResult = await storage.uploadFile(
          req.file,
          fileName,
          'templates'
        );

        // Créer l'entrée en base de données
        const template = await Template.create({
          name,
          description: description || '',
          file_path: uploadResult.path,
          user_id: req.user.id
        });

        res.status(201).json({
          message: 'Template uploadé avec succès',
          template: {
            id: template.id,
            name: template.name,
            description: template.description,
            file_path: template.file_path,
            file_url: uploadResult.url,
            created_at: template.created_at
          }
        });
        resolve();
      } catch (error) {
        console.error('Erreur upload template:', error);
        res.status(500).json({ 
          message: 'Erreur lors de l\'upload',
          error: error.message 
        });
        resolve();
      }
    });
  });
}

// Configuration importante pour Vercel
export const config = {
  api: {
    bodyParser: false,
  },
};
