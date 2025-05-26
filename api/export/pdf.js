const { authenticateToken } = require('../_lib/auth');
const { Template, Field, sequelize } = require('../_lib/models');
const storage = require('../_lib/storage');
const PDFDocument = require('pdfkit');

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
        const { template_id, field_values = {} } = req.body;

        if (!template_id) {
          res.status(400).json({ message: 'ID du template requis' });
          resolve();
          return;
        }

        // Récupérer le template avec ses champs
        const template = await Template.findOne({
          where: {
            id: template_id,
            user_id: req.user.id
          },
          include: [{
            model: Field,
            attributes: ['id', 'name', 'label', 'type', 'default_value', 'position_x', 'position_y', 'width', 'height', 'font_family', 'font_size', 'font_color', 'text_align']
          }]
        });

        if (!template) {
          res.status(404).json({ message: 'Template non trouvé' });
          resolve();
          return;
        }

        // Créer le PDF
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50
        });

        // Configuration des headers pour le téléchargement
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${template.name}.pdf"`);

        // Pipe le PDF vers la réponse
        doc.pipe(res);

        // Titre du document
        doc.fontSize(20)
           .text(template.name, 50, 50);

        doc.fontSize(12)
           .text(template.description || '', 50, 80);

        // Position de départ pour les champs
        let yPosition = 120;

        // Ajouter les champs et leurs valeurs
        template.Fields.forEach(field => {
          const value = field_values[field.name] || field.default_value || '';
          
          doc.fontSize(10)
             .fillColor('#666666')
             .text(`${field.label}:`, 50, yPosition);
          
          doc.fontSize(12)
             .fillColor('#000000')
             .text(value.toString(), 50, yPosition + 15);
          
          yPosition += 40;

          // Nouvelle page si nécessaire
          if (yPosition > 700) {
            doc.addPage();
            yPosition = 50;
          }
        });

        // Finaliser le PDF
        doc.end();

        // Le PDF sera automatiquement envoyé via le pipe
        resolve();
      } catch (error) {
        console.error('Erreur export PDF:', error);
        res.status(500).json({ message: 'Erreur lors de l\'export PDF' });
        resolve();
      }
    });
  });
}
