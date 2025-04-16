import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MusicPlayer } from "./audioPlayer";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {Heart} from "lucide-react"

interface Song {
  id: number;
  title: string;
  artist: string;
}

export function SongList() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [queue, setQueue] = useState<Song[]>([]);
  const [customQueue, setCustomQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLooping, setIsLooping] = useState<Song[]>([]);
  const [loopStateIndex, setLoopStateIndex] = useState<number>(0)
  const [currentSong, setCurrentSong] = useState<Song>()

  useEffect(() => {
    fetch("http://172.19.22.88:3000/songs")
      .then((res) => res.json())
      .then((data) => {
        setSongs(data);
        setQueue(data); // Default queue is all songs
      })
      .catch((error) => console.error("Error fetching songs:", error));
  }, []);

  const handleSongSelect = (selected: Song) => {
    const index = queue.findIndex((s) => s.id === selected.id);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (queue.length === 0) return;

    setCurrentIndex((prevIndex) => (prevIndex + 1) % queue.length);
  };

  const handlePrevious = () => {
    if (queue.length === 0) return;

    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? queue.length - 1 : prevIndex - 1
    );
  };

  const toggleLoop = () => {

    if(isLooping.includes(songs[currentIndex])){
      setLoopStateIndex(currentIndex)
      setIsLooping([])
      console.log("loop off")
    } else{
      setIsLooping([songs[currentIndex]])
      console.log("loop on")
    }
    
  };

  useEffect(() => {
    if(isLooping.length == 0){
      setQueue(songs)
      setCurrentIndex(loopStateIndex)
    } else{
      setQueue(isLooping)
      setCurrentIndex(0)
    }
  }, [isLooping])

  const playCustomPlaylist = () => {
    const custom = songs.slice(0, 3); // Example: first 3 songs
    setQueue(custom);
    setCurrentIndex(0);
  };

  const playCustomQueue = () => {
    setQueue(customQueue);
    setCurrentIndex(0);
  }

  const addToPlayList = (sidx) => {
    setCustomQueue(prev => [...prev, songs[sidx]])
    // console.log(sidx)
  }

  const removeFromPlayList = (sidx) => {
    const updatedQueue = customQueue.filter(q => q.id !== songs[sidx].id)
    setCustomQueue(updatedQueue)
    // console.log(sidx)
  }

useEffect(() => {
  setCurrentSong(queue[currentIndex]);
}, [queue, currentIndex])

  return (
    <div className="flex flex-row gap-4">
      {/* Music Player */}
      <div>{currentSong && (
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
          isLooping={isLooping}
          handleToggleLoop={toggleLoop}
        />
      )}</div>

      <div className="w-md h-[90vh] overflow-y-scroll no-scrollbar">{/* Control Buttons */}
      

      {/* Song List */}
     
       

        <div className="grid grid-cols-1 gap-2 mt-2 ">
        {songs.map((song, idx) => (
           <ContextMenu>
          <ContextMenuTrigger><Card
          key={song.id}
          className="p-4 cursor-pointer hover:bg-muted rounded-2xl border-2 bg-gradient-to-b from-background to-muted/50 shadow-lg"
          onClick={() => handleSongSelect(song)}
        >
          <CardContent className="grid grid-cols-3 gap-2">
            <div className="col-span-1"><img src="https://i1.sndcdn.com/artworks-000012560643-t526va-t500x500.jpg" className="w-9/10" /></div>
            <div className="col-span-2"><h3 className="text-lg font-bold">{song.title}</h3>
            <p className="text-sm text-muted-foreground">{song.artist}</p></div>
          </CardContent>
        </Card></ContextMenuTrigger>
        <ContextMenuContent>
          {customQueue.includes(songs[idx]) ? <ContextMenuItem onClick={() => {removeFromPlayList(idx)}}>Remove from Liked Songs {idx}</ContextMenuItem>:<ContextMenuItem onClick={() => {addToPlayList(idx)}}>Add to Liked Songs {idx}</ContextMenuItem>}
          <ContextMenuItem>Delete</ContextMenuItem>
         
        </ContextMenuContent>
        </ContextMenu>
          
        ))}
         
        
      </div></div>


    
      <div className="w-1/3">
     
      <div className="grid grid-cols-1 gap-2 mt-2">
      <Card
      onClick={playCustomQueue}
          className="p-4 cursor-pointer hover:bg-muted rounded-2xl border-2 bg-gradient-to-b from-background to-muted/50 shadow-lg"
         
        >
          <CardContent>
            <h3 className="text-lg font-bold flex flex-row gap-3 items-center"><Heart /> Liked Songs</h3>
            <div className="p-3 text-left">{customQueue.length !== 0 ? customQueue.map(q => <h3>{q.title}</h3>): <h3> No Liked Songs</h3>}</div>
            
          </CardContent>
        </Card>
      </div></div>

      
    </div>
  );
}
