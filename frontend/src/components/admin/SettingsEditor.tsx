'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { SiteSettings } from '@/lib/types';

const textFields: Array<{ name: keyof SiteSettings; label: string; area?: boolean }> = [
  { name: 'companyName', label: '会社名' },
  { name: 'tagline', label: 'タグライン' },
  { name: 'heroTitle', label: 'ヒーロー見出し' },
  { name: 'heroSubtitle', label: 'ヒーロー説明', area: true },
  { name: 'aboutTitle', label: 'About 見出し' },
  { name: 'aboutBody', label: 'About 本文', area: true },
  { name: 'email', label: 'メール' },
  { name: 'phone', label: '電話番号' },
  { name: 'address', label: '住所' },
  { name: 'accentColor', label: 'アクセントカラー' },
];

export function SettingsEditor() {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [statsText, setStatsText] = useState('[]');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api<SiteSettings>('/admin/content/settings', { auth: true }).then((s) => {
      setSettings(s);
      setStatsText(JSON.stringify(s.stats ?? [], null, 2));
      setLoading(false);
    });
  }, []);

  async function save() {
    setMessage('');
    let stats;
    try {
      stats = JSON.parse(statsText);
    } catch {
      setMessage('統計データのJSONが不正です。');
      return;
    }
    const { id, ...rest } = settings as SiteSettings;
    void id;
    try {
      await api('/admin/content/settings', { method: 'PUT', body: { ...rest, stats }, auth: true });
      setMessage('保存しました。');
    } catch (e) {
      setMessage(`エラー: ${(e as Error).message}`);
    }
  }

  if (loading) return <p className="text-slate-400">読み込み中...</p>;

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-slate-900">サイト設定</h2>
      <div className="grid gap-4 rounded-xl border border-slate-100 bg-white p-5 md:grid-cols-2">
        {textFields.map((f) => (
          <div key={f.name} className={f.area ? 'md:col-span-2' : ''}>
            <label className="mb-1 block text-sm font-medium text-slate-600">{f.label}</label>
            {f.area ? (
              <textarea
                rows={3}
                value={(settings[f.name] as string) ?? ''}
                onChange={(e) => setSettings({ ...settings, [f.name]: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            ) : (
              <input
                value={(settings[f.name] as string) ?? ''}
                onChange={(e) => setSettings({ ...settings, [f.name]: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            )}
          </div>
        ))}
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-600">統計データ (JSON)</label>
          <textarea
            rows={6}
            value={statsText}
            onChange={(e) => setStatsText(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={save} className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700">
          保存
        </button>
        {message && <span className="text-sm text-slate-500">{message}</span>}
      </div>
    </div>
  );
}
