#!/bin/bash

echo "🔧 Configuration des variables d'environnement Vercel pour Supabase..."

# Variables Supabase
echo "Ajout de SUPABASE_URL..."
echo "https://mbwurtmvdgmnrizxfouf.supabase.co" | vercel env add SUPABASE_URL production

echo "Ajout de SUPABASE_ANON_KEY..."
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MDU4MDAsImV4cCI6MjA2MzI4MTgwMH0.tNF11pL0MQQKhb3ejQiHjLhTCIGqabIhKu-WIdZvMDs" | vercel env add SUPABASE_ANON_KEY production

echo "Ajout de SUPABASE_SERVICE_KEY..."
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzcwNTgwMCwiZXhwIjoyMDYzMjgxODAwfQ.Ojvhv2gXUNiv5NmdMniJyZKgY9d-MqjN3_3p9KIJFsY" | vercel env add SUPABASE_SERVICE_KEY production

# Clé JWT pour l'authentification
echo "Ajout de JWT_SECRET..."
echo "ppt_template_manager_secret_key_vercel" | vercel env add JWT_SECRET production

# Configuration du client frontend
echo "Mise à jour de REACT_APP_SUPABASE_URL..."
echo "https://mbwurtmvdgmnrizxfouf.supabase.co" | vercel env add REACT_APP_SUPABASE_URL production

echo "Mise à jour de REACT_APP_SUPABASE_ANON_KEY..."
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MDU4MDAsImV4cCI6MjA2MzI4MTgwMH0.tNF11pL0MQQKhb3ejQiHjLhTCIGqabIhKu-WIdZvMDs" | vercel env add REACT_APP_SUPABASE_ANON_KEY production

echo "✅ Variables d'environnement configurées"

echo "🚀 Lancement du déploiement..."
vercel --prod
