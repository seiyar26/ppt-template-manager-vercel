#!/bin/bash

# Script de déploiement automatisé pour Vercel
# PPT Template Manager

set -e

echo "🚀 Déploiement PPT Template Manager sur Vercel"
echo "=============================================="

# Vérifier que Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé"
    echo "📦 Installation en cours..."
    npm install -g vercel
fi

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "vercel.json" ]; then
    echo "❌ Fichier vercel.json non trouvé"
    echo "Assurez-vous d'être dans le répertoire racine du projet"
    exit 1
fi

# Vérifier les variables d'environnement critiques
echo "🔍 Vérification des variables d'environnement..."

if [ -z "$DATABASE_URL" ] && [ -z "$POSTGRES_CONNECTION_STRING" ]; then
    echo "⚠️  DATABASE_URL ou POSTGRES_CONNECTION_STRING non définie"
    echo "Assurez-vous de configurer la base de données dans Vercel"
fi

if [ -z "$JWT_SECRET" ]; then
    echo "⚠️  JWT_SECRET non définie"
    echo "Assurez-vous de configurer JWT_SECRET dans Vercel"
fi

# Nettoyer les dépendances
echo "🧹 Nettoyage des dépendances..."
rm -rf node_modules
rm -rf frontend/node_modules
rm -f package-lock.json
rm -f frontend/package-lock.json

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install
cd frontend && npm install && cd ..

# Build du frontend
echo "🏗️  Build du frontend..."
cd frontend && npm run build && cd ..

# Déploiement sur Vercel
echo "🚀 Déploiement sur Vercel..."
vercel --prod

# Récupérer l'URL de déploiement
DEPLOYMENT_URL=$(vercel ls --scope=$(vercel whoami) | grep -E "https://.*\.vercel\.app" | head -1 | awk '{print $2}')

if [ -n "$DEPLOYMENT_URL" ]; then
    echo "✅ Déploiement réussi!"
    echo "🌐 URL: $DEPLOYMENT_URL"
    
    # Proposer d'initialiser la base de données
    echo ""
    echo "🗄️  Voulez-vous initialiser la base de données? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "🔄 Initialisation de la base de données..."
        
        if [ -n "$MIGRATION_SECRET" ]; then
            curl -X POST "$DEPLOYMENT_URL/api/migrate" \
                -H "Content-Type: application/json" \
                -d "{\"secret\": \"$MIGRATION_SECRET\"}" \
                && echo "✅ Base de données initialisée" \
                || echo "❌ Erreur lors de l'initialisation"
        else
            echo "⚠️  MIGRATION_SECRET non définie, initialisation manuelle requise"
            echo "Appelez: curl -X POST $DEPLOYMENT_URL/api/migrate -H 'Content-Type: application/json' -d '{\"secret\": \"your-secret\"}'"
        fi
    fi
    
    echo ""
    echo "📋 Prochaines étapes:"
    echo "1. Configurez les variables d'environnement dans Vercel Dashboard"
    echo "2. Testez l'application: $DEPLOYMENT_URL"
    echo "3. Configurez votre domaine personnalisé si nécessaire"
    
else
    echo "❌ Impossible de récupérer l'URL de déploiement"
    echo "Vérifiez manuellement avec: vercel ls"
fi

echo ""
echo "🎉 Déploiement terminé!"
