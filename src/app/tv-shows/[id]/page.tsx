'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tmdb } from '@/lib/api/tmdb';
import { Play, ArrowLeft, Star, Calendar, Clock, Tv } from 'lucide-react';
import Image from 'next/image';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { ContentCard } from '@/components/cards/ContentCard';
import { transformTVShowToContentItem } from '@/lib/utils';
import { useWatchlistStore } from '@/lib/store/watchlist';
import { WatchlistItem } from '@/types';
import Link from 'next/link';

export default function TVShowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [show, setShow] = useState<any>(null);
  const [trailer, setTrailer] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToWatchlist, isInWatchlist } = useWatchlistStore();

  useEffect(() => {
    const loadShow = async () => {
      try {
        const [showData, videosData, recsData] = await Promise.all([
          tmdb.getTVShowDetails(id),
          tmdb.getTVVideos(id),
          tmdb.getTVRecommendations(id),
        ]);
        setShow(showData);
        // Use recommendations if available, otherwise fallback to popular TV shows
        const recs = recsData.results?.slice(0, 6) || [];
        if (recs.length === 0) {
          // Fallback: get popular TV shows excluding current one
          const popularData = await tmdb.getPopularTVShows();
          const filtered = popularData.results?.filter((s: any) => s.id !== id).slice(0, 6) || [];
          setRecommendations(filtered);
        } else {
          setRecommendations(recs);
        }
        const trailerVideo = videosData.results?.find(
          (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
        );
        setTrailer(trailerVideo);
      } catch (error) {
        console.error('Error loading TV show:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) loadShow();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary text-accent flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-secondary text-accent flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">TV Show not found</h1>
          <button onClick={() => router.back()} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-accent">
      {/* Backdrop */}
      <div className="relative h-96">
        {show.backdrop_path && (
          <Image
            src={`https://image.tmdb.org/t/p/w1280${show.backdrop_path}`}
            alt={show.name}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-transparent to-secondary" />
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2 bg-gray-900 bg-opacity-75 rounded-full hover:bg-opacity-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Poster & Basic Info */}
          <div className="lg:w-1/3 flex-shrink-0">
            {show.poster_path && (
              <Image
                src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                alt={show.name}
                width={300}
                height={450}
                className="rounded-lg shadow-xl mb-6"
              />
            )}
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <Link 
                href={`/watch/tv/${show.id}`}
                className="btn-primary flex items-center justify-center space-x-2 w-full"
              >
                <Play className="h-5 w-5" />
                <span>Watch Now</span>
              </Link>
            </div>
          </div>

          {/* Right Side - Info */}
          <div className="lg:w-2/3">
            <h1 className="text-4xl font-bold mb-2">{show.name}</h1>
            {show.tagline && (
              <p className="text-xl text-gray-400 mb-4 italic">{show.tagline}</p>
            )}

            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(show.first_air_date).getFullYear()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{show.episode_run_time?.[0] || 'N/A'} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{show.vote_average?.toFixed(1)}</span>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Overview</h2>
              <p className="text-gray-300 leading-relaxed">{show.overview}</p>
            </div>

            {/* Genres */}
            {show.genres && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {show.genres.map((genre: any) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-gray-700 rounded-full text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trailer Section - Full Width Below */}
        {trailer && (
          <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-4">Watch Trailer</h3>
            <div className="aspect-video bg-black rounded-lg overflow-hidden max-w-5xl mx-auto">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=0`}
                title={trailer.name || 'Trailer'}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
            <div className="mt-4 text-center">
              <button 
                onClick={() => {
                  if (show) {
                    const watchlistItem: WatchlistItem = {
                      id: show.id,
                      title: show.name,
                      poster: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : '',
                      type: 'tv',
                      added_at: new Date().toISOString(),
                    };
                    addToWatchlist(watchlistItem);
                    alert('Added to watchlist!');
                  }
                }}
                className="btn-secondary"
              >
                {isInWatchlist(show?.id) ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
            </div>
          </div>
        )}

        {/* You May Also Like Section */}
        {recommendations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recommendations.map((rec: any) => (
                <ContentCard key={rec.id} item={transformTVShowToContentItem(rec)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
