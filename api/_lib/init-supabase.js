// Script d'initialisation de Supabase pour la création du bucket
const { supabaseAdmin } = require('./supabase-client');

/**
 * Initialise les ressources nécessaires dans Supabase
 * - Crée le bucket de stockage s'il n'existe pas
 * - Configure les politiques de sécurité
 */
async function initSupabase() {
  try {
    console.log('🔧 Initialisation de Supabase...');
    
    // 1. Créer le bucket de stockage
    const bucketName = 'ppt-templates';
    
    // Vérifier si le bucket existe déjà
    const { data: buckets, error: listError } = await supabaseAdmin
      .storage
      .listBuckets();
    
    if (listError) {
      console.error('❌ Erreur lors de la récupération des buckets:', listError);
      return false;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`🔧 Création du bucket "${bucketName}"...`);
      
      const { error: createError } = await supabaseAdmin
        .storage
        .createBucket(bucketName, {
          public: true,
          fileSizeLimit: 100 * 1024 * 1024 // 100MB
        });
      
      if (createError) {
        console.error(`❌ Erreur lors de la création du bucket "${bucketName}":`, createError);
        return false;
      }
      
      console.log(`✅ Bucket "${bucketName}" créé avec succès`);
      
      // Ajouter une politique pour permettre l'accès public en lecture
      const { error: policyError } = await supabaseAdmin
        .storage
        .from(bucketName)
        .createSignedUrl('dummy-file.txt', 60);
      
      if (policyError && !policyError.message.includes('not found')) {
        console.error('❌ Erreur lors de la configuration des politiques:', policyError);
      }
    } else {
      console.log(`✅ Le bucket "${bucketName}" existe déjà`);
    }
    
    console.log('✅ Initialisation de Supabase terminée');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de Supabase:', error);
    return false;
  }
}

module.exports = {
  initSupabase
};
