import { SiteProvider } from '@/components/site/SiteProvider';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteProvider>{children}</SiteProvider>;
}
