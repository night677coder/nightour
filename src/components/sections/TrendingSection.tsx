'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Film, Tv, Star, BookOpen } from 'lucide-react';
import { ContentItem } from '@/types';
import { transformMovieToContentItem, transformTVShowToContentItem } from '@/lib/utils';
import { ContentCard } from '@/components/cards/ContentCard';

export function TrendingSection() {
  const [trendingMovies, setTrendingMovies] = useState<ContentItem[]>([]);
  const [trendingTV, setTrendingTV] = useState<ContentItem[]>([]);
  const [trendingAnime, setTrendingAnime] = useState<ContentItem[]>([]);
  const [trendingManga, setTrendingManga] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrendingContent = async () => {
      try {
        const response = await fetch('/api/trending');
        if (!response.ok) {
          throw new Error('Failed to fetch trending content');
        }
        
        const data = await response.json();

        setTrendingMovies(data.movies.slice(0, 6).map(transformMovieToContentItem));
        setTrendingTV(data.tv.slice(0, 6).map(transformTVShowToContentItem));
        setTrendingAnime(data.anime.slice(0, 6).map((anime: any) => ({
          id: anime.id,
          title: anime?.title?.english || anime?.title?.romaji || anime?.title?.native || 'Unknown',
          poster: anime?.coverImage?.large || anime?.coverImage?.extraLarge || '/placeholder.svg',
          backdrop: anime?.bannerImage || anime?.coverImage?.extraLarge || '',
          overview: anime?.description || '',
          type: 'anime' as const,
          rating: typeof anime?.averageScore === 'number' ? anime.averageScore / 10 : 0,
          year: anime?.seasonYear?.toString() || 'Unknown',
          genres: Array.isArray(anime?.genres) ? anime.genres : [],
        } as ContentItem)));
        setTrendingManga(data.manga.slice(0, 6).map((manga: any) => ({
          id: manga.id,
          title: manga?.title?.english || manga?.title?.romaji || manga?.title?.native || 'Unknown',
          poster: manga?.coverImage?.large || manga?.coverImage?.extraLarge || '/placeholder.svg',
          backdrop: manga?.bannerImage || manga?.coverImage?.extraLarge || '',
          overview: manga?.description || '',
          type: 'manga' as const,
          rating: typeof manga?.averageScore === 'number' ? manga.averageScore / 10 : 0,
          year: manga?.seasonYear?.toString() || 'Unknown',
          genres: Array.isArray(manga?.genres) ? manga.genres : [],
        } as ContentItem)));
        setError(null);
      } catch (error) {
        console.error('Error loading trending content:', error);
        setError('Failed to load trending content. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTrendingContent();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-12">
        {['Movies', 'TV Shows', 'Anime', 'Manga'].map((title) => (
          <div key={title} className="space-y-4">
            <div className="h-8 bg-gray-800 rounded animate-pulse w-32" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-gray-800 rounded animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-12">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">Unable to load trending content</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Trending Movies */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Film className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-accent">Trending Movies</h2>
          </div>
          <Link
            href="/movies"
            className="flex items-center space-x-1 text-primary hover:text-red-600 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {trendingMovies.map((item) => (
            <ContentCard key={`movie-${item.id}`} item={item} />
          ))}
        </div>
      </section>

      {/* Trending TV Shows */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Tv className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-accent">Trending TV Shows</h2>
          </div>
          <Link
            href="/tv-shows"
            className="flex items-center space-x-1 text-primary hover:text-red-600 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {trendingTV.map((item) => (
            <ContentCard key={`tv-${item.id}`} item={item} />
          ))}
        </div>
      </section>

      {/* Trending Anime */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-accent">Trending Anime</h2>
          </div>
          <Link
            href="/anime"
            className="flex items-center space-x-1 text-primary hover:text-red-600 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {trendingAnime.map((item) => (
            <ContentCard key={`anime-${item.id}`} item={item} />
          ))}
        </div>
      </section>

      {/* Trending Manga */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-accent">Trending Manga</h2>
          </div>
          <Link
            href="/manga"
            className="flex items-center space-x-1 text-primary hover:text-red-600 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {trendingManga.map((item) => (
            <ContentCard key={`manga-${item.id}`} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
