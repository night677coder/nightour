type AniListImage = {
  extraLarge?: string;
  large?: string;
  medium?: string;
};

type AniListTitle = {
  romaji?: string;
  english?: string;
  native?: string;
};

export type AniListMedia = {
  id: number;
  title: AniListTitle;
  description?: string;
  coverImage?: AniListImage;
  bannerImage?: string;
  episodes?: number;
  chapters?: number;
  volumes?: number;
  averageScore?: number;
  seasonYear?: number;
  genres?: string[];
  streamingEpisodes?: Array<{
    title?: string;
    thumbnail?: string;
    url?: string;
    site?: string;
  }>;
  trailer?: {
    site?: string;
    id?: string;
  } | null;
};

type AniListPage<T> = {
  Page: {
    pageInfo: {
      currentPage: number;
      hasNextPage: boolean;
      perPage: number;
      total: number;
    };
    media: T[];
  };
};

const ANILIST_API_URL = 'https://graphql.anilist.co';

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

async function anilistRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const requestFn = async () => {
    const res = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      throw new Error(`AniList request failed: ${res.status} ${res.statusText}`);
    }

    const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> };

    if (json.errors?.length) {
      throw new Error(json.errors.map(e => e.message).join('\n'));
    }

    if (!json.data) {
      throw new Error('AniList response missing data');
    }

    return json.data;
  };

  return retryRequest(requestFn);
}

