# NighTour - Unified Streaming Platform

A modern, fast streaming platform that combines movies, TV shows, and anime in one beautiful interface.

## Features

🎬 **Movies** - Browse and discover the latest films
📺 **TV Shows** - Stream your favorite series  
🎌 **Anime** - Access Japanese animation content
🔍 **Universal Search** - Search across all content types
⭐ **Watchlist** - Save content for later
📱 **Responsive Design** - Works on all devices
⚡ **Fast Performance** - Built with Next.js 14

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **APIs**: 
  - TMDB (The Movie Database) for Movies & TV Shows
  - Jikan API for Anime
- **Icons**: Lucide React
- **Image Optimization**: Next.js Image

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nigntour
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Get your API keys:
   - **TMDB API Key**: Sign up at [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
   - **Jikan API**: Free to use (no key required)

5. Update `.env.local`:
```env
TMDB_API_KEY=your_tmdb_api_key_here
JIKAN_API_URL=https://api.jikan.moe/v4
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
nigntour/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── movies/         # Movies page
│   │   ├── tv-shows/       # TV shows page
│   │   ├── anime/          # Anime page
│   │   ├── watchlist/      # User watchlist
│   │   └── layout.tsx      # Root layout
│   ├── components/
│   │   ├── layout/         # Header, Footer
│   │   ├── cards/          # Content cards
│   │   ├── sections/       # Page sections
│   │   └── ui/             # UI components
│   ├── lib/
│   │   ├── api/            # API integrations
│   │   ├── store/          # State management
│   │   └── utils/          # Utility functions
│   └── types/              # TypeScript types
├── public/                 # Static assets
└── styles/                 # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## API Integration

### TMDB API
Used for movies and TV shows data including:
- Trending content
- Popular titles
- Detailed information
- Search functionality

### Jikan API  
Used for anime data including:
- Popular and trending anime
- Detailed anime information
- Search functionality

## Features Implementation

### Search Functionality
- Real-time search across movies, TV shows, and anime
- Debounced API calls for performance
- Unified search results display

### Watchlist System
- Persistent storage using Zustand with localStorage
- Add/remove items from watchlist
- Filter by content type
- Clear all functionality

### Responsive Design
- Mobile-first approach
- Grid layouts that adapt to screen size
- Touch-friendly interface
- Optimized images with Next.js Image component

## Performance Optimizations

- Image optimization with Next.js Image
- Component code splitting
- API response caching
- Debounced search
- Lazy loading for content

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes. Please ensure you have proper licenses for any content you stream.

## Support

If you encounter any issues or have questions, please open an issue on the repository.

---

**Note**: This is a demo project. For production use, ensure you comply with the terms of service of all APIs used.
