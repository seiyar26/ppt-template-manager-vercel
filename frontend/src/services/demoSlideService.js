/**
 * Service de slides - Version production
 * Les fonctions de démo sont désactivées et renvoient systématiquement des erreurs
 */

// Message d'erreur standard
const DEMO_DISABLED_MESSAGE = 'Le mode démo est désactivé. Veuillez utiliser l\'API de production.';

// Journalisation de l'erreur
const logDemoDisabled = (functionName) => {
  console.error(`🚫 DEMO DÉSACTIVÉE: La fonction ${functionName} a été appelée mais le mode démo est désactivé.`);
};

/**
 * Ajout de slides de démo à un template - Mode démo désactivé
 * @param {Object} template - Le template auquel ajouter des diapositives
 * @param {number} slideCount - Le nombre de diapositives à ajouter
 * @returns {Promise} - Promise rejetée avec message d'erreur
 */
export const addDemoSlidesToTemplate = async (template, slideCount = 3) => {
  logDemoDisabled('addDemoSlidesToTemplate');
  return Promise.reject(new Error(DEMO_DISABLED_MESSAGE));
};

/**
 * Stockage d'un template avec ses slides - Mode démo désactivé
 * @param {Object} template - Le template à stocker
 * @returns {Promise} - Promise rejetée avec message d'erreur
 */
export const storeDemoTemplateWithSlides = async (template) => {
  logDemoDisabled('storeDemoTemplateWithSlides');
  return Promise.reject(new Error(DEMO_DISABLED_MESSAGE));
};
