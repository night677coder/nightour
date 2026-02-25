'use client';

import { useEffect, useState } from 'react';
import { Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ContentCard } from '@/components/cards/ContentCard';
import { ContentItem } from '@/types';

export default function ContinueWatchingPage() {
  const [watchHistory, setWatchHistory] = useState<ContentItem[]>([]);

  useEffect(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('watch-history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Normalize titles for anime (which may be objects)
        const normalized = parsed.map((item: any) => ({
          ...item,
          title: typeof item.title === 'object' && item.title !== null
            ? item.title.english || item.title.romaji || item.title.native || 'Unknown'
            : item.title || 'Unknown',
        })).filter((item: any) => item.type !== 'youtube');
        setWatchHistory(normalized);
      } catch {
        setWatchHistory([]);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-secondary text-accent pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link
            href="/"
            className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center space-x-2">
            <Clock className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Continue Watching</h1>
          </div>
        </div>

        {watchHistory.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {watchHistory.map((item) => (
              <ContentCard key={item.id} item={item} href={`/watch/${item.type}/${item.id}`} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No watch history yet</h2>
            <p className="text-gray-400 mb-6">
              Start watching movies, TV shows, or anime to see them here.
            </p>
            <Link href="/" className="btn-primary">
              Browse Content
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
