import { NextRequest, NextResponse } from 'next/server'
import { gaanaService } from '../../../../lib/gaana/services/instances'

export async function GET(request: NextRequest, { params }: { params: Promise<{ seokey: string }> }) {
  const { seokey } = await params

  if (!seokey) {
    return NextResponse.json({ error: 'Seokey is required' }, { status: 400 })
  }

  try {
    const artistInfo = await gaanaService.getArtistInfo(seokey)
    if (artistInfo.error) {
      return NextResponse.json(artistInfo, { status: 404 })
    }
    return NextResponse.json(artistInfo)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to get artist' }, { status: 500 })
  }
}
