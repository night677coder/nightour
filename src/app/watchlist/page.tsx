'use client';

import { useState, useEffect } from 'react';
import { ContentCard } from '@/components/cards/ContentCard';
import { useWatchlistStore } from '@/lib/store/watchlist';
import { Trash2, Film, Tv, Star, BookOpen } from 'lucide-react';
import { ContentItem } from '@/types';

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist, clearWatchlist } = useWatchlistStore();
  const [filteredWatchlist, setFilteredWatchlist] = useState(watchlist);
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv' | 'anime' | 'manga'>('all');

  useEffect(() => {
    if (filter === 'all') {
      setFilteredWatchlist(watchlist);
    } else {
      setFilteredWatchlist(watchlist.filter(item => item.type === filter));
    }
  }, [watchlist, filter]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'movie':
        return <Film className="h-4 w-4" />;
      case 'tv':
        return <Tv className="h-4 w-4" />;
      case 'anime':
        return <Star className="h-4 w-4" />;
      case 'manga':
        return <BookOpen className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const toContentItem = (item: any): ContentItem => {
    return {
      id: item.id,
      title: item.title,
      poster: item.poster,
      backdrop: item.backdrop || item.poster,
      overview: item.overview || '',
      type: item.type,
      rating: typeof item.rating === 'number' ? item.rating : 0,
      year: item.year || 'Unknown',
      genres: item.genres,
    };
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'movie':
        return 'Movies';
      case 'tv':
        return 'TV Shows';
      case 'anime':
        return 'Anime';
      case 'manga':
        return 'Manga';
      default:
        return 'All';
    }
  };

  if (watchlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-accent mb-8">My Watchlist</h1>
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-accent mb-2">Your watchlist is empty</h2>
          <p className="text-gray-400 mb-6">Start adding movies, TV shows, and anime to your watchlist</p>
          <a href="/" className="btn-primary">
            Browse Content
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-accent">My Watchlist</h1>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-gray-800 text-accent px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-primary"
          >
            <option value="all">All Types</option>
            <option value="movie">Movies</option>
            <option value="tv">TV Shows</option>
            <option value="anime">Anime</option>
            <option value="manga">Manga</option>
          </select>
          <button
            onClick={clearWatchlist}
            className="flex items-center space-x-2 text-red-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {filteredWatchlist.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400">No {getTypeLabel(filter)} found in your watchlist</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-gray-400">
            {filteredWatchlist.length} {filteredWatchlist.length === 1 ? 'item' : 'items'} in watchlist
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {filteredWatchlist.map((item) => (
              <div key={item.id} className="relative group">
                <ContentCard item={toContentItem(item)} />
                <button
                  onClick={() => removeFromWatchlist(item.id)}
                  className="absolute top-2 right-2 p-2 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
