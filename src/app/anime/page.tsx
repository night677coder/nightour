'use client';

import { useState, useEffect } from 'react';
import { ContentCard } from '@/components/cards/ContentCard';
import { anilist } from '@/lib/api/anilist';
import { ContentItem } from '@/types';

export default function AnimePage() {
  const [anime, setAnime] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const loadAnime = async () => {
      try {
        const response = await anilist.getPopularAnime(page, 20);
        const transformedAnime = (response?.Page?.media ?? []).map((media: any) => ({
          id: media.id,
          title: media?.title?.english || media?.title?.romaji || media?.title?.native || 'Unknown',
          poster: media?.coverImage?.large || media?.coverImage?.extraLarge || '/placeholder.jpg',
          backdrop: media?.bannerImage || media?.coverImage?.extraLarge || '',
          overview: media?.description || '',
          type: 'anime' as const,
          rating: typeof media?.averageScore === 'number' ? media.averageScore / 10 : 0,
          year: media?.seasonYear?.toString() || 'Unknown',
          genres: Array.isArray(media?.genres) ? media.genres : [],
        } as ContentItem));
        
        if (page === 1) {
          setAnime(transformedAnime);
        } else {
          setAnime(prev => [...prev, ...transformedAnime]);
        }
        
        setHasMore(Boolean(response?.Page?.pageInfo?.hasNextPage));
      } catch (error) {
        // Anime failed to load, remains empty
      } finally {
        setIsLoading(false);
      }
    };

    loadAnime();
  }, [page]);

  const loadMore = () => {
    if (hasMore) {
      setPage(page + 1);
    }
  };

  if (isLoading && page === 1) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-accent mb-8">Anime</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-gray-800 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-accent mb-8">Anime</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {anime.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
