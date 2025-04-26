import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface UseAudioPlayerProps {
  src: string;
  onEnded?: () => void;
}

interface UseAudioPlayerResult {
  isPlaying: boolean;
  togglePlayPause: () => void;
  progress: number;
  duration: number;
  handleSeek: (time: number) => void;
  volume: number;
  handleVolumeChange: (vol: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

export function useHlsAudioPlayer({
  src,
  onEnded,
}: UseAudioPlayerProps): UseAudioPlayerResult {
  const audioRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = document.createElement("video");
    audioRef.current = audio;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(audio);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setDuration(audio.duration);
      });
    } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
      audio.src = src;
    }

    audio.addEventListener("timeupdate", () => setProgress(audio.currentTime));
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      onEnded?.();
    });

    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      hlsRef.current?.destroy();
    };
  }, [src]);

  const togglePlayPause = () => {
    const video = audioRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const handleVolumeChange = (vol: number) => {
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setVolume(vol);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newMuted = !isMuted;
      audioRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
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
  };
}
