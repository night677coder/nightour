import axios from 'axios';
import { Anime } from '@/types';

const JIKAN_BASE_URL = process.env.JIKAN_API_URL || 'https://api.jikan.moe/v4';

const jikanApi = axios.create({
  baseURL: JIKAN_BASE_URL,
  timeout: 10000, // 10 second timeout
});

export const jikan = {
  getTrendingAnime: async (page = 1) => {
    const response = await jikanApi.get('/top/anime', { 
      params: { 
        page,
        limit: 20,
        filter: 'airing'
      } 
    });
    return response.data;
  },

  getPopularAnime: async (page = 1) => {
    const response = await jikanApi.get('/top/anime', { 
      params: { 
        page,
        limit: 20,
        filter: 'bypopularity'
      } 
    });
    return response.data;
  },

  getTopRatedAnime: async (page = 1) => {
    const response = await jikanApi.get('/top/anime', { 
      params: { 
        page,
        limit: 20
      } 
    });
    return response.data;
  },

  getAnimeRecommendations: async (id: number) => {
    const response = await jikanApi.get(`/anime/${id}/recommendations`);
    return response.data;
  },

  getAnimeDetails: async (id: number) => {
    const response = await jikanApi.get(`/anime/${id}/full`);
    return response.data;
  },

  searchAnime: async (query: string, page = 1) => {
    const response = await jikanApi.get('/anime', { 
      params: { 
        q: query,
        page,
        limit: 20
      } 
    });
    return response.data;
  },

  getAnimeEpisodes: async (id: number, page = 1) => {
    const response = await jikanApi.get(`/anime/${id}/episodes`, { 
      params: { page } 
    });
    return response.data;
  },

  getAnimeGenres: async () => {
    const response = await jikanApi.get('/genres/anime');
    return response.data;
  },
};
