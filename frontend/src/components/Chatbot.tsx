'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import type { ChatMessage } from '@/lib/types';
import { useTracking } from './TrackingProvider';

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { sessionId } = useTracking();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  async function ensureConversation(): Promise<string | null> {
    if (conversationId) return conversationId;
    try {
      const conv = await api<{ id: string }>('/chat/start', {
        method: 'POST',
        body: { sessionId },
      });
      setConversationId(conv.id);
      setMessages([
        {
          id: 'welcome',
          conversationId: conv.id,
          role: 'assistant',
          content: 'こんにちは！Sakura TechのAIアシスタントです。サービスについて何でもお尋ねください。',
          createdAt: new Date().toISOString(),
        },
      ]);
      return conv.id;
    } catch {
      return null;
    }
  }

  async function handleOpen() {
    setOpen(true);
    await ensureConversation();
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const convId = await ensureConversation();
    if (!convId) return;

    const userMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      conversationId: convId,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const reply = await api<ChatMessage>(`/chat/${convId}/message`, {
        method: 'POST',
        body: { message: text },
      });
      setMessages((prev) => [...prev, reply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          conversationId: convId,
          role: 'assistant',
          content: '申し訳ありません、エラーが発生しました。',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={handleOpen}
          data-track="チャットを開く"
          className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-xl shadow-brand-500/30 transition hover:scale-105"
          aria-label="チャットを開く"
        >
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[32rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-gradient-to-r from-brand-600 to-accent-500 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-bold">AIアシスタント</p>
              <p className="text-xs opacity-80">通常すぐに返信します</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="閉じる" className="text-white/80 hover:text-white">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    m.role === 'user'
                      ? 'rounded-br-sm bg-brand-600 text-white'
                      : 'rounded-bl-sm border border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-slate-200 bg-white p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="メッセージを入力..."
              className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <button
              onClick={send}
              disabled={loading}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-50"
              aria-label="送信"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
