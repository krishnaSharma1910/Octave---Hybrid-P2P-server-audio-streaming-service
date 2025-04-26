import { SongList } from "./components/custom/SongList";
import SimpleHlsPlayer from "./components/test/SimplePlayer";

export default function App() {
  return (
    // <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
    //   <div className="w-full max-w-7xl">
    //     <h1 className="text-3xl font-bold mb-6">Music Player</h1>
    //     <SongList />
    //   </div>
    // </main>
    <SimpleHlsPlayer
      src="http://172.19.150.89:9000/track-bucket/converted-audio/output.m3u8" // Replace with your HLS audio URL
    />
  );
}
