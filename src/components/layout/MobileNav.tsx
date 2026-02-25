'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, Tv, Star, BookOpen, Home, Headphones } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/movies', icon: Film, label: 'Movies' },
    { href: '/tv-shows', icon: Tv, label: 'TV Shows' },
    { href: '/anime', icon: Star, label: 'Anime' },
    { href: '/manga', icon: BookOpen, label: 'Manga' },
    { href: '/music', icon: Headphones, label: 'Music' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur-sm border-t border-gray-700">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-primary'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
