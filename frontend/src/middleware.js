/**
 * Middleware pour la gestion intelligente des redirections d'URLs
 * Analyse et corrige automatiquement les URLs problématiques
 */

export function middleware(req) {
  // Récupérer l'URL actuelle
  const url = new URL(req.url);
  const pathname = url.pathname;
  
  // Journalisation pour debugging
  console.log(`Middleware: Analyse de l'URL ${pathname}`);
  
  // 1. Gérer les URLs d'images Supabase (problème CORS)
  if (pathname.includes('/storage/v1/object/public/ppt-templates/')) {
    // Extraire le chemin de l'image après /ppt-templates/
    const imagePath = pathname.split('/ppt-templates/')[1];
    // Rediriger vers notre API proxy
    return Response.redirect(new URL(`/api/image-proxy?path=${encodeURIComponent(imagePath)}`, url.origin));
  }
  
  // 2. Correction des URLs pour les templates
  if (pathname.match(/^\/templates\/(\d+)\/slides\/(\d+)$/)) {
    const [_, templateId, slideIndex] = pathname.match(/^\/templates\/(\d+)\/slides\/(\d+)$/);
    // Vérifier si l'ordre est correct (par exemple, si slideIndex est valide)
    // Redirection si nécessaire...
    console.log(`Template: ${templateId}, Slide: ${slideIndex}`);
  }
  
  // 3. Gérer les URLs obsolètes ou mal formatées (ajouter d'autres patterns au besoin)
  const redirectPatterns = [
    { pattern: /^\/template\/(\d+)$/, replacement: '/templates/$1' },
    { pattern: /^\/slide\/(\d+)\/(\d+)$/, replacement: '/templates/$1/slides/$2' },
    // Ajouter d'autres patterns problématiques connus ici
  ];
  
  // Vérifier si l'URL correspond à un pattern problématique
  for (const { pattern, replacement } of redirectPatterns) {
    if (pattern.test(pathname)) {
      const newPath = pathname.replace(pattern, replacement);
      console.log(`Redirection: ${pathname} → ${newPath}`);
      return Response.redirect(new URL(newPath, url.origin));
    }
  }
  
  // Continuer normalement si aucune redirection n'est nécessaire
  return undefined;
}

// Configuration du middleware : sur quelles routes il doit s'exécuter
export const config = {
  // Exécuter le middleware sur ces chemins
  matcher: [
    // Routes d'images (pour résoudre les problèmes CORS)
    '/storage/:path*',
    
    // Routes des templates et slides
    '/templates/:path*',
    '/template/:path*',
    '/slide/:path*',
    
    // Ajouter d'autres patterns au besoin
  ],
};
