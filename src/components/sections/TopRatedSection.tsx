'use client';

import { useState, useEffect } from 'react';
import { ContentItem } from '@/types';
import { transformMovieToContentItem, transformTVShowToContentItem } from '@/lib/utils';
import { ContentCard } from '@/components/cards/ContentCard';

export function TopRatedSection() {
  const [allItems, setAllItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTopRatedContent = async () => {
      try {
        const response = await fetch('/api/top-rated');
        if (!response.ok) {
          throw new Error('Failed to fetch top-rated content');
        }
        
        const data = await response.json();

        const combinedItems = [
          ...data.movies.map(transformMovieToContentItem),
          ...data.tv.map(transformTVShowToContentItem),
          ...data.anime.map((anime: any) => ({
            id: anime.id,
            title: anime?.title?.english || anime?.title?.romaji || anime?.title?.native || 'Unknown',
            poster: anime?.coverImage?.large || anime?.coverImage?.extraLarge || '/placeholder.svg',
            backdrop: anime?.bannerImage || anime?.coverImage?.extraLarge || '',
            overview: anime?.description || '',
            type: 'anime' as const,
            rating: typeof anime?.averageScore === 'number' ? anime.averageScore / 10 : 0,
            year: anime?.seasonYear?.toString() || 'Unknown',
            genres: Array.isArray(anime?.genres) ? anime.genres : [],
          } as ContentItem)),
          ...data.manga.map((manga: any) => ({
            id: manga.id,
            title: manga?.title?.english || manga?.title?.romaji || manga?.title?.native || 'Unknown',
            poster: manga?.coverImage?.large || manga?.coverImage?.extraLarge || '/placeholder.svg',
            backdrop: manga?.bannerImage || manga?.coverImage?.extraLarge || '',
            overview: manga?.description || '',
            type: 'manga' as const,
            rating: typeof manga?.averageScore === 'number' ? manga.averageScore / 10 : 0,
            year: manga?.seasonYear?.toString() || 'Unknown',
            genres: Array.isArray(manga?.genres) ? manga.genres : [],
          } as ContentItem)),
        ].sort((a, b) => b.rating - a.rating);

        setAllItems(combinedItems);
        setError(null);
      } catch (error) {
        console.error('Error loading top-rated content:', error);
        setError('Failed to load top-rated content. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTopRatedContent();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-gray-800 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-12">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">Unable to load top-rated content</div>
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {allItems.map((item) => (
        <ContentCard key={`${item.type}-${item.id}`} item={item} />
      ))}
    </div>
  );
}
