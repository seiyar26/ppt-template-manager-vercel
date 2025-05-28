// API pour servir les images des diapositives
// Cette API fournit un point d'accès unique pour toutes les images de diapositives
// Version simplifiée compatible serverless

const axios = require('axios');

module.exports = async function handler(req, res) {
  // Uniquement autorisé en GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // Extraire les paramètres de la requête
  const { templateId, slideIndex, path, width, height } = req.query;

  try {
    let imageUrl;
    let slideNumber = slideIndex || '1';

    // Option 1: Utiliser le chemin direct fourni
    if (path) {
      const supabaseUrl = process.env.SUPABASE_URL || 'https://mbwurtmvdgmnrizxfouf.supabase.co';
      imageUrl = `${supabaseUrl}/storage/v1/object/public/ppt-templates/${path}`;

      // Extraire le numéro de diapositive du chemin pour les placeholders
      const slideMatch = path.match(/slide-(\d+)\.jpg$/);
      if (slideMatch && slideMatch[1]) {
        slideNumber = slideMatch[1];
      }
    }
    // Option 2: Construire le chemin à partir des IDs de template et diapositive
    else if (templateId && slideIndex) {
      const templateIdShort = templateId.toString().substring(0, 8);
      const imagePath = `templates/${templateIdShort}/slide-${slideIndex}.jpg`;
      const supabaseUrl = process.env.SUPABASE_URL || 'https://mbwurtmvdgmnrizxfouf.supabase.co';
      imageUrl = `${supabaseUrl}/storage/v1/object/public/ppt-templates/${imagePath}`;
      slideNumber = slideIndex;
    }
    // Aucune information suffisante fournie
    else {
      return res.status(400).json({
        error: 'Paramètres insuffisants',
        message: 'Veuillez fournir soit path, soit templateId et slideIndex',
        required: 'path OU (templateId ET slideIndex)'
      });
    }

    console.log(`Récupération de l'image: ${imageUrl}`);

    // Récupérer l'image depuis Supabase
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      validateStatus: status => status < 500
    });

    // Si l'image n'existe pas, générer un placeholder
    if (response.status === 404 || response.status >= 400) {
      console.log(`Image non trouvée ou erreur ${response.status}: ${imageUrl}, génération d'un placeholder`);

      // Extraire le numéro de diapositive plus efficacement
      let slideNumber = slideIndex || '1';

      if (path) {
        const slideMatch = path.match(/slide-(\d+)\.jpg$/i);
        if (slideMatch && slideMatch[1]) {
          slideNumber = slideMatch[1];
        } else if (path.includes('/')) {
          // Essayez d'extraire le dernier segment du chemin
          const segments = path.split('/');
          const lastSegment = segments[segments.length - 1];
          const numMatch = lastSegment.match(/\d+/);
          if (numMatch) {
            slideNumber = numMatch[0];
          }
        }
      }

      // Générer plusieurs placeholders alternatifs pour une meilleure robustesse
      const placeholders = [
        `https://via.placeholder.com/800x450/556677/FFFFFF?text=Diapositive+${slideNumber}`,
        `https://placehold.co/800x450/556677/FFFFFF?text=Diapositive+${slideNumber}`,
        `https://dummyimage.com/800x450/556677/ffffff&text=Diapositive+${slideNumber}`
      ];

      // Essayer en séquence jusqu'à ce qu'un placeholder fonctionne
      for (const placeholderUrl of placeholders) {
        try {
          console.log(`Essai du placeholder: ${placeholderUrl}`);
          const placeholderResponse = await axios.get(placeholderUrl, {
            responseType: 'arraybuffer',
            timeout: 3000 // Timeout court pour rapidement essayer l'alternative
          });

          if (placeholderResponse.status === 200) {
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache pendant 1 heure
            res.setHeader('Access-Control-Allow-Origin', '*');

            return res.send(placeholderResponse.data);
          }
        } catch (placeholderError) {
          console.warn(`Erreur pour le placeholder ${placeholderUrl}:`, placeholderError.message);
          // Continuer avec le prochain placeholder
          continue;
        }
      }

      // Si tous les placeholders échouent, rediriger vers le premier
      return res.redirect(placeholders[0]);
    }

    // Configurer les en-têtes pour l'image
    const contentType = response.headers['content-type'] || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache pendant 1 an
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Renvoyer l'image
    return res.send(response.data);

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'image:', error.message);

    // Extraire le numéro de diapositive
    let slideNumber = slideIndex || '1';
    if (path) {
      const slideMatch = path.match(/slide-(\d+)\.jpg$/i);
      if (slideMatch && slideMatch[1]) {
        slideNumber = slideMatch[1];
      }
    }

    // Générer plusieurs placeholders alternatifs pour une meilleure robustesse
    const placeholders = [
      `https://via.placeholder.com/800x450/dd3333/ffffff?text=Erreur+Diapositive+${slideNumber}`,
      `https://placehold.co/800x450/dd3333/ffffff?text=Erreur+Diapositive+${slideNumber}`,
      `https://dummyimage.com/800x450/dd3333/ffffff&text=Erreur+Diapositive+${slideNumber}`
    ];

    // Essayer en séquence jusqu'à ce qu'un placeholder fonctionne
    for (const placeholderUrl of placeholders) {
      try {
        console.log(`Essai du placeholder d'erreur: ${placeholderUrl}`);
        const placeholderResponse = await axios.get(placeholderUrl, {
          responseType: 'arraybuffer',
          timeout: 3000
        });

        if (placeholderResponse.status === 200) {
          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache pendant 1 heure
          res.setHeader('Access-Control-Allow-Origin', '*');

          return res.send(placeholderResponse.data);
        }
      } catch (placeholderError) {
        console.warn(`Erreur pour le placeholder d'erreur ${placeholderUrl}:`, placeholderError.message);
        // Continuer avec le prochain placeholder
      }
    }

    // En dernier recours, générer une image d'erreur directement
    try {
      // Créer une image SVG simple avec du texte d'erreur
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="450">
          <rect width="800" height="450" fill="#dd3333"/>
          <text x="400" y="225" font-family="Arial" font-size="36" fill="white" text-anchor="middle" dominant-baseline="middle">
            Erreur Diapositive ${slideNumber}
          </text>
        </svg>
      `;

      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Access-Control-Allow-Origin', '*');

      return res.send(svgContent);
    } catch (svgError) {
      // Vraiment le dernier recours - rediriger vers le premier placeholder
      return res.redirect(placeholders[0]);
    }
  }
};
