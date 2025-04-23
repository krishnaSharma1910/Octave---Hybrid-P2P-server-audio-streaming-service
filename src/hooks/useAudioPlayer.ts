import { useState, useEffect, useRef } from "react";
// import { Howl } from "howler";

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
  onLoad: () => void;
}
export function useAudioPlayer({ src, onEnded }: UseAudioPlayerProps): UseAudioPlayerResult {
  const audioRef = useRef(new Audio(src));
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;

    const updateProgress = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded(); 
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onEnded]);

  useEffect(() => {
    const audio = audioRef.current;
    audio.src = src;
    audio.load();
    audio.volume = volume;
  }, [src]);
  

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    audioRef.current.currentTime = time;
    setProgress(time);
  };

  const handleVolumeChange = (vol: number) => {
    audioRef.current.volume = vol;
    setVolume(vol);
  };

  const toggleMute = () => {
    const muted = !isMuted;
    audioRef.current.muted = muted;
    setIsMuted(muted);
  };

  const onLoad = () => {
    audioRef.current.play();
    setIsPlaying(true);
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
