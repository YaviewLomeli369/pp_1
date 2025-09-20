
import React from 'react';

interface OptimizedHeroImageProps {
  className?: string;
  style?: React.CSSProperties;
}

export const OptimizedHeroImage: React.FC<OptimizedHeroImageProps> = ({
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`${className}`}
      style={{
        ...style,
        backgroundImage: 'url(/imgs/bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'crisp-edges',
        willChange: 'transform',
      }}
      // Agregar atributos para mejor rendimiento
      role="img"
      aria-label="Imagen de fondo del hero"
    />
  );
};
