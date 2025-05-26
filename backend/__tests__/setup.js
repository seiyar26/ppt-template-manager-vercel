/**
 * Configuration d'environnement pour les tests Jest
 * Ce fichier est chargé avant l'exécution des tests
 */

// Définit l'environnement de test
process.env.NODE_ENV = 'test';
process.env.PORT = 12345; // Port différent pour les tests
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DB_NAME_TEST = ':memory:'; // Utiliser une base SQLite en mémoire pour les tests

// Désactive les logs verbeux pendant les tests
process.env.LOG_LEVEL = 'error';

// Mock de certains services externes
// Si besoin de mocker des services comme nodemailer, convertapi, etc.
