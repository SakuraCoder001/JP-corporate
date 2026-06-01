'use client';

import { useSite } from '@/components/site/SiteProvider';
import { Services } from '@/components/sections';

export default function ServicesPage() {
  const { site } = useSite();
  if (!site) return null;
  return <Services services={site.services} />;
}
