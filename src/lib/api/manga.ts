import { anilist } from './anilist';
import { vidSrcIcu } from './2embed';

export const mangaApi = {
  // Get popular manga from AniList
  getPopularManga: anilist.getPopularManga,
  
  // Get trending manga from AniList
  getTrendingManga: anilist.getTrendingManga,
  
  // Search manga on AniList
  searchManga: anilist.searchManga,
  
  // Get manga details from AniList
  getMangaDetails: anilist.getMangaDetails,
  
  // Get manga recommendations
  getMangaRecommendations: anilist.getMangaRecommendations,
  
  // Get manga embed URL from VidSrcIcu
  getMangaEmbedUrl: vidSrcIcu.getMangaEmbedUrl,
};
