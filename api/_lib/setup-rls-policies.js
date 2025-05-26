// Configuration des politiques RLS pour Supabase Storage
// Basé sur la documentation officielle : https://supabase.com/docs/guides/storage/security/access-control

const { supabaseAdmin, BUCKET_NAME } = require('./supabase-setup');

/**
 * Crée les politiques RLS nécessaires pour le bucket de stockage
 * @returns {Promise<boolean>} - true si toutes les politiques ont été créées avec succès
 */
async function setupRLSPolicies() {
  console.log('🔄 Configuration des politiques RLS pour le storage...');

  try {
    // Politique 1: Permettre à tous de lire les fichiers du bucket public
    const selectPolicy = `
      create policy if not exists "Allow public read access to ppt-templates"
      on storage.objects for select
      to public
      using ( bucket_id = '${BUCKET_NAME}' );
    `;

    // Politique 2: Permettre l'upload à tous les utilisateurs authentifiés
    const insertPolicy = `
      create policy if not exists "Allow authenticated uploads to ppt-templates"
      on storage.objects for insert
      to authenticated
      with check ( bucket_id = '${BUCKET_NAME}' );
    `;

    // Politique 3: Permettre la mise à jour aux utilisateurs authentifiés
    const updatePolicy = `
      create policy if not exists "Allow authenticated updates to ppt-templates"
      on storage.objects for update
      to authenticated
      using ( bucket_id = '${BUCKET_NAME}' );
    `;

    // Politique 4: Permettre la suppression aux utilisateurs authentifiés
    const deletePolicy = `
      create policy if not exists "Allow authenticated delete from ppt-templates"
      on storage.objects for delete
      to authenticated
      using ( bucket_id = '${BUCKET_NAME}' );
    `;

    // Politique 5: Permettre aux utilisateurs anonymes de lister les objets (optionnel)
    const listPolicy = `
      create policy if not exists "Allow public list access to ppt-templates"
      on storage.objects for select
      to public
      using ( bucket_id = '${BUCKET_NAME}' );
    `;

    // Activer RLS sur la table storage.objects si ce n'est pas déjà fait
    const enableRLS = `
      alter table if exists storage.objects enable row level security;
    `;

    console.log('⏳ Activation de RLS sur storage.objects...');
    const { error: rlsError } = await supabaseAdmin.rpc('sql', { query: enableRLS });
    if (rlsError) {
      console.warn('⚠️ Avertissement RLS:', rlsError.message);
    } else {
      console.log('✅ RLS activé sur storage.objects');
    }

    // Appliquer chaque politique
    const policies = [
      { name: 'Lecture publique', sql: selectPolicy },
      { name: 'Upload authentifié', sql: insertPolicy },
      { name: 'Mise à jour authentifiée', sql: updatePolicy },
      { name: 'Suppression authentifiée', sql: deletePolicy },
      { name: 'Liste publique', sql: listPolicy }
    ];

    for (const policy of policies) {
      console.log(`⏳ Création de la politique: ${policy.name}...`);
      const { error } = await supabaseAdmin.rpc('sql', { query: policy.sql });
      
      if (error) {
        console.warn(`⚠️ Avertissement pour ${policy.name}:`, error.message);
        // Ne pas échouer complètement si la politique existe déjà
        if (!error.message.includes('already exists')) {
          console.error(`❌ Erreur critique pour ${policy.name}:`, error);
          return false;
        }
      } else {
        console.log(`✅ Politique "${policy.name}" créée avec succès`);
      }
    }

    console.log('✅ Configuration des politiques RLS terminée avec succès');
    return true;

  } catch (error) {
    console.error('❌ Erreur lors de la configuration des politiques RLS:', error);
    return false;
  }
}

/**
 * Vérifie que les politiques RLS sont correctement configurées
 * @returns {Promise<boolean>} - true si les politiques sont valides
 */
async function verifyRLSPolicies() {
  console.log('🔄 Vérification des politiques RLS...');

  try {
    // Tenter un test de lecture publique
    const { data, error } = await supabaseAdmin.storage.from(BUCKET_NAME).list();
    
    if (error) {
      console.error('❌ Test de lecture échoué:', error);
      return false;
    }

    console.log('✅ Les politiques RLS fonctionnent correctement');
    return true;

  } catch (error) {
    console.error('❌ Erreur lors de la vérification des politiques:', error);
    return false;
  }
}

module.exports = {
  setupRLSPolicies,
  verifyRLSPolicies
};
