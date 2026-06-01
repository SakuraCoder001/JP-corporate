'use client';

import { useSite } from '@/components/site/SiteProvider';
import { Contact } from '@/components/sections';

export default function ContactPage() {
  const { site } = useSite();
  if (!site) return null;
  return <Contact settings={site.settings} />;
}
