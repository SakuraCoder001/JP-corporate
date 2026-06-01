'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const links = [
  { href: '/about', label: '私たちについて' },
  { href: '/services', label: 'サービス' },
  { href: '/portfolio', label: '実績' },
  { href: '/testimonials', label: 'お客様の声' },
  { href: '/news', label: 'ニュース' },
  { href: '/team', label: 'チーム' },
  { href: '/contact', label: 'お問い合わせ' },
];

export function Navbar({ companyName }: { companyName: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkClass = (href: string) =>
    `text-sm font-medium transition ${
      pathname === href ? 'text-brand-600' : 'text-slate-600 hover:text-brand-600'
    }`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all ${
        scrolled || pathname !== '/' ? 'bg-white/90 shadow-sm backdrop-blur' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" data-track="ロゴ" className="flex items-center gap-2 text-lg font-black text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
            S
          </span>
          {companyName}
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} data-track={`ナビ:${l.label}`} className={linkClass(l.href)}>
              {l.label}
            </Link>
          ))}
          <Link
            href="/contact"
            data-track="CTA:お問い合わせ"
            className="rounded-full bg-brand-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-brand-500/30 transition hover:bg-brand-700"
          >
            無料相談
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="メニュー">
          <svg className="h-6 w-6 text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div className="space-y-1 border-t border-slate-100 bg-white px-6 py-3 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              data-track={`ナビ:${l.label}`}
              className={`block py-2 text-sm font-medium ${pathname === l.href ? 'text-brand-600' : 'text-slate-700'}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
