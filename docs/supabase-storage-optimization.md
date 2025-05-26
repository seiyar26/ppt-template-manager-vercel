# Guide d'Optimisation Supabase Storage

## Pourquoi Supabase Storage > Vercel Blob

### Avantages de Supabase Storage

#### 💰 **Coûts**
- **Supabase** : 10GB gratuits, puis $0.09/GB
- **Vercel Blob** : 2GB gratuits, puis $0.15/GB + coûts de bandwidth

#### 🔒 **Sécurité**
- **Politiques RLS** granulaires par utilisateur/rôle
- **Intégration native** avec l'authentification Supabase
- **Validation côté serveur** automatique

#### 🚀 **Performance**
- **CDN global** Supabase inclus
- **Mise en cache intelligente**
- **Compression automatique** des images

#### 🛠️ **Fonctionnalités**
- **Transformation d'images** à la volée
- **Métadonnées riches** stockées en DB
- **Recherche avancée** dans les métadonnées
- **Versioning** des fichiers

## Configuration Optimale

### 1. Variables d'Environnement Requises

```bash
# Supabase uniquement (plus de Vercel Blob)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
```

### 2. Structure des Buckets Recommandée

```
ppt-templates/
├── public/           # Templates publics
│   ├── business/
│   ├── education/
│   └── creative/
├── private/          # Templates privés par utilisateur
│   ├── user_123/
│   └── user_456/
└── thumbnails/       # Miniatures générées automatiquement
```

### 3. Politiques RLS Optimales

```sql
-- Lecture publique pour les templates publics
CREATE POLICY "Public read access" ON storage.objects FOR SELECT
TO public USING (
  bucket_id = 'ppt-templates' AND 
  (storage.foldername(name))[1] = 'public'
);

-- Upload authentifié dans le dossier utilisateur
CREATE POLICY "User upload access" ON storage.objects FOR INSERT
TO authenticated WITH CHECK (
  bucket_id = 'ppt-templates' AND
  (storage.foldername(name))[1] = 'private' AND
  (storage.foldername(name))[2] = auth.uid()::text
);
```

### 4. Optimisations de Performance

#### Utilisation du CDN
```javascript
// URL avec optimisations automatiques
const { data } = supabase.storage
  .from('ppt-templates')
  .getPublicUrl('template.pptx', {
    transform: {
      quality: 80,
      format: 'auto',
      width: 800
    }
  });
```

#### Mise en cache intelligente
```javascript
const uploadOptions = {
  cacheControl: '3600',  // 1 heure
  contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  upsert: false  // Éviter les conflits
};
```

## Migration de Vercel Blob

### Script de Migration
```bash
# Exécuter le nettoyage
node api/_lib/cleanup-vercel-blob.js

# Installer les dépendances manquantes si nécessaire
npm install @supabase/supabase-js

# Initialiser Supabase Storage
node api/_lib/supabase-setup.js
```
