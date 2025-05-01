import { SongList } from "./components/custom/SongList";
// import { MusicPlayer } from "./components/custom/audioPlayer";

export default function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-7xl text-center">
        {/* Logo and Title Row */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <img
            src="/OCTAVE2.png"
            alt="Octave Logo"
            className="w-10 h-10"
          />
          <h1 className="text-3xl font-bold">Octave</h1>
        </div>

        {/* Subtitle */}
        <p className="text-lg text-muted-foreground mb-6">
          Stream Your Sound. 
        </p>

         <SongList />
      </div>
    </main>
  );
}
