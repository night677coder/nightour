'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Star, Film, Tv, BookOpen } from 'lucide-react';
import { ContentItem } from '@/types';

interface ContentCardProps {
  item: ContentItem;
  href?: string;
}

export function ContentCard({ item, href }: ContentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getTypeIcon = () => {
    switch (item.type) {
      case 'movie':
        return <Film className="h-3 w-3" />;
      case 'tv':
        return <Tv className="h-3 w-3" />;
      case 'manga':
        return <BookOpen className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getRoute = () => {
    switch (item.type) {
      case 'movie':
        return 'movies';
      case 'tv':
        return 'tv-shows';
      case 'anime':
        return 'anime';
      case 'manga':
        return 'manga';
      default:
        return item.type;
    }
  };

  return (
    <Link href={href || `/${getRoute()}/${item.id}`}>
      <div
        className="content-card relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="aspect-[2/3] overflow-hidden rounded-lg">
          <img
            src={imageError ? '/placeholder.svg' : item.poster}
            alt={item.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          
          {/* Overlay */}
          <div className="content-card-overlay">
            {/* Empty overlay - buttons removed */}
          </div>
        </div>

        {/* Content Info */}
        <div className="mt-2">
          <div className="flex items-center space-x-2 mb-1">
            {getTypeIcon()}
            <h3 className="text-sm font-medium text-accent line-clamp-1">
              {item.title}
            </h3>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{item.year}</span>
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 text-yellow-500" />
              <span>{item.rating?.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Quick Info on Hover */}
        {isHovered && (
          <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-gray-900 rounded-lg shadow-xl z-10 animate-slide-up">
            <p className="text-xs text-gray-300 line-clamp-3">
              {item.overview}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
