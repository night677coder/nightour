import axios from 'axios';
import { Movie, TVShow } from '@/types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

if (!API_KEY) {
  console.warn('NEXT_PUBLIC_TMDB_API_KEY not found in environment variables');
}

const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'en-US',
  },
  timeout: 10000,
});

// Add retry logic
const retryRequest = async <T>(requestFn: () => Promise<T>, maxRetries = 3): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  throw new Error('Max retries exceeded');
};

export const tmdb = {
  // Movies
  getTrendingMovies: async (page = 1) => {
    return retryRequest(async () => {
      const response = await tmdbApi.get('/trending/movie/day', { params: { page } });
      return response.data;
    });
  },

  getPopularMovies: async (page = 1) => {
    return retryRequest(async () => {
      const response = await tmdbApi.get('/movie/popular', { params: { page } });
      return response.data;
    });
  },

  getTopRatedMovies: async (page = 1) => {
    return retryRequest(async () => {
      const response = await tmdbApi.get('/movie/top_rated', { params: { page } });
      return response.data;
    });
  },

  getMovieRecommendations: async (id: number) => {
    const response = await tmdbApi.get(`/movie/${id}/recommendations`);
    return response.data;
  },

  getMovieDetails: async (id: number) => {
    const response = await tmdbApi.get(`/movie/${id}`);
    return response.data;
  },
  getMovieVideos: async (id: number) => {
    const response = await tmdbApi.get(`/movie/${id}/videos`);
    return response.data;
  },

  getMovieByImdbId: async (imdbId: string): Promise<Movie | null> => {
    try {
      const findResponse = await tmdbApi.get(`/find/${imdbId}`, {
        params: { external_source: 'imdb_id' },
      });
      const movieResult = findResponse.data.movie_results?.[0];
      if (movieResult) {
        return tmdb.getMovieDetails(movieResult.id);
      }
      return null;
    } catch (error) {
      console.error('Error finding movie by IMDb ID:', error);
      return null;
    }
  },

  searchMovies: async (query: string, page = 1) => {
    const response = await tmdbApi.get('/search/movie', { params: { query, page } });
    return response.data;
  },

  // TV Shows
  getTrendingTVShows: async (page = 1) => {
    return retryRequest(async () => {
      const response = await tmdbApi.get('/trending/tv/day', { params: { page } });
      return response.data;
    });
  },

  getPopularTVShows: async (page = 1) => {
    const response = await tmdbApi.get('/tv/popular', { params: { page } });
    return response.data;
  },

  getTopRatedTVShows: async (page = 1) => {
    return retryRequest(async () => {
      const response = await tmdbApi.get('/tv/top_rated', { params: { page } });
      return response.data;
    });
  },

  getTVRecommendations: async (id: number) => {
    const response = await tmdbApi.get(`/tv/${id}/recommendations`);
    return response.data;
  },

  getTVEpisodes: async (id: number, season: number) => {
    const response = await tmdbApi.get(`/tv/${id}/season/${season}`);
    return response.data;
  },

  getTVShowDetails: async (id: number) => {
    const response = await tmdbApi.get(`/tv/${id}`);
    return response.data;
  },

  getTVExternalIds: async (id: number) => {
    const response = await tmdbApi.get(`/tv/${id}/external_ids`);
    return response.data;
  },
  getTVVideos: async (id: number) => {
    const response = await tmdbApi.get(`/tv/${id}/videos`);
    return response.data;
  },

  searchTVShows: async (query: string, page = 1) => {
    return retryRequest(async () => {
      const response = await tmdbApi.get('/search/tv', { params: { query, page } });
      return response.data;
    });
  },

  // Multi search (movies + TV)
  searchMulti: async (query: string, page = 1) => {
    const response = await tmdbApi.get('/search/multi', { params: { query, page } });
    return response.data;
  },

  // Get genres
  getMovieGenres: async () => {
    const response = await tmdbApi.get('/genre/movie/list');
    return response.data;
  },

  getTVGenres: async () => {
    const response = await tmdbApi.get('/genre/tv/list');
    return response.data;
  },
};
