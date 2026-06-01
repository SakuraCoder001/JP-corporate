'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import type { VisitorEvent, VisitorSession } from '@/lib/types';

export function VisitorHistory() {
  const [sessions, setSessions] = useState<VisitorSession[]>([]);
  const [selected, setSelected] = useState<VisitorSession | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await api<VisitorSession[]>('/admin/analytics/sessions', { auth: true });
      setSessions(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const socket = getSocket();
    socket.emit('admin:join');

    const onSession = (s: VisitorSession) => {
      setSessions((prev) => [{ ...s, events: [] }, ...prev].slice(0, 200));
    };
    const onEvent = (ev: VisitorEvent) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === ev.sessionId
            ? { ...s, lastSeen: ev.createdAt, events: [ev, ...(s.events || [])].slice(0, 50) }
            : s,
        ),
      );
      setSelected((cur) =>
        cur && cur.id === ev.sessionId
          ? { ...cur, events: [ev, ...(cur.events || [])] }
          : cur,
      );
    };

    socket.on('visitor:session', onSession);
    socket.on('visitor:event', onEvent);
    return () => {
      socket.off('visitor:session', onSession);
      socket.off('visitor:event', onEvent);
    };
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-xl font-bold text-slate-900">訪問者履歴</h2>
        <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" /> リアルタイム
        </span>
      </div>

      {loading ? (
        <p className="text-slate-400">読み込み中...</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white lg:col-span-3">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">都市</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">最終アクセス</th>
                  <th className="px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-3 font-numeric text-slate-700">{s.ip}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {s.city}
                      {s.country ? `, ${s.country}` : ''}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{s.email}</td>
                    <td className="px-4 py-3 font-numeric text-xs text-slate-400">
                      {new Date(s.lastSeen).toLocaleString('ja-JP')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(s)}
                        className="text-sm font-medium text-brand-600 hover:underline"
                      >
                        詳細
                      </button>
                    </td>
                  </tr>
                ))}
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      まだ訪問者がいません。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-4 lg:col-span-2">
            <h3 className="mb-3 font-bold text-slate-800">クリック・閲覧履歴</h3>
            {!selected ? (
              <p className="text-sm text-slate-400">左の「詳細」を選択してください。</p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-400">
                  {selected.ip} / {selected.city} / {selected.userAgent.slice(0, 40)}
                </p>
                <div className="max-h-96 space-y-1 overflow-y-auto">
                  {(selected.events || []).map((e) => (
                    <div key={e.id} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs font-bold ${
                          e.type === 'click' ? 'bg-accent-400/10 text-accent-500' : 'bg-brand-100 text-brand-700'
                        }`}
                      >
                        {e.type === 'click' ? 'クリック' : '閲覧'}
                      </span>
                      <span className="flex-1 truncate text-slate-700">{e.label || e.path}</span>
                      <span className="font-numeric text-xs text-slate-400">
                        {new Date(e.createdAt).toLocaleTimeString('ja-JP')}
                      </span>
                    </div>
                  ))}
                  {(!selected.events || selected.events.length === 0) && (
                    <p className="text-sm text-slate-400">イベントがありません。</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
