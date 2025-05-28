#!/bin/bash

# Script pour déployer uniquement le frontend avec configuration optimale
echo "🚀 Déploiement du frontend optimisé pour Vercel..."

# Aller dans le répertoire frontend
cd frontend

# Supprimer le précédent build s'il existe
rm -rf build

# Ajouter une variable d'environnement temporaire pour le build
echo "REACT_APP_API_URL=http://localhost:12000/api" > .env.production.local
echo "REACT_APP_DEMO_MODE=true" >> .env.production.local

# Construire le frontend
echo "📦 Construction du frontend..."
npm install && npm run build

# Déployer sur Vercel
echo "🚀 Déploiement sur Vercel..."
vercel --prod

echo "✅ Déploiement terminé!"
echo "N'oubliez pas d'ajouter la variable d'environnement REACT_APP_API_URL dans les paramètres Vercel."
