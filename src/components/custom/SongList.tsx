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
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch("http://172.19.22.88:3000/songs")
      .then((res) => res.json())
      .then((data) => setSongs(data))
      .catch((error) => console.error("Error fetching songs:", error));
  }, []);

  const handleSongSelect = (index: number) => {
    setCurrentIndex(index);
    setTimeout(() => document.getElementById("play-button")?.click(), 100);
  };

  const handleNext = () => {
    if (currentIndex !== null && currentIndex < songs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex !== null && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Song List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {songs.map((song, idx) => (
          <Card
            key={song.id}
            className="p-4 cursor-pointer hover:bg-muted rounded-2xl border-2 bg-gradient-to-b from-background to-muted/50 shadow-lg"
            onClick={() => handleSongSelect(idx)}
          >
            <CardContent>
              {/* <img
                src={
                  "https://i1.sndcdn.com/artworks-000012560643-t526va-t500x500.jpg"
                }
                alt={`${idx} cover`}
                className="object-cover rounded-2xl"
              /> */}
              <h3 className="text-lg font-bold">{song.title}</h3>
              <p className="text-sm text-muted-foreground">{song.artist}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Music Player */}
      {currentIndex !== null && songs[currentIndex] && (
        <MusicPlayer
          track={{
            id: songs[currentIndex].id.toString(),
            title: songs[currentIndex].title,
            artist: songs[currentIndex].artist,
            coverUrl:
              "https://i1.sndcdn.com/artworks-000012560643-t526va-t500x500.jpg", // Placeholder
            audioUrl: `http://172.19.22.88:3000/stream/${songs[currentIndex].id}/192`,
          }}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
    </div>
  );
}
