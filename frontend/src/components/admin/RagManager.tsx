'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { RagDocument } from '@/lib/types';

export function RagManager() {
  const [docs, setDocs] = useState<RagDocument[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    try {
      const data = await api<RagDocument[]>('/admin/rag/documents', { auth: true });
      setDocs(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function syncCms() {
    setSaving(true);
    setMessage('');
    try {
      const res = await api<RagDocument & { warning?: string }>('/admin/rag/sync', {
        method: 'POST',
        auth: true,
      });
      setMessage(
        res.warning
          ? `同期しました（注意: ${res.warning}）`
          : `CMSから再同期しました（${res.chunks} チャンク）`,
      );
      await load();
    } catch (e) {
      setMessage(`エラー: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  }

  async function add() {
    if (!content.trim()) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await api<RagDocument & { warning?: string }>('/admin/rag/documents', {
        method: 'POST',
        body: { title, content },
        auth: true,
      });
      setMessage(res.warning ? `保存しました（注意: ${res.warning}）` : `保存しました（${res.chunks} チャンク）`);
      setTitle('');
      setContent('');
      await load();
    } catch (e) {
      setMessage(`エラー: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('このドキュメントを削除しますか？')) return;
    await api(`/admin/rag/documents/${id}`, { method: 'DELETE', auth: true });
    await load();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900">ナレッジベース (RAG)</h2>
        <button
          onClick={syncCms}
          disabled={saving}
          className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700 transition hover:bg-brand-100 disabled:opacity-50"
        >
          CMSから再同期（チーム・CEOなど）
        </button>
      </div>

      <div className="mb-6 rounded-xl border border-slate-100 bg-white p-5">
        <h3 className="mb-3 font-bold text-slate-800">ドキュメントを追加</h3>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトル（例：料金プラン）"
          className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          placeholder="チャットボットに学習させたい情報を入力（会社情報、FAQ、料金など）"
          className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={add}
            disabled={saving}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? '埋め込み生成中...' : '追加して学習'}
          </button>
          {message && <span className="text-sm text-slate-500">{message}</span>}
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400">読み込み中...</p>
      ) : (
        <div className="space-y-2">
          {docs.length === 0 && <p className="text-sm text-slate-400">ドキュメントがありません。</p>}
          {docs.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">{d.title}</p>
                <p className="truncate text-sm text-slate-400">{d.content.slice(0, 80)}...</p>
                <p className="font-numeric text-xs text-slate-300">{d.chunks} チャンク</p>
              </div>
              <button
                onClick={() => remove(d.id)}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                削除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
