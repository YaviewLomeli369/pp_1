import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ImageWithRetryProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
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

  const setImageSrc = (newSrc: string) => {
    setCurrentSrc(newSrc);
    setIsLoading(true);
    setHasError(false);
    setIsRetrying(false);
  };

  useEffect(() => {
    setImageSrc(src);
    setRetryCount(0);
  }, [src]);

  const handleError = useCallback(() => {
    console.warn(`❌ Image failed to load: ${currentSrc}`);

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
          const separator = currentSrc.includes('?') ? '&' : '?';
          nextSrc = `${normalizeImageUrl(currentSrc)}${separator}v=${timestamp}`;
        }

        setImageSrc(nextSrc);
        setIsRetrying(false);
      }, retryDelay);
    } else {
      setHasError(true);
      setIsLoading(false);
      setIsRetrying(false);
      onError?.(new Error(`Failed to load image after ${maxRetries} retries: ${currentSrc}`));
    }
  }, [currentSrc, retryCount, maxRetries, retryDelay, fallbackSrc, src, onError]);


  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    setIsRetrying(false);
    onLoad?.();
    console.log(`✅ Image loaded successfully: ${currentSrc}`);
  };

  const handleRetry = () => {
    setRetryCount(0);
    setHasError(false);
    setIsLoading(true);
    setIsRetrying(false);
    setCurrentSrc(normalizeImageUrl(src));
  };

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}
        style={{ minHeight: '150px' }}
      >
        <div className="text-center">
          <AlertCircle className="mx-auto h-8 w-8 mb-2" />
          <p className="text-sm">Imagen no encontrada</p>
          <p className="text-xs text-gray-400 mt-1">
            {src ? `${src.split('/').pop()}` : 'Archivo no disponible'}
          </p>
          <button
            onClick={() => {
              setHasError(false);
              setRetryCount(0);
              setIsLoading(true);
              setCurrentSrc(`${src}?reload=${Date.now()}`);
            }}
            className="mt-2 text-xs text-blue-500 hover:underline"
          >
            Reintentar
          </button>
        </div>
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