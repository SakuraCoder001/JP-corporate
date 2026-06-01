'use client';

import { useEffect, useState } from 'react';
import { api, getToken, clearToken } from '@/lib/api';
import { LoginForm } from '@/components/admin/LoginForm';
import { Dashboard } from '@/components/admin/Dashboard';

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [adminName, setAdminName] = useState('');

  async function check() {
    if (!getToken()) {
      setAuthed(false);
      return;
    }
    try {
      const me = await api<{ name: string }>('/auth/me', { auth: true });
      setAdminName(me.name);
      setAuthed(true);
    } catch {
      clearToken();
      setAuthed(false);
    }
  }

  useEffect(() => {
    check();
  }, []);

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (!authed) {
    return <LoginForm onSuccess={check} />;
  }

  return (
    <Dashboard
      adminName={adminName}
      onLogout={() => {
        clearToken();
        setAuthed(false);
      }}
    />
  );
}
