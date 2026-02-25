'use client';

import { useEffect, useState } from 'react';
import { ContentCard } from '@/components/cards/ContentCard';
import { anilist } from '@/lib/api/anilist';
import { ContentItem } from '@/types';

export default function MangaPage() {
  const [manga, setManga] = useState<ContentItem[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const res = await anilist.getGenres();
        setGenres(Array.isArray(res?.GenreCollection) ? res.GenreCollection : []);
      } catch (error) {
        // Genres failed to load, remains empty
      }
    };

    loadGenres();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [selectedGenre]);

  useEffect(() => {
    const loadManga = async () => {
      try {
        const response = await anilist.getPopularManga(page, 20, selectedGenre ? [selectedGenre] : undefined);
        const transformed = (response?.Page?.media ?? []).map((media: any) => ({
          id: media.id,
          title: media?.title?.english || media?.title?.romaji || media?.title?.native || 'Unknown',
          poster: media?.coverImage?.large || media?.coverImage?.extraLarge || '/placeholder.jpg',
          backdrop: media?.bannerImage || media?.coverImage?.extraLarge || '',
          overview: media?.description || '',
          type: 'manga' as const,
          rating: typeof media?.averageScore === 'number' ? media.averageScore / 10 : 0,
          year: media?.seasonYear?.toString() || 'Unknown',
          genres: Array.isArray(media?.genres) ? media.genres : [],
        } as ContentItem));

        if (page === 1) {
          setManga(transformed);
        } else {
          setManga(prev => [...prev, ...transformed]);
        }

        setHasMore(Boolean(response?.Page?.pageInfo?.hasNextPage));
      } catch (error) {
        // Manga failed to load, remains empty
      } finally {
        setIsLoading(false);
      }
    };

    loadManga();
  }, [page, selectedGenre]);

  const loadMore = () => {
    if (hasMore) {
      setPage(page + 1);
    }
  };

  if (isLoading && page === 1) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-accent mb-8">Manga</h1>
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-accent">Manga</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-400">Category</label>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-gray-800 text-accent px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-primary"
          >
            <option value="">All</option>
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {manga.map((item) => (
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
