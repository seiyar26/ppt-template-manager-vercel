/**
 * Configuration de sécurité centralisée pour l'application
 * @module SecurityConfig
 */

/**
 * Options de configuration pour Helmet
 * @type {Object}
 */
const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'", process.env.FRONTEND_URL || '*'],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false, // Pour permettre le chargement de ressources cross-origin
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Nécessaire pour les fichiers PDF/PPTX
  
  // Autres options de sécurité
  xssFilter: true,
  noSniff: true,
  hsts: {
    maxAge: 15552000, // 180 jours en secondes
    includeSubDomains: true
  },
  frameguard: {
    action: 'deny' // Empêche le site d'être inclus dans un iframe
  },
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none'
  }
};

/**
 * Options CORS pour l'application
 * @type {Object}
 */
const corsOptions = {
  origin: (origin, callback) => {
    // En développement, autoriser toutes les origines
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }
    
    // En production, vérifier l'origine
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://ppt-template-manager.vercel.app'
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 heures en secondes (mise en cache préflight)
};

/**
 * Options de limitation de débit pour l'API
 * @type {Object}
 */
const rateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite à 100 requêtes par fenêtre et par IP
  standardHeaders: true, // Ajoute les en-têtes 'RateLimit-*' aux réponses
  legacyHeaders: false, // Désactive les anciens en-têtes 'X-RateLimit-*'
  message: {
    status: 'error',
    message: 'Trop de requêtes, veuillez réessayer plus tard'
  }
};

module.exports = {
  helmetOptions,
  corsOptions,
  rateLimitOptions
};
