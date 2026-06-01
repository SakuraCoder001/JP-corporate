import type { Metadata } from 'next';
import { Noto_Sans_JP, Montserrat } from 'next/font/google';
import './globals.css';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sakura Tech | 未来を創るITソリューション',
  description: 'クラウド・AI・Web開発で企業のデジタル変革を支援する日本のIT企業。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${montserrat.variable}`}>
      <body className="font-sans antialiased text-slate-900">{children}</body>
    </html>
  );
}
