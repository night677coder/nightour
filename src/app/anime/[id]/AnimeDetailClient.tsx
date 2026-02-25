'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, ArrowLeft, Star, Calendar, Clock } from 'lucide-react';
import Image from 'next/image';
import { ContentCard } from '@/components/cards/ContentCard';
import { useWatchlistStore } from '@/lib/store/watchlist';
import { WatchlistItem } from '@/types';
import Link from 'next/link';

import { anilist } from '@/lib/api/anilist';

export default function AnimeDetailClient() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [anime, setAnime] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToWatchlist, isInWatchlist } = useWatchlistStore();

  useEffect(() => {
    const loadAnime = async () => {
      if (!id || isNaN(id) || id <= 0) {
        console.error('Invalid anime ID:', params.id);
        setIsLoading(false);
        return;
      }

      try {
        let animeData, recsData;
        try {
          animeData = await anilist.getAnimeDetails(id);
        } catch (detailError) {
          console.error('Error loading anime details:', detailError);
          const err = detailError as any;
          throw new Error(`Failed to load anime details: ${err?.message || 'Unknown error'}`);
        }

        try {
          recsData = await anilist.getAnimeRecommendations(id, 1, 12);
        } catch (recsError) {
          console.error('Error loading anime recommendations:', recsError);
          // Don't throw for recommendations, just log
          recsData = { Page: { media: [] } };
        }

        const media = (animeData as any)?.Media ?? null;
        setAnime(media);

        const transformedRecs = ((recsData as any)?.Page?.media ?? []).slice(0, 6);
        setRecommendations(transformedRecs);
      } catch (error) {
        const err = error as any;
        console.error('Error loading anime:', {
          error: err,
          message: err?.message,
          stack: err?.stack,
          animeId: id,
          timestamp: new Date().toISOString()
        });
      } finally {
        setIsLoading(false);
      }
    };
    if (id) loadAnime();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen text-accent flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen text-accent flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Anime not found</h1>
          <button onClick={() => router.back()} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const title = anime?.title?.english || anime?.title?.romaji || anime?.title?.native || 'Unknown';
  const year = anime?.seasonYear || 'N/A';
  const episodes = anime?.episodes || 'N/A';
  const rating = typeof anime?.averageScore === 'number' ? anime.averageScore / 10 : null;
  const synopsis = anime?.description || '';
  const imageUrl = anime?.coverImage?.extraLarge || anime?.coverImage?.large || '';
  const trailer = (anime?.trailer?.site === 'youtube' || anime?.trailer?.site === 'YouTube') ? anime?.trailer?.id : null;
  const genres = Array.isArray(anime?.genres) ? anime.genres : [];

  return (
    <div className="min-h-screen text-accent">
      <div className="relative h-80">
        {imageUrl && (
          <>
            <Image
              src={imageUrl}
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
              <Link 
                href={`/watch/anime/${anime.id}`}
                className="btn-primary flex items-center justify-center space-x-2 w-full"
              >
                <Play className="h-5 w-5" />
                <span>Watch Now</span>
              </Link>
            </div>
          </div>

          <div className="lg:w-2/3 relative z-10">
            <h1 className="text-4xl font-bold mb-2">{title}</h1>
            {anime.title_english && anime.title_english !== title && (
              <p className="text-xl text-gray-400 mb-4">{anime.title_english}</p>
            )}

            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{year}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{episodes} episodes</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{rating?.toFixed(1) || 'N/A'}</span>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Synopsis</h2>
              <p className="text-gray-300 leading-relaxed">{synopsis || 'No synopsis available.'}</p>
            </div>

            {genres.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre: any) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-gray-700 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {trailer && (
          <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-4">Watch Trailer</h3>
            <div className="aspect-video bg-black rounded-lg overflow-hidden max-w-5xl mx-auto">
              <iframe
                src={`https://www.youtube.com/embed/${trailer}?autoplay=0`}
                title="Trailer"
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
            <div className="mt-4 text-center">
              <button 
                onClick={() => {
                  if (anime) {
                    const watchlistItem: WatchlistItem = {
                      id: anime.id,
                      title,
                      poster: anime?.coverImage?.large || '',
                      type: 'anime',
                      added_at: new Date().toISOString(),
                    };
                    addToWatchlist(watchlistItem);
                    alert('Added to watchlist!');
                  }
                }}
                className="btn-secondary"
              >
                {isInWatchlist(anime?.id) ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
            </div>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recommendations.map((rec: any) => (
                <ContentCard key={rec.id} item={{
                  id: rec.id,
                  title: rec?.title?.english || rec?.title?.romaji || rec?.title?.native || 'Unknown',
                  poster: rec?.coverImage?.large || rec?.coverImage?.extraLarge || '/placeholder.jpg',
                  backdrop: rec?.bannerImage || '',
                  overview: rec?.description || '',
                  type: 'anime',
                  rating: typeof rec?.averageScore === 'number' ? rec.averageScore / 10 : 0,
                  year: rec?.seasonYear?.toString() || 'Unknown',
                  genres: []
                }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
