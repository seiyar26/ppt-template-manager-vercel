#!/bin/bash

# Script de déploiement optimisé pour Vercel
# Version production-ready

# Couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Déploiement PPT Template Manager sur Vercel - Version Production ===${NC}"
echo "Date: $(date)"

# 1. Préparation du déploiement
echo -e "\n${YELLOW}Préparation du déploiement...${NC}"

# Définition des variables d'environnement
SUPABASE_URL="https://mbwurtmvdgmnrizxfouf.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MDU4MDAsImV4cCI6MjA2MzI4MTgwMH0.tNF11pL0MQQKhb3ejQiHjLhTCIGqabIhKu-WIdZvMDs"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzcwNTgwMCwiZXhwIjoyMDYzMjgxODAwfQ.Ojvhv2gXUNiv5NmdMniJyZKgY9d-MqjN3_3p9KIJFsY"
JWT_SECRET="BXcp8JDIZk5L9w3s2PtR7qYaFg6hVeUn"
TEMPLATE_STORAGE_BUCKET="ppt-templates"

# 2. Mise à jour des versions des packages React
echo -e "\n${YELLOW}Mise à jour des dépendances...${NC}"

# Installer les dépendances avec les options de compatibilité
echo -e "${BLUE}Installation des dépendances racine...${NC}"
npm install --no-fund --no-audit

echo -e "${BLUE}Installation des dépendances frontend...${NC}"
cd frontend
npm install --legacy-peer-deps
cd ..

# 3. Test de build local
echo -e "\n${YELLOW}Test de build local...${NC}"
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}Erreur lors du build local. Correction nécessaire avant déploiement.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Build local réussi${NC}"

# 4. Préparation de la configuration Vercel
echo -e "\n${YELLOW}Préparation de la configuration Vercel...${NC}"

# Création d'un fichier de configuration optimisé
cat > vercel.json << EOL
{
  "version": 2,
  "builds": [
    { "src": "api/*.js", "use": "@vercel/node" },
    { "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "frontend/build" } }
  ],
  "routes": [
    { "src": "/api/image-proxy", "dest": "/api/image-proxy.js" },
    { "src": "/api/slide-image", "dest": "/api/slide-image.js" },
    { "src": "/api/(.*)", "dest": "/api/$1.js" },
    { "src": "/static/(.*)", "dest": "/frontend/build/static/$1" },
    { "src": "/assets/(.*)", "dest": "/frontend/build/assets/$1" },
    { "src": "/favicon.ico", "dest": "/frontend/build/favicon.ico" },
    { "src": "/manifest.json", "dest": "/frontend/build/manifest.json" },
    { "src": "/(.*)", "dest": "/frontend/build/index.html" }
  ]
}
EOL

echo -e "${GREEN}✓ Configuration Vercel optimisée${NC}"

# 5. Lancement du déploiement
echo -e "\n${BLUE}=== Lancement du déploiement sur Vercel ===${NC}"

vercel --prod --yes \
  -e NODE_ENV=production \
  -e VERCEL=1 \
  -e SUPABASE_URL="$SUPABASE_URL" \
  -e NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL" \
  -e SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" \
  -e SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_KEY" \
  -e JWT_SECRET="$JWT_SECRET" \
  -e TEMPLATE_STORAGE_BUCKET="$TEMPLATE_STORAGE_BUCKET" \
  -e REACT_APP_SUPABASE_URL="$SUPABASE_URL" \
  -e REACT_APP_SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" \
  -e REACT_APP_API_URL="/api" 

DEPLOY_STATUS=$?

if [ $DEPLOY_STATUS -ne 0 ]; then
  echo -e "${RED}Erreur lors du déploiement. Vérifiez les logs pour plus de détails.${NC}"
  exit 1
fi

echo -e "\n${GREEN}=== Déploiement terminé avec succès! ===${NC}"
echo -e "${BLUE}Votre application est maintenant disponible sur Vercel.${NC}"
echo -e "${YELLOW}N'oubliez pas de vérifier:${NC}"
echo "1. L'accès au frontend"
echo "2. Le bon fonctionnement des API d'images"
echo "3. La gestion du cache des images"
