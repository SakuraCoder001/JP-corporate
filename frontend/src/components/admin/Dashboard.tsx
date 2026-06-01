'use client';

import { useState } from 'react';
import { CrudManager, FieldDef } from './CrudManager';
import { VisitorHistory } from './VisitorHistory';
import { LiveChat } from './LiveChat';
import { RagManager } from './RagManager';
import { SettingsEditor } from './SettingsEditor';

type Tab =
  | 'settings'
  | 'services'
  | 'portfolio'
  | 'testimonials'
  | 'news'
  | 'team'
  | 'visitors'
  | 'chat'
  | 'rag';

const tabs: Array<{ id: Tab; label: string; group: string }> = [
  { id: 'settings', label: 'サイト設定', group: 'コンテンツ' },
  { id: 'services', label: 'サービス', group: 'コンテンツ' },
  { id: 'portfolio', label: '実績', group: 'コンテンツ' },
  { id: 'testimonials', label: 'お客様の声', group: 'コンテンツ' },
  { id: 'news', label: 'ニュース', group: 'コンテンツ' },
  { id: 'team', label: 'チーム', group: 'コンテンツ' },
  { id: 'visitors', label: '訪問者履歴', group: '分析' },
  { id: 'chat', label: 'チャット監視', group: '分析' },
  { id: 'rag', label: 'ナレッジ(RAG)', group: 'AI' },
];

const serviceFields: FieldDef[] = [
  { name: 'title', label: 'タイトル' },
  { name: 'description', label: '説明', type: 'textarea' },
  { name: 'icon', label: 'アイコン (cloud/cpu/code/compass/rocket/shield/chart)' },
  { name: 'order', label: '表示順', type: 'number' },
  { name: 'published', label: '公開', type: 'checkbox' },
];

const portfolioFields: FieldDef[] = [
  { name: 'title', label: 'タイトル' },
  { name: 'client', label: 'クライアント' },
  { name: 'category', label: 'カテゴリ' },
  { name: 'description', label: '説明', type: 'textarea' },
  { name: 'imageUrl', label: '画像URL' },
  { name: 'link', label: 'リンク' },
  { name: 'order', label: '表示順', type: 'number' },
  { name: 'published', label: '公開', type: 'checkbox' },
];

const testimonialFields: FieldDef[] = [
  { name: 'authorName', label: '名前' },
  { name: 'authorRole', label: '役職' },
  { name: 'company', label: '会社' },
  { name: 'quote', label: 'コメント', type: 'textarea' },
  { name: 'rating', label: '評価 (1-5)', type: 'number' },
  { name: 'order', label: '表示順', type: 'number' },
  { name: 'published', label: '公開', type: 'checkbox' },
];

const newsFields: FieldDef[] = [
  { name: 'title', label: 'タイトル' },
  { name: 'category', label: 'カテゴリ' },
  { name: 'excerpt', label: '概要', type: 'textarea' },
  { name: 'body', label: '本文', type: 'textarea' },
  { name: 'coverUrl', label: 'カバー画像URL' },
  { name: 'published', label: '公開', type: 'checkbox' },
];

const teamFields: FieldDef[] = [
  { name: 'name', label: '名前' },
  { name: 'role', label: '役職' },
  { name: 'bio', label: '紹介', type: 'textarea' },
  { name: 'photoUrl', label: '写真URL' },
  { name: 'order', label: '表示順', type: 'number' },
  { name: 'published', label: '公開', type: 'checkbox' },
];

export function Dashboard({ adminName, onLogout }: { adminName: string; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('settings');
  const groups = Array.from(new Set(tabs.map((t) => t.group)));

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 font-black text-white">
            S
          </span>
          <span className="font-black text-slate-900">管理画面</span>
        </div>
        {groups.map((g) => (
          <div key={g} className="mb-4">
            <p className="px-2 pb-1 text-xs font-bold uppercase tracking-wide text-slate-400">{g}</p>
            {tabs
              .filter((t) => t.group === g)
              .map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`mb-0.5 block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                    tab === t.id ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
          </div>
        ))}
        <div className="mt-auto border-t border-slate-100 pt-3">
          <p className="px-2 text-xs text-slate-400">{adminName}</p>
          <button onClick={onLogout} className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50">
            ログアウト
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 md:hidden">
          <select
            value={tab}
            onChange={(e) => setTab(e.target.value as Tab)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {tabs.map((t) => (
              <option key={t.id} value={t.id}>
                {t.group} / {t.label}
              </option>
            ))}
          </select>
          <button onClick={onLogout} className="text-sm font-medium text-red-600">
            ログアウト
          </button>
        </header>

        <main className="mx-auto max-w-5xl p-6">
          {tab === 'settings' && <SettingsEditor />}
          {tab === 'services' && (
            <CrudManager
              title="サービス"
              endpoint="/admin/content/services"
              fields={serviceFields}
              defaults={{ icon: 'sparkles', order: 0, published: true }}
              display={(i) => ({ primary: i.title, secondary: i.description })}
            />
          )}
          {tab === 'portfolio' && (
            <CrudManager
              title="実績"
              endpoint="/admin/content/portfolio"
              fields={portfolioFields}
              defaults={{ order: 0, published: true }}
              display={(i) => ({ primary: i.title, secondary: `${i.category} / ${i.client}` })}
            />
          )}
          {tab === 'testimonials' && (
            <CrudManager
              title="お客様の声"
              endpoint="/admin/content/testimonials"
              fields={testimonialFields}
              defaults={{ rating: 5, order: 0, published: true }}
              display={(i) => ({ primary: i.authorName, secondary: i.quote })}
            />
          )}
          {tab === 'news' && (
            <CrudManager
              title="ニュース"
              endpoint="/admin/content/news"
              fields={newsFields}
              defaults={{ category: 'News', published: true }}
              display={(i) => ({ primary: i.title, secondary: i.category })}
            />
          )}
          {tab === 'team' && (
            <CrudManager
              title="チーム"
              endpoint="/admin/content/team"
              fields={teamFields}
              defaults={{ order: 0, published: true }}
              display={(i) => ({ primary: i.name, secondary: i.role })}
            />
          )}
          {tab === 'visitors' && <VisitorHistory />}
          {tab === 'chat' && <LiveChat />}
          {tab === 'rag' && <RagManager />}
        </main>
      </div>
    </div>
  );
}
