'use client';

import { useState, useEffect } from 'react';
import { ContentCard } from '@/components/cards/ContentCard';
import { tmdb } from '@/lib/api/tmdb';
import { transformMovieToContentItem } from '@/lib/utils';
import { ContentItem } from '@/types';

export default function MoviesPage() {
  const [movies, setMovies] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const response = await tmdb.getPopularMovies(page);
        setMovies(response.results.map(transformMovieToContentItem));
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error('Error loading movies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMovies();
  }, [page]);

  const loadMore = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-accent mb-8">Movies</h1>
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
      <h1 className="text-3xl font-bold text-accent mb-8">Movies</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <ContentCard key={movie.id} item={movie} />
        ))}
      </div>

      {page < totalPages && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            className="btn-primary"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
