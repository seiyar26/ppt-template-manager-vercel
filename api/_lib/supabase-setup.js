// Script d'initialisation Supabase basé sur la documentation officielle
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Récupérer les variables d'environnement Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Vérifier que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.error('SUPABASE_URL et SUPABASE_SERVICE_KEY doivent être définis');
  process.exit(1);
}

// Créer le client Supabase avec la clé de service (admin)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Nom du bucket pour les templates PowerPoint
const BUCKET_NAME = 'ppt-templates';

/**
 * Initialise les ressources Supabase nécessaires
 * @returns {Promise<boolean>} - true si l'initialisation a réussi
 */
async function setupSupabase() {
  console.log('🔄 Initialisation de Supabase...');

  try {
    // 1. Vérifier si le bucket existe
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();

    if (listError) {
      console.error('❌ Erreur lors de la vérification des buckets:', listError);
      return false;
    }

    // Vérifier si le bucket existe déjà
    const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME);

    if (!bucketExists) {
      console.log(`⏳ Création du bucket "${BUCKET_NAME}"...`);

      // Créer le bucket avec les options recommandées
      const { data, error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true,  // Accès public aux fichiers
        allowedMimeTypes: [
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/vnd.ms-powerpoint',
          'image/jpeg',
          'image/png'
        ],
        fileSizeLimit: 100 * 1024 * 1024 // 100MB
      });

      if (createError) {
        console.error(`❌ Erreur lors de la création du bucket "${BUCKET_NAME}":`, createError);
        return false;
      }

      console.log(`✅ Bucket "${BUCKET_NAME}" créé avec succès`);
    } else {
      console.log(`✅ Le bucket "${BUCKET_NAME}" existe déjà`);
    }

    // 2. Configuration des politiques RLS
    console.log('🔄 Configuration des politiques RLS...');

    // Activer RLS sur storage.objects
    const enableRLS = `ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;`;

    // Politique de lecture publique
    const publicReadPolicy = `
      CREATE POLICY IF NOT EXISTS "Public read access to ppt-templates"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = '${BUCKET_NAME}');
    `;

    // Politique d'upload authentifié
    const authInsertPolicy = `
      CREATE POLICY IF NOT EXISTS "Authenticated upload to ppt-templates"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = '${BUCKET_NAME}');
    `;

    try {
      // Exécuter les politiques une par une
      await supabaseAdmin.rpc('sql', { query: enableRLS });
      console.log('✅ RLS activé sur storage.objects');

      await supabaseAdmin.rpc('sql', { query: publicReadPolicy });
      console.log('✅ Politique de lecture publique créée');

      await supabaseAdmin.rpc('sql', { query: authInsertPolicy });
      console.log('✅ Politique d\'upload authentifié créée');

    } catch (policyError) {
      console.warn('⚠️ Avertissement politiques RLS:', policyError.message);
      // Les politiques peuvent déjà exister, continuons
    }

    console.log('✅ Initialisation de Supabase terminée avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de Supabase:', error);
    return false;
  }
}

// Exécuter l'initialisation si ce script est appelé directement
if (require.main === module) {
  setupSupabase().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = {
  supabaseAdmin,
  setupSupabase,
  BUCKET_NAME
};
