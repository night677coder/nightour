import { NextRequest, NextResponse } from 'next/server'
import { fetchStreamUrl } from '../../../../lib/gaana/utils/crypto'

export async function GET(request: NextRequest, { params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await params

  if (!trackId || !/^\d+$/.test(trackId)) {
    return NextResponse.json({ error: 'Track ID is required and must be numeric' }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const quality = (searchParams.get('quality') as 'low' | 'medium' | 'high') || 'high'

  try {
    const streamUrl = await fetchStreamUrl(trackId, quality)
    if (!streamUrl) {
      return NextResponse.json({ error: 'Failed to get stream URL' }, { status: 404 })
    }
    return NextResponse.json(streamUrl)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to get stream URL' }, { status: 500 })
  }
}
