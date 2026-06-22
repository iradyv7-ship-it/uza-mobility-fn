import { HomeAvailableSectionLoader } from '@/components/marketing/home-available-section-loader';
import { HomeHero } from '@/components/marketing/home-hero';
import { HomePerfectFit } from '@/components/marketing/home-perfect-fit';
import { HomePromoGrid } from '@/components/marketing/home-promo-grid';
import { HomeSourceGlobally } from '@/components/marketing/home-source-globally';

export default function LandingPage() {
  return (
    <>
      <HomeHero />
      <HomeAvailableSectionLoader />
      <HomePromoGrid />
      <HomePerfectFit />
      <HomeSourceGlobally />
    </>
  );
}
