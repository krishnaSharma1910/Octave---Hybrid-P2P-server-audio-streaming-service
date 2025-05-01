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
    audio.volume = volume;

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

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              handleGenericError("Fatal HLS Error", data.details);
              hls.destroy();
              break;
          }
        }
      });

      hls.loadSource(src);
      hls.attachMedia(audio);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setDuration(audio.duration);
        setIsLoading(false);
        if (autoPlay) {
          audio
            .play()
            .catch((e) => handleGenericError("Playback failed", e.message));
        }
      });
    } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
      audio.src = src;
      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
        setIsLoading(false);
        if (autoPlay) {
          audio
            .play()
            .catch((e) => handleGenericError("Playback failed", e.message));
        }
      });
      audio.addEventListener("error", () => {
        handleGenericError("Native HLS playback failed");
      });
    } else {
      handleGenericError("HLS is not supported in this browser");
    }

    const updateProgress = () => setProgress(audio.currentTime);
    const handleEnded = () => {
      if (loop) {
        audio.currentTime = 0;
        audio
          .play()
          .catch((e) =>
            setError(new Error(`Loop playback failed: ${e.message}`))
          );
      } else {
        setIsPlaying(false);
        onEnded?.();
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(audio.volume);
      setIsMuted(audio.muted);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("volumechange", handleVolumeChange);

    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      hlsRef.current?.destroy();
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("volumechange", handleVolumeChange);
    };
  }, [src, onEnded, autoPlay, volume, loop]); // include loop here

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
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setProgress(time);
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
  };
}
