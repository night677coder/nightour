import { NextRequest, NextResponse } from 'next/server';
import SpotifyWebApi from 'spotify-web-api-node';

export async function GET(request: NextRequest) {
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body.access_token);

    const newReleases = await spotifyApi.getNewReleases({ limit: 20, offset: 0, country: 'US' });
    return NextResponse.json(newReleases.body.albums.items);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to get new releases' }, { status: 500 });
  }
}
