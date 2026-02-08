'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tmdb } from '@/lib/api/tmdb';
import { Play, ArrowLeft, Star, Calendar, Clock } from 'lucide-react';
import Image from 'next/image';
import { ContentCard } from '@/components/cards/ContentCard';
import { transformMovieToContentItem } from '@/lib/utils';
import { useWatchlistStore } from '@/lib/store/watchlist';
import { WatchlistItem } from '@/types';
import Link from 'next/link';

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [movie, setMovie] = useState<any>(null);
  const [trailer, setTrailer] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToWatchlist, isInWatchlist } = useWatchlistStore();

  useEffect(() => {
    const loadMovie = async () => {
      try {
        const [movieData, videosData, recsData] = await Promise.all([
          tmdb.getMovieDetails(id),
          tmdb.getMovieVideos(id),
          tmdb.getMovieRecommendations(id),
        ]);
        setMovie(movieData);
        const recs = recsData.results?.slice(0, 6) || [];
        if (recs.length === 0) {
          const popularData = await tmdb.getPopularMovies();
          const filtered = popularData.results?.filter((m: any) => m.id !== id).slice(0, 6) || [];
          setRecommendations(filtered);
        } else {
          setRecommendations(recs);
        }
        const trailerVideo = videosData.results?.find(
          (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
        );
        setTrailer(trailerVideo);
      } catch (error) {
        console.error('Error loading movie:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) loadMovie();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary text-accent flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-secondary text-accent flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Movie not found</h1>
          <button onClick={() => router.back()} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-accent">
      <div className="relative h-96">
        {movie.backdrop_path && (
          <Image
            src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}
            alt={movie.title}
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
          <div className="lg:w-1/3 flex-shrink-0">
            {movie.poster_path && (
              <Image
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                width={300}
                height={450}
                className="rounded-lg shadow-xl mb-6"
              />
            )}
            <div className="space-y-3">
              <Link 
                href={`/watch/movie/${movie.id}`}
                className="btn-primary flex items-center justify-center space-x-2 w-full"
              >
                <Play className="h-5 w-5" />
                <span>Watch Now</span>
              </Link>
            </div>
          </div>

          <div className="lg:w-2/3">
            <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
            {movie.tagline && (
              <p className="text-xl text-gray-400 mb-4 italic">{movie.tagline}</p>
            )}

            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(movie.release_date).getFullYear()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{movie.runtime} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{movie.vote_average?.toFixed(1)}</span>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Overview</h2>
              <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
            </div>

            {movie.genres && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre: any) => (
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
                  if (movie) {
                    const watchlistItem: WatchlistItem = {
                      id: movie.id,
                      title: movie.title,
                      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '',
                      type: 'movie',
                      added_at: new Date().toISOString(),
                    };
                    addToWatchlist(watchlistItem);
                    alert('Added to watchlist!');
                  }
                }}
                className="btn-secondary"
              >
                {isInWatchlist(movie?.id) ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
            </div>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recommendations.map((rec: any) => (
                <ContentCard key={rec.id} item={transformMovieToContentItem(rec)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
