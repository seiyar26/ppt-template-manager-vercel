/**
 * Service d'authentification - Version production
 * Les fonctions de démo sont désactivées et renvoient systématiquement des erreurs
 */

// Message d'erreur standard
const DEMO_DISABLED_MESSAGE = 'Le mode démo est désactivé. Veuillez utiliser l\'API de production.';

// Journalisation de l'erreur
const logDemoDisabled = (functionName) => {
  console.error(`🚫 DEMO DÉSACTIVÉE: La fonction ${functionName} a été appelée mais le mode démo est désactivé.`);
};

// Génération d'un token fictif pour la compatibilité (ne sera jamais utilisé)
const generateDemoToken = () => {
  logDemoDisabled('generateDemoToken');
  return 'INVALID_TOKEN_DEMO_DISABLED';
};

/**
 * Authentification - Mode démo désactivé
 */
export const demoLogin = async (email, password) => {
  logDemoDisabled('demoLogin');
  return Promise.reject(new Error(DEMO_DISABLED_MESSAGE));
};

/**
 * Vérification du token - Mode démo désactivé
 */
export const demoVerifyToken = async (token) => {
  logDemoDisabled('demoVerifyToken');
  return Promise.reject(new Error(DEMO_DISABLED_MESSAGE));
};

/**
 * Déconnexion - Mode démo désactivé
 */
export const demoLogout = async () => {
  logDemoDisabled('demoLogout');
  return Promise.reject(new Error(DEMO_DISABLED_MESSAGE));
};
