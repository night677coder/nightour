import Link from 'next/link';
import { Film, Tv, Star, Play, Clock, TrendingUp, BookOpen, Award, Music } from 'lucide-react';

export function CategoriesSection() {
  const categories = [
    {
      title: 'Movies',
      description: 'Blockbuster films and indie favorites',
      icon: Film,
      href: '/movies',
      color: 'from-red-600 to-red-800',
    },
    {
      title: 'TV Shows',
      description: 'Binge-worthy series and classics',
      icon: Tv,
      href: '/tv-shows',
      color: 'from-blue-600 to-blue-800',
    },
    {
      title: 'Anime',
      description: 'Japanese animation and manga',
      icon: Star,
      href: '/anime',
      color: 'from-purple-600 to-purple-800',
    },
    {
      title: 'Manga',
      description: 'Read popular manga and explore genres',
      icon: BookOpen,
      href: '/manga',
      color: 'from-indigo-600 to-indigo-800',
    },
    {
      title: 'Music',
      description: 'Discover and stream music tracks',
      icon: Music,
      href: '/music',
      color: 'from-cyan-600 to-cyan-800',
    },
    {
      title: 'Top Rated',
      description: 'Highest rated content from IMDb',
      icon: Award,
      href: '/top-rated',
      color: 'from-yellow-600 to-yellow-800',
    },
    {
      title: 'Continue Watching',
      description: 'Pick up where you left off',
      icon: Clock,
      href: '/continue-watching',
      color: 'from-green-600 to-green-800',
    },
    {
      title: 'Trending Now',
      description: 'Most popular this week',
      icon: TrendingUp,
      href: '/trending',
      color: 'from-orange-600 to-orange-800',
    },
    {
      title: 'Watchlist',
      description: 'Your saved content',
      icon: Play,
      href: '/watchlist',
      color: 'from-pink-600 to-pink-800',
    },
  ];

  return (
    <section>
      <h2 className="text-2xl font-bold text-accent mb-8">Browse Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.title}
              href={category.href}
              className="group relative overflow-hidden rounded-lg bg-gray-800 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90`} />
              <div className="relative p-6 text-white">
                <Icon className="h-8 w-8 mb-4" />
                <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                <p className="text-gray-200 text-sm">{category.description}</p>
                <div className="mt-4 flex items-center text-sm font-medium">
                  <span>Explore</span>
                  <Play className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
