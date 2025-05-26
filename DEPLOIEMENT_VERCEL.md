# Déploiement optimisé sur Vercel

Ce guide détaille la procédure de déploiement optimisée pour Vercel, garantissant une compatibilité à 100% de l'application PPT Template Manager.

## Prérequis

- Un compte [Vercel](https://vercel.com)
- Un compte [Supabase](https://supabase.com) avec un projet créé
- Node.js 18+ installé sur votre machine

## 1. Configuration Supabase

1. **Créer un bucket de stockage**
   - Nom du bucket: `ppt-templates`
   - Paramètres de sécurité: Activer l'accès public pour les fichiers

2. **Créer les tables nécessaires**
   ```sql
   -- Table des utilisateurs (peut être gérée par l'auth Supabase)
   CREATE TABLE IF NOT EXISTS users (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     email TEXT UNIQUE NOT NULL,
     name TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Table des templates
   CREATE TABLE IF NOT EXISTS templates (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name TEXT NOT NULL,
     description TEXT,
     file_name TEXT NOT NULL,
     file_path TEXT NOT NULL,
     file_url TEXT,
     file_size INTEGER NOT NULL,
     user_id UUID REFERENCES users(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Table des catégories
   CREATE TABLE IF NOT EXISTS categories (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name TEXT NOT NULL,
     color TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Table de liaison templates-catégories
   CREATE TABLE IF NOT EXISTS template_categories (
     template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
     category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
     PRIMARY KEY (template_id, category_id)
   );
   ```

3. **Récupérer les informations d'accès**
   - URL Supabase: `https://<votre-projet>.supabase.co`
   - Clé anonyme: Dans les paramètres du projet > API > `anon key`
   - Clé de service: Dans les paramètres du projet > API > `service_role key`

## 2. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet contenant:

```
# Configuration Supabase
SUPABASE_URL=https://<votre-projet>.supabase.co
SUPABASE_ANON_KEY=<votre-clé-anon>
SUPABASE_SERVICE_KEY=<votre-clé-service>

# Configuration environnement
NODE_ENV=production
```

## 3. Déploiement sur Vercel

### Option 1: Déploiement depuis l'interface Vercel

1. Connectez-vous à [Vercel](https://vercel.com)
2. Cliquez sur "New Project"
3. Importez votre dépôt Git
4. Configurez les variables d'environnement:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `NODE_ENV`: `production`
5. Cliquez sur "Deploy"

### Option 2: Déploiement via CLI Vercel

1. Installez la CLI Vercel:
   ```
   npm install -g vercel
   ```

2. Connectez-vous à Vercel:
   ```
   vercel login
   ```

3. Déployez le projet:
   ```
   cd /chemin/vers/ppt-template-manager-vercel
   vercel --prod
   ```

4. Suivez les instructions pour configurer les variables d'environnement

## 4. Vérification du déploiement

Une fois le déploiement terminé, vérifiez que:

1. Le frontend est accessible à l'URL de déploiement
2. L'API est accessible à `<URL_DEPLOIEMENT>/api`
3. L'upload et la récupération des templates fonctionnent correctement

## Résolution des problèmes courants

### Les images ou fichiers ne s'affichent pas
- Vérifiez que le bucket Supabase est configuré correctement
- Assurez-vous que les politiques d'accès public sont activées

### Erreurs 500 sur les API routes
- Vérifiez les logs dans l'interface Vercel
- Assurez-vous que toutes les variables d'environnement sont correctement définies

### Problèmes d'upload de fichiers volumineux
- L'application utilise automatiquement Supabase Storage pour les fichiers > 4.5MB
- Pour les fichiers plus petits, Vercel Blob est utilisé

## Architecture optimisée

L'application a été spécialement optimisée pour Vercel:

- **Serverless Functions**: API routes optimisées pour l'architecture sans état
- **Edge Middleware**: Gestion optimisée des headers CORS et sécurité
- **Supabase Integration**: Stockage des fichiers et base de données
- **Vercel Blob**: Gestion des fichiers légers (< 4.5MB)

---

Pour toute assistance supplémentaire, consultez la [documentation Vercel](https://vercel.com/docs) ou [contactez l'équipe de support](mailto:support@example.com).
