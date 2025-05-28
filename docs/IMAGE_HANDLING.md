# Gestion des Images - Documentation Technique

## Architecture de Gestion des Images

### Vue d'ensemble

L'application implémente une architecture robuste et performante pour la gestion des images avec plusieurs niveaux de redondance, optimisée pour un environnement de production. Cette documentation décrit les composants clés et leur fonctionnement.

### Composants principaux

1. **API Centralisée d'Images (`/api/slide-image.js`)**
   - Point d'accès unique pour toutes les images
   - Fonctionnalités avancées :

     - Mise en cache intelligente avec ETag
     - Optimisation des images à la volée (redimensionnement, compression)
     - Mesures de performance
     - Détection automatique des formats
     - Système de fallback multi-niveaux avec plusieurs services de placeholder
     - Support SVG pour les fallbacks en dernier recours

2. **Utilitaire de Gestion d'Images (`/api/_lib/image-handler.js`)**
   - Bibliothèque de fonctions pour manipuler les images
   - Abstraction des opérations complexes
   - Optimisation des performances et de la mémoire

3. **Composant React ImageLoader (`/frontend/src/components/ImageLoader.js`)**
   - Interface utilisateur réactive avec indicateur de chargement
   - Système de fallback en cascade à 3 niveaux avec sources multiples
   - Gestion avancée des erreurs avec tentatives de rechargement
   - Métriques de performance intégrées
   - Support pour services de placeholder alternatifs (via.placeholder.com, placehold.co, dummyimage.com)
   - Fallback d'urgence pour garantir l'affichage

4. **Middleware de Redirection (`/frontend/src/middleware.js`)**
   - Intercepte les requêtes problématiques
   - Corrige automatiquement les URLs non valides
   - Assure la compatibilité avec diverses sources d'images

### Flux de chargement des images

1. **Requête initiale**
   - L'utilisateur accède à l'éditeur de template
   - Le composant ImageLoader demande l'image via l'API centralisée

2. **Traitement par l'API**
   - Vérification du cache côté client (ETag/If-Modified-Since)
   - Récupération de l'image depuis Supabase Storage
   - Optimisation à la volée si des paramètres sont fournis
   - Envoi de l'image avec en-têtes de cache appropriés

3. **Système de fallback multi-niveaux amélioré**
   - Niveau 1 : API `/api/slide-image` avec image Supabase
   - Niveau 2 : URL directe vers Supabase (si disponible)
   - Niveau 3 : Service de placeholder primaire (via.placeholder.com)
   - Niveau 4 : Services alternatifs (placehold.co, dummyimage.com)
   - Niveau 5 : SVG généré directement par l'API (ultime recours)

4. **Expérience utilisateur**
   - Barre de progression pendant le chargement
   - Transition fluide lors de l'affichage de l'image
   - Message d'erreur explicite en cas d'échec
   - Bouton de rechargement en cas de problème

## Guide d'Utilisation

### Paramètres de l'API d'images

L'API `/api/slide-image` accepte les paramètres suivants :

| Paramètre | Description | Exemple |
|-----------|-------------|---------|
| `path` | Chemin direct de l'image dans Supabase | `templates/a1b2c3d4/slide-1.jpg` |
| `templateId` | ID du template (à utiliser avec slideIndex) | `12345` |
| `slideIndex` | Index de la diapositive (1-based) | `1` |
| `width` | Largeur souhaitée (px) | `800` |
| `height` | Hauteur souhaitée (px) | `450` |
| `format` | Format de sortie | `webp` , `jpeg` , `png` |
| `quality` | Qualité de compression (1-100) | `90` |

### Utilisation du composant ImageLoader

```jsx
import ImageLoader from '../components/ImageLoader';

// Exemple d'utilisation basique
<ImageLoader 
  src="/api/slide-image?templateId=123&slideIndex=1" 
  alt="Ma diapositive" 
  fallbackSrc="https://url-directe.jpg"
  placeholderSrc="https://placeholder.com/800x450"
/>

// Exemple avec tous les paramètres
<ImageLoader 
  src="/api/slide-image?path=templates/abc123/slide-1.jpg&width=800&height=450&format=webp&quality=90" 
  alt="Diapositive optimisée" 
  fallbackSrc="https://url-fallback.jpg"
  placeholderSrc="https://placeholder.com/800x450"
  className="rounded shadow-lg"
  width={800}
  height={450}
  onLoad={(e) => console.log('Image chargée !')}
  onError={(e) => console.error('Erreur de chargement')}
/>
```

## Métriques et Performances

Le système collecte automatiquement des métriques de performance :

* Temps de chargement des images
* Taux de réussite/échec
* Utilisation du cache
* Source finale utilisée (API, directe, placeholder)

Ces métriques sont accessibles dans la console du navigateur et peuvent être intégrées à un système de monitoring.

## Dépannage

### Problèmes courants

1. **Images qui ne s'affichent pas ("impossible de charger l'image")**
   - Vérifier que les chemins d'images sont corrects
   - Confirmer que les images existent dans Supabase Storage
   - Vérifier les logs de l'API pour détecter des erreurs
   - Vérifier l'accessibilité des services de placeholder alternatifs
   - Examiner les redirections dans les requêtes réseau
   - Consulter les erreurs CORS éventuelles

2. **Performances lentes**
   - Utiliser les paramètres d'optimisation (width, height, format)
   - Vérifier la taille des images originales
   - S'assurer que le cache fonctionne correctement

3. **Erreurs CORS**
   - Les erreurs CORS sont automatiquement gérées par l'API proxy
   - Si des erreurs persistent, vérifier les configurations Supabase

## Évolutions futures

* Support de WebP adaptatif (avec détection de compatibilité navigateur)
* Préchargement intelligent des diapositives suivantes
* Intégration avec un CDN pour améliorer les performances globales
* Système de watermarking dynamique

## Mises à jour récentes (Mai 2025)

* **Résolution des problèmes 404**: Correction des erreurs de chargement des images dans l'environnement Vercel
* **Amélioration du fallback**: Ajout de services multiples pour garantir l'affichage des placeholders
* **Gestion des redirections**: Meilleure gestion des redirections 307 dans le navigateur
* **Support SVG**: Ajout d'un fallback SVG généré dynamiquement en cas d'échec de tous les services externes
* **Mode démo optimisé**: Utilisation de placeholders directs pour les slides en mode démonstration

## Utilisation avec ConvertAPI

Le service [ConvertAPI](https://www.convertapi.com/) est utilisé pour la conversion des présentations PowerPoint en images. La réponse contient des URLs temporaires vers les images converties qui sont ensuite téléchargées et stockées dans Supabase Storage.

```json
{
  "ConversionCost": 1,
  "Files": [
    {
      "FileName": "slide-1.jpg",
      "FileExt": "jpg",
      "FileSize": 193714,
      "FileId": "vldp5jpi8m1fp6xjt3mq0kzfw3supb81",
      "Url": "https://v2.convertapi.com/d/vldp5jpi8m1fp6xjt3mq0kzfw3supb81/slide-1.jpg"
    },
    // Autres slides...
  ]
}
```

Ces images sont ensuite accessibles via l'API `/api/slide-image` avec le paramètre `path` pointant vers l'emplacement dans Supabase Storage.
