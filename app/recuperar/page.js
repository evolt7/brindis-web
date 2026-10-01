'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { createClient, supabaseConfigured, siteUrl, friendlyError } from '@/lib/supabase/client';

export default function RecuperarPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!supabaseConfigured) {
      setError('Esta función todavía no está conectada (falta configurar Supabase).');
      return;
    }
    const f = new FormData(e.currentTarget);
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(String(f.get('email')).trim(), {
      redirectTo: `${siteUrl()}/auth/callback?next=/nueva-clave`,
    });
    setLoading(false);
    if (err && (err.message || '').toLowerCase().includes('rate')) {
      setError(friendlyError(err));
      return;
    }
    setSent(true);
  }

  return (
    <>
      <Header minimal />
      <main className="auth-wrap">
        <div className="auth-card auth-card-sm stack gap-24">
          <div className="stack gap-8">
            <h1 className="h2" style={{ fontSize: 36 }}>Recupera tu clave</h1>
            <p className="body">Te enviaremos un enlace para crear una clave nueva.</p>
          </div>
          {sent ? (
            <div className="alert alert-ok" role="status">
              Si existe una cuenta con ese correo, te llegará un enlace en unos minutos. Revisa también la carpeta de spam.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="stack gap-16">
              <div className="field">
                <label htmlFor="email">Correo de tu cuenta</label>
                <input id="email" name="email" type="email" className="input" autoComplete="email" required />
              </div>
              {error && <div className="alert alert-error" role="alert">{error}</div>}
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Enviando…' : 'Enviar enlace'}
              </button>
            </form>
          )}
          <p className="body" style={{ textAlign: 'center', fontSize: 15 }}>
            <Link href="/ingresar">Volver a ingresar</Link>
          </p>
        </div>
      </main>
    </>
  );
}
