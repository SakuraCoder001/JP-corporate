import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '管理画面 | Sakura Tech',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-100">{children}</div>;
}
