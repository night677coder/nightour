import { NextResponse } from 'next/server';
import { tmdb } from '@/lib/api/tmdb';
import { anilist } from '@/lib/api/anilist';

export async function GET() {
  try {
    const [moviesResponse, tvResponse, animeResponse, mangaResponse] = await Promise.all([
      tmdb.getTrendingMovies(1).catch(err => {
        // Movies API failed, return empty
        return { results: [] };
      }),
      tmdb.getTrendingTVShows(1).catch(err => {
        // TV API failed, return empty
        return { results: [] };
      }),
      anilist.getTrendingAnime(1, 20).catch(err => {
        // Anime API failed, return empty
        return { Page: { media: [] } };
      }),
      anilist.getTrendingManga(1, 20).catch(err => {
        // Manga API failed, return empty
        return { Page: { media: [] } };
      }),
    ]);

    return NextResponse.json({
      movies: moviesResponse.results?.slice(0, 6) || [],
      tv: tvResponse.results?.slice(0, 6) || [],
      anime: ((animeResponse as any)?.Page?.media ?? []).slice(0, 6),
      manga: ((mangaResponse as any)?.Page?.media ?? []).slice(0, 6),
    });
  } catch (error) {
    console.error('Error fetching trending content:', error);
    // Return empty arrays instead of error to prevent frontend from breaking
    return NextResponse.json({
      movies: [],
      tv: [],
      anime: [],
      manga: [],
    });
  }
}
