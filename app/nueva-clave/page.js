'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { createClient, supabaseConfigured, friendlyError } from '@/lib/supabase/client';

export default function NuevaClavePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    const f = new FormData(e.currentTarget);
    const password = String(f.get('password'));
    if (password.length < 8) {
      setError('La clave debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== String(f.get('password2'))) {
      setError('Las dos claves no coinciden.');
      return;
    }
    if (!supabaseConfigured) {
      setError('Esta función todavía no está conectada (falta configurar Supabase).');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(friendlyError(err));
      return;
    }
    router.push('/panel');
    router.refresh();
  }

  return (
    <>
      <Header minimal />
      <main className="auth-wrap">
        <div className="auth-card auth-card-sm stack gap-24">
          <h1 className="h2" style={{ fontSize: 36 }}>Crea tu clave nueva</h1>
          <form onSubmit={onSubmit} className="stack gap-16">
            <div className="field">
              <label htmlFor="password">Clave nueva</label>
              <input id="password" name="password" type="password" className="input" autoComplete="new-password" minLength={8} required />
            </div>
            <div className="field">
              <label htmlFor="password2">Repite la clave</label>
              <input id="password2" name="password2" type="password" className="input" autoComplete="new-password" minLength={8} required />
            </div>
            {error && <div className="alert alert-error" role="alert">{error}</div>}
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Guardando…' : 'Guardar y entrar'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
