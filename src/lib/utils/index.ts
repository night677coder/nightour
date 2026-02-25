import { clsx, type ClassValue } from 'clsx';
import { Movie, TVShow, ContentItem } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatYear(dateString: string): string {
  const date = new Date(dateString);
  return date.getFullYear().toString();
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function getImageUrl(path: string, size: string = 'w500'): string {
  if (!path) return '/placeholder.jpg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function transformMovieToContentItem(movie: Movie): ContentItem {
  return {
    id: movie.id,
    title: movie.title,
    poster: getImageUrl(movie.poster_path),
    backdrop: getImageUrl(movie.backdrop_path, 'w1280'),
    overview: movie.overview,
    type: 'movie',
    rating: movie.vote_average,
    year: formatYear(movie.release_date),
  };
}

export function transformTVShowToContentItem(tv: TVShow): ContentItem {
  return {
    id: tv.id,
    title: tv.name,
    poster: getImageUrl(tv.poster_path),
    backdrop: getImageUrl(tv.backdrop_path, 'w1280'),
    overview: tv.overview,
    type: 'tv',
    rating: tv.vote_average,
    year: formatYear(tv.first_air_date),
  };
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
