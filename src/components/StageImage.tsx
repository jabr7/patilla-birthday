import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { getImageStage } from '../app/selectors';

interface StageImageProps {
  corruption: number;
  historyFlags?: string[];
  className?: string;
}

export function StageImage({ corruption, historyFlags = [], className = '' }: StageImageProps) {
  const stage = getImageStage(corruption);
  const [imageError, setImageError] = useState(false);
  const [opacity, setOpacity] = useState(1);

  const isAbuelaCuetes = historyFlags.includes('abuela_cuetes');
  const isInModal = className.includes('outcome-image');
  const isFurryDiplomacy = historyFlags.includes('furry_diplomacy');

  const furryPaths = ['/images/patilla_furry_1.jpeg', '/images/patilla_furry_2..jpeg'] as const;

  const stableIndex = (seed: string, modulo: number): number => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) | 0;
    }
    return modulo === 0 ? 0 : Math.abs(hash) % modulo;
  };

  const selectedFurryPath =
    furryPaths[stableIndex(historyFlags.join('|'), furryPaths.length)];

  const imagePath = isAbuelaCuetes
    ? '/images/abuela_cuetes.jpeg'
    : isInModal && isFurryDiplomacy
      ? selectedFurryPath
      : `/images/stage${stage}.png`;

  useEffect(() => {
    setOpacity(0);
    const timer = setTimeout(() => setOpacity(1), 150);
    return () => clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    setImageError(false);
  }, [imagePath]);

  const getFilter = (): string => {
    switch (stage) {
      case 0:
        return 'contrast(1.05) brightness(0.98)';
      case 1:
        return 'contrast(1.08) brightness(0.96)';
      case 2:
        return 'contrast(1.1) brightness(0.94) saturate(1.1)';
      case 3:
        return 'contrast(1.15) brightness(0.9) saturate(1.2)';
      case 4:
        return 'contrast(1.2) brightness(0.85) saturate(1.3)';
      default:
        return 'contrast(1.05) brightness(0.98)';
    }
  };

  const getBlendMode = (): CSSProperties['mixBlendMode'] => {
    return stage >= 4 ? 'multiply' : 'normal';
  };

  // Si está en el modal, renderizar de forma diferente
  if (isInModal) {
    if (imageError) {
      return null; // No mostrar fallback en modal
    }

    return (
      <img
        src={imagePath}
        alt={
          isAbuelaCuetes
            ? 'Abuela Cuetes'
            : isFurryDiplomacy
              ? 'Patilla Furry'
              : `Stage ${stage}`
        }
        className={className}
        style={{
          width: '100%',
          maxHeight: '400px',
          objectFit: 'contain',
          marginBottom: '1.5rem',
          borderRadius: '8px',
          border: '2px solid var(--color-border)',
          opacity,
          transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), filter 0.5s ease-in-out',
          filter: getFilter(),
          mixBlendMode: getBlendMode(),
          willChange: 'opacity, filter',
        }}
        onError={() => setImageError(true)}
      />
    );
  }

  // Comportamiento original para fondo (aunque ya no se usa en CoreGame)
  if (imageError) {
    const gradientColors = [
      'radial-gradient(circle at 30% 50%, rgba(196, 30, 58, 0.4) 0%, rgba(10, 10, 10, 0.9) 70%), linear-gradient(135deg, #1e3a8a 0%, #0a0a0a 100%)',
      'radial-gradient(circle at 50% 50%, rgba(196, 30, 58, 0.5) 0%, rgba(30, 58, 138, 0.3) 50%, rgba(10, 10, 10, 0.9) 100%), linear-gradient(135deg, #8b1528 0%, #1e3a8a 100%)',
      'radial-gradient(circle at 70% 50%, rgba(196, 30, 58, 0.6) 0%, rgba(251, 191, 36, 0.2) 40%, rgba(10, 10, 10, 0.9) 100%), linear-gradient(135deg, #c41e3a 0%, #8b1528 100%)',
      'radial-gradient(circle at 50% 50%, rgba(196, 30, 58, 0.7) 0%, rgba(251, 191, 36, 0.3) 30%, rgba(10, 10, 10, 0.95) 100%), linear-gradient(135deg, #991b1b 0%, #c41e3a 100%)',
      'radial-gradient(circle at 50% 50%, rgba(196, 30, 58, 0.8) 0%, rgba(251, 191, 36, 0.4) 20%, rgba(10, 10, 10, 1) 100%), linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #c41e3a 100%)',
    ];

    return (
      <div
        className={className}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: gradientColors[stage],
          zIndex: -1,
          filter: stage >= 3 ? 'contrast(1.2) brightness(0.9)' : 'contrast(1.0) brightness(1.0)',
          transition: 'filter 0.5s ease-in-out',
        }}
      />
    );
  }

  return (
    <img
      src={imagePath}
      alt={isAbuelaCuetes ? 'Abuela Cuetes' : `Stage ${stage}`}
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: -1,
        opacity,
        transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), filter 0.5s ease-in-out',
        filter: getFilter(),
        mixBlendMode: getBlendMode(),
        willChange: 'opacity, filter',
      }}
      onError={() => setImageError(true)}
    />
  );
}
