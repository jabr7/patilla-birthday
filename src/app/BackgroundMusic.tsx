import { useEffect, useRef } from 'react';

export interface BackgroundMusicProps {
  enabled: boolean;
  src: string;
  volume?: number;
}

export function BackgroundMusic({ enabled, src, volume = 0.25 }: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = Math.min(1, Math.max(0, volume));

    if (!enabled) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }

    void audio.play().catch((error: unknown) => {
      console.error('Background music failed to play.', error);
    });
  }, [enabled, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  return <audio ref={audioRef} src={src} loop preload="auto" playsInline />;
}

