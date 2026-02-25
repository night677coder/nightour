'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Calendar, Star } from 'lucide-react';
import { anilist } from '@/lib/api/anilist';
import { vidSrcIcu } from '@/lib/api/2embed';
import { ContentCard } from '@/components/cards/ContentCard';
import { useWatchlistStore } from '@/lib/store/watchlist';
import { WatchlistItem } from '@/types';

export default function MangaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [manga, setManga] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chapter, setChapter] = useState(1);

  const { addToWatchlist, isInWatchlist } = useWatchlistStore();

  useEffect(() => {
    const loadManga = async () => {
      try {
        const [mangaData, recsData] = await Promise.all([
          anilist.getMangaDetails(id),
          anilist.getMangaRecommendations(id, 1, 6),
        ]);

        const media = (mangaData as any)?.Media ?? null;
        setManga(media);

        setRecommendations((recsData as any)?.Page?.media ?? []);
      } catch (error) {
        console.error('Error loading manga:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) loadManga();
  }, [id]);

  const readerSrc = useMemo(() => {
    if (!id) return '';
    return vidSrcIcu.getMangaEmbedUrl(id, chapter);
  }, [id, chapter]);

  if (isLoading) {
    return (
      <div className="min-h-screen text-accent flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="min-h-screen text-accent flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Manga not found</h1>
          <button onClick={() => router.back()} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const title = manga?.title?.english || manga?.title?.romaji || manga?.title?.native || 'Unknown';
  const year = manga?.seasonYear?.toString() || 'Unknown';
  const rating = typeof manga?.averageScore === 'number' ? manga.averageScore / 10 : 0;
  const description = manga?.description || '';
  const imageUrl = manga?.coverImage?.extraLarge || manga?.coverImage?.large || '';
  const backdropUrl = manga?.bannerImage || imageUrl;
  const chapters = typeof manga?.chapters === 'number' ? manga.chapters : null;
  const volumes = typeof manga?.volumes === 'number' ? manga.volumes : null;
  const genres = Array.isArray(manga?.genres) ? manga.genres : [];

  return (
    <div className="min-h-screen text-accent">
      <div className="relative h-80">
        {backdropUrl && (
          <>
            <Image
              src={backdropUrl}
              alt={title}
              fill
              className="object-cover opacity-30 blur-sm"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/80 to-transparent" />
          </>
        )}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2 bg-gray-900 bg-opacity-75 rounded-full hover:bg-opacity-100 transition-colors z-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-20">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/3 flex-shrink-0">
            <div className="relative z-10">
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={title}
                  width={300}
                  height={450}
                  className="rounded-lg shadow-xl mb-6"
                />
              )}
            </div>

            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg p-3">
                <BookOpen className="h-4 w-4 text-primary" />
                <label className="text-sm text-gray-300">Chapter</label>
                <input
                  type="number"
                  min={1}
                  value={chapter}
                  onChange={(e) => setChapter(Math.max(1, Number(e.target.value) || 1))}
                  className="ml-auto w-24 bg-gray-800 text-accent px-3 py-2 rounded border border-gray-700 focus:outline-none focus:border-primary"
                />
              </div>

              <Link
                href={`/watch/manga/${manga.id}`}
                className="btn-secondary flex items-center justify-center space-x-2 w-full"
              >
                <span>Open Reader</span>
              </Link>

              <button
                onClick={() => {
                  const watchlistItem: WatchlistItem = {
                    id: manga.id,
                    title,
                    poster: manga?.coverImage?.large || manga?.coverImage?.extraLarge || '',
                    type: 'manga',
                    added_at: new Date().toISOString(),
                  };
                  addToWatchlist(watchlistItem);
                }}
                className="btn-primary w-full"
              >
                {isInWatchlist(manga?.id) ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
            </div>
          </div>

          <div className="lg:w-2/3 relative z-10">
            <h1 className="text-4xl font-bold mb-2">{title}</h1>

            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{year}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{rating?.toFixed(1) || 'N/A'}</span>
              </div>
              {chapters !== null && (
                <div className="text-gray-300">{chapters} chapters</div>
              )}
              {volumes !== null && (
                <div className="text-gray-300">{volumes} volumes</div>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Description</h2>
              <p className="text-gray-300 leading-relaxed">{description || 'No description available.'}</p>
            </div>

            {genres.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre: any) => (
                    <span key={genre} className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {readerSrc && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Reader</h2>
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <iframe
                key={readerSrc}
                src={readerSrc}
                title={title}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recommendations.slice(0, 6).map((rec: any) => (
                <ContentCard
                  key={rec.id}
                  item={{
                    id: Number(rec.id),
                    title: String(rec?.title?.english || rec?.title?.romaji || rec?.title?.native || ''),
                    poster: rec?.coverImage?.large || rec?.coverImage?.extraLarge || '/placeholder.jpg',
                    backdrop: rec?.bannerImage || rec?.coverImage?.extraLarge || '',
                    overview: rec?.description || '',
                    type: 'manga',
                    rating: typeof rec?.averageScore === 'number' ? rec.averageScore / 10 : 0,
                    year: rec?.seasonYear?.toString() || 'Unknown',
                    genres: Array.isArray(rec?.genres) ? rec.genres : [],
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
