import { HeroSection } from '@/components/sections/HeroSection';
import { TrendingSection } from '@/components/sections/TrendingSection';
import { ShuffleSection } from '@/components/sections/ShuffleSection';
import { CategoriesSection } from '@/components/sections/CategoriesSection';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <div className="container mx-auto px-4 py-12 space-y-16">
        <TrendingSection />
        <ShuffleSection />
        <CategoriesSection />
      </div>
    </div>
  );
}
