/**
 * Point d'entrée API pour le déploiement serverless sur Vercel
 * Ce fichier adapte l'application Express pour l'architecture serverless
 */

// Importer les mêmes modules que le serveur principal
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('../config/database');
const authRoutes = require('../routes/authRoutes');
const templateRoutes = require('../routes/templateRoutes');
const categoryRoutes = require('../routes/categoryRoutes');
const exportRoutes = require('../routes/exportRoutes');
require('dotenv').config();

// Initialize Express app
const app = express();

// Middleware
// Configuration CORS adaptée pour Vercel
app.use(cors({
  origin: '*', // Autoriser toutes les origines en production sur Vercel
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files - adapter pour Vercel
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/exports', exportRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: 'vercel' });
});

// Toute autre route
app.all('*', (req, res) => {
  res.status(200).json({ 
    message: 'PPT Template Manager API', 
    routes: {
      auth: '/api/auth',
      templates: '/api/templates',
      categories: '/api/categories',
      exports: '/api/exports'
    },
    health: '/health'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

// Export pour Vercel Serverless Functions
// Cette partie est critique pour que Vercel exécute correctement l'API
module.exports = app;

// Pour le mode développement local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 12000;
  
  // Synchroniser la base de données et démarrer le serveur
  sequelize.sync()
    .then(() => {
      console.log('Base de données connectée avec succès.');
      app.listen(PORT, () => {
        console.log(`Serveur démarré sur le port ${PORT}`);
      });
    })
    .catch(err => {
      console.error('Erreur lors de la connexion à la base de données:', err);
    });
}