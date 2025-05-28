// API pour servir d'intermédiaire pour les images Supabase
// Contourne les problèmes CORS en récupérant les images côté serveur

const axios = require('axios');

module.exports = async function handler(req, res) {
  // Uniquement autorisé en GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // Récupérer l'URL de l'image depuis le paramètre
  const { url, path } = req.query;

  if (!url && !path) {
    return res.status(400).json({ error: 'URL ou chemin d\'image requis' });
  }

  try {
    let imageUrl = url;

    // Si un chemin est fourni, construire l'URL Supabase
    if (path) {
      const supabaseUrl = process.env.SUPABASE_URL || 'https://mbwurtmvdgmnrizxfouf.supabase.co';
      imageUrl = `${supabaseUrl}/storage/v1/object/public/ppt-templates/${path}`;
    }

    // Vérifier que l'URL est valide
    if (!imageUrl || !imageUrl.startsWith('http')) {
      return res.status(400).json({ error: 'URL d\'image invalide' });
    }

    console.log('Proxy d\'image - Récupération de :', imageUrl);

    // Récupérer l'image depuis Supabase
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });

    // Détecter le type MIME
    const contentType = response.headers['content-type'];

    // Définir les en-têtes pour l'image
    res.setHeader('Content-Type', contentType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache pendant 1 an

    // Renvoyer l'image
    return res.send(response.data);

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'image:', error.message);

    // Rediriger vers un placeholder en cas d'erreur
    const slideNumber = path ? path.match(/slide-(\d+)/) : null;
    const slideIndex = slideNumber ? slideNumber[1] : '1';

    return res.redirect(`https://via.placeholder.com/800x450?text=Diapositive+${slideIndex}`);
  }
};
