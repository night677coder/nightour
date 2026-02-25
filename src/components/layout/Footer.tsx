'use client';

import Link from 'next/link';
import { PlayCircle, Github } from 'lucide-react';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export function Footer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-16">
          {/* Logo and Description - full width on mobile */}
          <div className="col-span-2 md:col-span-5">
            <div className="flex items-center space-x-2 mb-4">
                <span className="text-xl font-bold text-accent inline-flex items-center">
                <span>NighT</span>
                <PlayCircle className="h-5 w-5 text-primary mx-0.5" aria-hidden="true" />
                <span>ur</span>
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              Your ultimate streaming destination for movies, TV shows, anime, and manga. 
              Discover and watch your favorite content all in one place.
            </p>
            <div className="flex space-x-4 items-center">
              <a href="https://github.com/night677coder" className="text-gray-400 hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              {mounted && (
                <div className="ml-2">
                  <div id="google_translate_element"></div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 md:col-span-3 md:pl-14">
            <h3 className="text-white font-semibold mb-4">Browse</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-400 hover:text-primary transition-colors">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/movies" className="text-gray-400 hover:text-primary transition-colors">
                  Movies
                </Link>
              </li>
              <li>
                <Link href="/tv-shows" className="text-gray-400 hover:text-primary transition-colors">
                  TV Shows
                </Link>
              </li>
              <li>
                <Link href="/anime" className="text-gray-400 hover:text-primary transition-colors">
                  Anime
                </Link>
              </li>
              <li>
                <Link href="/manga" className="text-gray-400 hover:text-primary transition-colors">
                  Manga
                </Link>
              </li>
              <li>
                <Link href="/watchlist" className="text-gray-400 hover:text-primary transition-colors">
                  My Watchlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Languages */}
          <div className="col-span-1 md:col-span-4 md:pl-6">
            <div className="mb-4">
              <h3 className="text-white font-semibold inline">
                <a href="https://movierulz-silk.vercel.app/" className="hover:text-primary transition-colors">
                  moviedot
                </a>
              </h3>
            </div>
            <ul className="space-y-2">
              <li>
                <a href="https://movierulz-silk.vercel.app/c/telugu?page=1" className="text-gray-400 hover:text-primary transition-colors">
                  Telugu
                </a>
              </li>
              <li>
                <a href="https://movierulz-silk.vercel.app/c/hindi?page=1" className="text-gray-400 hover:text-primary transition-colors">
                  Hindi
                </a>
              </li>
              <li>
                <a href="https://movierulz-silk.vercel.app/c/tamil?page=1" className="text-gray-400 hover:text-primary transition-colors">
                  Tamil
                </a>
              </li>
              <li>
                <a href="https://movierulz-silk.vercel.app/c/malayalam?page=1" className="text-gray-400 hover:text-primary transition-colors">
                  Malayalam
                </a>
              </li>
              <li>
                <a href="https://movierulz-silk.vercel.app/c/english?page=1" className="text-gray-400 hover:text-primary transition-colors">
                  English
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            <span className="inline-flex items-center">
              <span>© 2025 NighT</span>
              <PlayCircle className="h-4 w-4 text-primary mx-0.5" aria-hidden="true" />
              <span>ur. All rights reserved.</span>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
