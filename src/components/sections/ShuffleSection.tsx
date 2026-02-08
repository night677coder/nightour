'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shuffle, Play, Film, Tv, Star, BookOpen } from 'lucide-react';
import { tmdb } from '@/lib/api/tmdb';
import { ContentItem } from '@/types';
import { anilist } from '@/lib/api/anilist';
import { transformMovieToContentItem, transformTVShowToContentItem } from '@/lib/utils';
import { ContentCard } from '@/components/cards/ContentCard';

export function ShuffleSection() {
  const [shuffledContent, setShuffledContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentType, setContentType] = useState<'all' | 'movies' | 'tv' | 'anime' | 'manga'>('all');

  const shuffleContent = async () => {
    setIsLoading(true);
    try {
      let allContent: ContentItem[] = [];

      if (contentType === 'all' || contentType === 'movies') {
        const moviesResponse = await tmdb.getTrendingMovies(1);
        const movies = moviesResponse.results.slice(0, 12).map(transformMovieToContentItem);
        allContent = [...allContent, ...movies];
      }

      if (contentType === 'all' || contentType === 'tv') {
        const tvResponse = await tmdb.getTrendingTVShows(1);
        const tvShows = tvResponse.results.slice(0, 12).map(transformTVShowToContentItem);
        allContent = [...allContent, ...tvShows];
      }

      if (contentType === 'all' || contentType === 'anime') {
        const animeResponse = await anilist.getTrendingAnime(1, 12);
        const anime = ((animeResponse as any)?.Page?.media ?? []).slice(0, 12).map((anime: any) => ({
          id: anime.id,
          title: anime?.title?.english || anime?.title?.romaji || anime?.title?.native || 'Unknown',
          poster: anime?.coverImage?.large || anime?.coverImage?.extraLarge || '/placeholder.jpg',
          backdrop: anime?.bannerImage || anime?.coverImage?.extraLarge || '',
          overview: anime?.description || '',
          type: 'anime' as const,
          rating: typeof anime?.averageScore === 'number' ? anime.averageScore / 10 : 0,
          year: anime?.seasonYear?.toString() || 'Unknown',
          genres: Array.isArray(anime?.genres) ? anime.genres : [],
        } as ContentItem));
        allContent = [...allContent, ...anime];
      }

      if (contentType === 'all' || contentType === 'manga') {
        const mangaResponse = await anilist.getTrendingManga(1, 12);
        const manga = ((mangaResponse as any)?.Page?.media ?? []).slice(0, 12).map((manga: any) => ({
          id: manga.id,
          title: manga?.title?.english || manga?.title?.romaji || manga?.title?.native || 'Unknown',
          poster: manga?.coverImage?.large || manga?.coverImage?.extraLarge || '/placeholder.jpg',
          backdrop: manga?.bannerImage || manga?.coverImage?.extraLarge || '',
          overview: manga?.description || '',
          type: 'manga' as const,
          rating: typeof manga?.averageScore === 'number' ? manga.averageScore / 10 : 0,
          year: manga?.seasonYear?.toString() || 'Unknown',
          genres: Array.isArray(manga?.genres) ? manga.genres : [],
        } as ContentItem));
        allContent = [...allContent, ...manga];
      }

      // Shuffle the array randomly
      const shuffled = allContent.sort(() => Math.random() - 0.5).slice(0, 12);
      setShuffledContent(shuffled);
      setError(null);
    } catch (error) {
      // Error already handled by setting error state
      setError('Failed to shuffle content. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    shuffleContent();
  }, [contentType]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'movie': return <Film className="h-4 w-4" />;
      case 'tv': return <Tv className="h-4 w-4" />;
      case 'anime': return <Star className="h-4 w-4" />;
      case 'manga': return <BookOpen className="h-4 w-4" />;
      default: return <Play className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'movie': return 'text-blue-400';
      case 'tv': return 'text-green-400';
      case 'anime': return 'text-red-400';
      case 'manga': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Shuffle className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-accent">Random Discover</h2>
        </div>
        <div className="flex items-center space-x-4">
          {/* Content Type Filter */}
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as any)}
            className="bg-gray-800 text-accent px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-primary"
          >
            <option value="all">All Content</option>
            <option value="movies">Movies Only</option>
            <option value="tv">TV Shows Only</option>
            <option value="anime">Anime Only</option>
            <option value="manga">Manga Only</option>
          </select>
          
          {/* Shuffle Button */}
          <button
            onClick={shuffleContent}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shuffle className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Shuffling...' : 'Shuffle'}</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-gray-800 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {shuffledContent.map((item) => (
            <div key={`${item.type}-${item.id}`} className="relative group">
              <ContentCard item={item} />
              {/* Type Badge */}
              <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)} bg-black/50 backdrop-blur-sm`}>
                <div className="flex items-center space-x-1">
                  {getTypeIcon(item.type)}
                  <span className="capitalize">{item.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && !isLoading && (
        <div className="text-center py-12">
          <Shuffle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Failed to load content. Please try again!</p>
          <button 
            onClick={shuffleContent}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {shuffledContent.length === 0 && !isLoading && !error && (
        <div className="text-center py-12">
          <Shuffle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No content found. Try shuffling again!</p>
        </div>
      )}
    </section>
  );
}
