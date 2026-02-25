import { NextResponse } from 'next/server';
import { tmdb } from '@/lib/api/tmdb';
import { anilist } from '@/lib/api/anilist';

export async function GET() {
  try {
    const [moviesPages, tvPages, animeResponse, mangaResponse] = await Promise.all([
      Promise.all([1, 2, 3].map(page => tmdb.getTopRatedMovies(page).catch(() => ({ results: [] })))),
      Promise.all([1, 2, 3].map(page => tmdb.getTopRatedTVShows(page).catch(() => ({ results: [] })))),
      anilist.getTopRatedAnime(1, 60).catch(() => ({ Page: { media: [] } })),
      anilist.getTopRatedManga(1, 60).catch(() => ({ Page: { media: [] } })),
    ]);

    const movies = moviesPages.flatMap(page => page.results || []);
    const tv = tvPages.flatMap(page => page.results || []);
    const anime = animeResponse?.Page?.media || [];
    const manga = mangaResponse?.Page?.media || [];

    return NextResponse.json({
      movies,
      tv,
      anime,
      manga,
    });
  } catch (error) {
    console.error('Error fetching top-rated content:', error);
    return NextResponse.json({
      movies: [],
      tv: [],
      anime: [],
      manga: [],
    });
  }
}
