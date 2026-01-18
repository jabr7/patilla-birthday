import { useState } from 'react';
import type { CSSProperties } from 'react';
import { getImageStage } from '../app/selectors';

interface StageImageProps {
  corruption: number;
  historyFlags?: string[];
  className?: string;
}

export function StageImage({ corruption, historyFlags = [], className = '' }: StageImageProps) {
  const stage = getImageStage(corruption);
  const [errorPath, setErrorPath] = useState<string | null>(null);

  const isInModal = className.includes('outcome-image');
  const isAbuelaCuetes = historyFlags.includes('abuela_cuetes');
  const isFurryDiplomacy = historyFlags.includes('furry_diplomacy');
  const isAbitabMode = historyFlags.includes('abitab_base');

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

  const stagePath = `/images/stage${stage}.png`;
  const abitabIconPath = '/images/abitab.jpg';

  const modalPath = isAbuelaCuetes
    ? '/images/abuela_cuetes.jpeg'
    : isFurryDiplomacy
      ? selectedFurryPath
      : stagePath;

  const imagePath = isInModal ? modalPath : stagePath;
  const effectiveImagePath = errorPath === imagePath ? stagePath : imagePath;
  const imageHasError = errorPath === imagePath;

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

  // Fondo especial: "modo ABITAB" (pattern repetido + gradientes)
  if (!isInModal && isAbitabMode) {
    const darkness = stage >= 3 ? 0.92 : 0.85;
    const contrast = stage >= 3 ? 1.2 : 1.12;
    const iconCount = 12;

    const icons = Array.from({ length: iconCount }, (_, i) => {
      const top = stableIndex(`abitab-top:${historyFlags.join('|')}:${stage}:${i}`, 80) + 10;
      const left = stableIndex(`abitab-left:${historyFlags.join('|')}:${stage}:${i}`, 80) + 10;
      const size = stableIndex(`abitab-size:${historyFlags.join('|')}:${stage}:${i}`, 90) + 60;
      const duration = stableIndex(`abitab-dur:${historyFlags.join('|')}:${stage}:${i}`, 8) + 6;
      const direction = stableIndex(`abitab-dir:${historyFlags.join('|')}:${stage}:${i}`, 2) === 0 ? 'normal' : 'reverse';

      return (
        <img
          key={i}
          src={abitabIconPath}
          alt=""
          className="abitab-float-icon"
          style={{
            top: `${top}%`,
            left: `${left}%`,
            ['--size' as never]: `${size}px`,
            ['--spin-duration' as never]: `${duration}s`,
            ['--spin-direction' as never]: direction,
          }}
        />
      );
    });

    return (
      <div
        key={`abitab:${stage}`}
        className={className}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          animation: 'fadeIn 0.35s ease-out',
          backgroundImage: [
            `radial-gradient(circle at 30% 30%, rgba(251, 191, 36, 0.18) 0%, rgba(10, 10, 10, 0.92) 60%)`,
            `linear-gradient(135deg, rgba(196, 30, 58, 0.25) 0%, rgba(10, 10, 10, 0.9) 70%)`,
            `url(${abitabIconPath})`,
          ].join(', '),
          backgroundRepeat: 'no-repeat, no-repeat, repeat',
          backgroundSize: 'cover, cover, 120px 120px',
          backgroundPosition: 'center, center, center',
          filter: `contrast(${contrast}) saturate(1.05) brightness(${darkness})`,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {icons}
      </div>
    );
  }

  // Si está en el modal, renderizar de forma diferente
  if (isInModal) {
    if (imageHasError) {
      return null; // No mostrar fallback en modal
    }

    const modalFilter = isAbuelaCuetes || isFurryDiplomacy
      ? 'none'
      : 'contrast(1.03) brightness(1.02) saturate(1.05)';

    return (
      <img
        key={effectiveImagePath}
        src={effectiveImagePath}
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
          animation: 'fadeIn 0.35s ease-out',
          // En modal evitamos filtros oscuros + multiply (si no, en stage alto se ve casi negro)
          filter: modalFilter,
          mixBlendMode: 'normal',
          willChange: 'filter',
        }}
        onError={() => setErrorPath(imagePath)}
      />
    );
  }

  // Comportamiento original para fondo (aunque ya no se usa en CoreGame)
  if (imageHasError && !(isAbitabMode && !isInModal)) {
    const gradientColors = [
      'radial-gradient(circle at 30% 50%, rgba(196, 30, 58, 0.4) 0%, rgba(10, 10, 10, 0.9) 70%), linear-gradient(135deg, #1e3a8a 0%, #0a0a0a 100%)',
      'radial-gradient(circle at 50% 50%, rgba(196, 30, 58, 0.5) 0%, rgba(30, 58, 138, 0.3) 50%, rgba(10, 10, 10, 0.9) 100%), linear-gradient(135deg, #8b1528 0%, #1e3a8a 100%)',
      'radial-gradient(circle at 70% 50%, rgba(196, 30, 58, 0.6) 0%, rgba(251, 191, 36, 0.2) 40%, rgba(10, 10, 10, 0.9) 100%), linear-gradient(135deg, #c41e3a 0%, #8b1528 100%)',
      'radial-gradient(circle at 50% 50%, rgba(196, 30, 58, 0.7) 0%, rgba(251, 191, 36, 0.3) 30%, rgba(10, 10, 10, 0.95) 100%), linear-gradient(135deg, #991b1b 0%, #c41e3a 100%)',
      'radial-gradient(circle at 50% 50%, rgba(196, 30, 58, 0.8) 0%, rgba(251, 191, 36, 0.4) 20%, rgba(10, 10, 10, 1) 100%), linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #c41e3a 100%)',
    ];

    return (
      <div
        key={`gradient:${stage}`}
        className={className}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: gradientColors[stage],
          zIndex: 0,
          filter: stage >= 3 ? 'contrast(1.2) brightness(0.9)' : 'contrast(1.0) brightness(1.0)',
          transition: 'filter 0.5s ease-in-out',
          pointerEvents: 'none',
        }}
      />
    );
  }

  return (
    <img
      key={effectiveImagePath}
      src={effectiveImagePath}
      alt={`Stage ${stage}`}
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: 0,
        animation: 'fadeIn 0.35s ease-out',
        transition: 'filter 0.5s ease-in-out',
        filter: getFilter(),
        mixBlendMode: getBlendMode(),
        willChange: 'filter',
        pointerEvents: 'none',
      }}
      onError={() => setErrorPath(imagePath)}
    />
  );
}
