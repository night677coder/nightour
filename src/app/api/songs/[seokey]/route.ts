import { NextRequest, NextResponse } from 'next/server'
import { gaanaService } from '../../../../lib/gaana/services/instances'

export async function GET(request: NextRequest, { params }: { params: Promise<{ seokey: string }> }) {
  const { seokey } = await params

  if (!seokey) {
    return NextResponse.json({ error: 'Seokey is required' }, { status: 400 })
  }

  try {
    const songInfo = await gaanaService.getSongInfo(seokey)
    if (songInfo.error) {
      return NextResponse.json(songInfo, { status: 404 })
    }
    return NextResponse.json(songInfo)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to get song' }, { status: 500 })
  }
}
