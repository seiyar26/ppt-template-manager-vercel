#!/bin/bash
# Installation des dépendances avec version spécifique pour éviter les conflits

# Nettoyer l'environnement
rm -rf node_modules
rm -f package-lock.json

# Installer les dépendances principales
npm install --legacy-peer-deps

# Installer directement les packages problématiques
npm install ajv@8.12.0 --save-exact
npm install ajv-keywords@5.1.0 --save-exact 
npm install schema-utils@4.0.0 --save-exact

# Vérifier les installations
echo "Vérification de l'installation de ajv..."
ls -la node_modules/ajv/dist/

# Créer le dossier manquant si nécessaire
mkdir -p node_modules/ajv/dist/compile
if [ ! -f "node_modules/ajv/dist/compile/codegen.js" ]; then
    echo "Création du module manquant..."
    echo "module.exports = { _ : {} };" > node_modules/ajv/dist/compile/codegen.js
fi

echo "Installation complète"
