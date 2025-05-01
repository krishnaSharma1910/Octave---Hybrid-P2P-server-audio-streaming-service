import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { useHlsAudioPlayer } from "@/hooks/varientUseAudioPlayer"; 
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
}
// Update the MusicPlayerProps interface to include src
interface MusicPlayerProps {
  track: Track;
  onNext: () => void;
  onPrevious: () => void;
  isLooping: boolean;
  isShuffling: boolean;
  onLoopToggle: () => void;
  onShuffle: () => void;
  manifestSrc: string; // Add src to the props
}

export function MusicPlayer({
  track,
  onNext,
  onPrevious,
  isLooping,
  onLoopToggle,
  onShuffle,
  isShuffling,
  manifestSrc, // Destructure src from props
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
    isLoading,
    error,
  } = useHlsAudioPlayer({
    src: manifestSrc,
    onEnded: onNext,
    autoPlay: true,
    loop: isLooping,
  });
    
  
  // Show error if HLS fails to load
  useEffect(() => {
    if (error) {
      console.error("Player Error:", error);
    }
  }, [error]);

  useEffect(() => {
    console.log("Progress updated in UI:", progress);
  }, [progress]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600)/ 60);
    const seconds = Math.floor(time % 60);

    const hoursStr = hours > 0 ? `${hours.toString().padStart(2,"0")}:` : "";
    return `${hoursStr}${minutes.toString().padStart(2, "0")}:${seconds
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
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <p className="text-white">Loading stream...</p>
              </div>
            )}
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
                value={[isNaN(progress) ? 0 : progress]}
                max={isNaN(duration) ? 0 : duration}
                step={0.1}
                onValueChange={(value) => {
                  const newTime = value[0];
                  if (isFinite(newTime)) handleSeek(newTime);
                }}
                className="cursor-pointer"
                disabled={isLoading || isNaN(duration)}
              />

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 flex justify-center gap-4">
                <button
                  onClick={onShuffle}
                  className={`text-muted-foreground hover:text-foreground transition-colors ${
                    isShuffling ? "text-primary" : ""
                  }`}
                  aria-label="Shuffle"
                  disabled={isLoading}
                >
                  <Shuffle size={20} />
                </button>
                <button
                  onClick={onPrevious}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  <SkipBack size={24} />
                </button>
                <Toggle
                  pressed={isPlaying}
                  onPressedChange={togglePlayPause}
                  className="h-12 w-12 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground flex items-center justify-center"
                  aria-label={isPlaying ? "Pause" : "Play"}
                  disabled={isLoading}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </Toggle>
                <button
                  onClick={onNext}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  <SkipForward size={24} />
                </button>
                <Toggle
                  pressed={isLooping}
                  onPressedChange={onLoopToggle}
                  className="h-12 w-12 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors data-[state=on]:text-primary"
                  aria-label="Repeat"
                  disabled={isLoading}
                >
                  <Repeat size={24} />
                </Toggle>
              </div>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMute}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
                disabled={isLoading}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                max={100}
                step={1}
                onValueChange={(value) => handleVolumeChange(value[0] / 100)}
                className="cursor-pointer max-w-48"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}