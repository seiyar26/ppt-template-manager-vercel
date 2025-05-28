#!/bin/bash

# Script de déploiement production-ready avec build local et upload statique
# Contourne les problèmes de build Vercel en utilisant une approche plus robuste

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Déploiement Production Static PPT Template Manager ===${NC}"
echo "Date: $(date)"

# 1. Préparation
echo -e "\n${YELLOW}Préparation de l'environnement de build local...${NC}"
rm -rf frontend/build
rm -rf frontend/node_modules/.cache
rm -rf .vercel/output

# 2. Installation des dépendances avec versions spécifiques
echo -e "\n${YELLOW}Installation des dépendances frontend...${NC}"
cd frontend
npm install --legacy-peer-deps

# Installation explicite des packages problématiques
echo -e "${BLUE}Installation des packages spécifiques pour résoudre les conflits...${NC}"
npm install ajv@8.12.0 ajv-keywords@5.1.0 schema-utils@4.0.0 --legacy-peer-deps --no-save

# 3. Build local
echo -e "\n${YELLOW}Construction du build de production en local...${NC}"
CI=false SKIP_PREFLIGHT_CHECK=true npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}Erreur lors du build local. Vérifiez les logs pour plus de détails.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Build local réussi${NC}"
cd ..

# 4. Préparation du déploiement statique
echo -e "\n${YELLOW}Préparation du déploiement statique...${NC}"

# Création de la structure pour déploiement statique
mkdir -p .vercel/output/static
mkdir -p .vercel/output/functions/api

# Copie des fichiers statiques
cp -r frontend/build/* .vercel/output/static/

# Copie des API functions
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
    "JWT_SECRET": "BXcp8JDIZk5L9w3s2PtR7qYaFg6hVeUn",
    "SUPABASE_URL": "https://mbwurtmvdgmnrizxfouf.supabase.co",
    "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MDU4MDAsImV4cCI6MjA2MzI4MTgwMH0.tNF11pL0MQQKhb3ejQiHjLhTCIGqabIhKu-WIdZvMDs",
    "SUPABASE_SERVICE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzcwNTgwMCwiZXhwIjoyMDYzMjgxODAwfQ.Ojvhv2gXUNiv5NmdMniJyZKgY9d-MqjN3_3p9KIJFsY",
    "TEMPLATE_STORAGE_BUCKET": "ppt-templates",
    "NODE_ENV": "production"
  }
}
EOL

# 5. Déploiement sur Vercel avec l'option prebuilt
echo -e "\n${BLUE}=== Lancement du déploiement statique sur Vercel ===${NC}"
echo -e "${YELLOW}Déploiement du build pré-compilé...${NC}"

vercel deploy --prebuilt --prod --yes \
  -e JWT_SECRET="BXcp8JDIZk5L9w3s2PtR7qYaFg6hVeUn" \
  -e SUPABASE_URL="https://mbwurtmvdgmnrizxfouf.supabase.co" \
  -e SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MDU4MDAsImV4cCI6MjA2MzI4MTgwMH0.tNF11pL0MQQKhb3ejQiHjLhTCIGqabIhKu-WIdZvMDs" \
  -e SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzcwNTgwMCwiZXhwIjoyMDYzMjgxODAwfQ.Ojvhv2gXUNiv5NmdMniJyZKgY9d-MqjN3_3p9KIJFsY" \
  -e TEMPLATE_STORAGE_BUCKET="ppt-templates" \
  -e NODE_ENV="production"

DEPLOY_STATUS=$?

if [ $DEPLOY_STATUS -ne 0 ]; then
  echo -e "${RED}Erreur lors du déploiement statique. Dernier recours : tentative avec déploiement local...${NC}"
  
  # 6. En cas d'échec, offrir une solution locale
  echo -e "\n${YELLOW}Mise en place d'un serveur local pour tester l'application...${NC}"
  
  npm install -g serve
  
  echo -e "${GREEN}Serveur local prêt à être lancé avec la commande suivante :${NC}"
  echo -e "serve -s frontend/build -l 3000"
  
  echo -e "${YELLOW}Pour accéder à l'application :${NC} http://localhost:3000"
  
  # Proposition d'instructions pour un déploiement manuel
  echo -e "\n${YELLOW}Pour un déploiement manuel sur Vercel :${NC}"
  echo "1. Connectez-vous à l'interface Vercel (https://vercel.com)"
  echo "2. Créez un nouveau projet en important votre dépôt"
  echo "3. Dans 'Build & Development Settings', définissez:"
  echo "   - Framework: Other"
  echo "   - Build Command: cd frontend && npm install --legacy-peer-deps && npm run build"
  echo "   - Output Directory: frontend/build"
  echo "4. Ajoutez les variables d'environnement mentionnées dans ce script"
  
  exit 1
fi

# 7. Succès du déploiement
echo -e "\n${GREEN}=== Déploiement terminé avec succès! ===${NC}"
echo -e "${BLUE}Votre application est maintenant disponible sur Vercel.${NC}"
echo -e "${YELLOW}Points à vérifier sur le site déployé :${NC}"
echo -e "1. Chargement des images et performance du proxy"
echo -e "2. Fonctionnement du cache des images"
echo -e "3. Métriques de performance dans la console"
