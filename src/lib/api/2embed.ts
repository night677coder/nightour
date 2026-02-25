// 2Embed.cc API - Streaming server integration
// Documentation: https://www.2embed.cc/#api

const EMBED_BASE_URL = 'https://www.2embed.cc';
const VIDSRC_BASE_URL = 'https://vidsrc.cc';

export const twoEmbed = {
  // Movie embed by TMDB ID
  getMovieEmbedUrl: (tmdbId: number | string): string => {
    return `${EMBED_BASE_URL}/embed/${tmdbId}`;
  },

  // Movie embed by IMDb ID
  getMovieEmbedUrlByImdb: (imdbId: string): string => {
    return `${EMBED_BASE_URL}/embed/${imdbId}`;
  },

  // TV Show embed by TMDB ID
  getTVEmbedUrl: (tmdbId: number | string): string => {
    return `${EMBED_BASE_URL}/embedtvfull/${tmdbId}`;
  },

  // TV Show embed by IMDb ID + season/episode
  getTVEmbedUrlByImdb: (imdbId: string, season = 1, episode = 1): string => {
    return `${EMBED_BASE_URL}/embedtv/${imdbId}&s=${season}&e=${episode}`;
  },

  // Anime embed by slug
  getAnimeEmbedUrl: (slug: string): string => {
    return `${EMBED_BASE_URL}/embedanime/${slug}`;
  },

  // Anime embed by base slug + episode number
  getAnimeEpisodeEmbedUrl: (baseSlug: string, episode = 1): string => {
    return `${EMBED_BASE_URL}/embedanime/${baseSlug}-episode-${episode}`;
  },

  // Get appropriate embed URL based on content type
  getEmbedUrl: (
    type: 'movie' | 'tv' | 'anime' | 'manga',
    id: number | string,
    animeSlug?: string
  ): string => {
    switch (type) {
      case 'movie':
        return twoEmbed.getMovieEmbedUrl(id);
      case 'tv':
        return twoEmbed.getTVEmbedUrl(id);
      case 'anime':
        return animeSlug
          ? twoEmbed.getAnimeEmbedUrl(animeSlug)
          : `${EMBED_BASE_URL}/embedanime/${id}`;
      case 'manga':
        return ''; // Not supported
      default:
        return '';
    }
  },
};

// VidSrc.cc API - Server 2
// Documentation: https://vidsrc.cc/#api
export const vidSrc = {
  // Movie embed by TMDB ID (v2)
  getMovieEmbedUrl: (tmdbId: number | string): string => {
    return `${VIDSRC_BASE_URL}/v2/embed/movie/${tmdbId}`;
  },

  // Movie embed by IMDb ID (v2)
  getMovieEmbedUrlByImdb: (imdbId: string): string => {
    return `${VIDSRC_BASE_URL}/v2/embed/movie/${imdbId}`;
  },

  // TV Show embed by TMDB ID (v2) - full series
  getTVEmbedUrl: (tmdbId: number | string): string => {
    return `${VIDSRC_BASE_URL}/v2/embed/tv/${tmdbId}`;
  },

  // TV Show season embed by TMDB ID
  getTVSeasonEmbedUrl: (tmdbId: number | string, season: number): string => {
    return `${VIDSRC_BASE_URL}/v2/embed/tv/${tmdbId}/${season}`;
  },

  // TV Show episode embed by TMDB ID
  getTVEpisodeEmbedUrl: (tmdbId: number | string, season: number, episode: number): string => {
    return `${VIDSRC_BASE_URL}/v2/embed/tv/${tmdbId}/${season}/${episode}`;
  },

  // TV Show embed by IMDb ID + season/episode
  getTVEmbedUrlByImdb: (imdbId: string, season = 1, episode?: number): string => {
    if (episode) {
      return `${VIDSRC_BASE_URL}/v2/embed/tv/${imdbId}/${season}/${episode}`;
    }
    return `${VIDSRC_BASE_URL}/v2/embed/tv/${imdbId}/${season}`;
  },

  // Anime embed by ID + episode + type (sub/dub)
  getAnimeEmbedUrl: (id: string | number, episode = 1, type: 'sub' | 'dub' = 'sub'): string => {
    return `${VIDSRC_BASE_URL}/v2/embed/anime/${id}/${episode}/${type}`;
  },

  // Get appropriate embed URL based on content type
  getEmbedUrl: (
    type: 'movie' | 'tv' | 'anime' | 'manga',
    id: number | string,
    animeSlug?: string
  ): string => {
    switch (type) {
      case 'movie':
        return vidSrc.getMovieEmbedUrl(id);
      case 'tv':
        return vidSrc.getTVEmbedUrl(id);
      case 'anime':
        return vidSrc.getAnimeEmbedUrl(id, 1, 'sub');
      case 'manga':
        return ''; // Not supported
      default:
        return '';
    }
  },
};

