/**
 * Configuration Jest pour les tests unitaires et d'intégration
 */
module.exports = {
  // Répertoire de test par défaut
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  
  // Ignore les répertoires node_modules et uploads
  testPathIgnorePatterns: ['/node_modules/', '/uploads/'],
  
  // Génère une couverture de test
  collectCoverage: false,
  collectCoverageFrom: [
    'utils/**/*.js',
    'controllers/**/*.js',
    'middleware/**/*.js',
    '!**/__tests__/**',
    '!**/node_modules/**',
  ],
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  
  // Arrête le test après un certain nombre d'échecs
  bail: 1,
  
  // Timeout pour les tests
  testTimeout: 30000,
  
  // Environnement de test
  testEnvironment: 'node',
  
  // Fournit des informations de diagnostic utiles
  verbose: true,
  
  // Définit des variables d'environnement pour les tests
  setupFiles: ['./__tests__/setup.js'],
};
