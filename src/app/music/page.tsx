'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import SpotifyPlayer from 'react-spotify-web-playback';
import { Artist, Track } from '@/types';

export default function MusicPage() {
  const { data: session } = useSession();
  
  console.log('Session status:', session ? 'Logged in' : 'Not logged in');
  console.log('Session data:', session);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTracks, setSearchTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [playTrackUris, setPlayTrackUris] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [newReleases, setNewReleases] = useState<any[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchTracks(data);
    } catch (error) {
      console.error('Error searching tracks:', error);
      setSearchTracks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const playAllTracks = () => {
    if (searchTracks.length > 0) {
      playTrack(searchTracks[0].uri);
    }
  };

  const playTrack = (uri: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = uri;
      audioRef.current.load();
      audioRef.current.play();
    }
  };

  useEffect(() => {
    const loadNewReleases = async () => {
      try {
        const response = await fetch('/api/spotify/new-releases');
        const data = await response.json();
        setNewReleases(data);
      } catch (error) {
        console.error('Error loading new releases:', error);
        // Fallback mock data
        setNewReleases([
          {
            id: '1',
            name: 'Mock Album 1',
            images: [{ url: '/placeholder.svg' }],
            artists: [{ name: 'Mock Artist 1' }]
          },
          {
            id: '2',
            name: 'Mock Album 2',
            images: [{ url: '/placeholder.svg' }],
            artists: [{ name: 'Mock Artist 2' }]
          },
          {
            id: '3',
            name: 'Mock Album 3',
            images: [{ url: '/placeholder.svg' }],
            artists: [{ name: 'Mock Artist 3' }]
          },
        ]);
      }
    };
    loadNewReleases();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-accent mb-8">Music</h1>

      {newReleases.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-accent mb-4">New Releases</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {newReleases.map((album) => (
              <div
                key={album.id}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
              >
                <img
                  src={album.images[0]?.url || '/placeholder.svg'}
                  alt={album.name}
                  className="w-full aspect-square object-cover rounded-lg mb-2"
                />
                <h3 className="font-semibold text-white">{album.name}</h3>
                <p className="text-sm text-gray-400">
                  {album.artists.map((artist: any) => artist.name).join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for songs..."
            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {searchTracks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-accent">
              Search Results
            </h2>
            <button
              onClick={playAllTracks}
              className="btn-primary"
            >
              Play All
            </button>
          </div>
          <div className="space-y-2">
            {searchTracks.map((track, index) => (
              <div key={track.id} className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg">
                <span className="text-gray-400 w-8">{index + 1}</span>
                <img
                  src={track.album.images[0]?.url || '/placeholder.svg'}
                  alt={track.name}
                  className="w-12 h-12 rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{track.name} (Preview)</h3>
                  <p className="text-sm text-gray-400">
                    {track.artists.map(artist => artist.name).join(', ')}
                  </p>
                </div>
                <span className="text-sm text-gray-400">
                  {Math.floor(track.duration_ms / 60000)}:{((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}
                </span>
                <button
                  onClick={() => playTrack(track.uri)}
                  className="btn-primary"
                >
                  Play
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <audio ref={audioRef} controls className="fixed bottom-0 left-0 right-0 bg-gray-900 p-4 z-50" />
    </div>
  );
}
