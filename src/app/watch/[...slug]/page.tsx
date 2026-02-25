'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, ArrowLeft, Star, Calendar, Clock, Film, Tv, Server, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import Image from 'next/image';
import { tmdb } from '@/lib/api/tmdb';
import { anilist } from '@/lib/api/anilist';
import { jikan } from '@/lib/api/jikan';
import { twoEmbed, vidSrc, goDrivePlayer, vidSrcMe, vidSrcIcu, vidSrcOnline, vidLink, playerAutoEmbed, indraEmbed, iEmbed, embedmaster } from '@/lib/api/2embed';
import Link from 'next/link';
import { ContentCard } from '@/components/cards/ContentCard';
import { transformMovieToContentItem, transformTVShowToContentItem } from '@/lib/utils';
import { useWatchlistStore } from '@/lib/store/watchlist';

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string[];
  const type = slug?.[0] as string;
  const id = Number(slug?.[1]);
  const twoEmbedAnimeBaseSlug = slug?.[2];
  const [content, setContent] = useState<any>(null);
  const [trailer, setTrailer] = useState<any>(null);
  const [selectedServer, setSelectedServer] = useState(() => {
    if (type === 'anime') return 1; // Default to 2Embed for anime
    if (type === 'manga') return 5; // Default to VidSrcIcu for manga
    return 1; // Default to 2Embed for movies/TV
  });
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSeasons, setShowSeasons] = useState(true);
  const [tvImdbId, setTvImdbId] = useState<string | null>(null);
  const [animeTmdbId, setAnimeTmdbId] = useState<number | null>(null);

  const { watchlist } = useWatchlistStore();
  const currentProgress = watchlist.find(item => item.id === id)?.progress || 0;

  // Retry helper for API calls
  const retry = async (fn: () => Promise<any>, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        if (i === retries - 1) throw error;
        // For 429 (rate limit), use longer delay
        const waitTime = error?.response?.status === 429 ? delay * 5 : delay;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  };

  // Server configuration
  const servers = [
    { id: 0, name: 'Server'},
    { id: 1, name: 'Server 1'},
    { id: 2, name: 'Server 2'},
    { id: 3, name: 'Server 3'},
    { id: 4, name: 'Server 4'},
    { id: 5, name: 'Server 5'},
    { id: 6, name: 'Server 6'},
    { id: 7, name: 'Server 7'},
    { id: 8, name: 'Server 8'},
    { id: 9, name: 'Server 9'},
    { id: 10, name: 'Server 10'},
    { id: 11, name: 'Server 11'},
  ];

  useEffect(() => {
    const loadContent = async () => {
      try {
        let contentData, videosData, recsData;
        
        if (type === 'movie') {
          [contentData, videosData, recsData] = await Promise.all([
            tmdb.getMovieDetails(id),
            tmdb.getMovieVideos(id),
            tmdb.getMovieRecommendations(id),
          ]);
          setRecommendations(recsData.results?.slice(0, 6) || []);
        } else if (type === 'tv') {
          [contentData, videosData, recsData] = await Promise.all([
            tmdb.getTVShowDetails(id),
            tmdb.getTVVideos(id),
            tmdb.getTVRecommendations(id),
          ]);
          setSeasons(contentData.seasons?.filter((s: any) => s.season_number > 0) || []);
          setRecommendations(recsData.results?.slice(0, 6) || []);

          try {
            const externalIds = await tmdb.getTVExternalIds(id);
            const imdb = externalIds?.imdb_id as string | undefined;
            setTvImdbId(imdb && imdb.startsWith('tt') ? imdb : null);
          } catch {
            setTvImdbId(null);
          }
          
          // Load episodes for first season
          if (contentData.seasons?.length > 0) {
            const episodesData = await tmdb.getTVEpisodes(id, 1);
            setEpisodes(episodesData.episodes || []);
          }
        } else if (type === 'anime') {
          const [animeResponse, recsResponse] = await Promise.all([
            anilist.getAnimeDetails(id),
            anilist.getAnimeRecommendations(id, 1, 12),
          ]);

          contentData = (animeResponse as any)?.Media ?? animeResponse;
          videosData = { results: [] };

          // Try to get real episode data from Jikan API using MAL ID
          try {
            const malId = contentData?.idMal || contentData?.id; // Try MAL ID first, fallback to AniList ID
            let allEpisodes: any[] = [];
            let page = 1;
            let totalPages = 1;
            
            if (malId) {
              // First, get the pagination info to know total pages
              try {
                const firstPageResponse = await retry(() => jikan.getAnimeEpisodes(malId, 1));
                const pagination = firstPageResponse?.pagination;
                if (pagination) {
                  totalPages = pagination.last_visible_page || 1;
                  console.log(`One Piece has ${totalPages} pages of episodes`);
                  
                  // Add first page episodes
                  const firstPageEpisodes = firstPageResponse?.data || [];
                  allEpisodes = [...firstPageEpisodes];
                  
                  // Fetch remaining pages
                  for (let currentPage = 2; currentPage <= Math.min(totalPages, 20); currentPage++) {
                    try {
                      const pageResponse = await retry(() => jikan.getAnimeEpisodes(malId, currentPage));
                      const pageEpisodes = pageResponse?.data || [];
                      allEpisodes = [...allEpisodes, ...pageEpisodes];
                      console.log(`Fetched page ${currentPage}/${totalPages}: ${pageEpisodes.length} episodes`);
                    } catch (pageError) {
                      console.error(`Error fetching page ${currentPage}:`, pageError);
                      break; // Stop if one page fails
                    }
                  }
                } else {
                  // Fallback if no pagination info
                  const jikanResponse = await jikan.getAnimeEpisodes(malId, page);
                  const jikanEpisodes = jikanResponse?.data || [];
                  allEpisodes = [...allEpisodes, ...jikanEpisodes];
                }
              } catch (firstPageError) {
                console.error('Error fetching first page:', firstPageError);
                // Try without pagination info
                const jikanResponse = await jikan.getAnimeEpisodes(malId, page);
                const jikanEpisodes = jikanResponse?.data || [];
                allEpisodes = [...allEpisodes, ...jikanEpisodes];
              }
            }
            
            if (allEpisodes.length > 0) {
              console.log(`Total episodes fetched from Jikan: ${allEpisodes.length}`);
              const realEpisodes = allEpisodes.map((ep: any, index: number) => ({
                episode_number: ep.mal_id, // Use actual MAL episode ID
                name: ep.title || `Episode ${ep.mal_id}`,
                overview: ep.synopsis || '',
                air_date: ep.aired || '',
              }));
              setEpisodes(realEpisodes);
            } else {
              // Fallback to generated episodes using AniList episode count
              const episodeCount = (contentData as any)?.episodes || 12;
              console.log(`Using fallback episodes: ${episodeCount} (Jikan returned no episodes)`);
              const fallbackEpisodes = [];
              for (let i = 1; i <= episodeCount; i++) {
                fallbackEpisodes.push({
                  episode_number: i,
                  name: `Episode ${i}`,
                  overview: '',
                });
              }
              setEpisodes(fallbackEpisodes);
            }
          } catch (error) {
            console.error('Error fetching Jikan episodes:', error);
            // Fallback to generated episodes using AniList episode count
            const episodeCount = (contentData as any)?.episodes || 12;
            console.log(`Using fallback episodes after error: ${episodeCount}`);
            const fallbackEpisodes = [];
            for (let i = 1; i <= episodeCount; i++) {
              fallbackEpisodes.push({
                episode_number: i,
                name: `Episode ${i}`,
                overview: '',
              });
            }
            setEpisodes(fallbackEpisodes);
          }

          const transformedRecs = ((recsResponse as any)?.Page?.media ?? []).slice(0, 6);
          setRecommendations(transformedRecs);

          // Try to get TMDB ID for server 9
          try {
            const animeTitle = contentData?.title?.english || contentData?.title?.romaji || contentData?.title?.native || '';
            if (animeTitle) {
              const searchResults = await tmdb.searchTVShows(animeTitle, 1);
              if (searchResults.results && searchResults.results.length > 0) {
                setAnimeTmdbId(searchResults.results[0].id);
              }
            }
          } catch (error) {
            // Optional TMDB search failed, continue without TMDB ID
            setAnimeTmdbId(null);
          }
        } else if (type === 'manga') {
          setSelectedServer(6);

          const [mangaResponse, recsResponse] = await Promise.all([
            anilist.getMangaDetails(id),
            anilist.getMangaRecommendations(id, 1, 12),
          ]);

          contentData = (mangaResponse as any)?.Media ?? mangaResponse;
          videosData = { results: [] };

          const chapterCount = (contentData as any)?.chapters;
          const maxChapters = typeof chapterCount === 'number' ? Math.min(chapterCount, 500) : 50;
          const fallbackChapters = [];
          for (let i = 1; i <= maxChapters; i++) {
            fallbackChapters.push({
              episode_number: i,
              name: `Chapter ${i}`,
              overview: '',
            });
          }
          setEpisodes(fallbackChapters);

          const transformedRecs = ((recsResponse as any)?.Page?.media ?? []).slice(0, 6);
          setRecommendations(transformedRecs);
        }
        
        setContent(contentData);
        
        // Find trailer
        const trailerVideo = videosData?.results?.find(
          (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
        );
        setTrailer(trailerVideo);
      } catch (error) {
        // Content loading failed, will show "Content not found"
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id && type) loadContent();
  }, [id, type]);

  // Add to watch history when content loads
  useEffect(() => {
    if (content) {
      const watchHistoryItem = {
        id: content.id,
        title: content.title || content.name || 'Unknown',
        poster: content.poster_path 
          ? `https://image.tmdb.org/t/p/w300${content.poster_path}` 
          : content.images?.jpg?.image_url || content.coverImage?.large || content.coverImage?.extraLarge || '',
        backdrop: content.backdrop_path || content.bannerImage || '',
        overview: content.overview || content.synopsis || content.description || '',
        type: type as 'movie' | 'tv' | 'anime' | 'manga',
        rating: content.vote_average || content.score || (typeof content?.averageScore === 'number' ? content.averageScore / 10 : 0),
        year: content.release_date || content.first_air_date 
          ? new Date(content.release_date || content.first_air_date).getFullYear().toString()
          : (content.seasonYear?.toString() || 'Unknown'),
      };

      // Get existing watch history
      const existingHistory = localStorage.getItem('watch-history');
      let watchHistory: any[] = [];
      
      if (existingHistory) {
        try {
          watchHistory = JSON.parse(existingHistory);
        } catch {
          watchHistory = [];
        }
      }

      // Remove if already exists (to update position)
      watchHistory = watchHistory.filter((item) => item.id !== content.id);
      
      // Add to beginning of array
      watchHistory.unshift(watchHistoryItem);
      
      // Keep only last 50 items (increased limit)
      watchHistory = watchHistory.slice(0, 50);
      
      // Save to localStorage
      localStorage.setItem('watch-history', JSON.stringify(watchHistory));
    }
  }, [content, type]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Content not found</h1>
          <button onClick={() => router.back()} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const title = content.title || content.name || 'Unknown';
  const year = content.release_date || content.first_air_date 
    ? new Date(content.release_date || content.first_air_date).getFullYear() 
    : 'Unknown';
  const rating = content.vote_average || content.score || 0;
  const overview = content.overview || content.synopsis || '';
  const posterPath = content.poster_path 
    ? `https://image.tmdb.org/t/p/w300${content.poster_path}` 
    : content.images?.jpg?.image_url || '';
  const trailerKey = trailer?.key || content.trailer?.youtube_id;

  const resolvedTitle = type === 'anime' || type === 'manga'
    ? (content?.title?.english || content?.title?.romaji || content?.title?.native || 'Unknown')
    : title;

  const resolvedYear = type === 'anime' || type === 'manga'
    ? (content?.seasonYear ?? 'Unknown')
    : year;

  const resolvedRating = type === 'anime' || type === 'manga'
    ? (typeof content?.averageScore === 'number' ? content.averageScore / 10 : rating)
    : rating;

  const resolvedOverview = type === 'anime' || type === 'manga'
    ? (content?.description || overview)
    : overview;

  const resolvedPosterPath = type === 'anime' || type === 'manga'
    ? (content?.coverImage?.large || content?.coverImage?.extraLarge || posterPath)
    : posterPath;

  const resolvedTrailerKey = type === 'anime'
    ? (content?.trailer?.site === 'youtube' || content?.trailer?.site === 'YouTube' ? content?.trailer?.id : trailerKey)
    : trailerKey;

  const animeBaseSlug = typeof twoEmbedAnimeBaseSlug === 'string' ? twoEmbedAnimeBaseSlug : '';

  const getPlayerSrc = () => {
    // Trailer (Server 0)
    if (selectedServer === 0) {
      if (resolvedTrailerKey) {
        return `https://www.youtube.com/embed/${resolvedTrailerKey}?autoplay=1&rel=0`;
      }
      return '';
    }

    // Server 1: 2Embed
    if (selectedServer === 1) {
      if (type === 'movie') {
        const imdbId = content?.imdb_id as string | undefined;
        if (imdbId && imdbId.startsWith('tt')) return twoEmbed.getMovieEmbedUrlByImdb(imdbId);
        return twoEmbed.getMovieEmbedUrl(id);
      }
      if (type === 'tv') {
        if (tvImdbId) return twoEmbed.getTVEmbedUrlByImdb(tvImdbId, selectedSeason, selectedEpisode);
        return twoEmbed.getTVEmbedUrl(id);
      }
      if (type === 'anime') {
        if (!animeBaseSlug) return '';
        return twoEmbed.getAnimeEpisodeEmbedUrl(animeBaseSlug, selectedEpisode);
      }
      return '';
    }

    if (selectedServer === 2) {
      if (type === 'movie') {
        const imdbId = content?.imdb_id as string | undefined;
        if (imdbId && imdbId.startsWith('tt')) return vidSrc.getMovieEmbedUrlByImdb(imdbId);
        return vidSrc.getMovieEmbedUrl(id);
      }
      if (type === 'tv') {
        if (tvImdbId) return vidSrc.getTVEmbedUrlByImdb(tvImdbId, selectedSeason, selectedEpisode);
        return vidSrc.getTVEpisodeEmbedUrl(id, selectedSeason, selectedEpisode);
      }
      if (type === 'anime') {
        return vidSrc.getAnimeEmbedUrl(id, selectedEpisode, 'sub');
      }
      return '';
    }

    if (selectedServer === 3) {
      if (type === 'movie') {
        const imdbId = content?.imdb_id as string | undefined;
        if (imdbId && imdbId.startsWith('tt')) return goDrivePlayer.getMovieEmbedUrl(imdbId);
        return ''; // GoDrivePlayer requires IMDb ID for movies
      }
      if (type === 'tv') {
        return goDrivePlayer.getTVEmbedUrl(id, selectedSeason, selectedEpisode);
      }
      if (type === 'anime') {
        return ''; // GoDrivePlayer doesn't support anime
      }
      return '';
    }

    if (selectedServer === 4) {
      if (type === 'movie') {
        const imdbId = content?.imdb_id as string | undefined;
        if (imdbId && imdbId.startsWith('tt')) return vidSrcMe.getMovieEmbedUrlByImdb(imdbId);
        return vidSrcMe.getMovieEmbedUrl(id);
      }
      if (type === 'tv') {
        if (tvImdbId) return vidSrcMe.getTVEpisodeEmbedUrlByImdb(tvImdbId, selectedSeason, selectedEpisode);
        return vidSrcMe.getTVEpisodeEmbedUrl(id, selectedSeason, selectedEpisode);
      }
      if (type === 'anime') {
        return ''; // VidSrcMe doesn't support anime
      }
      return '';
    }

    // Server 5: VidSrcIcu
    if (selectedServer === 5) {
      if (type === 'movie') {
        const imdbId = content?.imdb_id as string | undefined;
        if (imdbId && imdbId.startsWith('tt')) return vidSrcIcu.getMovieEmbedUrl(imdbId);
        return vidSrcIcu.getMovieEmbedUrl(id);
      }
      if (type === 'tv') {
        return vidSrcIcu.getTVEmbedUrl(id, selectedSeason, selectedEpisode);
      }
      if (type === 'anime') {
        return vidSrcIcu.getAnimeEmbedUrl(id, selectedEpisode, false);
      }
      if (type === 'manga') {
        return vidSrcIcu.getMangaEmbedUrl(id, selectedEpisode);
      }
      return '';
    }

    // Server 6: VidSrcOnline
    if (selectedServer === 6) {
      if (type === 'movie') {
        const imdbId = content?.imdb_id as string | undefined;
        if (imdbId && imdbId.startsWith('tt')) return vidSrcOnline.getMovieEmbedUrl(imdbId);
        return vidSrcOnline.getMovieEmbedUrl(id);
      }
      if (type === 'tv') {
        return vidSrcOnline.getTVEmbedUrl(id, selectedSeason, selectedEpisode);
      }
      if (type === 'anime') {
        return vidSrcOnline.getAnimeEmbedUrl(id, selectedEpisode, false);
      }
      if (type === 'manga') {
        return vidSrcOnline.getMangaEmbedUrl(id, selectedEpisode);
      }
      return '';
    }

    // Server 7: VidLink.pro
    if (selectedServer === 7) {
      if (type === 'movie') {
        return vidLink.getMovieEmbedUrl(id);
      }
      if (type === 'tv') {
        return vidLink.getTVEmbedUrl(id, selectedSeason, selectedEpisode);
      }
      return '';
    }

    // Server 8: PlayerAutoEmbed.cc
    if (selectedServer === 8) {
      if (type === 'movie') {
        return playerAutoEmbed.getMovieEmbedUrl(id);
      }
      if (type === 'tv') {
        return playerAutoEmbed.getTVEmbedUrl(id, selectedSeason, selectedEpisode);
      }
      return '';
    }

    // Server 9: IndraEmbed.netlify.app
    if (selectedServer === 9) {
      if (type === 'movie') {
        return indraEmbed.getMovieEmbedUrl(id);
      }
      if (type === 'tv') {
        return indraEmbed.getTVEmbedUrl(id, selectedSeason, selectedEpisode);
      }
      if (type === 'anime') {
        if (animeTmdbId) {
          return indraEmbed.getTVEmbedUrl(animeTmdbId, selectedSeason, selectedEpisode);
        }
        return '';
      }
      return '';
    }

    // Server 10: IEmbed.codeera.dev
    if (selectedServer === 10) {
      if (type === 'movie') {
        return iEmbed.getMovieEmbedUrl(id);
      }
      if (type === 'tv') {
        return iEmbed.getTVEmbedUrl(id, selectedSeason, selectedEpisode);
      }
      return '';
    }

    // Server 11: EmbedMaster.link
    if (selectedServer === 11) {
      if (type === 'movie') {
        return embedmaster.getMovieEmbedUrl(id);
      }
      if (type === 'tv') {
        return embedmaster.getTVEmbedUrl(id, selectedSeason, selectedEpisode);
      }
      if (type === 'anime') {
        if (animeTmdbId) {
          return embedmaster.getTVEmbedUrl(animeTmdbId, selectedSeason, selectedEpisode);
        }
        return '';
      }
      return '';
    }

    return '';
  };

  let playerSrc = getPlayerSrc();

  if (currentProgress > 0) {
    try {
      const url = new URL(playerSrc);
      if (selectedServer === 0) {
        url.searchParams.set('start', Math.floor(currentProgress).toString());
      } else {
        url.searchParams.set('t', Math.floor(currentProgress).toString());
      }
      playerSrc = url.toString();
    } catch (error) {
      // Invalid URL, keep original
    }
  }

  const handleSeasonChange = async (seasonNum: number) => {
    setSelectedSeason(seasonNum);
    if (type === 'anime') {
      const episodeCount = content.episodes || 12;
      const startEpisode = (seasonNum - 1) * 12 + 1;
      const clampedStartEpisode = Math.min(startEpisode, episodeCount);
      setSelectedEpisode(clampedStartEpisode);
    } else {
      setSelectedEpisode(1);
    }
    
    if (type === 'tv') {
      try {
        const episodesData = await tmdb.getTVEpisodes(id, seasonNum);
        setEpisodes(episodesData.episodes || []);
      } catch (error) {
        console.error('Error loading episodes:', error);
      }
    } else if (type === 'anime') {
      // For anime, try to get episodes from Jikan API
      try {
        const jikanResponse = await retry(() => jikan.getAnimeEpisodes(content.idMal || id));
        const jikanEpisodes = jikanResponse?.data || [];
        
        if (Array.isArray(jikanEpisodes) && jikanEpisodes.length > 0) {
          // Use real episode data from Jikan
          setEpisodes(jikanEpisodes.map((ep: any, index: number) => ({
            episode_number: index + 1, // Use sequential numbering instead of mal_id
            name: ep.title || `Episode ${index + 1}`,
            overview: ep.synopsis || '',
            air_date: ep.aired || '',
          })));
        } else {
          // Fallback to generated episodes
          const episodeCount = content?.episodes || 12;
          const startEpisode = (seasonNum - 1) * 12 + 1;
          const endEpisode = Math.min(startEpisode + 11, episodeCount);
          const mockEpisodes = [];
          for (let i = startEpisode; i <= endEpisode; i++) {
            mockEpisodes.push({
              episode_number: i,
              name: `Episode ${i}`,
              overview: `Episode ${i} of ${content.title}`,
            });
          }
          setEpisodes(mockEpisodes);
        }
      } catch (error) {
        console.error('Error fetching Jikan episodes for season change:', error);
        // Fallback to generated episodes
        const episodeCount = content?.episodes || 12;
        const startEpisode = (seasonNum - 1) * 12 + 1;
        const endEpisode = Math.min(startEpisode + 11, episodeCount);
        const mockEpisodes = [];
        for (let i = startEpisode; i <= endEpisode; i++) {
          mockEpisodes.push({
            episode_number: i,
            name: `Episode ${i}`,
            overview: `Episode ${i} of ${content.title}`,
          });
        }
        setEpisodes(mockEpisodes);
      }
    }
  };

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900">
        <button 
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-white hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
        <h1 className="text-lg font-semibold">{resolvedTitle}</h1>
        <div className="w-32"></div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row">
        {/* Video Player Section */}
        <div className="flex-1">
          {/* Main Video Player */}
          <div className="relative aspect-video bg-gray-900">
            {playerSrc ? (
              <iframe
                key={playerSrc}
                src={playerSrc}
                title={resolvedTitle}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Play className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Video not available</p>
                  <p className="text-gray-500 text-sm mt-2">No stream source available for the selected server</p>
                </div>
              </div>
            )}
          </div>

          {/* Server Selection (Movies) */}
          {type === 'movie' && (
            <div className="bg-gray-900 p-4 border-b border-gray-800">
              <div className="flex items-center space-x-2 mb-3">
                <Server className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Select Server:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {servers
                  .filter(server => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(server.id))
                  .map((server: any) => (
                  <button
                    key={server.id}
                    onClick={() => setSelectedServer(server.id)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      selectedServer === server.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {server.name}{server.quality ? ` (${server.quality})` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Season & Episodes (TV only) */}
          {type === 'tv' && (
            <div className="bg-gray-900 p-4 border-b border-gray-800">
              {/* Season Selector */}
              <div className="mb-4">
                <button
                  onClick={() => setShowSeasons(!showSeasons)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="font-semibold">Season {selectedSeason}</span>
                  {showSeasons ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </button>

                {showSeasons && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {seasons.map((season) => (
                      <button
                        key={season.season_number}
                        onClick={() => handleSeasonChange(season.season_number)}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedSeason === season.season_number
                            ? 'bg-primary text-white'
                            : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                      >
                        {season.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Episodes List */}
              <div>
                <h3 className="font-semibold mb-3">Episodes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                  {episodes.map((episode) => (
                    <button
                      key={episode.episode_number}
                      onClick={() => setSelectedEpisode(episode.episode_number)}
                      className={`text-left p-3 rounded-lg transition-colors ${
                        selectedEpisode === episode.episode_number
                          ? 'bg-primary text-white'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium min-w-[3rem]">
                          EP {episode.episode_number}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{episode.name}</p>
                          {episode.air_date && (
                            <p className="text-xs text-gray-400">
                              {new Date(episode.air_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Server Selection (Anime & Manga) */}
          {(type === 'anime' || type === 'manga') && (
            <div className="bg-gray-900 p-4 border-b border-gray-800">
              <div className="flex items-center space-x-2 mb-3">
                <Server className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Select Server:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {servers
                  .filter(server => {
                    if (type === 'anime') return [0, 1, 2, 5, 9, 11].includes(server.id);
                    if (type === 'manga') return [0, 5].includes(server.id);
                    return false;
                  })
                  .map((server: any) => (
                  <button
                    key={server.id}
                    onClick={() => setSelectedServer(server.id)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      selectedServer === server.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {server.name}{server.quality ? ` (${server.quality})` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Episodes List for Anime */}
          {type === 'anime' && episodes.length > 0 && (
            <div className="bg-gray-900 p-4 border-b border-gray-800">
              <h3 className="font-semibold mb-3">Episodes ({episodes.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                {episodes.map((episode) => (
                  <button
                    key={episode.episode_number}
                    onClick={() => setSelectedEpisode(episode.episode_number)}
                    className={`text-left p-3 rounded-lg transition-colors ${
                      selectedEpisode === episode.episode_number
                        ? 'bg-primary text-white'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium min-w-[3rem]">
                        EP {episode.episode_number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{episode.name}</p>
                        {episode.air_date && (
                          <p className="text-xs text-gray-400">
                            {new Date(episode.air_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chapters List for Manga */}
          {type === 'manga' && episodes.length > 0 && (
            <div className="bg-gray-900 p-4 border-b border-gray-800">
              <h3 className="font-semibold mb-3">Chapters ({episodes.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                {episodes.map((episode) => (
                  <button
                    key={episode.episode_number}
                    onClick={() => setSelectedEpisode(episode.episode_number)}
                    className={`text-left p-3 rounded-lg transition-colors ${
                      selectedEpisode === episode.episode_number
                        ? 'bg-primary text-white'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium min-w-[3rem]">
                        CH {episode.episode_number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{episode.name}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Server Selection (TV only, below episodes) */}
          {type === 'tv' && (
            <div className="bg-gray-900 p-4 border-b border-gray-800">
              <div className="flex items-center space-x-2 mb-3">
                <Server className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Select Server:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {servers
                  .filter(server => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(server.id))
                  .map((server: any) => (
                  <button
                    key={server.id}
                    onClick={() => setSelectedServer(server.id)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      selectedServer === server.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {server.name}{server.quality ? ` (${server.quality})` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Info Bar */}
          <div className="bg-gray-900 p-4 border-b border-gray-800">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  {type === 'movie' && <Film className="h-4 w-4 text-primary" />}
                  {type === 'tv' && <Tv className="h-4 w-4 text-primary" />}
                  {type === 'anime' && <Star className="h-4 w-4 text-primary" />}
                  <span className="capitalize">{type === 'tv' ? 'TV Show' : type}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{resolvedYear}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{resolvedRating?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Info */}
          <div className="p-6">
            <div className="flex gap-6">
              {resolvedPosterPath && (
                <Image
                  src={resolvedPosterPath}
                  alt={resolvedTitle}
                  width={150}
                  height={225}
                  className="rounded-lg shadow-lg flex-shrink-0"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold mb-2">{resolvedTitle}</h2>
                <p className="text-gray-300 leading-relaxed">{resolvedOverview || 'No description available.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* You May Also Like Section */}
      {recommendations.length > 0 && (
        <div className="p-6 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recommendations.map((rec: any) => (
              <ContentCard 
                key={rec.id} 
                item={type === 'anime' ? {
                  id: Number(rec.id),
                  title: String(rec?.title?.english || rec?.title?.romaji || rec?.title?.native || ''),
                  poster: rec?.coverImage?.large || rec?.coverImage?.extraLarge || '/placeholder.svg',
                  backdrop: rec?.bannerImage || '',
                  overview: rec?.description || '',
                  type: 'anime',
                  rating: typeof rec?.averageScore === 'number' ? rec.averageScore / 10 : 0,
                  year: rec?.seasonYear?.toString() || 'Unknown',
                  genres: []
                } : type === 'manga' ? {
                  id: Number(rec.id),
                  title: String(rec?.title?.english || rec?.title?.romaji || rec?.title?.native || ''),
                  poster: rec?.coverImage?.large || rec?.coverImage?.extraLarge || '/placeholder.svg',
                  backdrop: rec?.bannerImage || '',
                  overview: rec?.description || '',
                  type: 'manga',
                  rating: typeof rec?.averageScore === 'number' ? rec.averageScore / 10 : 0,
                  year: rec?.seasonYear?.toString() || 'Unknown',
                  genres: []
                } : type === 'movie' ? transformMovieToContentItem(rec) : transformTVShowToContentItem(rec)} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
