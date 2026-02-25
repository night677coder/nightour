import { NextRequest, NextResponse } from 'next/server';
import SpotifyWebApi from 'spotify-web-api-node';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body.access_token);

    const topTracks = await spotifyApi.getArtistTopTracks(id, 'US');
    return NextResponse.json(topTracks.body.tracks);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to get top tracks' }, { status: 500 });
  }
}
