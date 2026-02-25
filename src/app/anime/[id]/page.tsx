import AnimeDetailClient from './AnimeDetailClient';

export async function generateStaticParams() {
  return [];
}

export default function AnimeDetailPage() {
  return <AnimeDetailClient />;
}
