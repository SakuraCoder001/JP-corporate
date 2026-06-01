'use client';

import { useSite } from '@/components/site/SiteProvider';
import { News } from '@/components/sections';

export default function NewsPage() {
  const { site } = useSite();
  if (!site) return null;
  return <News items={site.news} />;
}
