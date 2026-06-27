import { Hero } from '@/components/hero';
import { FeaturedCategories } from '@/components/featured-categories';
import { FeaturedProducts } from '@/components/featured-products';
import { CtaSection } from '@/components/cta-section';

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <FeaturedProducts />
      <CtaSection />
    </>
  );
}
