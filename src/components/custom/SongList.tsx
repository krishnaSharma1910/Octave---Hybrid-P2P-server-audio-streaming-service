import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MusicPlayer } from "./audioPlayer";

interface Song {
  id: number;
  title: string;
  artist: string;
}

export function SongList() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLooping, setIsLooping] = useState<boolean>(false);

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

    if (isLooping) {
      // Replay same song
      setCurrentIndex((prev) => prev);
    } else {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % queue.length);
    }
  };

  const handlePrevious = () => {
    if (queue.length === 0) return;

    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? queue.length - 1 : prevIndex - 1
    );
  };

  const toggleLoop = () => {
    setIsLooping((prev) => !prev);
  };

  const createCustomPlaylist = () => {
    const custom = songs.slice(0, 3); // Example: first 3 songs
    setQueue(custom);
    setCurrentIndex(0);
  };

  const currentSong = queue[currentIndex];

  return (
    <div className="flex flex-col gap-4">
      {/* Control Buttons */}
      <div className="flex gap-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow"
          onClick={toggleLoop}
        >
          {isLooping ? "Looping On 🔁" : "Loop Off"}
        </button>

        <button
          className="px-4 py-2 bg-green-600 text-white rounded-xl shadow"
          onClick={createCustomPlaylist}
        >
          🎵 Custom Queue (1-3)
        </button>
      </div>

      {/* Song List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {songs.map((song, idx) => (
          <Card
            key={song.id}
            className="p-4 cursor-pointer hover:bg-muted rounded-2xl border-2 bg-gradient-to-b from-background to-muted/50 shadow-lg"
            onClick={() => handleSongSelect(song)}
          >
            <CardContent>
              <h3 className="text-lg font-bold">{song.title}</h3>
              <p className="text-sm text-muted-foreground">{song.artist}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Music Player */}
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
          isLooping={isLooping}
        />
      )}
    </div>
  );
}
