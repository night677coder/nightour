import { NextRequest, NextResponse } from 'next/server'
import { gaanaService } from '../../../../lib/gaana/services/instances'

export async function GET(request: NextRequest, { params }: { params: Promise<{ seokey: string }> }) {
  const { seokey } = await params

  if (!seokey) {
    return NextResponse.json({ error: 'Seokey is required' }, { status: 400 })
  }

  try {
    const playlistInfo = await gaanaService.getPlaylistInfo(seokey)
    if (playlistInfo.error) {
      return NextResponse.json(playlistInfo, { status: 404 })
    }
    return NextResponse.json(playlistInfo)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to get playlist' }, { status: 500 })
  }
}
