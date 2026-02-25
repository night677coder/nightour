'use client'

import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

export default function SongLife() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>({})
  const [audioSrc, setAudioSrc] = useState<string | null>(null)
  const [nowPlaying, setNowPlaying] = useState<string>('Select a song to play')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [expandedSongs, setExpandedSongs] = useState<Record<string, any[]>>({})

  const audioRef = useRef<HTMLAudioElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  useEffect(() => {
    if (!audioSrc) return
    if (!audioRef.current) return

    console.log('🎵 Audio effect triggered with src:', audioSrc)
    
    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
    
    // Check if this is an HLS m3u8 URL
    const isHls = audioSrc.includes('.m3u8')
    
    if (isHls && Hls.isSupported()) {
      console.log('🎵 Using HLS.js for m3u8 playback')
      const hls = new Hls()
      hlsRef.current = hls
      hls.loadSource(audioSrc)
      hls.attachMedia(audioRef.current)
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('🎵 HLS manifest parsed, attempting play...')
        audioRef.current?.play().catch((playError) => {
          console.log('⚠️ HLS auto-play blocked or failed:', playError.message)
        })
      })
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('❌ HLS error:', {
          type: data.type,
          details: data.details,
          fatal: data.fatal,
          url: data.url,
          response: data.response,
          fullData: data
        })
        
        if (data.fatal) {
          console.error('💀 Fatal HLS error, destroying instance')
          hls.destroy()
        }
      })
    } else {
      // Regular audio playback
      console.log('🎵 Using native audio playback')
      audioRef.current.load()
      console.log('🎵 Audio loaded, attempting play...')
      audioRef.current.play().catch((playError) => {
        console.log('⚠️ Auto-play blocked or failed:', playError.message)
      })
    }
    
    // Cleanup function
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [audioSrc])

  const getSeokey = (obj: any): string => {
    const val = obj?.seokey ?? obj?.seo ?? obj?.seokeys ?? ''
    return typeof val === 'string' ? val : ''
  }

  const toggleExpanded = async (type: string, seokey: string) => {
    if (!seokey) return
    const key = `${type}-${seokey}`
    const newExpanded = new Set(expandedItems)
    
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
      // Fetch songs if not already loaded
      if (!expandedSongs[key]) {
        await loadExpandedSongs(type, seokey, key)
      }
    }
    
    setExpandedItems(newExpanded)
  }

  const loadExpandedSongs = async (type: string, seokey: string, key: string) => {
    try {
      let songs: any[] = []
      
      if (type === 'albums') {
        const resp = await fetch(`/api/albums/${seokey}`)
        if (!resp.ok) {
          setExpandedSongs(prev => ({ ...prev, [key]: [] }))
          return
        }
        
        const data = await resp.json()
        songs = data.tracks || data.songs || []
      } else if (type === 'artists') {
        const resp = await fetch(`/api/artists/${seokey}`)
        if (!resp.ok) {
          setExpandedSongs(prev => ({ ...prev, [key]: [] }))
          return
        }
        
        const data = await resp.json()
        songs = data.top_tracks || data.tracks || []
      }
      
      setExpandedSongs(prev => ({ ...prev, [key]: songs }))
    } catch (error) {
      setExpandedSongs(prev => ({ ...prev, [key]: [] }))
    }
  }

  const search = async () => {
    if (!query) return
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    const data = await response.json()
    if (data.success) {
      setResults(data.data)
    } else {
      setResults({})
    }
  }

  const playItem = async (seokey: string, type: string) => {
    if (!seokey) {
      setNowPlaying('Invalid song')
      return
    }
    let songSeokey = seokey
    
    if (type === 'albums') {
      const resp = await fetch(`/api/albums/${seokey}`)
      const data = await resp.json()
      if (data.tracks && data.tracks.length > 0) {
        songSeokey = data.tracks[0].seokey
      } else {
        return
      }
    } else if (type === 'playlists') {
      const resp = await fetch(`/api/playlists/${seokey}`)
      const data = await resp.json()
      if (data.playlist && data.playlist.tracks && data.playlist.tracks.length > 0) {
        songSeokey = data.playlist.tracks[0].seokey
      } else {
        return
      }
    } else if (type === 'artists') {
      const resp = await fetch(`/api/artists/${seokey}`)
      const data = await resp.json()
      if (data.top_tracks && data.top_tracks.length > 0) {
        songSeokey = data.top_tracks[0].seokey
      } else {
        return
      }
    }
    
    playSong(songSeokey)
  }

  const playSong = async (seokey: string) => {
    try {
      if (!seokey) {
        setNowPlaying('Invalid song')
        return
      }
      setNowPlaying('Loading...')
      
      const songResp = await fetch(`/api/songs/${seokey}`)
      
      if (!songResp.ok) {
        setNowPlaying('Failed to load song')
        return
      }
      
      const songData = await songResp.json()
      
      if (!songData.track_id) {
        setNowPlaying('Invalid song data')
        return
      }
      
      setNowPlaying(`${songData.title || 'Unknown'} - ${songData.artists || 'Unknown Artist'}`)
      
      const streamResp = await fetch(`/api/stream/${songData.track_id}`)
      
      if (!streamResp.ok) {
        setNowPlaying('Failed to load stream')
        return
      }
      
      const streamData = await streamResp.json()
      
      const nextSrc = (streamData && (streamData.hlsUrl || streamData.url)) as string | undefined

      console.log('🎵 Stream data received:', streamData)
      console.log('🎵 Next source URL:', nextSrc)

      if (!nextSrc) {
        console.log('❌ No valid source URL found in stream data')
        setNowPlaying('Invalid stream data')
        return
      }
      
      console.log('✅ Setting audio source to:', nextSrc)
      setAudioSrc(nextSrc)
    } catch (error) {
      setNowPlaying('Error loading song')
    }
  }

  const categoryIcons = {
    songs: '🎵',
    albums: '💿',
    playlists: '📋',
    artists: '🎤'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-accent mb-8">Song Life</h1>
        </header>

        {/* Search Section */}
        <section className="mb-8">
          <form onSubmit={(e) => { e.preventDefault(); search(); }} className="mb-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for songs..."
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                onKeyPress={(e) => e.key === 'Enter' && search()}
              />
              <button
                type="submit"
                className="btn-primary"
              >
                Search
              </button>
            </div>
          </form>
        </section>

        {/* Audio Player */}
        <audio
          ref={audioRef}
          src={audioSrc ?? undefined}
          controls
          className={`fixed bottom-0 left-0 right-0 bg-gray-900 p-4 z-50 ${audioSrc ? '' : 'hidden'}`}
        />

        {/* Results Section */}
        {Object.keys(results).length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-accent">
                Search Results
              </h2>
            </div>
            <div className="space-y-2">
              {Object.entries(results).flatMap(([type, items]: [string, unknown]) =>
                Array.isArray(items) ? items.map((item, index) => ({ item, type, originalIndex: index })) : []
              ).map(({ item, type, originalIndex }, flatIndex) => {
                const itemSeokey = getSeokey(item)
                const itemKey = `${type}-${itemSeokey}`
                const isExpanded = expandedItems.has(itemKey)
                const expandedSongList = expandedSongs[itemKey] || []
                const isExpandable = type === 'albums' || type === 'artists'

                return (
                  <div key={`${type}-${originalIndex}`}>
                    <div className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg">
                      <span className="text-gray-400 w-8">{flatIndex + 1}</span>
                      <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-lg">{categoryIcons[type as keyof typeof categoryIcons] || '🎵'}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{item.title || item.name}</h3>
                        <p className="text-sm text-gray-400">
                          {item.artists || item.artist || 'Unknown Artist'}
                          {item.album && ` • ${item.album}`}
                        </p>
                      </div>
                      {item.duration && (
                        <span className="text-sm text-gray-400">
                          {item.duration}
                        </span>
                      )}
                      {type === 'songs' && itemSeokey && (
                        <button
                          onClick={() => playItem(itemSeokey, type)}
                          className="btn-primary"
                        >
                          Play
                        </button>
                      )}
                      {isExpandable && (
                        <button
                          onClick={() => toggleExpanded(type, itemSeokey)}
                          className="btn-primary"
                        >
                          {isExpanded ? 'Collapse' : 'Expand'}
                        </button>
                      )}
                    </div>
                    {isExpanded && (
                      <div className="ml-8 mt-2 space-y-1">
                        {expandedSongList.length > 0 ? (
                          expandedSongList.map((song, songIndex) => (
                            <div key={song.seokey || songIndex} className="flex items-center gap-4 bg-gray-700 p-3 rounded-lg">
                              <span className="text-gray-500 w-6">{songIndex + 1}</span>
                              <div className="flex-1">
                                <h4 className="font-medium text-white text-sm">{song.title || song.name}</h4>
                                {song.artists && (
                                  <p className="text-xs text-gray-400">{song.artists}</p>
                                )}
                              </div>
                              {song.duration && (
                                <span className="text-xs text-gray-400">
                                  {song.duration}
                                </span>
                              )}
                              <button
                                onClick={() => playSong(getSeokey(song))}
                                className="btn-primary text-xs px-2 py-1"
                              >
                                Play
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-400">No songs found.</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {Object.keys(results).length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Search for your favorite music</h3>
            <p className="text-gray-400">Start typing to discover songs, albums, playlists, and artists</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
