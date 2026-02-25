/**
 * @fileoverview Main API router configuration for all endpoints.
 * Defines RESTful routes organized by functionality:
 * - Health check
 * - Search endpoints (type-specific and global)
 * - Resource detail endpoints (songs, albums, playlists, artists)
 * - Browse endpoints (trending, charts, new releases)
 * - Stream URL endpoint
 *
 * Route order matters: more specific routes must come before generic ones.
 * @module routes/index
 */

import { Hono } from 'hono'
import { handleSearch } from '../handlers/search'
import { handleSearchSongs } from '../handlers/searchSongs'
import { handleSearchAlbums } from '../handlers/searchAlbums'
import { handleSearchPlaylists } from '../handlers/searchPlaylists'
import { handleSearchArtists } from '../handlers/searchArtists'
import { handleGetSong } from '../handlers/songs'
import { handleGetAlbum } from '../handlers/albums'
import { handleGetPlaylist } from '../handlers/playlists'
import { handleGetArtist } from '../handlers/artists'
import { handleTrending } from '../handlers/trending'
import { handleCharts } from '../handlers/charts'
import { handleNewReleases } from '../handlers/newreleases'
import { handleHealth } from '../handlers/health'
import { handleGetStream } from '../handlers/stream'

const router = new Hono()

// Health check
router.get('/health', handleHealth)

// Type-specific search endpoints (MUST come BEFORE /search)
// Usage:
//   GET /api/search/songs?q=despacito&limit=10
//   GET /api/search/albums?q=thriller&limit=10
//   GET /api/search/playlists?q=hits&limit=10
//   GET /api/search/artists?q=arijit&limit=10
router.get('/search/songs', handleSearchSongs)
router.get('/search/albums', handleSearchAlbums)
router.get('/search/playlists', handleSearchPlaylists)
router.get('/search/artists', handleSearchArtists)

// Global search endpoint - search across all types (AFTER specific routes)
// Usage:
//   GET /api/search?q=despacito
//   GET /api/search?q=despacito&limit=20
router.get('/search', handleSearch)

// Resource endpoints - get specific items by seokey or URL
// Query parameter support (MUST come BEFORE path parameter routes)
// Usage:
//   GET /api/songs?url=https://gaana.com/song/tune-ka-mathabhar
//   GET /api/songs?seokey=tune-ka-mathabhar
router.get('/songs', handleGetSong)
router.get('/albums', handleGetAlbum)
router.get('/playlists', handleGetPlaylist)
router.get('/artists', handleGetArtist)

// Path parameter support
// Usage:
//   GET /api/songs/tune-ka-mathabhar
//   GET /api/albums/thriller-album
//   GET /api/playlists/hits-2024
//   GET /api/artists/arijit-singh
router.get('/songs/:seokey', handleGetSong)
router.get('/albums/:seokey', handleGetAlbum)
router.get('/playlists/:seokey', handleGetPlaylist)
router.get('/artists/:seokey', handleGetArtist)

// Browse endpoints - get curated lists
// Usage:
//   GET /api/trending?language=hi&limit=20
//   GET /api/charts?limit=30
//   GET /api/new-releases?language=en
router.get('/trending', handleTrending)
router.get('/charts', handleCharts)
router.get('/new-releases', handleNewReleases)

// Stream URL endpoint - get decrypted HLS stream URL by track ID
// Usage:
//   GET /api/stream/29797868
//   GET /api/stream?track_id=29797868
//   GET /api/stream/29797868?quality=medium
router.get('/stream', handleGetStream)
router.get('/stream/:trackId', handleGetStream)

export default router



