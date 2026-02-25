import { NextRequest, NextResponse } from 'next/server'
import { gaanaService } from '../../../../lib/gaana/services/instances'

export async function GET(request: NextRequest, { params }: { params: Promise<{ seokey: string }> }) {
  const { seokey } = await params

  if (!seokey) {
    return NextResponse.json({ error: 'Seokey is required' }, { status: 400 })
  }

  try {
    const albumInfo = await gaanaService.getAlbumInfo(seokey, true)
    if (albumInfo.error) {
      return NextResponse.json(albumInfo, { status: 404 })
    }
    return NextResponse.json(albumInfo)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to get album' }, { status: 500 })
  }
}
