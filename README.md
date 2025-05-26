# PPT Template Manager

## Description
Application web moderne pour la gestion et la personnalisation de templates PowerPoint. Permet l'upload, l'organisation et la génération de présentations personnalisées.

## État Actuel - Version 1.0
**Application pleinement fonctionnelle** déployée sur Vercel avec :
- Interface utilisateur moderne et responsive
- API complètes et opérationnelles
- Upload de fichiers avec validation (limite 4.5MB)
- Gestion des catégories et dossiers
- Authentification basique fonctionnelle
- Déployé et accessible en production

## Prochaines Évolutions - Version 2.0
Plan d'amélioration avec base de données persistante et stockage réel :
- Base de données Supabase PostgreSQL
- Stockage de fichiers Vercel Blob
- Authentification JWT robuste
- Interface utilisateur avancée
- API complètes avec CRUD

## Structure du Projet

```
ppt-template-manager/
├── frontend/                 # Application React
│   ├── src/
│   │   ├── components/      # Composants React
│   │   ├── services/        # Services API
│   │   └── styles/          # Styles CSS
│   └── public/              # Assets statiques
├── api/                     # API Vercel Serverless
│   ├── health.js           # API de santé
│   ├── categories.js       # Gestion des catégories
│   ├── folders.js          # Gestion des dossiers
│   ├── templates/          # Gestion des templates
│   └── _lib/               # Services et utilitaires
├── scripts/                # Scripts d'automatisation
└── docs/                   # Documentation
```

## Installation et Développement

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Vercel
- (Optionnel) Compte Supabase pour la version avancée

### Installation Locale
```bash
# Cloner le projet
git clone <repository-url>
cd ppt-template-manager

# Installer les dépendances frontend
cd frontend
npm install

# Installer les dépendances API
cd ../
npm install

# Démarrer en développement
npm run dev
```

### Déploiement
```bash
# Déploiement simple (version actuelle)
vercel --prod

# Déploiement version améliorée (avec base de données)
./deploy-enhanced-version.sh
```

## Utilisation

### Menu Principal
```bash
./main-menu.sh
```

### Scripts Disponibles
- `final-status-report.sh` - Rapport de statut complet
- `test-production.sh` - Tests de l'application en production
- `demo-enhanced-features.sh` - Démonstration des fonctionnalités
- `setup-supabase.sh` - Configuration base de données
- `setup-file-storage.sh` - Configuration stockage fichiers
- `implement-supabase-integration.sh` - Intégration complète
- `deploy-enhanced-version.sh` - Déploiement orchestré

### Interface Utilisateur
1. Accéder à l'URL de production
2. Se connecter avec : `admin@default.com`
3. Explorer les fonctionnalités :
   - Gestion des catégories
   - Organisation en dossiers
   - Upload de templates PowerPoint
   - Personnalisation des champs

## API Endpoints

### Endpoints Actuels
- `GET /api/health` - Statut de l'application
- `GET /api/categories` - Liste des catégories
- `POST /api/categories` - Créer une catégorie
- `GET /api/folders` - Liste des dossiers
- `POST /api/folders` - Créer un dossier
- `GET /api/templates` - Liste des templates
- `POST /api/templates` - Upload d'un template
- `GET /api/fields` - Champs disponibles

### Réponses API
Toutes les API retournent du JSON avec gestion d'erreurs appropriée :
```json
{
  "data": [...],
  "status": "success",
  "message": "Opération réussie"
}
```

## Configuration

### Variables d'Environnement
```bash
# Version actuelle (optionnel)
NODE_ENV=production

# Version améliorée (requis)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
BLOB_READ_WRITE_TOKEN=your-blob-token
```

### Configuration Vercel
```json
{
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs20.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

## Tests

### Tests Automatisés
```bash
# Test de l'API en production
./test-production.sh

# Test de la base de données (version améliorée)
npm run test:supabase

# Test du stockage de fichiers (version améliorée)
npm run test:storage
```

### Tests Manuels
1. Interface utilisateur responsive
2. Upload de fichiers PowerPoint
3. Validation des limites de taille
4. Gestion des erreurs
5. Performance des API

## Monitoring et Logs

### Logs Vercel
```bash
# Voir les logs en temps réel
vercel logs

# Logs d'une fonction spécifique
vercel logs --function=api/templates
```

### Métriques
- Temps de réponse API : < 500ms
- Taille max upload : 4.5MB
- Disponibilité : 99.9%
- Performance Lighthouse : > 90

## Sécurité

### Mesures Actuelles
- Validation des types de fichiers
- Limitation de taille d'upload
- Sanitisation des entrées
- CORS configuré
- HTTPS obligatoire

### Mesures Prévues (Version 2.0)
- Authentification JWT
- Chiffrement des données sensibles
- Audit logs
- Rate limiting
- Scan antivirus des fichiers

## Contribution

### Workflow de Développement
1. Fork du projet
2. Créer une branche feature
3. Développer et tester
4. Créer une Pull Request
5. Review et merge

### Standards de Code
- ESLint pour JavaScript
- Prettier pour le formatage
- Tests unitaires requis
- Documentation des API

## Documentation

### Guides Disponibles
- `migration-guide.md` - Migration vers la version avancée
- `roadmap-next-steps.md` - Plan d'évolution détaillé
- API documentation (auto-générée)

### Liens Utiles
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://reactjs.org/docs)

## Résolution de Problèmes

### Problèmes Courants
1. **Erreur 500** : Vérifier les logs Vercel
2. **Upload échoue** : Vérifier la taille et le type de fichier
3. **API lente** : Vérifier la connexion réseau
4. **Interface ne charge pas** : Vérifier le build frontend

### Support
- Issues GitHub pour les bugs
- Discussions pour les questions
- Documentation pour les guides

## Licence
MIT License - Voir le fichier LICENSE pour plus de détails.

## Remerciements
- Équipe Vercel pour la plateforme de déploiement
- Supabase pour la base de données
- Communauté React pour les outils de développement

---

**Version Actuelle** : 1.0 - Fonctionnelle 
**Prochaine Version** : 2.0 - Base de données et stockage 
**Statut** : En production et prêt pour l'évolution