export const anilist = {
  getGenres: async (): Promise<{ GenreCollection: string[] }> => {
    const query = `
      query {
        GenreCollection
      }
    `;

    return anilistRequest<{ GenreCollection: string[] }>(query);
  },

  getPopularAnime: async (page = 1, perPage = 20): Promise<AniListPage<AniListMedia>> => {
    const query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo { currentPage hasNextPage perPage total }
          media(type: ANIME, sort: POPULARITY_DESC) {
            id
            title { romaji english native }
            coverImage { extraLarge large medium }
            bannerImage
            description(asHtml: false)
            episodes
            averageScore
            seasonYear
            genres
            trailer { site id }
          }
        }
      }
    `;

    return anilistRequest<AniListPage<AniListMedia>>(query, { page, perPage });
  },

  getTrendingAnime: async (page = 1, perPage = 20): Promise<AniListPage<AniListMedia>> => {
    const query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo { currentPage hasNextPage perPage total }
          media(type: ANIME, sort: TRENDING_DESC) {
            id
            title { romaji english native }
            coverImage { extraLarge large medium }
            bannerImage
            description(asHtml: false)
            episodes
            averageScore
            seasonYear
            genres
            trailer { site id }
          }
        }
      }
    `;

    return anilistRequest<AniListPage<AniListMedia>>(query, { page, perPage });
  },

  getTopRatedAnime: async (page = 1, perPage = 20): Promise<AniListPage<AniListMedia>> => {
    const query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo { currentPage hasNextPage perPage total }
          media(type: ANIME, sort: AVERAGE_SCORE_DESC) {
            id
            title { romaji english native }
            coverImage { extraLarge large medium }
            bannerImage
            description(asHtml: false)
            episodes
            averageScore
            seasonYear
            genres
            trailer { site id }
          }
        }
      }
    `;

    return anilistRequest<AniListPage<AniListMedia>>(query, { page, perPage });
  },

  getPopularManga: async (page = 1, perPage = 20, genreIn?: string[]): Promise<AniListPage<AniListMedia>> => {
    const query = `
      query ($page: Int, $perPage: Int, $genreIn: [String]) {
        Page(page: $page, perPage: $perPage) {
          pageInfo { currentPage hasNextPage perPage total }
          media(type: MANGA, sort: POPULARITY_DESC, genre_in: $genreIn) {
            id
            title { romaji english native }
            coverImage { extraLarge large medium }
            bannerImage
            description(asHtml: false)
            chapters
            volumes
            averageScore
            seasonYear
            genres
          }
        }
      }
    `;
    return anilistRequest<AniListPage<AniListMedia>>(query, { page, perPage, genreIn: genreIn?.length ? genreIn : null });
  },

  getTrendingManga: async (page = 1, perPage = 20): Promise<AniListPage<AniListMedia>> => {
    const query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo { currentPage hasNextPage perPage total }
          media(type: MANGA, sort: TRENDING_DESC) {
            id
            title { romaji english native }
            coverImage { extraLarge large medium }
            bannerImage
            description(asHtml: false)
            chapters
            volumes
            averageScore
            seasonYear
            genres
          }
        }
      }
    `;
    return anilistRequest<AniListPage<AniListMedia>>(query, { page, perPage });
  },

  getTopRatedManga: async (page = 1, perPage = 20): Promise<AniListPage<AniListMedia>> => {
    const query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo { currentPage hasNextPage perPage total }
          media(type: MANGA, sort: AVERAGE_SCORE_DESC) {
            id
            title { romaji english native }
            coverImage { extraLarge large medium }
            bannerImage
            description(asHtml: false)
            chapters
            volumes
            averageScore
            seasonYear
            genres
          }
        }
      }
    `;
    return anilistRequest<AniListPage<AniListMedia>>(query, { page, perPage });
  },

  searchAnime: async (search: string, page = 1, perPage = 20): Promise<AniListPage<AniListMedia>> => {
    const query = `
      query ($search: String, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo { currentPage hasNextPage perPage total }
          media(type: ANIME, search: $search, sort: POPULARITY_DESC) {
            id
            title { romaji english native }
            coverImage { extraLarge large medium }
            bannerImage
            description(asHtml: false)
            episodes
            averageScore
            seasonYear
            genres
            trailer { site id }
          }
        }
      }
    `;

    return anilistRequest<AniListPage<AniListMedia>>(query, { search, page, perPage });
  },

  searchManga: async (search: string, page = 1, perPage = 20): Promise<AniListPage<AniListMedia>> => {
    const query = `
      query ($search: String, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo { currentPage hasNextPage perPage total }
          media(type: MANGA, search: $search, sort: POPULARITY_DESC) {
            id
            title { romaji english native }
            coverImage { extraLarge large medium }
            bannerImage
            description(asHtml: false)
            chapters
            volumes
            averageScore
            seasonYear
            genres
          }
        }
      }
    `;
    return anilistRequest<AniListPage<AniListMedia>>(query, { search, page, perPage });
  },

  getAnimeDetails: async (id: number): Promise<{ Media: AniListMedia }> => {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title { romaji english native }
          coverImage { extraLarge large medium }
          bannerImage
          description(asHtml: false)
          episodes
          averageScore
          seasonYear
          genres
          trailer { site id }
          streamingEpisodes {
            title
            thumbnail
            url
            site
          }
        }
      }
    `;

    return anilistRequest<{ Media: AniListMedia }>(query, { id });
  },

  getMangaDetails: async (id: number): Promise<{ Media: AniListMedia }> => {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: MANGA) {
          id
          title { romaji english native }
          coverImage { extraLarge large medium }
          bannerImage
          description(asHtml: false)
          chapters
          volumes
          averageScore
          seasonYear
          genres
        }
      }
    `;
    return anilistRequest<{ Media: AniListMedia }>(query, { id });
  },

  getAnimeRecommendations: async (id: number, page = 1, perPage = 6): Promise<AniListPage<AniListMedia>> => {
    const query = `
      query ($id: Int, $page: Int, $perPage: Int) {
        Media(id: $id, type: ANIME) {
          recommendations(page: $page, perPage: $perPage, sort: RATING_DESC) {
            pageInfo { currentPage hasNextPage perPage total }
            nodes {
              mediaRecommendation {
                id
                title { romaji english native }
                coverImage { extraLarge large medium }
                bannerImage
                description(asHtml: false)
                episodes
                averageScore
                seasonYear
                genres
                trailer { site id }
              }
            }
          }
        }
      }
    `;

    const data = await anilistRequest<{
      Media: {
        recommendations: {
          pageInfo: AniListPage<AniListMedia>['Page']['pageInfo'];
          nodes: Array<{ mediaRecommendation: AniListMedia | null }>;
        };
      };
    }>(query, { id, page, perPage });

    const media = data.Media.recommendations.nodes
      .map(n => n.mediaRecommendation)
      .filter((m): m is AniListMedia => Boolean(m));

    return {
      Page: {
        pageInfo: data.Media.recommendations.pageInfo,
        media,
      },
    };
  },

  getMangaRecommendations: async (id: number, page = 1, perPage = 6): Promise<AniListPage<AniListMedia>> => {
    const query = `
      query ($id: Int, $page: Int, $perPage: Int) {
        Media(id: $id, type: MANGA) {
          recommendations(page: $page, perPage: $perPage, sort: RATING_DESC) {
            pageInfo { currentPage hasNextPage perPage total }
            nodes {
              mediaRecommendation {
                id
                title { romaji english native }
                coverImage { extraLarge large medium }
                bannerImage
                description(asHtml: false)
                chapters
                volumes
                averageScore
                seasonYear
                genres
              }
            }
          }
        }
      }
    `;

    const data = await anilistRequest<{
      Media: {
        recommendations: {
          pageInfo: AniListPage<AniListMedia>['Page']['pageInfo'];
          nodes: Array<{ mediaRecommendation: AniListMedia | null }>;
        };
      };
    }>(query, { id, page, perPage });

    const media = data.Media.recommendations.nodes
      .map(n => n.mediaRecommendation)
      .filter((m): m is AniListMedia => Boolean(m));

    return {
      Page: {
        pageInfo: data.Media.recommendations.pageInfo,
        media,
      },
    };
  },
};
