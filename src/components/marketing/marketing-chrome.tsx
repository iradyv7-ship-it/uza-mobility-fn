'use client';

import { usePathname } from 'next/navigation';
import {
  MarketingCatalogProvider,
  useMarketingCategories,
} from '@/components/marketing/marketing-catalog-context';
import { MarketingFooter } from '@/components/marketing/footer';
import { MarketingNavbar } from '@/components/marketing/navbar';
import {
  buildMarketingFooterColumns,
  buildMarketingNav,
} from '@/lib/marketing/marketing-catalog-nav';
import { usesLightNavTone } from '@/lib/marketing/nav-overlay';

type MarketingChromeProps = {
  children: React.ReactNode;
  overlayNav?: boolean;
};

function MarketingChromeInner({ children, overlayNav }: MarketingChromeProps) {
  const categories = useMarketingCategories();
  const pathname = usePathname();
  const navItems = buildMarketingNav(categories);
  const footerColumns = buildMarketingFooterColumns(categories);
  const overlay = overlayNav ?? !usesLightNavTone(pathname);

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden">
      <div className="relative flex flex-1 flex-col">
        <MarketingNavbar overlay={overlay} navItems={navItems} />
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
      <MarketingFooter columns={footerColumns} />
    </div>
  );
}

export function MarketingChrome({
  children,
  overlayNav,
}: MarketingChromeProps) {
  return (
    <MarketingCatalogProvider>
      <MarketingChromeInner overlayNav={overlayNav}>
        {children}
      </MarketingChromeInner>
    </MarketingCatalogProvider>
  );
}
