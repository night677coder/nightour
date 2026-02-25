'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Film, Tv, Star, BookOpen } from 'lucide-react';
import { tmdb } from '@/lib/api/tmdb';
import { anilist } from '@/lib/api/anilist';
import { ContentItem } from '@/types';
import { debounce } from '@/lib/utils';

interface SearchBarProps {
  onClose: () => void;
}

export function SearchBar({ onClose }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const searchContent = debounce(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const [moviesResponse, tvResponse, animeResponse, mangaResponse] = await Promise.all([
        tmdb.searchMovies(searchQuery, 1),
        tmdb.searchTVShows(searchQuery, 1),
        anilist.searchAnime(searchQuery, 1, 3),
        anilist.searchManga(searchQuery, 1, 3),
      ]);

      const combinedResults: ContentItem[] = [
        ...moviesResponse.results.slice(0, 3).map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          poster: `https://image.tmdb.org/t/p/w200${movie.poster_path}`,
          backdrop: `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`,
          overview: movie.overview,
          type: 'movie' as const,
          rating: movie.vote_average,
          year: movie.release_date?.split('-')[0] || 'Unknown',
        })),
        ...tvResponse.results.slice(0, 3).map((tv: any) => ({
          id: tv.id,
          title: tv.name,
          poster: `https://image.tmdb.org/t/p/w200${tv.poster_path}`,
          backdrop: `https://image.tmdb.org/t/p/w1280${tv.backdrop_path}`,
          overview: tv.overview,
          type: 'tv' as const,
          rating: tv.vote_average,
          year: tv.first_air_date?.split('-')[0] || 'Unknown',
        })),
        ...(animeResponse?.Page?.media ?? []).slice(0, 3).map((anime: any) => ({
          id: anime.id,
          title: anime?.title?.english || anime?.title?.romaji || anime?.title?.native || 'Unknown',
          poster: anime?.coverImage?.large || anime?.coverImage?.extraLarge || '/placeholder.jpg',
          backdrop: anime?.bannerImage || anime?.coverImage?.extraLarge || '',
          overview: anime?.description || '',
          type: 'anime' as const,
          rating: typeof anime?.averageScore === 'number' ? anime.averageScore / 10 : 0,
          year: anime?.seasonYear?.toString() || 'Unknown',
        })),
        ...(mangaResponse?.Page?.media ?? []).slice(0, 3).map((manga: any) => ({
          id: manga.id,
          title: manga?.title?.english || manga?.title?.romaji || manga?.title?.native || 'Unknown',
          poster: manga?.coverImage?.large || manga?.coverImage?.extraLarge || '/placeholder.jpg',
          backdrop: manga?.bannerImage || manga?.coverImage?.extraLarge || '',
          overview: manga?.description || '',
          type: 'manga' as const,
          rating: typeof manga?.averageScore === 'number' ? manga.averageScore / 10 : 0,
          year: manga?.seasonYear?.toString() || 'Unknown',
        })),
      ];

      setResults(combinedResults);
    } catch (error) {
      // Search failed, results remain empty
    } finally {
      setIsLoading(false);
    }
  }, 300);

  useEffect(() => {
    searchContent(query);
  }, [query]);

  const handleItemClick = (item: ContentItem) => {
    const getRoute = () => {
      switch (item.type) {
        case 'movie':
          return 'movies';
        case 'tv':
          return 'tv-shows';
        case 'anime':
          return 'anime';
        default:
          return item.type;
      }
    };
    const route = `/${getRoute()}/${item.id}`;
    router.push(route);
    onClose();
    setQuery('');
    setResults([]);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'movie':
        return <Film className="h-3 w-3" />;
      case 'tv':
        return <Tv className="h-3 w-3" />;
      case 'anime':
        return <Star className="h-3 w-3" />;
      case 'manga':
        return <BookOpen className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden">
        <Search className="h-5 w-5 text-gray-400 ml-3" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, TV shows, anime..."
          className="flex-1 bg-transparent px-4 py-3 text-accent placeholder-gray-400 outline-none"
          autoFocus
        />
        <button
          onClick={onClose}
          className="p-3 hover:bg-gray-700 transition-colors"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {/* Search Results */}
      {query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleItemClick(item)}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                >
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(item.type)}
                      <h4 className="text-accent font-medium">{item.title}</h4>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {item.year} • {item.rating?.toFixed(1)} ⭐
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
