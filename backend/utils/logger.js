/**
 * Service centralisé de journalisation
 * Assure la cohérence des logs dans toute l'application
 * et différencie les environnements de développement et production
 */
const winston = require('winston');
const path = require('path');

// Définition des niveaux et couleurs
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Ajoute les couleurs à Winston
winston.addColors(colors);

// Format de log pour la production
const productionFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

// Format de log pour le développement
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Déterminer si nous sommes en production
const isProduction = process.env.NODE_ENV === 'production';

// Transports pour les logs
const transports = [
  // Toujours loguer dans la console
  new winston.transports.Console({
    format: isProduction ? productionFormat : developmentFormat,
  }),
];

// En production, ajouter un log dans un fichier pour les erreurs
if (isProduction) {
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      format: productionFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Création du logger
const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  levels,
  format: isProduction ? productionFormat : developmentFormat,
  transports,
  silent: process.env.NODE_ENV === 'test', // Désactiver les logs en test
});

module.exports = { logger };
