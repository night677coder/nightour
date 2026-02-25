'use client';

import { useState } from 'react';
import { Play, X, ExternalLink } from 'lucide-react';

interface VideoPlayerProps {
  title: string;
  trailerKey?: string;
  type: 'movie' | 'tv' | 'anime';
}

export function VideoPlayer({ title, trailerKey, type }: VideoPlayerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleWatch = () => {
    setIsOpen(true);
  };

  const getWatchMessage = () => {
    switch (type) {
      case 'movie':
        return `Watch "${title}" on your favorite streaming service or rent it digitally.`;
      case 'tv':
        return `Watch "${title}" episodes on your favorite streaming service.`;
      case 'anime':
        return `Watch "${title}" on Crunchyroll, Funimation, or other anime streaming platforms.`;
      default:
        return `Watch "${title}" on your preferred streaming service.`;
    }
  };

  return (
    <>
      {/* Play Button */}
      <button 
        onClick={handleWatch}
        className="btn-primary flex items-center space-x-2"
      >
        <Play className="h-5 w-5" />
        <span>Watch Now</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 p-4">
          <div className="relative w-full max-w-6xl h-[90vh] bg-gray-900 rounded-lg overflow-hidden flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-20 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Main Content - Video on Right, Info on Left */}
            <div className="flex flex-col lg:flex-row h-full">
              {/* Left Side - Info */}
              <div className="lg:w-1/3 p-6 border-r border-gray-800 overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                <p className="text-gray-400 mb-6">{getWatchMessage()}</p>
                
                {/* Watch Options */}
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-2">Watch on:</p>
                  <a 
                    href={`https://www.google.com/search?q=watch+${encodeURIComponent(title)}+${type}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span>Where to Watch</span>
                  </a>
                  
                  {type === 'anime' && (
                    <a 
                      href={`https://www.crunchyroll.com/search?q=${encodeURIComponent(title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 p-3 bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <Play className="h-5 w-5" />
                      <span>Crunchyroll</span>
                    </a>
                  )}
                  
                  {trailerKey && (
                    <a 
                      href={`https://www.youtube.com/watch?v=${trailerKey}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 p-3 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Play className="h-5 w-5" />
                      <span>Watch on YouTube</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Right Side - Full Video */}
              <div className="lg:w-2/3 bg-black flex items-center justify-center">
                {trailerKey ? (
                  <div className="w-full h-full">
                    <iframe
                      src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                      title={`${title} Trailer`}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <Play className="h-24 w-24 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Trailer not available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
