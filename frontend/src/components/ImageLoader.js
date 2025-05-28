import { useEffect, useState } from 'react';

/**
 * Composant de chargement d'image avec gestion d'erreur et placeholder
 * @param {Object} props - Les props du composant
 * @returns {JSX.Element} - Le composant ImageLoader
 */
const ImageLoader = ({
  src,
  alt,
  fallbackSrc,
  placeholderSrc,
  className = '',
  width,
  height,
  onLoad,
  onError,
  ...rest
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const maxRetries = 2;

  useEffect(() => {
    // Réinitialiser l'état lorsque la source change
    setLoading(true);
    setError(false);
    setImageSrc(src);
    setRetryCount(0);
    setLoadingProgress(0);

    // Simuler une progression de chargement pour UX
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + (100 - prev) * 0.1;
        return newProgress > 95 ? 95 : newProgress;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [src]);

  const handleLoad = (e) => {
    setLoading(false);
    setLoadingProgress(100);
    setError(false);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    // En cas d'erreur, essayer la source de fallback si disponible
    if (retryCount < maxRetries) {
      console.log(`Erreur de chargement de l'image: ${imageSrc}, tentative ${retryCount + 1}/${maxRetries}`);

      // Première tentative : fallbackSrc
      if (retryCount === 0 && fallbackSrc) {
        setImageSrc(fallbackSrc);
      }
      // Dernière tentative : placeholderSrc ou générer un placeholder par défaut
      else if (retryCount === 1) {
        // Si placeholderSrc est fourni, l'utiliser
        if (placeholderSrc) {
          setImageSrc(placeholderSrc);
        } else {
          // Utiliser une image de base au lieu d'un placeholder externe
          const slideNumber = alt?.match(/\d+/)?.[0] || '1';
          // Générer un Data URI pour éviter les dépendances externes
          const dataUri = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23556677'/%3E%3Ctext x='400' y='225' font-family='Arial' font-size='30' fill='white' text-anchor='middle' dominant-baseline='middle'%3EDiapositive ${slideNumber}%3C/text%3E%3C/svg%3E`;
          setImageSrc(dataUri);
        }
      }

      setRetryCount(prev => prev + 1);
    } else {
      // Si même le placeholder échoue, utiliser un placeholder local codé en dur
      // mais essayer d'afficher quand même quelque chose au lieu de montrer une erreur
      setLoading(false);

      // Au lieu de montrer une erreur, utiliser un SVG inline en Data URI comme fallback final
      const slideNumber = alt?.match(/\d+/)?.[0] || '1';
      const emergencyDataUri = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23ff5555'/%3E%3Ctext x='400' y='225' font-family='Arial' font-size='30' fill='white' text-anchor='middle' dominant-baseline='middle'%3EDiapositive ${slideNumber} (Error)%3C/text%3E%3C/svg%3E`;
      setImageSrc(emergencyDataUri);

      // On ne définit pas d'erreur si on a un fallback de secours
      // setError(true);
      console.warn(`Fallback d'urgence utilisé pour l'image: ${src}`);
      if (onError) onError(e);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Image principale */}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        width={width}
        height={height}
        {...rest}
      />

      {/* Indicateur de chargement */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 bg-opacity-60">
          <div className="w-full max-w-md h-2 bg-gray-200 rounded overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Chargement de l'image...
          </p>
        </div>
      )}

      {/* Message d'erreur (uniquement si toutes les tentatives ont échoué) */}
      {error && !loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 bg-opacity-80 p-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="mt-2 text-red-600 font-medium">Impossible de charger l'image</p>
          <button
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            onClick={() => {
              setLoading(true);
              setError(false);
              setImageSrc(src);
              setRetryCount(0);
              setLoadingProgress(10);
            }}
          >
            Réessayer
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageLoader;
