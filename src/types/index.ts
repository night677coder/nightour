export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  popularity: number;
  video: boolean;
  vote_count: number;
}

export interface TVShow {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  original_language: string;
  popularity: number;
  vote_count: number;
  origin_country: string[];
}

export interface ContentItem {
  id: number | string;
  title: string;
  poster: string;
  backdrop: string;
  overview: string;
  type: 'movie' | 'tv' | 'anime' | 'manga';
  rating: number;
  year: string;
  genres?: string[];
}

export interface SearchResult {
  results: ContentItem[];
  total_pages: number;
  total_results: number;
}

export interface WatchlistItem {
  id: number;
  title: string;
  poster: string;
  type: 'movie' | 'tv' | 'anime' | 'manga';
  added_at: string;
  progress?: number;
}

export interface Anime {
  mal_id: number;
  title: string;
  title_english?: string;
  title_japanese?: string;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  synopsis: string;
  type: string;
  episodes: number;
  status: string;
  airing: boolean;
  aired: {
    from: string;
    to: string;
  };
  rating: string;
  score: number;
  scored_by: number;
  rank: number;
  popularity: number;
  members: number;
  favorites: number;
  genres: Array<{
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }>;
}

export interface Artist {
  id: string;
  name: string;
  images: { url: string }[];
  genres: string[];
  popularity: number;
}

export interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
  duration_ms: number;
  uri: string;
}
