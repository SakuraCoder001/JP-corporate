'use client';

import { useSite } from '@/components/site/SiteProvider';
import { Hero } from '@/components/sections';

/** Home — hero only */
export default function HomePage() {
  const { site } = useSite();
  if (!site) return null;
  return <Hero settings={site.settings} />;
}
