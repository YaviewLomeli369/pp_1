
import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ImageWithRetryProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: string) => void;
  onLoad?: () => void;
}

export default function ImageWithRetry({
  src,
  alt,
  className = "",
  fallbackSrc,
  maxRetries = 3,
  retryDelay = 1000,
  onError,
  onLoad
}: ImageWithRetryProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Normalizar URL para asegurar que sea absoluta
  const normalizeImageUrl = (url: string): string => {
    if (!url) return '';
    
    // Si ya es absoluta, devolverla tal como está
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Si es relativa, convertir a absoluta
    if (url.startsWith('/')) {
      return `${window.location.origin}${url}`;
    }
    
    // Si no tiene protocolo, asumir relativa
    return `${window.location.origin}/${url}`;
  };

  useEffect(() => {
    setCurrentSrc(src);
    setRetryCount(0);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = () => {
    console.error(`Image failed to load: ${currentSrc}, retry ${retryCount + 1}/${maxRetries}`);
    
    if (retryCount < maxRetries) {
      setIsRetrying(true);
      
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        
        // Intentar con diferentes variaciones de la URL
        let nextSrc = src;
        
        if (retryCount === 0) {
          // Primer reintento: asegurar URL absoluta
          nextSrc = normalizeImageUrl(src);
        } else if (retryCount === 1 && fallbackSrc) {
          // Segundo reintento: usar fallback si existe
          nextSrc = normalizeImageUrl(fallbackSrc);
        } else {
          // Último reintento: añadir timestamp para evitar cache
          const timestamp = Date.now();
          const separator = src.includes('?') ? '&' : '?';
          nextSrc = `${normalizeImageUrl(src)}${separator}v=${timestamp}`;
        }
        
        setCurrentSrc(nextSrc);
        setIsRetrying(false);
        setIsLoading(true);
      }, retryDelay);
    } else {
      setHasError(true);
      setIsLoading(false);
      setIsRetrying(false);
      onError?.(`Failed to load image after ${maxRetries} retries: ${src}`);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
    console.log(`✅ Image loaded successfully: ${currentSrc}`);
  };

  const handleRetry = () => {
    setRetryCount(0);
    setHasError(false);
    setIsLoading(true);
    setCurrentSrc(normalizeImageUrl(src));
  };

  if (hasError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 ${className}`}>
        <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500 text-center mb-2">
          Error cargando imagen
        </p>
        <button
          onClick={handleRetry}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
        >
          <RefreshCw className="h-3 w-3" />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {(isLoading || isRetrying) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2" />
            <p className="text-xs text-gray-500">
              {isRetrying ? `Reintentando... (${retryCount}/${maxRetries})` : 'Cargando...'}
            </p>
          </div>
        </div>
      )}
      
      <img
        src={normalizeImageUrl(currentSrc)}
        alt={alt}
        className={`w-full h-full object-cover rounded-lg ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
}
