/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    domains: ['image.tmdb.org', 's4.anilist.co'],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_TMDB_API_KEY: process.env.NEXT_PUBLIC_TMDB_API_KEY,
  },
  basePath: '/nightour',
  assetPrefix: '/nightour/',
  trailingSlash: true,
}

module.exports = nextConfig
