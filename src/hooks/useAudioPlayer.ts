import { useState, useEffect, useRef } from "react";
import { Howl } from "howler";

interface UseAudioPlayerProps {
  src: string;
  loop?: boolean;
  onEnd?: () => void; // Callback for track end
}

export function useAudioPlayer({ src, loop = false, onEnd }: UseAudioPlayerProps) {
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
      loop,
      onload: () => {
        setDuration(sound.duration());
      },
      onplay: () => {
        requestAnimationFrame(updateProgress);
      },
      onend: () => {
        setIsPlaying(false);
        setProgress(0);
        if (onEnd) onEnd(); // Call external handler
      },
    });

    soundRef.current = sound;

    return () => {
      sound.unload();
    };
  }, [src, loop]);

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
      setIsPlaying(false);
    } else {
      soundRef.current.play();
      setIsPlaying(true);
      requestAnimationFrame(updateProgress);
    }
  };

  const handleSeek = (value: number) => {
    if (!soundRef.current) return;
    soundRef.current.seek(value);
    setProgress(value);
  };

  const handleVolumeChange = (value: number) => {
    const newVolume = value / 100;
    setVolume(newVolume);
    if (soundRef.current) {
      soundRef.current.volume(newVolume);
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    if (soundRef.current) {
      soundRef.current.mute(newMute);
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
