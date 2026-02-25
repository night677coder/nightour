'use client';

import { useState, useEffect } from 'react';
import { Search, Film, Tv, Star, BookOpen, X } from 'lucide-react';
import { tmdb } from '@/lib/api/tmdb';
import { anilist } from '@/lib/api/anilist';
import { ContentItem } from '@/types';
import { debounce } from '@/lib/utils';
import Link from 'next/link';

// Comprehensive genres across movies, TV, anime, and manga
const COMMON_GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama',
  'Family', 'Fantasy', 'History', 'Horror', 'Mystery',
  'Romance', 'Sci-Fi', 'Science Fiction', 'Sport', 'Supernatural', 'Thriller', 
  'War', 'Western', 'Biography', 'Food', 'Game', 'Harem', 'Mecha', 'Psychological',
  'School', 'Seinen', 'Shoujo', 'Shounen', 'Slice of Life', 'Space', 'Sports',
  'Super Power', 'Suspense', 'TV Movie', 'Tragedy', 'Yaoi', 'Yuri'
];

// TMDB genre ID to name mapping
const TMDB_GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ContentItem[]>([]);
  const [filteredResults, setFilteredResults] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const searchContent = debounce(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setFilteredResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const [moviesResponse, tvResponse, animeResponse, mangaResponse] = await Promise.all([
        tmdb.searchMovies(searchQuery, 1),
        tmdb.searchTVShows(searchQuery, 1),
        anilist.searchAnime(searchQuery, 1, 10),
        anilist.searchManga(searchQuery, 1, 10),
      ]);

      const combinedResults: ContentItem[] = [
        ...moviesResponse.results.map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          backdrop: `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`,
          overview: movie.overview,
          type: 'movie' as const,
          rating: movie.vote_average,
          year: movie.release_date?.split('-')[0] || 'Unknown',
          genres: (movie.genre_ids || []).map((id: number) => TMDB_GENRE_MAP[id] || '').filter(Boolean),
        })),
        ...tvResponse.results.map((tv: any) => ({
          id: tv.id,
          title: tv.name,
          poster: `https://image.tmdb.org/t/p/w500${tv.poster_path}`,
          backdrop: `https://image.tmdb.org/t/p/w1280${tv.backdrop_path}`,
          overview: tv.overview,
          type: 'tv' as const,
          rating: tv.vote_average,
          year: tv.first_air_date?.split('-')[0] || 'Unknown',
          genres: (tv.genre_ids || []).map((id: number) => TMDB_GENRE_MAP[id] || '').filter(Boolean),
        })),
        ...(animeResponse?.Page?.media ?? []).map((anime: any) => ({
          id: anime.id,
          title: anime?.title?.english || anime?.title?.romaji || anime?.title?.native || 'Unknown',
          poster: anime?.coverImage?.large || anime?.coverImage?.extraLarge || '/placeholder.jpg',
          backdrop: anime?.bannerImage || anime?.coverImage?.extraLarge || '',
          overview: anime?.description || '',
          type: 'anime' as const,
          rating: typeof anime?.averageScore === 'number' ? anime.averageScore / 10 : 0,
          year: anime?.seasonYear?.toString() || 'Unknown',
          genres: anime?.genres || [],
        })),
        ...(mangaResponse?.Page?.media ?? []).map((manga: any) => ({
          id: manga.id,
          title: manga?.title?.english || manga?.title?.romaji || manga?.title?.native || 'Unknown',
          poster: manga?.coverImage?.large || manga?.coverImage?.extraLarge || '/placeholder.jpg',
          backdrop: manga?.bannerImage || manga?.coverImage?.extraLarge || '',
          overview: manga?.description || '',
          type: 'manga' as const,
          rating: typeof manga?.averageScore === 'number' ? manga.averageScore / 10 : 0,
          year: manga?.seasonYear?.toString() || 'Unknown',
          genres: manga?.genres || [],
        })),
      ];

      setResults(combinedResults);
      applyGenreFilter(combinedResults, selectedGenres);
    } catch (error) {
      // Search failed, results remain empty
      setResults([]);
      setFilteredResults([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  useEffect(() => {
    searchContent(query);
  }, [query]);

  useEffect(() => {
    applyGenreFilter(results, selectedGenres);
  }, [selectedGenres, results]);

  const applyGenreFilter = (items: ContentItem[], genres: string[]) => {
    if (genres.length === 0) {
      setFilteredResults(items);
      return;
    }

    const filtered = items.filter(item => {
      if (!item.genres || item.genres.length === 0) return false;
      
      const itemGenreNames = item.genres.map(g => g.toLowerCase());
      
      return genres.some(genre => {
        const genreLower = genre.toLowerCase();
        // Handle 'sci-fi' vs 'science fiction' equivalence
        if (genreLower === 'sci-fi') {
          return itemGenreNames.includes('science fiction');
        }
        return itemGenreNames.includes(genreLower);
      });
    });
    setFilteredResults(filtered);
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const clearGenres = () => {
    setSelectedGenres([]);
  };

  const getRoute = (type: string) => {
    switch (type) {
      case 'movie':
        return 'movies';
      case 'tv':
        return 'tv-shows';
      case 'anime':
        return 'anime';
      default:
        return type;
    }
  };

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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'movie':
        return 'Movie';
      case 'tv':
        return 'TV Show';
      case 'anime':
        return 'Anime';
      case 'manga':
        return 'Manga';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-secondary pt-24 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-accent mb-8">Search</h1>
        
        {/* Search Input */}
        <div className="mb-6">
          <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden">
            <Search className="h-5 w-5 text-gray-400 ml-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, TV shows, anime, manga..."
              className="flex-1 bg-transparent px-4 py-4 text-accent placeholder-gray-400 outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* Genre Filters */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-400">Filter by Genre</h2>
            {selectedGenres.length > 0 && (
              <button
                onClick={clearGenres}
                className="text-xs text-primary hover:text-red-400 flex items-center space-x-1"
              >
                <X className="h-3 w-3" />
                <span>Clear all</span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {COMMON_GENRES.map(genre => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedGenres.includes(genre)
                    ? 'bg-primary text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
          {selectedGenres.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Showing results for: {selectedGenres.join(', ')}
            </p>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-400">Searching...</p>
          </div>
        ) : filteredResults.length > 0 ? (
          <>
            <p className="text-sm text-gray-400 mb-4">
              Found {filteredResults.length} results
              {selectedGenres.length > 0 && ` for selected genres`}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredResults.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={`/${getRoute(item.type)}/${item.id}`}
                className="group"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 mb-2">
                  <img
                    src={item.poster || '/placeholder.svg'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex items-center space-x-2 mb-1">
                  {getTypeIcon(item.type)}
                  <span className="text-xs text-gray-400">{getTypeLabel(item.type)}</span>
                </div>
                <h3 className="text-accent font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-xs">
                  {item.year} • {item.rating?.toFixed(1)} ⭐
                </p>
              </Link>
            ))}
          </div>
        </>
        ) : query ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No results found for &quot;{query}&quot;</p>
            <p className="text-gray-500 mt-2">Try searching for something else</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Start typing to search for content</p>
            <p className="text-gray-500 mt-2">Search across movies, TV shows, anime, and manga</p>
          </div>
        )}
      </div>
    </div>
  );
}
