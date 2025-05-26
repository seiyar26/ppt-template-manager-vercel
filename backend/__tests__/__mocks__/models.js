/**
 * Mock pour les modèles de base de données dans les tests
 * Permet d'isoler les tests des dépendances externes
 */

// Mocks pour les modèles
const Export = {
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
};

const User = {
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
};

const Template = {
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  findByPkWithDetails: jest.fn()
};

const Field = {
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
};

const Slide = {
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
};

const Category = {
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
};

// Fonctions utilitaires pour réinitialiser tous les mocks
const resetAllMocks = () => {
  Object.values(models).forEach(model => {
    Object.values(model).forEach(method => {
      if (typeof method === 'function' && method.mockReset) {
        method.mockReset();
      }
    });
  });
};

// Exporte les modèles mockés
const models = {
  Export,
  User,
  Template,
  Field,
  Slide,
  Category
};

// Exporte également chaque modèle individuellement pour plus de flexibilité
module.exports = {
  models,
  Export,
  User,
  Template,
  Field,
  Slide,
  Category,
  resetAllMocks
};
