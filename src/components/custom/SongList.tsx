import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MusicPlayer } from "./audioPlayer";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Heart } from "lucide-react";
import { ScrollingText } from "./scrollingText";

interface Song {
  id: number;
  title: string;
  artist: string;
}

export function SongList() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isUsingCustomQueue, setIsUsingCustomQueue] = useState(false);
  const [customQueue, setCustomQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentSong = isUsingCustomQueue ? customQueue[currentIndex] : queue[currentIndex];

  const fetchSongs = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://172.19.22.88:3000/songs");
      if (!response.ok) throw new Error("Server is down");
      const data = await response.json();
      setSongs(data);
      setQueue(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Error fetching songs:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  const handleSongSelect = useCallback((selected: Song) => {
    const activeQueue = isUsingCustomQueue ? customQueue : queue;
    const index = activeQueue.findIndex((s) => s.id === selected.id);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [isUsingCustomQueue, customQueue, queue]);

  const handleNext = useCallback(() => {
    const activeQueue = isUsingCustomQueue ? customQueue : queue;
    if (activeQueue.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % activeQueue.length);
  }, [isUsingCustomQueue, customQueue, queue]);

  const handlePrevious = useCallback(() => {
    const activeQueue = isUsingCustomQueue ? customQueue : queue;
    if (activeQueue.length === 0) return;
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? activeQueue.length - 1 : prevIndex - 1
    );
  }, [isUsingCustomQueue, customQueue, queue]);

  const toggleLoop = useCallback(() => {
    setIsLooping((prev) => !prev);
  }, []);

  const handleShuffleToggle = useCallback(() => {
    setIsShuffling((prev) => {
      const newShuffleState = !prev;
      const currentSongInPlay = isUsingCustomQueue ? customQueue[currentIndex] : queue[currentIndex];

      if (newShuffleState) {
        const shuffled = [...songs].filter(song => song.id !== currentSongInPlay.id);
        shuffled.unshift(currentSongInPlay);
        shuffled.sort(() => Math.random() - 0.5);
        setQueue(shuffled);
      } else {
        setQueue(songs);
        const index = songs.findIndex((s) => s.id === currentSongInPlay.id);
        setCurrentIndex(index);
      }

      setIsUsingCustomQueue(false);
      return newShuffleState;
    });
  }, [currentIndex, isUsingCustomQueue, customQueue, queue, songs]);

  const playCustomQueue = useCallback(() => {
    if (customQueue.length === 0) return;
    setIsUsingCustomQueue(true);
    setCurrentIndex(0);
  }, [customQueue]);

  const addToPlayList = useCallback((songId: number) => {
    const songToAdd = songs.find((s) => s.id === songId);
    if (songToAdd && !customQueue.some((q) => q.id === songId)) {
      setCustomQueue((prev) => [...prev, songToAdd]);
    }
  }, [songs, customQueue]);

  const removeFromPlayList = useCallback((songId: number) => {
    setCustomQueue((prev) => prev.filter((q) => q.id !== songId));
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading songs...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      {/* Song List */}
      <div className="w-full md:w-1/3 h-[60vh] md:h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">All Songs</h2>
        <div className="grid grid-cols-1 gap-2">
          {songs.map((song) => (
            <ContextMenu key={song.id}>
              <ContextMenuTrigger>
                <Card
                  className={`p-4 cursor-pointer hover:bg-muted rounded-2xl border-2 transition-colors ${
                    currentSong?.id === song.id ? 'bg-muted/50' : 'bg-gradient-to-b from-background to-muted/10'
                  }`}
                  onClick={() => handleSongSelect(song)}
                >
                  <CardContent className="grid grid-cols-3 gap-2 p-0">
                    <div className="col-span-1">
                      <img
                        src="https://i1.sndcdn.com/artworks-000012560643-t526va-t500x500.jpg"
                        className="w-full rounded-lg"
                        alt={`${song.title} cover`}
                      />
                    </div>
                    <div className="col-span-2">
                      <ScrollingText 
                        text={song.title} 
                        className="text-lg font-bold" 
                        width="100%"
                      />
                      <ScrollingText 
                        text={song.artist} 
                        className="text-sm text-muted-foreground" 
                        width="100%"
                      />
                    </div>
                  </CardContent>
                </Card>
              </ContextMenuTrigger>

              <ContextMenuContent>
                {customQueue.some((q) => q.id === song.id) ? (
                  <ContextMenuItem onClick={() => removeFromPlayList(song.id)}>
                    Remove from Liked Songs
                  </ContextMenuItem>
                ) : (
                  <ContextMenuItem onClick={() => addToPlayList(song.id)}>
                    Add to Liked Songs
                  </ContextMenuItem>
                )}
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      </div>

      {/* Music Player */}
      <div className="w-full md:w-1/3 flex justify-center">
        {currentSong && (
          <MusicPlayer
            track={{
              id: currentSong.id.toString(),
              title: currentSong.title,
              artist: currentSong.artist,
              coverUrl: "https://i1.sndcdn.com/artworks-000012560643-t526va-t500x500.jpg",
              audioUrl: `http://172.19.22.88:3000/stream/${currentSong.id}/192`,
            }}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isLooping={isLooping}
            onLoopToggle={toggleLoop}
            onShuffle={handleShuffleToggle}
            isShuffling={isShuffling}
          />
        )}
      </div>

      {/* Liked Songs */}
      <div className="w-full md:w-1/3">
        <h2 className="text-xl font-bold mb-4">Liked Songs</h2>
        <Card
          onClick={playCustomQueue}
          className="p-4 cursor-pointer hover:bg-muted rounded-2xl border-2 transition-colors bg-gradient-to-b from-background to-muted/10"
        >
          <CardContent className="p-0">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="text-red-500 fill-red-500" />
              <h3 className="text-lg font-bold">Liked Songs</h3>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {customQueue.length > 0 ? (
                customQueue.map((q) => (
                  <div 
                    key={q.id} 
                    className="py-2 px-1 hover:bg-muted/50 rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSongSelect(q);
                    }}
                  >
                    <h3 className="font-medium">{q.title}</h3>
                    <p className="text-sm text-muted-foreground">{q.artist}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No liked songs yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}