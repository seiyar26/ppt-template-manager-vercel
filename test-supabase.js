const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test de connexion simple
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Erreur lors de la récupération des données:', error);
      return false;
    }

    console.log('✅ Connexion Supabase réussie');
    console.log('Données de test:', data);
    return true;

  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('🎉 Test de connexion Supabase terminé avec succès');
  } else {
    console.log('💥 Test de connexion Supabase échoué');
  }
});
