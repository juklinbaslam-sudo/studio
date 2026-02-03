'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Pause, Play, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  src: string;
}

export function AudioPlayer({ src }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    if (src) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(src);
      audio.oncanplaythrough = () => setCanPlay(true);
      audio.onended = () => setIsPlaying(false);
      audioRef.current = audio;

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      };
    }
  }, [src]);

  const togglePlayPause = () => {
    if (!audioRef.current || !canPlay) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const downloadAudio = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = 'translation.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!src) return null;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-4">
      <Button onClick={togglePlayPause} size="lg" disabled={!canPlay} className="min-w-[120px]">
        {canPlay ? (
          <>
            {isPlaying ? (
              <Pause className="mr-2 h-5 w-5" />
            ) : (
              <Play className="mr-2 h-5 w-5" />
            )}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </>
        ) : (
          <>
            <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
            <span>Loading</span>
          </>
        )}
      </Button>
      <Button onClick={downloadAudio} variant="outline" size="lg" disabled={!canPlay}>
        <Download className="mr-2 h-4 w-4" />
        Download Audio
      </Button>
    </div>
  );
}
