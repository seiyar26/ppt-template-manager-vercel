const fs = require('fs');
const path = require('path');

// Résout le problème d'ajv en garantissant que les versions sont compatibles
console.log('Fixing package dependencies for Vercel deployment...');

// Vérifier si node_modules/ajv existe
const ajvPath = path.join(__dirname, '../node_modules/ajv');
if (!fs.existsSync(ajvPath)) {
  console.log('Installing ajv@8.12.0 directly...');
  require('child_process').execSync('npm install ajv@8.12.0 --no-save', { stdio: 'inherit' });
}

// Vérifier si node_modules/ajv-keywords existe
const ajvKeywordsPath = path.join(__dirname, '../node_modules/ajv-keywords');
if (!fs.existsSync(ajvKeywordsPath)) {
  console.log('Installing ajv-keywords@5.1.0 directly...');
  require('child_process').execSync('npm install ajv-keywords@5.1.0 --no-save', { stdio: 'inherit' });
}

console.log('Dependencies fixed successfully.');
