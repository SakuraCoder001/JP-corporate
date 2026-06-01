'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export interface FieldDef {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'checkbox';
  placeholder?: string;
}

interface CrudManagerProps {
  title: string;
  endpoint: string; // e.g. /admin/content/services
  fields: FieldDef[];
  display: (item: any) => { primary: string; secondary?: string };
  defaults?: Record<string, unknown>;
}

export function CrudManager({ title, endpoint, fields, display, defaults = {} }: CrudManagerProps) {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await api<any[]>(endpoint, { auth: true });
      setItems(data);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  function startCreate() {
    const initial: Record<string, any> = { ...defaults };
    fields.forEach((f) => {
      if (!(f.name in initial)) initial[f.name] = f.type === 'checkbox' ? true : f.type === 'number' ? 0 : '';
    });
    setForm(initial);
    setEditing({ __new: true });
  }

  function startEdit(item: any) {
    const initial: Record<string, any> = {};
    fields.forEach((f) => (initial[f.name] = item[f.name] ?? (f.type === 'checkbox' ? false : '')));
    setForm(initial);
    setEditing(item);
  }

  async function save() {
    try {
      if (editing?.__new) {
        await api(endpoint, { method: 'POST', body: form, auth: true });
      } else {
        await api(`${endpoint}/${editing.id}`, { method: 'PATCH', body: form, auth: true });
      }
      setEditing(null);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function remove(id: string) {
    if (!confirm('本当に削除しますか？')) return;
    try {
      await api(`${endpoint}/${id}`, { method: 'DELETE', auth: true });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <button
          onClick={startCreate}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          + 新規追加
        </button>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

      {loading ? (
        <p className="text-slate-400">読み込み中...</p>
      ) : (
        <div className="space-y-2">
          {items.length === 0 && <p className="text-sm text-slate-400">項目がありません。</p>}
          {items.map((item) => {
            const d = display(item);
            return (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{d.primary}</p>
                  {d.secondary && <p className="truncate text-sm text-slate-400">{d.secondary}</p>}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => remove(item.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    削除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              {editing.__new ? `${title}を追加` : `${title}を編集`}
            </h3>
            <div className="space-y-3">
              {fields.map((f) => (
                <div key={f.name}>
                  <label className="mb-1 block text-sm font-medium text-slate-600">{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea
                      rows={4}
                      value={form[f.name] ?? ''}
                      placeholder={f.placeholder}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                    />
                  ) : f.type === 'checkbox' ? (
                    <input
                      type="checkbox"
                      checked={!!form[f.name]}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })}
                      className="h-5 w-5 rounded"
                    />
                  ) : (
                    <input
                      type={f.type === 'number' ? 'number' : 'text'}
                      value={form[f.name] ?? ''}
                      placeholder={f.placeholder}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [f.name]: f.type === 'number' ? Number(e.target.value) : e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                キャンセル
              </button>
              <button
                onClick={save}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
