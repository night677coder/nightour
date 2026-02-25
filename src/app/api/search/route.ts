import { NextRequest, NextResponse } from 'next/server'
import { gaanaService } from '../../../lib/gaana/services/instances'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '10')

  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 })
  }

  try {
    const [songs, albums, playlists, artists] = await Promise.allSettled([
      gaanaService.searchSongs(query, limit),
      gaanaService.searchAlbums(query, limit),
      gaanaService.searchPlaylists(query, limit),
      gaanaService.searchArtists(query, limit)
    ])

    const results = {
      songs: songs.status === 'fulfilled' ? songs.value : [],
      albums: albums.status === 'fulfilled' ? albums.value : [],
      playlists: playlists.status === 'fulfilled' ? playlists.value : [],
      artists: artists.status === 'fulfilled' ? artists.value : []
    }

    return NextResponse.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Search failed' }, { status: 500 })
  }
}
