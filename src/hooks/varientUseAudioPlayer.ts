import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface UseAudioPlayerProps {
  src: string;
  onEnded?: () => void;
  autoPlay?: boolean;
  loop?: boolean;
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
  isLoading: boolean;
  error: Error | null;
  onLoad: () => void;
}

export function useHlsAudioPlayer({
  src,
  onEnded,
  autoPlay = false,
  loop = false,
}: UseAudioPlayerProps): UseAudioPlayerResult {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.preload = "auto";
    audio.loop = loop;
    audio.volume = volume;

    const updateProgress = () => {
      if (!audioRef.current) return;
      setProgress(audioRef.current.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const handleVolumeUpdate = () => {
      setVolume(audio.volume);
      setIsMuted(audio.muted);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      if (autoPlay) {
        audio
          .play()
          .catch((e) => setError(new Error(`Playback failed: ${e.message}`)));
      }
    };

    const handleGenericError = (errorType: string, details?: string) => {
      setError(
        new Error(`Player Error: ${errorType}${details ? ` - ${details}` : ""}`)
      );
      setIsLoading(false);
    };

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
      });
      hlsRef.current = hls;

      hls.attachMedia(audio);
      hls.loadSource(src);

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          handleGenericError(data.type, data.details);
        }
      });

      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
      audio.src = src;
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("error", () => {
        handleGenericError("Native HLS playback failed");
      });
    } else {
      handleGenericError("HLS is not supported in this browser");
    }

    // Attach common audio listeners
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("volumechange", handleVolumeUpdate);

    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      hlsRef.current?.destroy();
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("volumechange", handleVolumeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [src, onEnded, autoPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.loop = loop;
    }
  }, [loop]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio
        .play()
        .catch((e) => setError(new Error(`Play failed: ${e.message}`)));
    } else {
      audio.pause();
    }
  };

  const handleSeek = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return;
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (vol: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = vol;
      setVolume(vol);
      if (vol === 0) {
        audio.muted = true;
        setIsMuted(true);
      } else if (isMuted) {
        audio.muted = false;
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !audio.muted;
      setIsMuted(audio.muted);
    }
  };

  const onLoad = () => {
    const audio = audioRef.current;
    if (audio) {
      audio
        .play()
        .catch((e) => setError(new Error(`Play failed: ${e.message}`)));
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
    isLoading,
    error,
    onLoad,
  };
}
