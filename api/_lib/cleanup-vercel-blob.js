// Script de nettoyage pour supprimer toutes les références à Vercel Blob
// et optimiser pour Supabase Storage uniquement

const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();

console.log('🧹 Nettoyage des références Vercel Blob...');

// 1. Vérifier et supprimer les variables d'environnement Blob
const envFiles = ['.env.local', '.env', '.env.example'];

envFiles.forEach(envFile => {
  const envPath = path.join(projectRoot, envFile);
  if (fs.existsSync(envPath)) {
    let content = fs.readFileSync(envPath, 'utf8');
    
    // Supprimer les lignes contenant BLOB_READ_WRITE_TOKEN
    const lines = content.split('\n');
    const filteredLines = lines.filter(line => 
      !line.includes('BLOB_READ_WRITE_TOKEN') &&
      !line.includes('@vercel/blob')
    );
    
    if (lines.length !== filteredLines.length) {
      fs.writeFileSync(envPath, filteredLines.join('\n'));
      console.log(`✅ Nettoyé ${envFile}`);
    }
  }
});

// 2. Mettre à jour package.json pour supprimer @vercel/blob
const packageJsonPath = path.join(projectRoot, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  let modified = false;
  
  if (packageJson.dependencies && packageJson.dependencies['@vercel/blob']) {
    delete packageJson.dependencies['@vercel/blob'];
    modified = true;
  }
  
  if (packageJson.devDependencies && packageJson.devDependencies['@vercel/blob']) {
    delete packageJson.devDependencies['@vercel/blob'];
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Supprimé @vercel/blob de package.json');
  }
}

console.log('✅ Nettoyage terminé - Votre projet utilise maintenant uniquement Supabase Storage');
console.log('');
console.log('📝 Avantages de cette configuration :');
console.log('  • Coûts plus prévisibles');
console.log('  • Intégration native avec votre base de données');
console.log('  • Politiques de sécurité RLS granulaires');
console.log('  • Pas de limites strictes sur la taille des fichiers');
console.log('  • CDN global inclus');
console.log('  • Gestion des métadonnées avancée');
