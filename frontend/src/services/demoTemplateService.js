/**
 * Service de templates - Version production
 * Les fonctions de démo sont désactivées et renvoient systématiquement des erreurs
 */

// Message d'erreur standard
const DEMO_DISABLED_MESSAGE = 'Le mode démo est désactivé. Veuillez utiliser l\'API de production.';

// Journalisation de l'erreur
const logDemoDisabled = (functionName) => {
  console.error(`🚫 DEMO DÉSACTIVÉE: La fonction ${functionName} a été appelée mais le mode démo est désactivé.`);
};

/**
 * Récupération de tous les templates - Mode démo désactivé
 */
export const getAllDemoTemplates = async (categoryId = null) => {
  logDemoDisabled('getAllDemoTemplates');
  return Promise.reject(new Error(DEMO_DISABLED_MESSAGE));
};

/**
 * Récupération d'un template par ID - Mode démo désactivé
 */
export const getDemoTemplateById = async (id) => {
  logDemoDisabled('getDemoTemplateById');
  return Promise.reject(new Error(DEMO_DISABLED_MESSAGE));
};

/**
 * Ajout de slides à un template - Mode démo désactivé
 */
export const addDemoSlidesToTemplate = async (template) => {
  logDemoDisabled('addDemoSlidesToTemplate');
  return Promise.reject(new Error(DEMO_DISABLED_MESSAGE));
};

/**
 * Récupération de toutes les catégories - Mode démo désactivé
 */
export const getAllDemoCategories = async () => {
  logDemoDisabled('getAllDemoCategories');
  return Promise.reject(new Error(DEMO_DISABLED_MESSAGE));
};

/**
 * Récupération d'une catégorie par ID - Mode démo désactivé
 */
export const getDemoCategoryById = async (id) => {
  logDemoDisabled('getDemoCategoryById');
  return Promise.reject(new Error(DEMO_DISABLED_MESSAGE));
};

/**
 * Stockage d'un template avec ses slides - Mode démo désactivé
 */
export const storeDemoTemplateWithSlides = async (template) => {
  logDemoDisabled('storeDemoTemplateWithSlides');
  return Promise.reject(new Error(DEMO_DISABLED_MESSAGE));
};
