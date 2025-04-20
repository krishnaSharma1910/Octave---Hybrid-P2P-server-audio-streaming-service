import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import {
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl: string;
}

interface MusicPlayerProps {
  track: Track;
  onNext: () => void;
  onPrevious: () => void;
  handleToggleLoop: () => void;
  loopQueue: Track[];
  isLooping: boolean;
}

export function MusicPlayer({
  track,
  onNext,
  onPrevious,
  handleToggleLoop,
  loopQueue,
  isLooping,
}: MusicPlayerProps) {
  const defaultCoverUrl =
    "https://i1.sndcdn.com/artworks-000012560643-t526va-t500x500.jpg";

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
    onLoad,
  } = useAudioPlayer({
    src: track.audioUrl,
    loop: isLooping,
    onEnd: () => {
      if (!isLooping) {
        onNext();
      }
    },
  });

  // Play automatically when track changes
  useEffect(() => {
    onLoad();
  }, [track]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Card className="w-full border-2 bg-gradient-to-b from-background to-muted/50 shadow-lg p-2.5 rounded-2xl">
      <CardContent className="p-0">
        <div className="flex flex-col">
          {/* Album Art */}
          <div className="relative w-full aspect-square md:aspect-auto md:h-auto overflow-hidden">
            <img
              src={track.coverUrl || defaultCoverUrl}
              alt={`${track.title} cover`}
              className="object-cover w-full h-full rounded-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden flex items-end p-4">
              <div className="text-white">
                <h3 className="font-bold text-xl">{track.title}</h3>
                <p className="text-white/80">{track.artist}</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="hidden md:block mb-6">
              <h3 className="font-bold text-2xl">{track.title}</h3>
              <p className="text-muted-foreground text-lg">{track.artist}</p>
            </div>

            {/* Progress bar */}
            <div className="space-y-2 mb-6">
              <Slider
                value={[progress]}
                max={duration || 100}
                step={0.1}
                onValueChange={(value) => handleSeek(value[0])}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 flex justify-center gap-4">
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Shuffle size={20} />
                </button>
                <button
                  onClick={onPrevious}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <SkipBack size={24} />
                </button>
                <Toggle
                  pressed={isPlaying}
                  onPressedChange={togglePlayPause}
                  className="h-12 w-12 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground flex items-center justify-center"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </Toggle>
                <button
                  onClick={onNext}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <SkipForward size={24} />
                </button>
                <button
                  onClick={handleToggleLoop}
                  className={`text-muted-foreground hover:text-foreground transition-colors ${
                    isLooping ? "text-primary" : ""
                  }`}
                >
                  <Repeat size={20} />
                </button>
              </div>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMute}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                max={100}
                step={1}
                onValueChange={(value) => handleVolumeChange(value[0])}
                className="cursor-pointer max-w-48"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
