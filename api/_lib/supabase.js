// Configuration de Supabase pour l'accès à la base de données et au stockage
const { createClient } = require('@supabase/supabase-js');

// Utilisation des variables d'environnement ou des valeurs par défaut pour le développement
const supabaseUrl = process.env.SUPABASE_URL || 'https://mbwurtmvdgmnrizxfouf.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MDU4MDAsImV4cCI6MjA2MzI4MTgwMH0.tNF11pL0MQQKhb3ejQiHjLhTCIGqabIhKu-WIdZvMDs';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzcwNTgwMCwiZXhwIjoyMDYzMjgxODAwfQ.Ojvhv2gXUNiv5NmdMniJyZKgY9d-MqjN3_3p9KIJFsY';

// Client avec les droits anonymes (pour requêtes frontend)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client avec les droits de service (pour requêtes administratives)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Initialise les tables dans Supabase si elles n'existent pas
 * Cette fonction devrait être exécutée au démarrage du serveur
 */
const initSupabaseTables = async () => {
  try {
    console.log('Vérification des tables Supabase...');
    
    // Cette requête utilise le client admin pour avoir accès aux opérations DDL
    const { error } = await supabaseAdmin.rpc('init_ppt_template_manager_tables');
    
    if (error) {
      console.error('Erreur lors de l\'initialisation des tables:', error);
      
      // Créer les tables manuellement si la procédure stockée n'existe pas
      await createTables();
    } else {
      console.log('Tables initialisées avec succès ou déjà existantes');
    }
  } catch (err) {
    console.error('Erreur lors de la vérification des tables:', err);
    // Créer les tables manuellement en cas d'erreur
    await createTables();
  }
};

/**
 * Crée les tables nécessaires dans Supabase
 */
const createTables = async () => {
  try {
    console.log('Création manuelle des tables...');
    
    // Exemple de création de tables (à adapter selon vos besoins)
    const { error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1);
    
    if (userError && userError.code === '42P01') { // relation "users" does not exist
      console.log('Création de la table users...');
      await supabaseAdmin.rpc('create_users_table');
    }
    
    // Vérification/création des autres tables
    // ...

    console.log('Tables créées avec succès');
  } catch (err) {
    console.error('Erreur lors de la création manuelle des tables:', err);
  }
};

module.exports = {
  supabase,
  supabaseAdmin,
  initSupabaseTables
};
