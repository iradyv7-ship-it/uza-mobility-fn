/**
 * Public guest/marketing routes indexed for search engines.
 * Mirrors `public/sitemap.xml` — keep both in sync when routes change.
 *
 * Dynamic vehicle detail URLs (`/vehicles/[slug]`) are not listed here;
 * update the sitemap manually or generate it before deploy when needed.
 */
// The origin search engines are told about. Read from the same variable the rest of the app
// uses for its own address, so a deployment to a new host does not keep advertising the old
// one. The literal is the fallback for local builds where the variable is not set.
export const guestSitemapOrigin = (
  process.env.NEXT_PUBLIC_APP_URL?.trim() || 'https://uzamobility.com'
).replace(/\/$/, '');

export const guestSitemapRoutes = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/vehicles', changeFrequency: 'daily', priority: 0.9 },
  { path: '/spare-parts', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/for-business', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.5 },
] as const;

/** Paths blocked in `public/robots.txt` (buyer hub, workspaces, auth, API). */
export const guestRobotsDisallow = [
  '/my/',
  '/seller/',
  '/operator/',
  '/api/',
  '/login',
  '/register',
  '/forgot-password',
  '/check-email',
  '/auth/',
  '/inquiry/',
] as const;
