// components/SimpleHlsPlayer.tsx
"use client";

import { useHlsAudioPlayer } from "@/hooks/varientUseAudioPlayer";


export default function SimpleHlsPlayer({ src }: { src: string }) {
  const {
    isPlaying,
    togglePlayPause,
    progress,
    duration,
    handleSeek,
    volume,
    handleVolumeChange,
    isMuted,
    toggleMute,
  } = useHlsAudioPlayer({ src });

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded shadow">
      <div className="flex items-center justify-between">
        <button onClick={togglePlayPause}>
          {isPlaying ? "⏸️ Pause" : "▶️ Play"}
        </button>
        <button onClick={toggleMute}>
          {isMuted ? "🔇 Unmute" : "🔊 Mute"}
        </button>
      </div>

      <div className="mt-4">
        <label className="block text-sm">
          Progress: {Math.floor(progress)} / {Math.floor(duration)} sec
        </label>
        <input
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={progress}
          onChange={(e) => handleSeek(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm">
          Volume: {Math.round(volume * 100)}%
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}
