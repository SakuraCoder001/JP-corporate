'use client';

import Link from 'next/link';
import type {
  NewsPost,
  PortfolioItem,
  Service,
  SiteSettings,
  TeamMember,
  Testimonial,
} from '@/lib/types';
import { Icon } from './Icon';

function SectionHeading({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <p className="mb-2 text-sm font-bold uppercase tracking-widest text-brand-600">{eyebrow}</p>
      <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">{title}</h2>
      {desc && <p className="mt-3 text-slate-500">{desc}</p>}
    </div>
  );
}

export function Hero({ settings }: { settings: SiteSettings }) {
  return (
    <section id="top" className="bg-uplift relative overflow-hidden pt-32 pb-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
        <div className="animate-fade-up">
          <span className="inline-block rounded-full bg-brand-100 px-4 py-1 text-sm font-bold text-brand-700">
            {settings.tagline || 'IT Solutions'}
          </span>
          <h1 className="mt-5 text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
            {settings.heroTitle || 'テクノロジーで、明日をもっと明るく。'}
          </h1>
          <p className="mt-5 text-lg text-slate-600">{settings.heroSubtitle}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contact"
              data-track="Hero:無料相談"
              className="rounded-full bg-brand-600 px-7 py-3 font-bold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-700"
            >
              無料で相談する
            </Link>
            <Link
              href="/services"
              data-track="Hero:サービスを見る"
              className="rounded-full border border-slate-300 bg-white px-7 py-3 font-bold text-slate-700 transition hover:border-brand-400 hover:text-brand-600"
            >
              サービスを見る
            </Link>
          </div>
        </div>

        <div className="relative animate-float">
          <div className="aspect-square rounded-[2.5rem] bg-gradient-to-br from-brand-400 via-brand-500 to-accent-500 shadow-2xl shadow-brand-500/30" />
          <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-5 shadow-xl">
            <p className="font-numeric text-3xl font-bold text-brand-600">99.9%</p>
            <p className="text-sm text-slate-500">稼働率</p>
          </div>
        </div>
      </div>

      {settings.stats?.length > 0 && (
        <div className="mx-auto mt-20 grid max-w-5xl grid-cols-2 gap-6 px-6 sm:grid-cols-4">
          {settings.stats.map((s, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-white/70 p-6 text-center backdrop-blur">
              <p className="font-numeric text-4xl font-extrabold text-slate-900">
                {s.value}
                <span className="text-brand-500">{s.suffix}</span>
              </p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function About({ settings }: { settings: SiteSettings }) {
  return (
    <section className="bg-uplift py-24 pt-32">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-brand-600">About</p>
        <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">{settings.aboutTitle}</h2>
        <p className="mt-6 whitespace-pre-wrap text-lg leading-relaxed text-slate-600">{settings.aboutBody}</p>
      </div>
    </section>
  );
}

export function Services({ services }: { services: Service[] }) {
  if (!services.length) return null;
  return (
    <section className="bg-slate-50 py-24 pt-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="Services" title="提供サービス" desc="お客様の課題に合わせた最適なソリューションを提供します。" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <div
              key={s.id}
              className="group rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                <Icon name={s.icon} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Portfolio({ items }: { items: PortfolioItem[] }) {
  if (!items.length) return null;
  return (
    <section className="bg-uplift py-24 pt-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="Portfolio" title="導入実績" desc="さまざまな業界のお客様をご支援してきました。" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <article
              key={p.id}
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-lg"
            >
              <div
                className="h-44 bg-gradient-to-br from-brand-400 to-accent-400"
                style={p.imageUrl ? { backgroundImage: `url(${p.imageUrl})`, backgroundSize: 'cover' } : undefined}
              />
              <div className="p-6">
                {p.category && (
                  <span className="text-xs font-bold uppercase tracking-wide text-brand-600">{p.category}</span>
                )}
                <h3 className="mt-1 text-lg font-bold text-slate-900">{p.title}</h3>
                {p.client && <p className="text-sm text-slate-400">{p.client}</p>}
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{p.description}</p>
                {p.link && (
                  <a
                    href={p.link}
                    data-track={`実績:${p.title}`}
                    className="mt-3 inline-block text-sm font-bold text-brand-600 hover:underline"
                  >
                    詳しく見る →
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials({ items }: { items: Testimonial[] }) {
  if (!items.length) return null;
  return (
    <section className="bg-uplift py-24 pt-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="Testimonials" title="お客様の声" desc="多くのお客様から信頼をいただいています。" />
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((t) => (
            <figure key={t.id} className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm">
              <div className="mb-3 flex gap-0.5 text-amber-400">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <svg key={i} className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.5 6.8L12 17.8 5.9 20.9l1.5-6.8L2.2 8.9l6.9-.6L12 2Z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-slate-700">「{t.quote}」</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
                  {t.authorName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{t.authorName}</p>
                  <p className="text-xs text-slate-400">
                    {t.authorRole}
                    {t.company && ` / ${t.company}`}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function News({ items }: { items: NewsPost[] }) {
  if (!items.length) return null;
  return (
    <section className="bg-uplift py-24 pt-32">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading eyebrow="News" title="ニュース・お知らせ" />
        <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white">
          {items.map((n) => (
            <article key={n.id} className="flex flex-col gap-2 p-6 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:gap-6">
              <time className="font-numeric text-sm text-slate-400">
                {new Date(n.publishedAt).toLocaleDateString('ja-JP')}
              </time>
              <span className="inline-block w-fit rounded-full bg-accent-400/10 px-3 py-0.5 text-xs font-bold text-accent-500">
                {n.category}
              </span>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">{n.title}</h3>
                {n.excerpt && <p className="text-sm text-slate-500">{n.excerpt}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Team({ members }: { members: TeamMember[] }) {
  if (!members.length) return null;
  return (
    <section className="bg-slate-50 py-24 pt-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="Team" title="チーム" desc="経験豊富なプロフェッショナルが在籍しています。" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <div key={m.id} className="rounded-2xl border border-slate-100 bg-white p-7 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-accent-400 text-2xl font-black text-white">
                {m.name.charAt(0)}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{m.name}</h3>
              <p className="text-sm font-medium text-brand-600">{m.role}</p>
              {m.bio && <p className="mt-2 text-sm text-slate-500">{m.bio}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact({ settings }: { settings: SiteSettings }) {
  return (
    <section className="bg-uplift py-24 pt-32">
      <div className="mx-auto max-w-4xl px-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-accent-500 p-10 text-white shadow-2xl sm:p-14">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-black">お問い合わせ</h2>
              <p className="mt-3 text-white/80">
                プロジェクトのご相談、お見積もりなどお気軽にご連絡ください。
              </p>
              <ul className="mt-8 space-y-3 text-sm">
                {settings.email && <li>✉️ {settings.email}</li>}
                {settings.phone && (
                  <li>
                    ☎️ <span className="font-numeric">{settings.phone}</span>
                  </li>
                )}
                {settings.address && <li>📍 {settings.address}</li>}
              </ul>
            </div>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                alert('お問い合わせありがとうございます。担当者よりご連絡いたします。');
              }}
            >
              <input required placeholder="お名前" className="w-full rounded-xl border-0 px-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-white" />
              <input required type="email" placeholder="メールアドレス" className="w-full rounded-xl border-0 px-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-white" />
              <textarea required rows={4} placeholder="お問い合わせ内容" className="w-full rounded-xl border-0 px-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-white" />
              <button
                type="submit"
                data-track="フォーム:送信"
                className="w-full rounded-xl bg-white px-6 py-3 font-bold text-brand-600 transition hover:bg-slate-100"
              >
                送信する
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="border-t border-slate-100 bg-white py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <p className="text-sm text-slate-500">
          © <span className="font-numeric">{new Date().getFullYear()}</span> {settings.companyName}. All rights reserved.
        </p>
        <div className="flex gap-4 text-sm text-slate-400">
          {Object.entries(settings.socialLinks || {}).map(([k, v]) => (
            <a key={k} href={v as string} data-track={`SNS:${k}`} className="capitalize hover:text-brand-600">
              {k}
            </a>
          ))}
          <a href="/admin" className="hover:text-brand-600">
            管理
          </a>
        </div>
      </div>
    </footer>
  );
}
