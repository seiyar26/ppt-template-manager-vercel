# ✅ Checklist de Déploiement Vercel - PPT Template Manager

## 🔧 **CONFIGURATION OBLIGATOIRE**

### 1. **Variables d'Environnement à Configurer sur Vercel**

Dans les **Project Settings** > **Environment Variables** de votre projet Vercel, ajoutez :

```bash
# 🔑 SUPABASE (CRITIQUE - REMPLACE VERCEL BLOB)
SUPABASE_URL=https://mbwurtmvdgmnrizxfouf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhm...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id3VydG12ZGdtbnJpenhm...

# 🔐 JWT & AUTH
JWT_SECRET=your-super-secret-jwt-key-here

# 🐘 DATABASE (optionnel si vous utilisez Supabase DB)
DATABASE_URL=postgresql://username:password@hostname:port/database

# 📧 EMAIL (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# 🔄 CONVERTAPI (optionnel)
CONVERTAPI_SECRET=your-convertapi-secret

# ⚙️ SYSTEM
NODE_ENV=production
```

## ✅ **VÉRIFICATIONS TECHNIQUES**

### 2. **Fichiers Critiques Vérifiés** ✅

- ✅ `vercel.json` - Configuration correcte
- ✅ `package.json` - Scripts de build configurés
- ✅ `api/_lib/storage.js` - **MIGRATION SUPABASE COMPLÈTE**
- ✅ `api/_lib/supabase-storage.js` - Service fonctionnel
- ✅ `.env.example` - Variables documentées

### 3. **Dépendances Vérifiées** ✅

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.49.8",  ✅ Supabase installé
    "dotenv": "^16.5.0",                  ✅ Env vars
    "express": "^5.1.0",                  ✅ API Server
    "multer": "^1.4.5-lts.2",            ✅ File upload
    // ❌ @vercel/blob SUPPRIMÉ
  }
}
```

### 4. **Tests de Fonctionnement** ✅

- ✅ Upload Supabase Storage : **FONCTIONNE**
- ✅ URL publique générée : **FONCTIONNE**
- ✅ Politiques RLS : **CONFIGURÉES**
- ✅ Bucket ppt-templates : **CRÉÉ**

## 🚀 **ÉTAPES DE DÉPLOIEMENT**

### Méthode 1: Via CLI Vercel
```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Login Vercel
vercel login

# 3. Déployer le projet
vercel --prod

# 4. Configurer les variables d'environnement
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_KEY
vercel env add JWT_SECRET
```

### Méthode 2: Via Interface Web
1. **Push** votre code sur GitHub/GitLab
2. **Connecter** le repo à Vercel
3. **Configurer** les variables d'environnement
4. **Déployer** automatiquement

## ⚠️ **POINTS CRITIQUES RÉSOLUS**

### 🔥 **Problème Majeur Corrigé** ✅
- **AVANT** : `api/_lib/storage.js` utilisait `@vercel/blob`
- **APRÈS** : `api/_lib/storage.js` utilise **Supabase Storage**
- **IMPACT** : Évite les erreurs 500 en production

### 🔧 **Configurations Vérifiées** ✅
- **Routes API** : Compatible Vercel serverless
- **File Upload** : Utilise `multer.memoryStorage()`
- **CORS** : Configuré pour production
- **Environment** : Variables documentées

## 🎯 **RÉSULTAT ATTENDU**

Après déploiement, votre application aura :
- ✅ **Frontend** accessible sur `https://votre-app.vercel.app`
- ✅ **API** accessible sur `https://votre-app.vercel.app/api/`
- ✅ **Upload** fonctionnel vers Supabase Storage
- ✅ **URLs publiques** avec CDN Supabase
- ✅ **Sécurité** via politiques RLS

## 🆘 **Dépannage**

### Si erreur 500 sur upload :
1. Vérifier les variables `SUPABASE_*` sur Vercel
2. Vérifier les politiques RLS dans Supabase
3. Consulter les logs Vercel

### Si problème de CORS :
1. Vérifier la configuration dans `api/index.js`
2. Ajouter votre domaine Vercel aux origines

### Si problème de build :
1. Vérifier `frontend/package.json`
2. Vérifier les scripts dans `package.json` racine

## 📊 **Avantages de cette Configuration**

| Aspect | Ancien (Vercel Blob) | Nouveau (Supabase) |
|--------|---------------------|-------------------|
| **Coût stockage** | $0.15/GB | $0.09/GB |
| **Stockage gratuit** | 2GB | 10GB |
| **CDN** | Payant | Inclus |
| **Intégration** | Séparée | Native |
| **Politique** | Basique | RLS granulaire |
| **Erreurs** | ❌ Tokens expirés | ✅ Stable |

## 🎉 **STATUT : PRÊT POUR PRODUCTION**

Votre application est maintenant **100% compatible Vercel** avec **Supabase Storage** !

🚀 **DÉPLOYEZ EN CONFIANCE !**
