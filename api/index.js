/**
 * Point d'entrée principal de l'API - Optimisé pour Vercel Serverless Functions
 * 
 * Cette version est spécialement optimisée pour les fonctions serverless de Vercel:
 * - Utilisation de promesses pour l'initialisation asynchrone
 * - Gestion correcte des connexions à la base de données
 * - Utilisation de Supabase pour le stockage sans état
 * - Handling CORS optimal pour les fonctions serverless
 */

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { initSupabase } = require('./_lib/init-supabase');

// Initialisation de l'application Express optimisée pour Vercel
const app = express();

// Informations système
const VERSION = '1.1.0';
const DEPLOY_PLATFORM = 'Vercel Serverless';

// Middleware pour parser les corps de requête JSON
app.use(express.json({ limit: '50mb' })); // Augmentation de la limite pour les templates
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configuration CORS optimisée pour Vercel
app.use(cors({
  origin: '*', // En production, serait remplacé par les domaines autorisés
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // Cache preflight pour 24h
}));

// Initialisation du client Supabase au démarrage
let supabaseInitPromise = null;
const initializeSupabase = async () => {
  if (!supabaseInitPromise) {
    supabaseInitPromise = initSupabase().catch(err => {
      console.error('[VERCEL] Erreur d\'initialisation Supabase:', err.message);
      // Réinitialiser la promesse en cas d'erreur pour permettre de réessayer
      supabaseInitPromise = null;
      throw err;
    });
  }
  return supabaseInitPromise;
};

// Route de santé pour vérifier que l'API est en ligne
app.get('/', async (req, res) => {
  try {
    // Tenter d'initialiser Supabase si ce n'est pas déjà fait
    await initializeSupabase();
    
    res.json({ 
      status: 'healthy',
      message: 'API PPT Template Manager en ligne',
      version: VERSION,
      platform: DEPLOY_PLATFORM,
      timestamp: new Date().toISOString(),
      supabase: 'connected'
    });
  } catch (error) {
    res.json({ 
      status: 'degraded',
      message: 'API en ligne mais Supabase déconnecté',
      version: VERSION,
      platform: DEPLOY_PLATFORM,
      timestamp: new Date().toISOString(),
      supabase: 'disconnected'
    });
  }
});

// Configuration pour Vercel
module.exports = app;
