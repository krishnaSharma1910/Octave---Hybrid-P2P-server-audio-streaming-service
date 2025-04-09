// useAudioPlayer.ts - Custom hook to manage audio playback with Howler
import { useState, useEffect, useRef } from "react";
import { Howl } from "howler";

interface UseAudioPlayerProps {
  src: string;
}

export function useAudioPlayer({ src }: UseAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const soundRef = useRef<Howl | null>(null);

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.unload();
    }

    const sound = new Howl({
      src: [src],
      html5: true,
      volume,
      onload: () => setDuration(sound.duration()),
      onend: () => {
        setIsPlaying(false);
        setProgress(0);
      },
      onplay: () => {
        requestAnimationFrame(updateProgress);
      },
    });

    soundRef.current = sound;

    return () => {
      sound.unload();
    };
  }, [src]);

  const updateProgress = () => {
    if (!soundRef.current) return;
    setProgress(soundRef.current.seek() as number);
    if (soundRef.current.playing()) {
      requestAnimationFrame(updateProgress);
    }
  };

  const togglePlayPause = () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number) => {
    if (!soundRef.current) return;
    soundRef.current.seek(value);
    setProgress(value);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value / 100);
    if (soundRef.current) {
      soundRef.current.volume(value / 100);
    }
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (soundRef.current) {
      soundRef.current.mute(!isMuted);
    }
  };

  const onLoad = () => {
    if (!soundRef.current) return;
    soundRef.current.play();
    setIsPlaying(true);
    setDuration(soundRef.current.duration());
    requestAnimationFrame(updateProgress);
  };

  return {
    isPlaying,
    togglePlayPause,
    progress,
    duration,
    handleSeek,
    volume,
    handleVolumeChange,
    isMuted,
    toggleMute,
    onLoad,
  };
}