// GoDrivePlayer API - Server 3
// Documentation: https://godriveplayer.com/#api
export const goDrivePlayer = {
  // Movie embed by IMDb ID only
  getMovieEmbedUrl: (imdbId: string): string => {
    return `https://godriveplayer.com/player.php?imdb=${encodeURIComponent(imdbId)}`;
  },

  // TV Show embed by TMDB ID with season and episode
  getTVEmbedUrl: (tmdbId: number | string, season = 1, episode = 1): string => {
    return `https://godriveplayer.com/player.php?type=series&tmdb=${encodeURIComponent(String(tmdbId))}&season=${encodeURIComponent(String(season))}&episode=${encodeURIComponent(String(episode))}`;
  },

  // Get appropriate embed URL based on content type
  getEmbedUrl: (
    type: 'movie' | 'tv' | 'anime' | 'manga',
    id: number | string,
    animeSlug?: string
  ): string => {
    switch (type) {
      case 'movie':
        // GoDrivePlayer only supports IMDb IDs for movies
        return ''; // Will be handled in watch page with IMDb ID check
      case 'tv':
        return goDrivePlayer.getTVEmbedUrl(id, 1, 1);
      case 'anime':
        return ''; // Not explicitly supported for anime
      case 'manga':
        return ''; // Not supported
      default:
        return '';
    }
  },
};

// VidSrcMe API - Server 4
// Documentation: https://vidsrcme.ru/api/
export const vidSrcMe = {
  // Movie embed by TMDB ID
  getMovieEmbedUrl: (tmdbId: number | string): string => {
    return `https://vidsrc-embed.ru/embed/movie/${tmdbId}`;
  },

  // Movie embed by IMDb ID
  getMovieEmbedUrlByImdb: (imdbId: string): string => {
    return `https://vidsrc-embed.ru/embed/movie/${imdbId}`;
  },

  // TV Show embed by TMDB ID (full series)
  getTVEmbedUrl: (tmdbId: number | string): string => {
    return `https://vidsrc-embed.ru/embed/tv/${tmdbId}`;
  },

  // TV Show episode embed by TMDB ID
  getTVEpisodeEmbedUrl: (tmdbId: number | string, season: number, episode: number): string => {
    return `https://vidsrc-embed.ru/embed/tv/${tmdbId}/${season}-${episode}`;
  },

  // TV Show embed by IMDb ID
  getTVEmbedUrlByImdb: (imdbId: string): string => {
    return `https://vidsrc-embed.ru/embed/tv/${imdbId}`;
  },

  // TV Show episode embed by IMDb ID
  getTVEpisodeEmbedUrlByImdb: (imdbId: string, season: number, episode: number): string => {
    return `https://vidsrc-embed.ru/embed/tv?imdb=${imdbId}&season=${season}&episode=${episode}`;
  },

  // Get appropriate embed URL based on content type
  getEmbedUrl: (
    type: 'movie' | 'tv' | 'anime' | 'manga',
    id: number | string,
    animeSlug?: string
  ): string => {
    switch (type) {
      case 'movie':
        return vidSrcMe.getMovieEmbedUrl(id);
      case 'tv':
        return vidSrcMe.getTVEmbedUrl(id);
      case 'anime':
        return ''; // Not explicitly supported for anime
      case 'manga':
        return ''; // Not supported
      default:
        return '';
    }
  },
};

// VidSrcIcu API - Server 6
// Documentation: https://vidsrc.icu/#api
export const vidSrcIcu = {
  // Movie embed by TMDB or IMDb ID
  getMovieEmbedUrl: (id: number | string): string => {
    return `https://vidsrc.icu/embed/movie/${id}`;
  },

  // TV Show embed by TMDB or IMDb ID
  getTVEmbedUrl: (id: number | string, season?: number, episode?: number): string => {
    if (season && episode) {
      return `https://vidsrc.icu/embed/tv/${id}/${season}/${episode}`;
    }
    return `https://vidsrc.icu/embed/tv/${id}`;
  },

  // Anime embed by AniList ID
  getAnimeEmbedUrl: (anilistId: number | string, episode = 1, dub = false): string => {
    return `https://vidsrc.icu/embed/anime/${anilistId}/${episode}/${dub ? 1 : 0}`;
  },

  // Manga embed by ID and chapter
  getMangaEmbedUrl: (mangaId: number | string, chapter = 1): string => {
    return `https://vidsrc.icu/embed/manga/${mangaId}/${chapter}`;
  },

  // Get appropriate embed URL based on content type
  getEmbedUrl: (
    type: 'movie' | 'tv' | 'anime' | 'manga',
    id: number | string,
    animeSlug?: string
  ): string => {
    switch (type) {
      case 'movie':
        return vidSrcIcu.getMovieEmbedUrl(id);
      case 'tv':
        return vidSrcIcu.getTVEmbedUrl(id);
      case 'anime':
        return ''; // Requires AniList ID, handled separately in watch page
      case 'manga':
        return vidSrcIcu.getMangaEmbedUrl(id, 1);
      default:
        return '';
    }
  },
};

