#!/bin/bash

# Script de déploiement simplifié pour Vercel
# Avec gestion des erreurs et compatibilité maximale

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Déploiement simplifié PPT Template Manager sur Vercel ===${NC}"
echo "Date: $(date)"

# 1. Nettoyage initial
echo -e "\n${YELLOW}Préparation de l'environnement...${NC}"
rm -rf .vercel/project.json 2>/dev/null
rm -rf frontend/node_modules/.cache 2>/dev/null

# 2. Configuration minimale
echo -e "\n${YELLOW}Configuration du projet pour Vercel...${NC}"

# Configuration vercel.json minimale
cat > vercel.json << EOL
{
  "version": 2,
  "buildCommand": "cd frontend && npm install --legacy-peer-deps && npm run build",
  "outputDirectory": "frontend/build",
  "routes": [
    { "src": "/api/image-proxy", "dest": "/api/image-proxy.js" },
    { "src": "/api/slide-image", "dest": "/api/slide-image.js" },
    { "src": "/api/(.*)", "dest": "/api/$1.js" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
EOL

# 3. Déploiement direct
echo -e "\n${BLUE}=== Lancement du déploiement sur Vercel ===${NC}"

vercel --prod --yes \
  -e JWT_SECRET="BXcp8JDIZk5L9w3s2PtR7qYaFg6hVeUn" \
  -e SUPABASE_URL="https://mbwurtmvdgmnrizxfouf.supabase.co" \
  -e SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MDU4MDAsImV4cCI6MjA2MzI4MTgwMH0.tNF11pL0MQQKhb3ejQiHjLhTCIGqabIhKu-WIdZvMDs" \
  -e SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzcwNTgwMCwiZXhwIjoyMDYzMjgxODAwfQ.Ojvhv2gXUNiv5NmdMniJyZKgY9d-MqjN3_3p9KIJFsY" \
  -e TEMPLATE_STORAGE_BUCKET="ppt-templates" \
  -e NODE_ENV="production" \
  -e NEXT_PUBLIC_SUPABASE_URL="https://mbwurtmvdgmnrizxfouf.supabase.co" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MDU4MDAsImV4cCI6MjA2MzI4MTgwMH0.tNF11pL0MQQKhb3ejQiHjLhTCIGqabIhKu-WIdZvMDs"

DEPLOY_STATUS=$?

if [ $DEPLOY_STATUS -ne 0 ]; then
  echo -e "${RED}Erreur lors du déploiement standard. Tentative de déploiement avec l'option --force...${NC}"
  
  # Tentative avec --force en cas d'échec
  vercel --prod --yes --force \
    -e JWT_SECRET="BXcp8JDIZk5L9w3s2PtR7qYaFg6hVeUn" \
    -e SUPABASE_URL="https://mbwurtmvdgmnrizxfouf.supabase.co" \
    -e SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MDU4MDAsImV4cCI6MjA2MzI4MTgwMH0.tNF11pL0MQQKhb3ejQiHjLhTCIGqabIhKu-WIdZvMDs" \
    -e SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzcwNTgwMCwiZXhwIjoyMDYzMjgxODAwfQ.Ojvhv2gXUNiv5NmdMniJyZKgY9d-MqjN3_3p9KIJFsY" \
    -e TEMPLATE_STORAGE_BUCKET="ppt-templates" \
    -e NODE_ENV="production" \
    -e NEXT_PUBLIC_SUPABASE_URL="https://mbwurtmvdgmnrizxfouf.supabase.co" \
    -e NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MDU4MDAsImV4cCI6MjA2MzI4MTgwMH0.tNF11pL0MQQKhb3ejQiHjLhTCIGqabIhKu-WIdZvMDs"
  
  FORCE_STATUS=$?
  
  if [ $FORCE_STATUS -ne 0 ]; then
    echo -e "${RED}Échec du déploiement même avec l'option --force. Vérifiez les logs pour plus de détails.${NC}"
    exit 1
  fi
fi

# 4. Succès du déploiement
echo -e "\n${GREEN}=== Déploiement terminé avec succès! ===${NC}"
echo -e "${BLUE}Votre application est maintenant disponible sur Vercel.${NC}"
echo -e "${YELLOW}Les fonctionnalités d'optimisation d'images via le proxy sont maintenant actives.${NC}"
