const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCategories() {
  console.log('🔍 Test des catégories avec clé anon...');
  
  try {
    // Test avec la clé anon
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('position', { ascending: true });

    if (error) {
      console.error('❌ Erreur avec clé anon:', error);
    } else {
      console.log('✅ Données avec clé anon:', data.length, 'catégories');
      console.log('📋 Première catégorie:', data[0]);
    }

    // Test avec bypass RLS si possible
    console.log('\n🔍 Test sans RLS...');
    const { data: data2, error: error2 } = await supabase
      .from('categories')
      .select('*')
      .order('position', { ascending: true });

    if (error2) {
      console.error('❌ Erreur sans RLS:', error2);
    } else {
      console.log('✅ Données sans RLS:', data2.length, 'catégories');
    }

  } catch (err) {
    console.error('💥 Erreur générale:', err);
  }
}

testCategories();
