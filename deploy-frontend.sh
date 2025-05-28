#!/bin/bash
# Script de déploiement simplifié pour le frontend uniquement

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Déploiement Frontend PPT Template Manager sur Vercel ===${NC}"
echo "Date: $(date)"

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}Vercel CLI n'est pas installé.${NC}"
    exit 1
fi

# Simplifier le package.json du frontend
echo -e "${YELLOW}Préparation du package.json pour le déploiement...${NC}"
cd frontend

# Créer un backup du package.json original
cp package.json package.json.backup

# Simplifier le package.json
cat > package.json << 'EOL'
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
    "build": "CI=false SKIP_PREFLIGHT_CHECK=true react-scripts build",
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

# Créer un vercel.json simplifié dans le répertoire frontend
cat > vercel.json << 'EOL'
{
  "framework": "create-react-app",
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
EOL

echo -e "${GREEN}Fichiers préparés pour le déploiement.${NC}"

# Déployer uniquement le frontend
echo -e "${YELLOW}Déploiement du frontend sur Vercel...${NC}"
vercel --prod --yes --scope seiyar26s-projects \
  -e NODE_ENV=production \
  -e REACT_APP_SUPABASE_URL="https://mbwurtmvdgmnrizxfouf.supabase.co" \
  -e REACT_APP_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MDU4MDAsImV4cCI6MjA2MzI4MTgwMH0.tNF11pL0MQQKhb3ejQiHjLhTCIGqabIhKu-WIdZvMDs" \
  -e REACT_APP_API_URL="/api"

DEPLOY_STATUS=$?

# Restaurer le package.json original
mv package.json.backup package.json

cd ..

if [ $DEPLOY_STATUS -eq 0 ]; then
    echo -e "${GREEN}Déploiement réussi !${NC}"
else
    echo -e "${RED}Erreur lors du déploiement.${NC}"
    exit 1
fi