// VidSrcOnline API - Server 7
// Documentation: https://vidsrc.online/#api
export const vidSrcOnline = {
  // Movie embed by TMDB or IMDb ID
  getMovieEmbedUrl: (id: number | string): string => {
    return `https://vidsrc.online/embed/movie/${id}`;
  },

  // TV Show embed by TMDB or IMDb ID
  getTVEmbedUrl: (id: number | string, season?: number, episode?: number): string => {
    if (season && episode) {
      return `https://vidsrc.online/embed/tv/${id}/${season}/${episode}`;
    }
    return `https://vidsrc.online/embed/tv/${id}`;
  },

  // Anime embed by AniList ID
  getAnimeEmbedUrl: (anilistId: number | string, episode = 1, dub = false): string => {
    return `https://vidsrc.online/embed/anime/${anilistId}/${episode}/${dub ? 1 : 0}`;
  },

  // Manga embed by ID and chapter
  getMangaEmbedUrl: (mangaId: number | string, chapter = 1): string => {
    return `https://vidsrc.online/embed/manga/${mangaId}/${chapter}`;
  },

  // Get appropriate embed URL based on content type
  getEmbedUrl: (
    type: 'movie' | 'tv' | 'anime' | 'manga',
    id: number | string,
    animeSlug?: string
  ): string => {
    switch (type) {
      case 'movie':
        return vidSrcOnline.getMovieEmbedUrl(id);
      case 'tv':
        return vidSrcOnline.getTVEmbedUrl(id);
      case 'anime':
        return ''; // Requires AniList ID, handled separately in watch page
      case 'manga':
        return vidSrcOnline.getMangaEmbedUrl(id, 1);
      default:
        return '';
    }
  },
};

// VidLink.pro API - Server 7
export const vidLink = {
  // Movie embed by TMDB ID
  getMovieEmbedUrl: (id: number | string): string => {
    return `https://vidlink.pro/movie/${id}`;
  },

  // TV Show embed by TMDB ID
  getTVEmbedUrl: (id: number | string, season?: number, episode?: number): string => {
    if (season && episode) {
      return `https://vidlink.pro/tv/${id}/${season}/${episode}`;
    }
    return `https://vidlink.pro/tv/${id}`;
  },

  // Get appropriate embed URL based on content type
  getEmbedUrl: (
    type: 'movie' | 'tv' | 'anime' | 'manga',
    id: number | string,
    animeSlug?: string
  ): string => {
    switch (type) {
      case 'movie':
        return vidLink.getMovieEmbedUrl(id);
      case 'tv':
        return vidLink.getTVEmbedUrl(id);
      case 'anime':
        return ''; // VidLink.pro doesn't support anime directly
      case 'manga':
        return ''; // VidLink.pro doesn't support manga
      default:
        return '';
    }
  },
};

// PlayerAutoEmbed.cc API - Server 8
// Documentation: https://player.autoembed.cc/
export const playerAutoEmbed = {
  // Movie embed by TMDB ID
  getMovieEmbedUrl: (tmdbId: number | string): string => {
    return `https://player.autoembed.cc/embed/movie/${tmdbId}`;
  },

  // TV Show embed by TMDB ID + season/episode
  getTVEmbedUrl: (tmdbId: number | string, season = 1, episode = 1): string => {
    return `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`;
  },

  // Get appropriate embed URL based on content type
  getEmbedUrl: (
    type: 'movie' | 'tv' | 'anime' | 'manga',
    id: number | string,
    animeSlug?: string
  ): string => {
    switch (type) {
      case 'movie':
        return playerAutoEmbed.getMovieEmbedUrl(id);
      case 'tv':
        return playerAutoEmbed.getTVEmbedUrl(id, 1, 1); // Default season/episode, handled in watch page
      case 'anime':
        return ''; // Not supported
      case 'manga':
        return ''; // Not supported
      default:
        return '';
    }
  },
};

