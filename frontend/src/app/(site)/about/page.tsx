'use client';

import { useSite } from '@/components/site/SiteProvider';
import { About } from '@/components/sections';

export default function AboutPage() {
  const { site } = useSite();
  if (!site) return null;
  return <About settings={site.settings} />;
}
