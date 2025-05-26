#!/bin/bash

# Script pour configurer toutes les variables d'environnement sur Vercel
# Usage: ./configure-vercel-env.sh

set -e

echo "🚀 Configuration des variables d'environnement sur Vercel..."

# Naviguer vers le répertoire du projet
cd "$(dirname "$0")"

# Variables d'environnement à configurer
SUPABASE_URL="https://mbwurtmvdgmnrizxfouf.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MDU4MDAsImV4cCI6MjA2MzI4MTgwMH0.tNF11pL0MQQKhb3ejQiHjLhTCIGqabIhKu-WIdZvMDs"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzcwNTgwMCwiZXhwIjoyMDYzMjgxODAwfQ.Ojvhv2gXUNiv5NmdMniJyZKgY9d-MqjN3_3p9KIJFsY"
NODE_ENV="production"
VERCEL="1"
TEMPLATE_STORAGE_BUCKET="ppt-templates"

echo "📝 Configuration de SUPABASE_URL..."
echo "$SUPABASE_URL" | vercel env add SUPABASE_URL production

echo "📝 Configuration de SUPABASE_ANON_KEY..."
echo "$SUPABASE_ANON_KEY" | vercel env add SUPABASE_ANON_KEY production

echo "📝 Configuration de SUPABASE_SERVICE_KEY..."
echo "$SUPABASE_SERVICE_KEY" | vercel env add SUPABASE_SERVICE_KEY production

echo "📝 Configuration de NODE_ENV..."
echo "$NODE_ENV" | vercel env add NODE_ENV production

echo "📝 Configuration de VERCEL..."
echo "$VERCEL" | vercel env add VERCEL production

echo "📝 Configuration de TEMPLATE_STORAGE_BUCKET..."
echo "$TEMPLATE_STORAGE_BUCKET" | vercel env add TEMPLATE_STORAGE_BUCKET production

echo "✅ Toutes les variables d'environnement ont été configurées sur Vercel !"

echo ""
echo "📋 Vérification des variables configurées :"
vercel env ls

echo ""
echo "🎯 Variables configurées avec succès :"
echo "  - SUPABASE_URL"
echo "  - SUPABASE_ANON_KEY"
echo "  - SUPABASE_SERVICE_KEY"
echo "  - NODE_ENV"
echo "  - VERCEL"
echo "  - TEMPLATE_STORAGE_BUCKET"

echo ""
echo "🚀 Vous pouvez maintenant redéployer votre application avec : vercel --prod"
