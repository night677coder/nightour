import { TopRatedSection } from '@/components/sections/TopRatedSection';

export default function TopRatedPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-accent mb-8">Top Rated Content</h1>
        <TopRatedSection />
      </div>
    </div>
  );
}
