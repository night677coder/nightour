'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { tmdb } from '@/lib/api/tmdb';
import { ContentItem } from '@/types';
import { anilist } from '@/lib/api/anilist';
import { transformMovieToContentItem, transformTVShowToContentItem } from '@/lib/utils';

export function HeroSection() {
  const router = useRouter();
  const [featuredContent, setFeaturedContent] = useState<ContentItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeaturedContent = async () => {
      try {
        const [moviesResponse, tvResponse, animeResponse] = await Promise.all([
          tmdb.getTrendingMovies(1).catch(err => {
            console.error('TMDB Movies API error:', err);
            return { results: [] };
          }),
          tmdb.getTrendingTVShows(1).catch(err => {
            console.error('TMDB TV API error:', err);
            return { results: [] };
          }),
          anilist.getTrendingAnime(1, 20).catch(err => {
            console.error('Anilist API error:', err);
            return { Page: { media: [] } };
          }),
        ]);

        const anime = (animeResponse as any)?.Page?.media?.[0];

        const featured = [
          moviesResponse.results?.[0] ? transformMovieToContentItem(moviesResponse.results[0]) : null,
          tvResponse.results?.[0] ? transformTVShowToContentItem(tvResponse.results[0]) : null,
          anime
            ? {
                id: anime.id,
                title: anime?.title?.english || anime?.title?.romaji || anime?.title?.native || 'Unknown',
                poster: anime?.coverImage?.large || anime?.coverImage?.extraLarge || '/placeholder.svg',
                backdrop: anime?.bannerImage || anime?.coverImage?.extraLarge || '',
                overview: anime?.description || '',
                type: 'anime',
                rating: typeof anime?.averageScore === 'number' ? anime.averageScore / 10 : 0,
                year: anime?.seasonYear?.toString() || 'Unknown',
                genres: Array.isArray(anime?.genres) ? anime.genres : [],
              }
            : null,
        ].filter((item): item is ContentItem => Boolean(item));

        setFeaturedContent(featured);
        setError(null);
      } catch (err) {
        console.error('Error loading featured content:', err);
        setError('Failed to load featured content. Please try again later.');
        // Set fallback content
        setFeaturedContent([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedContent();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredContent.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredContent.length) % featuredContent.length);
  };

  if (isLoading) {
    return (
      <div className="relative h-96 bg-gray-800 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative h-96 bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">Unable to load featured content</div>
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

  if (featuredContent.length === 0 && !isLoading) {
    return (
      <div className="relative h-96 bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">No featured content available</div>
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

  const current = featuredContent[currentIndex];

  const getRoute = (item: ContentItem) => {
    switch (item.type) {
      case 'movie': return 'movies';
      case 'tv': return 'tv-shows';
      case 'anime': return 'anime';
      default: return item.type;
    }
  };

  const handlePlayNow = () => {
    router.push(`/watch/${current.type}/${current.id}`);
  };

  const handleMoreInfo = () => {
    router.push(`/${getRoute(current)}/${current.id}`);
  };

  return (
    <div className="relative h-96 md:h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={current.backdrop}
          alt={current.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl animate-slide-up">
          <div className="flex items-center space-x-2 mb-4">
            <span className="px-3 py-1 bg-primary text-white text-sm font-medium rounded">
              {current.type === 'movie' ? 'Movie' : current.type === 'tv' ? 'TV Show' : 'Anime'}
            </span>
            <span className="text-gray-300 text-sm">
              {current.year} • ⭐ {current.rating?.toFixed(1)}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {current.title}
          </h1>
          
          <p className="text-lg text-gray-200 mb-8 line-clamp-3">
            {current.overview}
          </p>
          
          <div className="flex space-x-4">
            <button onClick={handlePlayNow} className="btn-primary flex items-center space-x-2">
              <Play className="h-5 w-5" />
              <span>Play Now</span>
            </button>
            <button onClick={handleMoreInfo} className="btn-secondary flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>More Info</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {featuredContent.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
          
          {/* Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
            {featuredContent.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-primary' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
