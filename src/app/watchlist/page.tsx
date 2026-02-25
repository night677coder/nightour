'use client';

import { useState, useEffect } from 'react';
import { ContentCard } from '@/components/cards/ContentCard';
import { useWatchlistStore } from '@/lib/store/watchlist';
import { Trash2, Film, Tv, Star, BookOpen } from 'lucide-react';
import { ContentItem, WatchlistItem } from '@/types';
import { tmdb } from '@/lib/api/tmdb';
import { jikan } from '@/lib/api/jikan';

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist, clearWatchlist, addToWatchlist } = useWatchlistStore();
  const [filteredWatchlist, setFilteredWatchlist] = useState(watchlist);
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv' | 'anime' | 'manga'>('all');
  const [addingMovies, setAddingMovies] = useState(false);
  const [addingTVShows, setAddingTVShows] = useState(false);
  const [addingAnime, setAddingAnime] = useState(false);

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

  const addTop100Movies = async () => {
    setAddingMovies(true);
    try {
      for (let page = 1; page <= 5; page++) {
        const movies = await tmdb.getTopRatedMovies(page);
        movies.results.forEach((movie: any) => {
          const item: WatchlistItem = {
            id: movie.id,
            title: movie.title,
            poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            type: 'movie',
            added_at: new Date().toISOString(),
          };
          addToWatchlist(item);
        });
      }
    } catch (error) {
      console.error('Error adding top 100 movies:', error);
    } finally {
      setAddingMovies(false);
    }
  };

  const addTop100TVShows = async () => {
    setAddingTVShows(true);
    try {
      for (let page = 1; page <= 5; page++) {
        const tvs = await tmdb.getTopRatedTVShows(page);
        tvs.results.forEach((tv: any) => {
          const item: WatchlistItem = {
            id: tv.id,
            title: tv.name,
            poster: `https://image.tmdb.org/t/p/w500${tv.poster_path}`,
            type: 'tv',
            added_at: new Date().toISOString(),
          };
          addToWatchlist(item);
        });
      }
    } catch (error) {
      console.error('Error adding top 100 TV shows:', error);
    } finally {
      setAddingTVShows(false);
    }
  };

  const addTop100Anime = async () => {
    setAddingAnime(true);
    try {
      for (let page = 1; page <= 5; page++) {
        const animes = await jikan.getTopRatedAnime(page);
        animes.data.forEach((anime: any) => {
          const item: WatchlistItem = {
            id: anime.mal_id,
            title: anime.title,
            poster: anime.images.jpg.image_url,
            type: 'anime',
            added_at: new Date().toISOString(),
          };
          addToWatchlist(item);
        });
      }
    } catch (error) {
      console.error('Error adding top 100 anime:', error);
    } finally {
      setAddingAnime(false);
    }
  };

  if (watchlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-accent">My Watchlist</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={addTop100Movies}
              disabled={addingMovies}
              className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
            >
              <Film className="h-4 w-4" />
              <span>{addingMovies ? 'Adding Movies...' : 'Add Top 100 Movies'}</span>
            </button>
            <button
              onClick={addTop100TVShows}
              disabled={addingTVShows}
              className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
            >
              <Tv className="h-4 w-4" />
              <span>{addingTVShows ? 'Adding TV Shows...' : 'Add Top 100 TV Shows'}</span>
            </button>
            <button
              onClick={addTop100Anime}
              disabled={addingAnime}
              className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
            >
              <Star className="h-4 w-4" />
              <span>{addingAnime ? 'Adding Anime...' : 'Add Top 100 Anime'}</span>
            </button>
          </div>
        </div>
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
            onClick={addTop100Movies}
            disabled={addingMovies}
            className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
          >
            <Film className="h-4 w-4" />
            <span>{addingMovies ? 'Adding Movies...' : 'Add Top 100 Movies'}</span>
          </button>
          <button
            onClick={addTop100TVShows}
            disabled={addingTVShows}
            className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
          >
            <Tv className="h-4 w-4" />
            <span>{addingTVShows ? 'Adding TV Shows...' : 'Add Top 100 TV Shows'}</span>
          </button>
          <button
            onClick={addTop100Anime}
            disabled={addingAnime}
            className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
          >
            <Star className="h-4 w-4" />
            <span>{addingAnime ? 'Adding Anime...' : 'Add Top 100 Anime'}</span>
          </button>
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
