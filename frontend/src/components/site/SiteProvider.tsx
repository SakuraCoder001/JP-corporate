'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { PublicSite } from '@/lib/types';
import { TrackingProvider } from '@/components/TrackingProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/sections';
import { Chatbot } from '@/components/Chatbot';

type SiteContextValue = {
  site: PublicSite | null;
  loading: boolean;
  error: string | null;
};

const SiteContext = createContext<SiteContextValue>({
  site: null,
  loading: true,
  error: null,
});

export function useSite() {
  return useContext(SiteContext);
}

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [site, setSite] = useState<PublicSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<PublicSite>('/public/site')
      .then(setSite)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="bg-uplift flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </main>
    );
  }

  if (error || !site) {
    return (
      <main className="bg-uplift flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-bold text-slate-800">サイトを読み込めませんでした</h1>
        <p className="mt-2 max-w-md text-slate-500">
          バックエンドAPI（ポート 4000）が起動しているかご確認ください。
        </p>
        {error && <p className="mt-1 text-sm text-slate-400">{error}</p>}
      </main>
    );
  }

  return (
    <SiteContext.Provider value={{ site, loading: false, error: null }}>
      <TrackingProvider>
        <Navbar companyName={site.settings.companyName} />
        <main className="min-h-screen">{children}</main>
        <Footer settings={site.settings} />
        <Chatbot />
      </TrackingProvider>
    </SiteContext.Provider>
  );
}
