const { authenticateToken } = require('../_lib/auth');
const { Field, Template, sequelize } = require('../_lib/models');

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

  // S'assurer que la connexion à la base de données est établie
  await sequelize.authenticate();

  const { id } = req.query;

  if (req.method === 'PUT') {
    // Mettre à jour un champ
    return new Promise((resolve) => {
      authenticateToken(req, res, async () => {
        try {
          // Récupérer le champ avec vérification de propriété
          const field = await Field.findOne({
            where: { id },
            include: [{
              model: Template,
              where: { user_id: req.user.id }
            }]
          });

          if (!field) {
            res.status(404).json({ message: 'Champ non trouvé' });
            resolve();
            return;
          }

          const {
            name,
            label,
            type,
            default_value,
            position_x,
            position_y,
            width,
            height,
            font_family,
            font_size,
            font_color,
            text_align,
            font_style
          } = req.body;

          // Mettre à jour les champs fournis
          const updates = {};
          if (name !== undefined) updates.name = name;
          if (label !== undefined) updates.label = label;
          if (type !== undefined) updates.type = type;
          if (default_value !== undefined) updates.default_value = default_value;
          if (position_x !== undefined) updates.position_x = position_x;
          if (position_y !== undefined) updates.position_y = position_y;
          if (width !== undefined) updates.width = width;
          if (height !== undefined) updates.height = height;
          if (font_family !== undefined) updates.font_family = font_family;
          if (font_size !== undefined) updates.font_size = font_size;
          if (font_color !== undefined) updates.font_color = font_color;
          if (text_align !== undefined) updates.text_align = text_align;
          if (font_style !== undefined) updates.font_style = font_style;

          await field.update(updates);

          res.status(200).json(field);
          resolve();
        } catch (error) {
          console.error('Erreur mise à jour champ:', error);
          res.status(500).json({ message: 'Erreur interne du serveur' });
          resolve();
        }
      });
    });
  }

  if (req.method === 'DELETE') {
    // Supprimer un champ
    return new Promise((resolve) => {
      authenticateToken(req, res, async () => {
        try {
          // Récupérer le champ avec vérification de propriété
          const field = await Field.findOne({
            where: { id },
            include: [{
              model: Template,
              where: { user_id: req.user.id }
            }]
          });

          if (!field) {
            res.status(404).json({ message: 'Champ non trouvé' });
            resolve();
            return;
          }

          await field.destroy();

          res.status(200).json({ message: 'Champ supprimé avec succès' });
          resolve();
        } catch (error) {
          console.error('Erreur suppression champ:', error);
          res.status(500).json({ message: 'Erreur interne du serveur' });
          resolve();
        }
      });
    });
  }

  res.status(405).json({ message: 'Méthode non autorisée' });
}
