'use client';

import { useSite } from '@/components/site/SiteProvider';
import { Portfolio } from '@/components/sections';

export default function PortfolioPage() {
  const { site } = useSite();
  if (!site) return null;
  return <Portfolio items={site.portfolio} />;
}
