'use client';

import { useSite } from '@/components/site/SiteProvider';
import { Team } from '@/components/sections';

export default function TeamPage() {
  const { site } = useSite();
  if (!site) return null;
  return <Team members={site.team} />;
}
