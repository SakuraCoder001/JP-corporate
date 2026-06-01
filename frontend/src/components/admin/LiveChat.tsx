'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import type { ChatConversation, ChatMessage } from '@/lib/types';

export function LiveChat() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await api<ChatConversation[]>('/admin/chat/conversations', { auth: true });
      setConversations(data);
      if (data.length && !selectedId) setSelectedId(data[0].id);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const socket = getSocket();
    socket.emit('admin:join');

    const onMessage = ({ conversationId, message }: { conversationId: string; message: ChatMessage }) => {
      setConversations((prev) => {
        const exists = prev.find((c) => c.id === conversationId);
        if (exists) {
          return prev
            .map((c) =>
              c.id === conversationId
                ? { ...c, updatedAt: message.createdAt, messages: [...c.messages, message] }
                : c,
            )
            .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
        }
        // New conversation we haven't loaded yet -> refetch.
        load();
        return prev;
      });
    };

    socket.on('chat:message', onMessage);
    return () => {
      socket.off('chat:message', onMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = conversations.find((c) => c.id === selectedId);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-xl font-bold text-slate-900">チャット監視</h2>
        <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" /> リアルタイム
        </span>
      </div>

      {loading ? (
        <p className="text-slate-400">読み込み中...</p>
      ) : (
        <div className="grid h-[32rem] gap-4 lg:grid-cols-3">
          <div className="overflow-y-auto rounded-xl border border-slate-100 bg-white">
            {conversations.length === 0 && (
              <p className="p-4 text-sm text-slate-400">会話がありません。</p>
            )}
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`block w-full border-b border-slate-50 p-4 text-left transition hover:bg-slate-50 ${
                  selectedId === c.id ? 'bg-brand-50' : ''
                }`}
              >
                <p className="font-numeric text-sm font-medium text-slate-700">{c.visitorIp || '匿名'}</p>
                <p className="truncate text-xs text-slate-400">
                  {c.messages[c.messages.length - 1]?.content || '（メッセージなし）'}
                </p>
                <p className="font-numeric text-[10px] text-slate-300">
                  {new Date(c.updatedAt).toLocaleString('ja-JP')}
                </p>
              </button>
            ))}
          </div>

          <div className="flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white lg:col-span-2">
            {!selected ? (
              <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
                会話を選択してください。
              </div>
            ) : (
              <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
                {selected.messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                        m.role === 'user'
                          ? 'rounded-br-sm bg-brand-600 text-white'
                          : 'rounded-bl-sm border border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
