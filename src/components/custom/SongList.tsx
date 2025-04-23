import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MusicPlayer } from "./audioPlayer";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Heart } from "lucide-react";

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
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentSong, setCurrentSong] = useState<Song>();
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
 


  useEffect(() => {
    fetch("http://172.19.22.88:3000/songs")
      .then((res) => res.json())
      .then((data) => {
        setSongs(data);
        setQueue(data);
      })
      .catch((error) => console.error("Error fetching songs:", error));
  }, []);

  useEffect(() => {
    setCurrentSong(queue[currentIndex]);
  }, [queue, currentIndex]);

  const handleSongSelect = (selected: Song) => {
    const index = queue.findIndex((s) => s.id === selected.id);
    setCurrentIndex(index);
  };
  
  useEffect(() => {
    const activeQueue = isUsingCustomQueue ? customQueue : queue;
    setCurrentSong(activeQueue[currentIndex]);
  }, [queue, customQueue, currentIndex, isUsingCustomQueue]);
  
  const handleNext = () => {
    const activeQueue = isUsingCustomQueue ? customQueue : queue;
    if (activeQueue.length === 0) return;
  
    setCurrentIndex((prevIndex) => (prevIndex + 1) % activeQueue.length);
  };
  
  const handlePrevious = () => {
    const activeQueue = isUsingCustomQueue ? customQueue : queue;
    if (activeQueue.length === 0) return;
  
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? activeQueue.length - 1 : prevIndex - 1
    );
  };
  
  const toggleLoop = () => {
    setIsLooping(!isLooping); // Toggle the loop state
  };

  
  const handleShuffleToggle = () => {
    console.log(queue)
    console.log(songs[currentIndex])
    setIsShuffling((prev) => {
      const newShuffleState = !prev;
  
      if (newShuffleState) {
        const currentSongInPlay = queue[currentIndex];
      
        const shuffled = [...songs].sort(() => Math.random() - 0.5);
        const indexOfCSP = shuffled.findIndex((s) => s.id === currentSongInPlay.id);
        setQueue(shuffled);
        setCurrentIndex(indexOfCSP);
      } else {
        const currentSongInPlay = queue[currentIndex];
        const indexOfCSP = songs.findIndex((s) => s.id === currentSongInPlay.id);
        setQueue(songs);
        setCurrentIndex(indexOfCSP); // Reset to first in original queue
      }
  
      return newShuffleState;
    });
  };
  
  const playCustomQueue = () => {
    if (customQueue.length === 0) return;
    setQueue(customQueue); // Optional: keep this if you want UI to show it
    setIsUsingCustomQueue(true);
    setCurrentIndex(0);
  };
  

  const addToPlayList = (sidx: number) => {
    setCustomQueue((prev) => [...prev, songs[sidx]]);
  };

  const removeFromPlayList = (sidx: number) => {
    const updatedQueue = customQueue.filter(
      (q) => q.id !== songs[sidx].id
    );
    setCustomQueue(updatedQueue);
  };

  return (
    <div className="flex flex-row gap-4">
      {/* Song List - Move to the Left */}
      <div className="w-1/3 h-[90vh] overflow-y-scroll no-scrollbar">
        <div className="grid grid-cols-1 gap-2 mt-2">
          {songs.map((song, idx) => (
            <ContextMenu key={song.id}>
              <ContextMenuTrigger>
                <Card
                  className="p-4 cursor-pointer hover:bg-muted rounded-2xl border-2 bg-gradient-to-b from-background to-muted/50 shadow-lg"
                  onClick={() => handleSongSelect(song)}
                >
                  <CardContent className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <img
                        src="https://i1.sndcdn.com/artworks-000012560643-t526va-t500x500.jpg"
                        className="w-9/10"
                      />
                    </div>
                    <div className="col-span-2">
                      <h3 className="text-lg font-bold">{song.title}</h3>
                      <p className="text-sm text-muted-foreground">{song.artist}</p>
                    </div>
                  </CardContent>
                </Card>
              </ContextMenuTrigger>
  
              <ContextMenuContent>
                {customQueue.includes(songs[idx]) ? (
                  <ContextMenuItem onClick={() => removeFromPlayList(idx)}>
                    Remove from Liked Songs
                  </ContextMenuItem>
                ) : (
                  <ContextMenuItem onClick={() => addToPlayList(idx)}>
                    Add to Liked Songs
                  </ContextMenuItem>
                )}
                <ContextMenuItem>Delete</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      </div>
  
      {/* Music Player - Center */}
      <div className="flex justify-center items-start w-1/2">
        {currentSong && (
          <MusicPlayer
            track={{
              id: currentSong.id.toString(),
              title: currentSong.title,
              artist: currentSong.artist,
              coverUrl:
                "https://i1.sndcdn.com/artworks-000012560643-t526va-t500x500.jpg",
              audioUrl: `http://172.19.22.88:3000/stream/${currentSong.id}/192`,
            }}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isLooping={isLooping} // Pass the loop state to MusicPlayer
            onLoopToggle={toggleLoop} // Pass the loop toggle function to MusicPlayer
            onShuffle={handleShuffleToggle}
            isShuffling={isShuffling}
            
          />
        )}
      </div>
  
      {/* Liked Songs - Right */}
      <div className="w-1/3">
        <div className="grid grid-cols-1 gap-2 mt-2">
          <Card
            onClick={playCustomQueue}
            className="p-4 cursor-pointer hover:bg-muted rounded-2xl border-2 bg-gradient-to-b from-background to-muted/50 shadow-lg"
          >
            <CardContent>
              <h3 className="text-lg font-bold flex flex-row gap-3 items-center">
                <Heart /> Liked Songs
              </h3>
              <div className="p-3 text-left">
                {customQueue.length !== 0 ? (
                  customQueue.map((q) => <h3 key={q.id}>{q.title}</h3>)
                ) : (
                  <h3>No Liked Songs</h3>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
  
}
