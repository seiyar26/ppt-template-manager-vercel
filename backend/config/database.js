const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuration pour PostgreSQL ou SQLite
let sequelize;

// Vérifier si on utilise SQLite (prioritaire pour le développement local)
if (process.env.DB_DIALECT === 'sqlite') {
  console.log('Utilisation de SQLite pour la base de données locale');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || 'database.sqlite',
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true
    }
  });
} 
// En environnement Zeabur, POSTGRES_CONNECTION_STRING est fourni au lieu de DATABASE_URL
else if (process.env.POSTGRES_CONNECTION_STRING && !process.env.DATABASE_URL) {
  console.log('Variable POSTGRES_CONNECTION_STRING détectée, conversion en DATABASE_URL');
  // Sans SSL - problème de compatibilité avec certains serveurs PostgreSQL
  process.env.DATABASE_URL = process.env.POSTGRES_CONNECTION_STRING;
  
  // Continuer avec la configuration DATABASE_URL
  configureDatabaseUrl();
}
// Vérifier si on a une URL de connexion complète
else if (process.env.DATABASE_URL) {
  configureDatabaseUrl();
} 
// Sinon, utiliser les variables individuelles
else {
  console.log('Utilisation des paramètres de connexion PostgreSQL individuels');
  sequelize = new Sequelize({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'postgres',
    dialect: 'postgres',
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true
    }
  });
}

function configureDatabaseUrl() {
  console.log('Utilisation de l\'URL de connexion PostgreSQL complète');
  
  const isProd = process.env.NODE_ENV === 'production';
  console.log(`Environnement détecté: ${isProd ? 'production' : 'développement'}`);
  
  // Désactiver SSL complètement pour éviter les erreurs de connexion
  const dialectOptions = {
    ssl: false
  };
  
  console.log('SSL désactivé pour la connexion PostgreSQL (problème de compatibilité)');
  
  // Log pour debug (en mode dev uniquement)
  if (!isProd) {
    const maskedUrl = process.env.DATABASE_URL.replace(/:\/\/([^:]+):[^@]+@/, '://***:***@');
    console.log(`URL de connexion (masqu\u00e9e): ${maskedUrl}`);
  }
  
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions,
    logging: isProd ? false : console.log, // Désactiver les logs SQL en production
    define: {
      timestamps: true,
      underscored: true
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

// Test de la connexion à la base de données
sequelize.authenticate()
  .then(() => {
    console.log('Connexion à la base de données PostgreSQL établie avec succès.');
  })
  .catch(err => {
    console.error('Impossible de se connecter à la base de données PostgreSQL:', err);
  });

module.exports = sequelize;