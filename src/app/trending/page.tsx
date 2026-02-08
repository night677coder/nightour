'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, ArrowLeft, Film, Tv, Star } from 'lucide-react';
import Link from 'next/link';
import { ContentCard } from '@/components/cards/ContentCard';
import { ContentItem } from '@/types';
import { tmdb } from '@/lib/api/tmdb';
import { anilist } from '@/lib/api/anilist';
import { transformMovieToContentItem, transformTVShowToContentItem } from '@/lib/utils';

export default function TrendingPage() {
  const [trendingMovies, setTrendingMovies] = useState<ContentItem[]>([]);
  const [trendingTV, setTrendingTV] = useState<ContentItem[]>([]);
  const [trendingAnime, setTrendingAnime] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const [moviesResponse, tvResponse, animeResponse] = await Promise.all([
          tmdb.getTrendingMovies(1),
          tmdb.getTrendingTVShows(1),
          anilist.getTrendingAnime(1, 20),
        ]);

        setTrendingMovies(moviesResponse.results.slice(0, 12).map(transformMovieToContentItem));
        setTrendingTV(tvResponse.results.slice(0, 12).map(transformTVShowToContentItem));
        setTrendingAnime(((animeResponse as any)?.Page?.media ?? []).slice(0, 12).map((anime: any) => ({
          id: anime.id,
          title: anime?.title?.english || anime?.title?.romaji || anime?.title?.native || 'Unknown',
          poster: anime?.coverImage?.large || anime?.coverImage?.extraLarge || '/placeholder.jpg',
          backdrop: anime?.bannerImage || anime?.coverImage?.extraLarge || '',
          overview: anime?.description || '',
          type: 'anime' as const,
          rating: typeof anime?.averageScore === 'number' ? anime.averageScore / 10 : 0,
          year: anime?.seasonYear?.toString() || 'Unknown',
          genres: Array.isArray(anime?.genres) ? anime.genres : [],
        } as ContentItem)));
      } catch (error) {
        console.error('Error loading trending content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrending();
  }, []);

  return (
    <div className="min-h-screen bg-secondary text-accent pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link
            href="/"
            className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Trending Now</h1>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-12">
            {['Movies', 'TV Shows', 'Anime'].map((title) => (
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
        ) : (
          <div className="space-y-12">
            {/* Trending Movies */}
            <section>
              <div className="flex items-center space-x-2 mb-6">
                <Film className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold text-accent">Trending Movies</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {trendingMovies.map((item) => (
                  <ContentCard key={`movie-${item.id}`} item={item} />
                ))}
              </div>
            </section>

            {/* Trending TV Shows */}
            <section>
              <div className="flex items-center space-x-2 mb-6">
                <Tv className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold text-accent">Trending TV Shows</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {trendingTV.map((item) => (
                  <ContentCard key={`tv-${item.id}`} item={item} />
                ))}
              </div>
            </section>

            {/* Trending Anime */}
            <section>
              <div className="flex items-center space-x-2 mb-6">
                <Star className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold text-accent">Trending Anime</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {trendingAnime.map((item) => (
                  <ContentCard key={`anime-${item.id}`} item={item} />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
