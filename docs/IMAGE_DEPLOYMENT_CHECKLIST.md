# Image System Deployment Checklist

Ce document fournit une checklist à suivre lors des déploiements pour s'assurer que le système de gestion d'images fonctionne correctement.

## Avant le déploiement

* [ ] Vérifier que le code de `/api/slide-image.js` est compatible avec l'environnement serverless de Vercel
* [ ] S'assurer que les services de placeholder alternatifs sont accessibles (via.placeholder.com, placehold.co, dummyimage.com)
* [ ] Vérifier que la variable d'environnement `SUPABASE_URL` est correctement définie dans Vercel
* [ ] Vérifier que la variable d'environnement `CONVERT_API_SECRET` est correctement définie pour la conversion PPTX vers JPG
* [ ] S'assurer que les buckets Supabase sont accessibles publiquement pour les images
* [ ] Vérifier que le composant `ImageLoader` utilise plusieurs niveaux de fallback

## Tests post-déploiement

* [ ] Tester le chargement d'une diapositive existante
* [ ] Vérifier que l'API `/api/slide-image` renvoie bien un code 200 et non un redirect 307
* [ ] Tester l'upload et la conversion d'une nouvelle présentation PowerPoint
* [ ] Vérifier que les placeholders s'affichent correctement quand une image n'existe pas
* [ ] Tester la navigation entre plusieurs diapositives pour vérifier le chargement des images
* [ ] Vérifier les performances de chargement (< 2 secondes par image)
* [ ] Tester la robustesse en désactivant momentanément l'accès à Supabase Storage

## Résolution des problèmes courants

### Erreur "impossible de charger l'image"

1. Vérifier les requêtes réseau dans la console du navigateur
2. Si l'API `/api/slide-image` renvoie 200 mais l'image ne s'affiche pas:
   - Vérifier que le contenu renvoyé est bien une image (Content-Type)
   - S'assurer que les redirections sont bien suivies par le navigateur
3. Si l'API renvoie une erreur 4xx/5xx:
   - Vérifier les logs Vercel pour l'erreur précise
   - Vérifier l'accès à Supabase Storage
   

### Problèmes avec ConvertAPI

1. Vérifier que la clé API est valide et correctement configurée
2. S'assurer que le quota n'est pas dépassé
3. Vérifier que le format des fichiers PPTX est supporté
4. Tester avec un fichier PPTX de petite taille

## Commandes utiles

```bash
# Vérifier les variables d'environnement Vercel
vercel env ls

# Déployer uniquement l'API d'images
vercel deploy --scope seiyar26s-projects --prod --paths="/api/slide-image.js" --paths="/api/_lib/image-handler.js"

# Tester l'API d'images localement
curl -I "http://localhost:3000/api/slide-image?path=templates/12345/slide-1.jpg"

# Tester l'API en production
curl -s -o /dev/null -w "%{http_code}" "https://ppt-template-manager-1748376801-cnfcwmfek-seiyar26s-projects.vercel.app/api/slide-image?path=templates/12345/slide-1.jpg"
```

## Notes importantes

* En mode développement, les images peuvent être servies directement depuis le système de fichiers local
* En production, toutes les images doivent être stockées dans Supabase Storage
* Les URL de placeholder doivent être accessibles depuis le navigateur du client ET depuis l'environnement serverless de Vercel
* La gestion des erreurs CORS est cruciale pour les images chargées depuis des domaines externes
* Les timeout de requête dans Vercel sont de 10 secondes maximum pour les fonctions serverless
