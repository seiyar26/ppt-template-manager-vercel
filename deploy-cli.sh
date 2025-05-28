#!/bin/bash

# Script de déploiement CLI optimisé
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Déploiement PPT Template Manager sur Vercel [Version CLI optimisée] ===${NC}"
echo "Date: $(date)"

# 1. Nettoyage initial pour repartir sur une base propre
echo -e "\n${YELLOW}Nettoyage des précédents déploiements...${NC}"
rm -rf .vercel/output
rm -rf frontend/build
rm -rf node_modules
rm -rf frontend/node_modules
rm -f .vercel/project.json

# 2. Préparation du build manuel
echo -e "\n${YELLOW}Préparation des fichiers pour déploiement direct...${NC}"

# Configuration package.json optimisée pour le déploiement
cat > package.json << EOL
{
  "name": "ppt-template-manager",
  "version": "1.1.0",
  "private": true,
  "scripts": {
    "build": "cd frontend && npm run build",
    "vercel-build": "npm run build"
  },
  "engines": {
    "node": "18.x"
  }
}
EOL

# Configuration frontend package.json pour compatibilité
cat > frontend/package.json << EOL
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@headlessui/react": "^1.7.13",
    "@heroicons/react": "^2.0.16",
    "@supabase/supabase-js": "^2.10.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "autoprefixer": "^10.4.13",
    "axios": "^1.3.4",
    "http-proxy-middleware": "^2.0.6",
    "postcss": "^8.4.21",
    "react": "^18.2.0",
    "react-dnd": "^16.0.1",
    "react-dnd-html5-backend": "^16.0.1",
    "react-dom": "^18.2.0",
    "react-draggable": "^4.4.5",
    "react-router-dom": "^6.8.2",
    "react-scripts": "5.0.1",
    "tailwindcss": "^3.2.7",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOL

# Vercel configuration optimisée
cat > vercel.json << EOL
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "frontend/build",
  "framework": null,
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "routes": [
    { "src": "/api/image-proxy", "dest": "/api/image-proxy.js" },
    { "src": "/api/slide-image", "dest": "/api/slide-image.js" },
    { "src": "/api/(.*)", "dest": "/api/$1.js" },
    { "src": "/static/(.*)", "dest": "frontend/build/static/$1" },
    { "src": "/assets/(.*)", "dest": "frontend/build/assets/$1" },
    { "src": "/favicon.ico", "dest": "frontend/build/favicon.ico" },
    { "src": "/manifest.json", "dest": "frontend/build/manifest.json" },
    { "src": "/(.*)", "dest": "frontend/build/index.html" }
  ]
}
EOL

# 3. Installation directe des dépendances npm
echo -e "\n${YELLOW}Installation des dépendances...${NC}"
npm install --no-save --no-package-lock --no-fund

cd frontend
echo -e "${BLUE}Installation des dépendances frontend...${NC}"
npm install --legacy-peer-deps --no-save --no-package-lock --no-fund
cd ..

# 4. Build local pour vérification
echo -e "\n${YELLOW}Test de build local...${NC}"
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}Erreur lors du build local. Correction nécessaire avant déploiement.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Build local réussi${NC}"

# 5. Déploiement direct sur Vercel avec bypass des vérifications standards
echo -e "\n${BLUE}=== Lancement du déploiement optimisé sur Vercel ===${NC}"

# Variables d'environnement
JWT_SECRET="BXcp8JDIZk5L9w3s2PtR7qYaFg6hVeUn"
SUPABASE_URL="https://mbwurtmvdgmnrizxfouf.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MDU4MDAsImV4cCI6MjA2MzI4MTgwMH0.tNF11pL0MQQKhb3ejQiHjLhTCIGqabIhKu-WIdZvMDs"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzcwNTgwMCwiZXhwIjoyMDYzMjgxODAwfQ.Ojvhv2gXUNiv5NmdMniJyZKgY9d-MqjN3_3p9KIJFsY"
TEMPLATE_STORAGE_BUCKET="ppt-templates"

# Déploiement direct avec le flag --prebuilt pour utiliser le build local
mkdir -p .vercel/output
cp -r frontend/build .vercel/output/static
mkdir -p .vercel/output/functions
cp -r api .vercel/output/functions/

# Création du config.json pour le déploiement
mkdir -p .vercel/output/config
cat > .vercel/output/config/config.json << EOL
{
  "version": 3,
  "routes": [
    { "src": "/api/image-proxy", "dest": "api/image-proxy.js" },
    { "src": "/api/slide-image", "dest": "api/slide-image.js" },
    { "src": "/api/(.*)", "dest": "api/$1.js" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ],
  "env": {
    "JWT_SECRET": "${JWT_SECRET}",
    "SUPABASE_URL": "${SUPABASE_URL}",
    "SUPABASE_ANON_KEY": "${SUPABASE_ANON_KEY}",
    "SUPABASE_SERVICE_KEY": "${SUPABASE_SERVICE_KEY}",
    "TEMPLATE_STORAGE_BUCKET": "${TEMPLATE_STORAGE_BUCKET}",
    "NODE_ENV": "production"
  }
}
EOL

# Déploiement manuel avec le CLI Vercel
vercel deploy --prebuilt --yes --prod \
  -e JWT_SECRET="${JWT_SECRET}" \
  -e SUPABASE_URL="${SUPABASE_URL}" \
  -e SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY}" \
  -e SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_KEY}" \
  -e TEMPLATE_STORAGE_BUCKET="${TEMPLATE_STORAGE_BUCKET}" \
  -e NODE_ENV="production"

DEPLOY_STATUS=$?

if [ $DEPLOY_STATUS -ne 0 ]; then
  echo -e "${RED}Erreur lors du déploiement. Vérifiez les logs pour plus de détails.${NC}"
  exit 1
fi

echo -e "\n${GREEN}=== Déploiement terminé avec succès! ===${NC}"
echo -e "${BLUE}Votre application avec les améliorations d'image est maintenant disponible sur Vercel.${NC}"
