# Déploiement Vercel - PPT Template Manager

Ce guide explique comment déployer le PPT Template Manager sur Vercel avec une architecture serverless complète.

## Architecture Vercel

- **Frontend**: React app déployé sur Vercel
- **Backend**: API Routes Vercel (serverless functions)
- **Base de données**: PostgreSQL externe (Supabase/Neon recommandé)
- **Stockage fichiers**: Vercel Blob Storage
- **Authentification**: JWT avec sessions stateless

## Prérequis

1. **Compte Vercel** avec CLI installé
2. **Base de données PostgreSQL** externe (Supabase, Neon, ou autre)
3. **Token Vercel Blob** pour le stockage des fichiers

## Configuration

### 1. Variables d'environnement Vercel

Configurez ces variables dans votre dashboard Vercel :

```bash
# Base de données
DATABASE_URL=postgresql://username:password@hostname:port/database
POSTGRES_CONNECTION_STRING=postgresql://username:password@hostname:port/database

# Authentification
JWT_SECRET=your-super-secret-jwt-key-here

# Stockage Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_token_here

# Email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# ConvertAPI (optionnel)
CONVERTAPI_SECRET=your-convertapi-secret

# Migration (pour initialisation)
MIGRATION_SECRET=your-migration-secret

# Environnement
NODE_ENV=production
```

### 2. Configuration de la base de données

#### Option A: Supabase (Recommandé)
1. Créez un projet sur [Supabase](https://supabase.com)
2. Récupérez l'URL de connexion PostgreSQL
3. Ajoutez-la dans `DATABASE_URL`

#### Option B: Neon
1. Créez un projet sur [Neon](https://neon.tech)
2. Récupérez l'URL de connexion
3. Ajoutez-la dans `DATABASE_URL`

### 3. Configuration Vercel Blob Storage

1. Activez Vercel Blob dans votre dashboard
2. Créez un token de lecture/écriture
3. Ajoutez-le dans `BLOB_READ_WRITE_TOKEN`

## Déploiement

### 1. Déploiement automatique

```bash
# Cloner le repo
git clone <your-repo-url>
cd ppt-template-manager

# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

### 2. Configuration post-déploiement

Après le premier déploiement, initialisez la base de données :

```bash
# Appelez l'endpoint de migration (une seule fois)
curl -X POST https://your-app.vercel.app/api/migrate \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-migration-secret"}'
```

## Structure des fichiers

```
/
├── api/                    # API Routes Vercel
│   ├── _lib/              # Utilitaires partagés
│   │   ├── database.js    # Configuration DB
│   │   ├── models.js      # Modèles Sequelize
│   │   ├── auth.js        # Middleware auth
│   │   └── storage.js     # Vercel Blob Storage
│   ├── auth/              # Authentification
│   │   ├── login.js       # POST /api/auth/login
│   │   └── me.js          # GET /api/auth/me
│   ├── templates/         # Gestion templates
│   │   ├── index.js       # GET/POST /api/templates
│   │   ├── [id].js        # GET/PUT/DELETE /api/templates/:id
│   │   └── upload.js      # POST /api/templates/upload
│   ├── fields/            # Gestion champs
│   │   ├── index.js       # POST /api/fields
│   │   └── [id].js        # PUT/DELETE /api/fields/:id
│   ├── export/            # Export documents
│   │   └── pdf.js         # POST /api/export/pdf
│   └── migrate.js         # Migration DB
├── frontend/              # Application React
├── vercel.json           # Configuration Vercel
└── package.json          # Dependencies principales
```

## Fonctionnalités adaptées

### ✅ Compatible Vercel
- Authentification JWT stateless
- Upload via Vercel Blob Storage
- API Routes serverless
- Base de données externe
- Export PDF en streaming

### ⚠️ Limitations Vercel
- Pas de stockage local persistant
- Timeout de 30s pour les functions
- Taille limitée des responses (4.5MB)
- Pas de WebSockets persistants

## Monitoring et Debug

### Logs Vercel
```bash
# Voir les logs en temps réel
vercel logs --follow

# Logs d'une function spécifique
vercel logs --follow --scope=api
```

### Debug local
```bash
# Développement local avec API routes
cd frontend && npm start
# Dans un autre terminal
vercel dev
```

## Optimisations

### Performance
- Les API routes sont mises en cache automatiquement
- Utilisation de `maxDuration: 30` pour les functions lourdes
- Compression automatique des responses

### Sécurité
- CORS configuré pour production
- JWT avec expiration
- Variables d'environnement sécurisées
- Validation des inputs

## Troubleshooting

### Erreur de connexion DB
```bash
# Vérifier la connexion
curl https://your-app.vercel.app/api/auth/me
```

### Problème d'upload
```bash
# Vérifier Vercel Blob
vercel env ls
```

### Timeout des functions
- Optimiser les requêtes DB
- Utiliser des indexes
- Paginer les résultats

## Support

Pour toute question sur le déploiement Vercel :
1. Vérifiez les logs Vercel
2. Consultez la documentation Vercel
3. Testez en local avec `vercel dev`
