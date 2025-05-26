/**
 * Client Supabase optimisé pour l'application PPT Template Manager sur Vercel
 * - Utilise les variables d'environnement Vercel
 * - Détection automatique des clés
 * - Lazy loading des clients pour éviter les problèmes de cold start
 */
const { createClient } = require('@supabase/supabase-js');

// Configuration et constantes
const STORAGE_BUCKET = 'ppt-templates';
const FILE_SIZE_LIMIT = 100 * 1024 * 1024; // 100MB

// Fonction pour obtenir l'URL Supabase
const getSupabaseUrl = () => {
  // Priorité aux variables d'environnement
  const configuredUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (configuredUrl) return configuredUrl;
  
  // Valeur par défaut pour le développement local uniquement
  console.warn('[VERCEL] Attention: URL Supabase non configurée dans les variables d\'environnement');
  return 'https://mbwurtmvdgmnrizxfouf.supabase.co';
};

// Fonction pour obtenir la clé anonyme Supabase
const getSupabaseAnonKey = () => {
  // Priorité aux variables d'environnement
  const configuredKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (configuredKey) return configuredKey;
  
  // Valeur par défaut pour le développement local uniquement
  console.warn('[VERCEL] Attention: Clé Supabase anon non configurée dans les variables d\'environnement');
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MDU4MDAsImV4cCI6MjA2MzI4MTgwMH0.tNF11pL0MQQKhb3ejQiHjLhTCIGqabIhKu-WIdZvMDs';
};

// Fonction pour obtenir la clé de service Supabase
const getSupabaseServiceKey = () => {
  // Priorité aux variables d'environnement
  const configuredKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (configuredKey) return configuredKey;
  
  // Valeur par défaut pour le développement local uniquement
  console.warn('[VERCEL] Attention: Clé Supabase service non configurée dans les variables d\'environnement');
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzcwNTgwMCwiZXhwIjoyMDYzMjgxODAwfQ.Ojvhv2gXUNiv5NmdMniJyZKgY9d-MqjN3_3p9KIJFsY';
};

// Lazy initialization des clients Supabase pour éviter les problèmes de cold start
let _supabase = null;
let _supabaseAdmin = null;

// Getter pour le client anonyme (lazy loading)
const getSupabaseClient = () => {
  if (!_supabase) {
    _supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
  }
  return _supabase;
};

// Getter pour le client admin (lazy loading)
const getSupabaseAdminClient = () => {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(getSupabaseUrl(), getSupabaseServiceKey(), {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return _supabaseAdmin;
};

// Export des clients comme objets proxy pour permettre l'initialisation lazy
const supabase = new Proxy({}, {
  get: (target, prop) => {
    return getSupabaseClient()[prop];
  }
});

const supabaseAdmin = new Proxy({}, {
  get: (target, prop) => {
    return getSupabaseAdminClient()[prop];
  }
});

module.exports = {
  supabase,
  supabaseAdmin,
  STORAGE_BUCKET,
  FILE_SIZE_LIMIT
};
