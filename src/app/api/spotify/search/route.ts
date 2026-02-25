import { NextRequest, NextResponse } from 'next/server';
import SpotifyWebApi from 'spotify-web-api-node';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    console.log('Searching iTunes for:', query);
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=10`);
    const data = await response.json();
    
    // Map iTunes results to Track format
    const tracks = data.results.map((item: any) => ({
      id: item.trackId.toString(),
      name: item.trackName,
      artists: [{ name: item.artistName }],
      album: { images: [{ url: item.artworkUrl100 }] },
      duration_ms: item.trackTimeMillis,
      uri: item.previewUrl || item.trackViewUrl
    }));
    
    console.log('iTunes search results:', tracks.length, 'tracks found');
    return NextResponse.json(tracks);
  } catch (error) {
    console.error('iTunes API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to search songs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
