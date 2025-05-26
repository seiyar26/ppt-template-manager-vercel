#!/bin/bash
# Script pour configurer les variables d'environnement Vercel

# Définition des variables Supabase
SUPABASE_URL="https://mbwurtmvdgmnrizxfouf.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MDU4MDAsImV4cCI6MjA2MzI4MTgwMH0.tNF11pL0MQQKhb3ejQiHjLhTCIGqabIhKu-WIdZvMDs"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhmb3VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzcwNTgwMCwiZXhwIjoyMDYzMjgxODAwfQ.Ojvhv2gXUNiv5NmdMniJyZKgY9d-MqjN3_3p9KIJFsY"

# Environnements
ENVIRONMENTS=("production" "preview" "development")

# Ajouter variables pour chaque environnement
for env in "${ENVIRONMENTS[@]}"; do
  echo "Configuration pour l'environnement: $env"
  
  # SUPABASE_URL
  echo -e "Adding SUPABASE_URL for $env environment..."
  echo -e "$SUPABASE_URL" | vercel env add SUPABASE_URL $env
  
  # SUPABASE_ANON_KEY
  echo -e "Adding SUPABASE_ANON_KEY for $env environment..."
  echo -e "$SUPABASE_ANON_KEY" | vercel env add SUPABASE_ANON_KEY $env
  
  # SUPABASE_SERVICE_KEY
  echo -e "Adding SUPABASE_SERVICE_KEY for $env environment..."
  echo -e "$SUPABASE_SERVICE_KEY" | vercel env add SUPABASE_SERVICE_KEY $env
done

echo "Toutes les variables d'environnement ont été configurées."
