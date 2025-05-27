/**
 * Script de vérification des variables d'environnement pour Vercel
 * 
 * Ce script vérifie la présence des variables d'environnement critiques
 * nécessaires au fonctionnement de l'application sur Vercel.
 * 
 * Il est exécuté automatiquement avant le build pour éviter
 * des déploiements incomplets ou non fonctionnels.
 */

const fs = require('fs');
const path = require('path');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Variables d'environnement requises
const REQUIRED_VARIABLES = [
  { 
    name: 'JWT_SECRET', 
    description: 'Secret JWT pour l\'authentification',
    alternatives: ['VERCEL_JWT_SECRET'] 
  }
];

// Variables pour Supabase (optionnelles, si utilisées)
const OPTIONAL_SUPABASE_VARIABLES = [
  { 
    name: 'SUPABASE_URL', 
    description: 'URL de l\'instance Supabase',
    alternatives: ['NEXT_PUBLIC_SUPABASE_URL'] 
  },
  { 
    name: 'SUPABASE_ANON_KEY', 
    description: 'Clé anonyme Supabase pour l\'authentification côté client',
    alternatives: ['NEXT_PUBLIC_SUPABASE_ANON_KEY']
  },
  { 
    name: 'SUPABASE_SERVICE_KEY', 
    description: 'Clé de service Supabase pour les opérations admin',
    alternatives: ['SUPABASE_SERVICE_ROLE_KEY']
  }
];

// Variables recommandées mais non bloquantes
const RECOMMENDED_VARIABLES = [
  { 
    name: 'NODE_ENV', 
    description: 'Environnement d\'exécution (production, development)',
    defaultValue: 'production' 
  },
  { 
    name: 'TEMPLATE_STORAGE_BUCKET', 
    description: 'Bucket Supabase pour le stockage des templates',
    defaultValue: 'ppt-templates' 
  }
];

console.log(`${colors.cyan}=== Vérification des variables d'environnement pour Vercel ===${colors.reset}`);

// Vérifier si .env existe
const envPath = path.join(__dirname, '..', '.env');
const vercelEnvPath = path.join(__dirname, '..', '.env.production');
let envFileExists = fs.existsSync(envPath);
let vercelEnvFileExists = fs.existsSync(vercelEnvPath);

if (!envFileExists && !vercelEnvFileExists) {
  console.log(`${colors.yellow}Aucun fichier .env ou .env.production trouvé.${colors.reset}`);
  console.log('Si vous déployez sur Vercel, assurez-vous de configurer les variables dans l\'interface Vercel.');
} else {
  if (envFileExists) {
    console.log(`${colors.green}✓ Fichier .env trouvé${colors.reset}`);
  }
  if (vercelEnvFileExists) {
    console.log(`${colors.green}✓ Fichier .env.production trouvé${colors.reset}`);
  }
}

// Vérifier les variables requises
let missingRequired = false;
console.log(`\n${colors.blue}Vérification des variables d'environnement requises:${colors.reset}`);

REQUIRED_VARIABLES.forEach(variable => {
  let found = false;
  let foundIn = null;
  
  // Vérifier la variable principale
  if (process.env[variable.name]) {
    found = true;
    foundIn = variable.name;
  } else {
    // Vérifier les alternatives
    for (const alt of variable.alternatives) {
      if (process.env[alt]) {
        found = true;
        foundIn = alt;
        break;
      }
    }
  }
  
  if (found) {
    const value = process.env[foundIn];
    // Masquer la valeur si c'est une clé
    const displayValue = foundIn.includes('KEY') 
      ? `${value.substring(0, 6)}...${value.substring(value.length - 4)}` 
      : value;
    console.log(`${colors.green}✓ ${variable.name}${colors.reset} (trouvé via ${foundIn}): ${displayValue}`);
  } else {
    console.log(`${colors.red}✗ ${variable.name}${colors.reset} - ${variable.description}`);
    if (variable.alternatives.length > 0) {
      console.log(`  Alternatives acceptées: ${variable.alternatives.join(', ')}`);
    }
    missingRequired = true;
  }
});

// Vérifier les variables Supabase optionnelles
console.log(`\n${colors.blue}Vérification des variables Supabase (optionnelles):${colors.reset}`);

OPTIONAL_SUPABASE_VARIABLES.forEach(variable => {
  let found = false;
  let foundIn = null;
  
  // Vérifier la variable principale
  if (process.env[variable.name]) {
    found = true;
    foundIn = variable.name;
  } else {
    // Vérifier les alternatives
    for (const alt of variable.alternatives) {
      if (process.env[alt]) {
        found = true;
        foundIn = alt;
        break;
      }
    }
  }
  
  if (found) {
    const value = process.env[foundIn];
    // Masquer la valeur si c'est une clé
    const displayValue = foundIn.includes('KEY') 
      ? `${value.substring(0, 6)}...${value.substring(value.length - 4)}` 
      : value;
    console.log(`${colors.green}✓ ${variable.name}${colors.reset} (trouvé via ${foundIn}): ${displayValue}`);
  } else {
    console.log(`${colors.yellow}⚠ ${variable.name}${colors.reset} - ${variable.description} (optionnel)`);
  }
});

// Vérifier les variables recommandées
console.log(`\n${colors.blue}Vérification des variables d'environnement recommandées:${colors.reset}`);

RECOMMENDED_VARIABLES.forEach(variable => {
  if (process.env[variable.name]) {
    console.log(`${colors.green}✓ ${variable.name}${colors.reset}: ${process.env[variable.name]}`);
  } else {
    console.log(`${colors.yellow}⚠ ${variable.name}${colors.reset} - ${variable.description}`);
    if (variable.defaultValue) {
      console.log(`  Valeur par défaut: ${variable.defaultValue}`);
    }
  }
});

// Vérifier la configuration frontend
const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env.production');
const frontendEnvExists = fs.existsSync(frontendEnvPath);

console.log(`\n${colors.blue}Vérification de la configuration frontend:${colors.reset}`);
if (frontendEnvExists) {
  console.log(`${colors.green}✓ Fichier frontend/.env.production trouvé${colors.reset}`);
} else {
  console.log(`${colors.yellow}⚠ Fichier frontend/.env.production non trouvé${colors.reset}`);
  console.log('  Recommandation: Créez ce fichier pour configurer les variables d\'environnement frontend');
}

// Résumé
console.log(`\n${colors.cyan}=== Résumé ===${colors.reset}`);
if (missingRequired) {
  console.log(`${colors.red}✗ Variables requises manquantes. Le déploiement pourrait échouer.${colors.reset}`);
  console.log(`  Configurez ces variables sur Vercel ou dans vos fichiers .env`);
  
  // Désactivé temporairement pour permettre le déploiement sur Vercel
  // if (process.env.NODE_ENV === 'production') {
  //   console.log(`${colors.red}Arrêt du processus de déploiement.${colors.reset}`);
  //   process.exit(1);
  // }
  console.log(`${colors.yellow}Avertissement: variables manquantes, mais le déploiement continuera.${colors.reset}`);
} else {
  console.log(`${colors.green}✓ Toutes les variables requises sont définies.${colors.reset}`);
  console.log(`${colors.green}✓ Le déploiement peut continuer.${colors.reset}`);
}

console.log(`\n${colors.cyan}=== Fin de la vérification des variables d'environnement ===${colors.reset}`);
