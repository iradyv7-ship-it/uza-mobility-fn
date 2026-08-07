import { VehiclesPageAsync } from '@/components/marketing/vehicles-page-async';

type VehiclesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function VehiclesPage({
  searchParams,
}: VehiclesPageProps) {
  const raw = await searchParams;
  return <VehiclesPageAsync rawSearchParams={raw} />;
}
