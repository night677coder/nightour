'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, Menu, X, PlayCircle, Tv, Film, Star, BookOpen, Music } from 'lucide-react';
import { SearchBar } from '../ui/SearchBar';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-secondary to-transparent">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-accent inline-flex items-center">
              <span>NighT</span>
              <PlayCircle className="h-6 w-6 text-primary mx-0.5" aria-hidden="true" />
              <span>ur</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/movies" className="flex items-center space-x-2 hover:text-primary transition-colors">
              <Film className="h-4 w-4" />
              <span>Movies</span>
            </Link>
            <Link href="/tv-shows" className="flex items-center space-x-2 hover:text-primary transition-colors">
              <Tv className="h-4 w-4" />
              <span>TV Shows</span>
            </Link>
            <Link href="/anime" className="flex items-center space-x-2 hover:text-primary transition-colors">
              <Star className="h-4 w-4" />
              <span>Anime</span>
            </Link>
            <Link href="/manga" className="flex items-center space-x-2 hover:text-primary transition-colors">
              <BookOpen className="h-4 w-4" />
              <span>Manga</span>
            </Link>
            <Link href="/song" className="flex items-center space-x-2 hover:text-primary transition-colors">
              <Music className="h-4 w-4" />
              <span>Song Life</span>
            </Link>
          </nav>

          {/* Search and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:text-primary transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:text-primary transition-colors"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4 animate-slide-up">
            <SearchBar onClose={() => setIsSearchOpen(false)} />
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-700 animate-slide-up">
            <div className="flex flex-col space-y-4">
              <Link
                href="/movies"
                className="flex items-center space-x-2 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Film className="h-4 w-4" />
                <span>Movies</span>
              </Link>
              <Link
                href="/tv-shows"
                className="flex items-center space-x-2 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Tv className="h-4 w-4" />
                <span>TV Shows</span>
              </Link>
              <Link
                href="/anime"
                className="flex items-center space-x-2 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Star className="h-4 w-4" />
                <span>Anime</span>
              </Link>
              <Link
                href="/manga"
                className="flex items-center space-x-2 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <BookOpen className="h-4 w-4" />
                <span>Manga</span>
              </Link>
              <Link
                href="/song"
                className="flex items-center space-x-2 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Music className="h-4 w-4" />
                <span>Song Life</span>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
