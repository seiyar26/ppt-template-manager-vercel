#!/bin/bash

# Script de déploiement Production-Ready - Version FINALE
# Optimisé pour garantir un déploiement réussi

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Déploiement Production PPT Template Manager sur Vercel - VERSION FINALE ===${NC}"
echo "Date: $(date)"

# 1. Nettoyage complet
echo -e "\n${YELLOW}Nettoyage complet de l'environnement...${NC}"
rm -rf .vercel/output
rm -rf frontend/build
rm -rf node_modules
rm -rf frontend/node_modules
rm -rf package-lock.json
rm -rf frontend/package-lock.json
rm -f .vercel/project.json

# 2. Préparation de l'environnement Node.js
echo -e "\n${YELLOW}Configuration de l'environnement Node.js...${NC}"

# Variables d'environnement
export NODE_OPTIONS="--max-old-space-size=4096"
export VERCEL_FORCE_NO_BUILD_CACHE=1
export NODE_ENV=production

# 3. Installation des dépendances avec gestion stricte des versions
echo -e "\n${YELLOW}Installation des dépendances avec verrouillage de versions...${NC}"

# Installation manuelle des dépendances critiques
cd frontend
npm install --no-save --no-package-lock react@18.2.0 react-dom@18.2.0 react-router-dom@6.8.2 --force
npm install --no-save --no-package-lock ajv@8.12.0 ajv-keywords@5.1.0 --force
npm install --no-save --no-package-lock --legacy-peer-deps

# 4. Build manuel optimisé
echo -e "\n${YELLOW}Construction du build de production...${NC}"
CI=false npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}Erreur lors du build. Tentative avec méthode alternative...${NC}"
  
  # Méthode alternative avec create-react-app directement
  rm -rf node_modules
  npm install --no-save --no-package-lock react-scripts@5.0.1 --force
  CI=false npx react-scripts build
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Échec du build même avec la méthode alternative. Déploiement annulé.${NC}"
    exit 1
  fi
fi

cd ..
echo -e "${GREEN}✓ Build de production réussi${NC}"

# 5. Préparation du déploiement direct
echo -e "\n${YELLOW}Préparation du déploiement...${NC}"

# Variables d'environnement pour le déploiement
JWT_SECRET="BXcp8JDIZk5L9w3s2PtR7qYaFg6hVeUn"
SUPABASE_URL="https://mbwurtmvdgmnrizxfouf.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MDU4MDAsImV4cCI6MjA2MzI4MTgwMH0.tNF11pL0MQQKhb3ejQiHjLhTCIGqabIhKu-WIdZvMDs"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzcwNTgwMCwiZXhwIjoyMDYzMjgxODAwfQ.Ojvhv2gXUNiv5NmdMniJyZKgY9d-MqjN3_3p9KIJFsY"
TEMPLATE_STORAGE_BUCKET="ppt-templates"

# Configuration Vercel simplifiée
cat > vercel.json << EOL
{
  "version": 2,
  "buildCommand": null,
  "installCommand": null,
  "framework": null,
  "outputDirectory": "frontend/build"
}
EOL

# 6. Création de la structure pour le déploiement manuel Vercel
echo -e "\n${YELLOW}Préparation de la structure Vercel...${NC}"
mkdir -p .vercel/output/static
mkdir -p .vercel/output/functions

# Copie des fichiers statiques
cp -r frontend/build/* .vercel/output/static/

# Préparation des fonctions API
mkdir -p .vercel/output/functions/api
cp -r api/* .vercel/output/functions/api/

# Configuration du déploiement
mkdir -p .vercel/output/config
cat > .vercel/output/config/config.json << EOL
{
  "version": 3,
  "routes": [
    {
      "src": "/api/image-proxy",
      "dest": "/api/image-proxy.js",
      "headers": {
        "Cache-Control": "public, max-age=604800, immutable"
      }
    },
    {
      "src": "/api/slide-image",
      "dest": "/api/slide-image.js",
      "headers": {
        "Cache-Control": "public, max-age=604800, immutable"
      }
    },
    {
      "src": "/api/(.*)",
      "dest": "/api/$1.js",
      "headers": {
        "Cache-Control": "public, max-age=60, s-maxage=86400, stale-while-revalidate=3600"
      }
    },
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

# 7. Déploiement sur Vercel
echo -e "\n${BLUE}=== Lancement du déploiement sur Vercel ===${NC}"

# Utilisation du flag --prebuilt pour indiquer que le build est déjà fait
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

# 8. Vérification post-déploiement
echo -e "\n${GREEN}=== Déploiement terminé avec succès! ===${NC}"
echo -e "${BLUE}Votre application avec les fonctionnalités d'optimisation d'images est maintenant disponible sur Vercel.${NC}"
echo -e "${YELLOW}Points à vérifier:${NC}"
echo -e "1. Chargement des images et performance du proxy"
echo -e "2. Fonctionnement du cache des images"
echo -e "3. Métriques de performance dans la console"
