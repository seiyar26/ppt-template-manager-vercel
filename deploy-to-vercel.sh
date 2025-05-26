#!/bin/bash

# Script de déploiement optimisé pour Vercel
# Ce script automatise le déploiement de l'application PPT Template Manager sur Vercel

# Couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Déploiement PPT Template Manager sur Vercel ===${NC}"
echo "Date: $(date)"

# Vérification des prérequis
echo -e "\n${YELLOW}Vérification des prérequis...${NC}"

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}Vercel CLI n'est pas installé. Installation...${NC}"
    npm install -g vercel
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erreur lors de l'installation de Vercel CLI. Veuillez l'installer manuellement:${NC}"
        echo "npm install -g vercel"
        exit 1
    fi
    echo -e "${GREEN}Vercel CLI installé avec succès.${NC}"
else
    VERCEL_VERSION=$(vercel --version)
    echo -e "${GREEN}✓ Vercel CLI détecté: ${VERCEL_VERSION}${NC}"
fi

# Vérification des fichiers et de la configuration
echo -e "\n${YELLOW}Vérification de la configuration...${NC}"

# Vérifier le fichier vercel.json
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✓ vercel.json trouvé${NC}"
else
    echo -e "${RED}× vercel.json non trouvé${NC}"
    exit 1
fi

# Vérifier si l'utilisateur est connecté à Vercel
echo -e "\n${YELLOW}Vérification de la connexion Vercel...${NC}"
VERCEL_USER=$(vercel whoami 2>/dev/null)
VERCEL_STATUS=$?

if [ $VERCEL_STATUS -ne 0 ]; then
    echo -e "${YELLOW}Vous n'êtes pas connecté à Vercel. Connexion...${NC}"
    vercel login
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erreur lors de la connexion à Vercel.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Connecté à Vercel en tant que: ${VERCEL_USER}${NC}"
fi

# Vérification des variables d'environnement
echo -e "\n${YELLOW}Vérification des variables d'environnement...${NC}"
node scripts/check-env.js
ENV_CHECK_STATUS=$?

if [ $ENV_CHECK_STATUS -ne 0 ]; then
    echo -e "${YELLOW}Voulez-vous configurer les variables d'environnement maintenant? (y/n)${NC}"
    read -r SETUP_ENV
    
    if [ "$SETUP_ENV" = "y" ]; then
        echo -e "${BLUE}Configuration des variables d'environnement principales:${NC}"
        echo -e "${YELLOW}URL Supabase (ex: https://votre-projet.supabase.co):${NC}"
        read -r SUPABASE_URL
        
        echo -e "${YELLOW}Clé anonyme Supabase:${NC}"
        read -r SUPABASE_ANON_KEY
        
        echo -e "${YELLOW}Clé de service Supabase:${NC}"
        read -r SUPABASE_SERVICE_KEY
        
        # Création du fichier .env
        echo "SUPABASE_URL=$SUPABASE_URL" > .env
        echo "SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" >> .env
        echo "SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY" >> .env
        echo "NODE_ENV=production" >> .env
        
        # Mise à jour du frontend
        echo "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL" > frontend/.env.production
        echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" >> frontend/.env.production
        echo "REACT_APP_SUPABASE_URL=$SUPABASE_URL" >> frontend/.env.production
        echo "REACT_APP_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" >> frontend/.env.production
        echo "REACT_APP_API_URL=/api" >> frontend/.env.production
        echo "NEXT_PUBLIC_API_URL=/api" >> frontend/.env.production
        echo "NODE_ENV=production" >> frontend/.env.production
        echo "VERCEL=1" >> frontend/.env.production
        
        echo -e "${GREEN}✓ Variables d'environnement configurées${NC}"
    else
        echo -e "${YELLOW}Veuillez configurer manuellement les variables d'environnement avant le déploiement.${NC}"
        echo "Vous pouvez vous référer au fichier .env.example pour la liste des variables nécessaires."
        exit 1
    fi
fi

# Déploiement sur Vercel
echo -e "\n${BLUE}=== Déploiement sur Vercel (Nouveau Projet) ===${NC}"
echo -e "${YELLOW}Préparation du nouveau déploiement...${NC}"

# Définir un nom unique pour le projet basé sur un timestamp
PROJECT_NAME="ppt-template-manager-$(date +%s)"
echo -e "${GREEN}Nom du nouveau projet: ${PROJECT_NAME}${NC}"

# Définition explicite des variables d'environnement Supabase
SUPABASE_URL="https://mbwurtmvdgmnrizxfouf.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MDU4MDAsImV4cCI6MjA2MzI4MTgwMH0.tNF11pL0MQQKhb3ejQiHjLhTCIGqabIhKu-WIdZvMDs"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzcwNTgwMCwiZXhwIjoyMDYzMjgxODAwfQ.Ojvhv2gXUNiv5NmdMniJyZKgY9d-MqjN3_3p9KIJFsY"
SUPABASE_PASSWORD="hf4oimWnHQaPUfSV"

# Affichage des variables pour débogage
echo -e "${GREEN}Variables d'environnement définies:${NC}"
echo -e "SUPABASE_URL = $SUPABASE_URL"
echo -e "SUPABASE_ANON_KEY = [MASQUÉ POUR SÉCURITÉ]"
echo -e "SUPABASE_SERVICE_KEY = [MASQUÉ POUR SÉCURITÉ]"
echo -e "SUPABASE_PASSWORD = [MASQUÉ POUR SÉCURITÉ]"

# Créer un nouveau projet sur Vercel
echo -e "${YELLOW}Création d'un nouveau projet Vercel...${NC}"
# D'abord, supprimer le lien avec le projet existant
rm -f .vercel/project.json 2>/dev/null

# Déployer en tant que nouveau projet
vercel --prod --yes --name "$PROJECT_NAME" --scope seiyar26s-projects \
  -e NODE_ENV=production \
  -e VERCEL=1 \
  -e SUPABASE_URL="$SUPABASE_URL" \
  -e NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL" \
  -e SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" \
  -e SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_KEY" \
  -e SUPABASE_PASSWORD="$SUPABASE_PASSWORD" \
  -e DB_PASSWORD="$SUPABASE_PASSWORD" \
  -e TEMPLATE_STORAGE_BUCKET=ppt-templates

if [ $? -ne 0 ]; then
    echo -e "${RED}Erreur lors du déploiement sur Vercel.${NC}"
    exit 1
fi

echo -e "\n${GREEN}=== Déploiement terminé avec succès! ===${NC}"
echo -e "${BLUE}Votre application est maintenant déployée sur Vercel.${NC}"
echo -e "${YELLOW}N'oubliez pas de vérifier les points suivants:${NC}"
echo "1. L'accès au frontend"
echo "2. L'accès à l'API (/api)"
echo "3. Le fonctionnement des uploads et du stockage de fichiers"
echo -e "\n${BLUE}Pour plus d'informations, consultez le fichier DEPLOIEMENT_VERCEL.md${NC}"