// IndraEmbed.netlify.app API - Server 9
// Documentation: https://indraembed.netlify.app/
export const indraEmbed = {
  // Movie embed by TMDB ID (supports movies and anime movies)
  getMovieEmbedUrl: (tmdbId: number | string): string => {
    return `https://indraembed.netlify.app/movie/${tmdbId}`;
  },

  // TV Show embed by TMDB ID + season/episode (supports TV shows and anime series)
  getTVEmbedUrl: (tmdbId: number | string, season = 1, episode = 1): string => {
    return `https://indraembed.netlify.app/tv/${tmdbId}/${season}/${episode}`;
  },

  // Get appropriate embed URL based on content type
  getEmbedUrl: (
    type: 'movie' | 'tv' | 'anime' | 'manga',
    id: number | string,
    animeSlug?: string
  ): string => {
    switch (type) {
      case 'movie':
        return indraEmbed.getMovieEmbedUrl(id);
      case 'tv':
        return indraEmbed.getTVEmbedUrl(id, 1, 1); // Default season/episode, handled in watch page
      case 'anime':
        return ''; // Not supported directly, but anime movies can use movie embed
      case 'manga':
        return ''; // Not supported
      default:
        return '';
    }
  },
};

// IEmbed.codeera.dev API - Server 10
// Documentation: https://iembed.codeera.dev/
export const iEmbed = {
  // Movie embed by TMDB ID
  getMovieEmbedUrl: (tmdbId: number | string): string => {
    return `https://iembed.codeera.dev/embed/movie/${tmdbId}`;
  },

  // TV Show embed by TMDB ID + season/episode
  getTVEmbedUrl: (tmdbId: number | string, season = 1, episode = 1): string => {
    return `https://iembed.codeera.dev/embed/tv/${tmdbId}/${season}/${episode}`;
  },

  // Get appropriate embed URL based on content type
  getEmbedUrl: (
    type: 'movie' | 'tv' | 'anime' | 'manga',
    id: number | string,
    animeSlug?: string
  ): string => {
    switch (type) {
      case 'movie':
        return iEmbed.getMovieEmbedUrl(id);
      case 'tv':
        return iEmbed.getTVEmbedUrl(id, 1, 1); // Default season/episode, handled in watch page
      case 'anime':
        return ''; // Not supported
      case 'manga':
        return ''; // Not supported
      default:
        return '';
    }
  },
};

// EmbedMaster.link API - Server 11
// Documentation: https://embedmaster.link/
export const embedmaster = {
  // Movie embed by TMDB ID
  getMovieEmbedUrl: (tmdbId: number | string): string => {
    return `https://embedmaster.link/movie/${tmdbId}`;
  },

  // TV Show embed by TMDB ID + season/episode
  getTVEmbedUrl: (tmdbId: number | string, season = 1, episode = 1): string => {
    return `https://embedmaster.link/tv/${tmdbId}/${season}/${episode}`;
  },

  // Get appropriate embed URL based on content type
  getEmbedUrl: (
    type: 'movie' | 'tv' | 'anime' | 'manga',
    id: number | string,
    animeSlug?: string
  ): string => {
    switch (type) {
      case 'movie':
        return embedmaster.getMovieEmbedUrl(id);
      case 'tv':
        return embedmaster.getTVEmbedUrl(id, 1, 1); // Default season/episode, handled in watch page
      case 'anime':
        return ''; // Not supported
      case 'manga':
        return ''; // Not supported
      default:
        return '';
    }
  },
};

export interface ServerConfig {
  id: string;
  name: string;
  getUrl: (type: 'movie' | 'tv' | 'anime' | 'manga', id: number | string, animeSlug?: string) => string;
}

export const streamingServers: ServerConfig[] = [
  {
    id: 'trailer',
    name: 'Server',
    getUrl: (type, id, animeSlug) => '', // Handled in watch page
  },
  {
    id: '2embed',
    name: 'Server 1',
    getUrl: twoEmbed.getEmbedUrl,
  },
  {
    id: 'vidsrc',
    name: 'Server 2',
    getUrl: vidSrc.getEmbedUrl,
  },
  {
    id: 'godrive',
    name: 'Server 3',
    getUrl: goDrivePlayer.getEmbedUrl,
  },
  {
    id: 'vidsrcme',
    name: 'Server 4',
    getUrl: vidSrcMe.getEmbedUrl,
  },
  {
    id: 'vidsrcicu',
    name: 'Server 5',
    getUrl: vidSrcIcu.getEmbedUrl,
  },
  {
    id: 'vidsrconline',
    name: 'Server 6',
    getUrl: vidSrcOnline.getEmbedUrl,
  },
  {
    id: 'vidlink',
    name: 'Server 7',
    getUrl: vidLink.getEmbedUrl,
  },
  {
    id: 'playerautoembed',
    name: 'Server 8',
    getUrl: playerAutoEmbed.getEmbedUrl,
  },
  {
    id: 'indraembed',
    name: 'Server 9',
    getUrl: indraEmbed.getEmbedUrl,
  },
  {
    id: 'iembed',
    name: 'Server 10',
    getUrl: iEmbed.getEmbedUrl,
  },
  {
    id: 'embedmaster',
    name: 'Server 11',
    getUrl: embedmaster.getEmbedUrl,
  },
];
