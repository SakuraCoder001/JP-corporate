'use client';

import { useSite } from '@/components/site/SiteProvider';
import { Testimonials } from '@/components/sections';

export default function TestimonialsPage() {
  const { site } = useSite();
  if (!site) return null;
  return <Testimonials items={site.testimonials} />;
}
