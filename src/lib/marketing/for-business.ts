import { vehiclesHref } from '@/lib/marketing/vehicles-url';

export type ForBusinessIndustryCard = {
  title: string;
  description: string;
  cta: string;
  href: string;
  categorySlug: string;
};

export const FOR_BUSINESS_INDUSTRY_CARDS: Omit<
  ForBusinessIndustryCard,
  'href'
>[] = [
  {
    title: 'Logistics & Delivery',
    description:
      'Cargo vans, 3-wheelers, and electric motorbikes optimized for last-mile efficiency',
    cta: 'Explore Cargo',
    categorySlug: 'commercial-ev',
  },
  {
    title: 'Passenger & Transit',
    description:
      'High-durability electric sedans and SUVs built for ride-hailing and continuous daily transit.',
    cta: 'Explore Transit',
    categorySlug: 'passenger-ev',
  },
  {
    title: 'Executive Transport',
    description:
      'Premium, long-range electric vehicles for corporate management and executive travel.',
    cta: 'Explore Executive',
    categorySlug: 'passenger-ev',
  },
];

export function forBusinessIndustryHref(
  card: Pick<ForBusinessIndustryCard, 'categorySlug'>,
) {
  return vehiclesHref({
    category: card.categorySlug,
  });
}

export const VEHICLE_CATEGORY_TYPES_FOR_FLEET = [
  'PASSENGER_EV',
  'TWO_THREE_WHEEL',
  'COMMERCIAL_EV',
] as const;
