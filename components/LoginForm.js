'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient, supabaseConfigured, friendlyError } from '@/lib/supabase/client';

export default function LoginForm({ linkError = false }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    linkError ? 'El enlace ya no es válido o ya se usó. Ingresa con tu correo y clave, o pide uno nuevo.' : ''
  );

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!supabaseConfigured) {
      setError('El ingreso todavía no está conectado a la base de datos (falta configurar Supabase).');
      return;
    }
    const f = new FormData(e.currentTarget);
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({
      email: String(f.get('email')).trim(),
      password: String(f.get('password')),
    });
    setLoading(false);
    if (err) {
      setError(friendlyError(err));
      return;
    }
    router.push('/panel');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="stack gap-16">
      <div className="field">
        <label htmlFor="email">Correo</label>
        <input id="email" name="email" type="email" className="input" autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="password">Clave</label>
        <input id="password" name="password" type="password" className="input" autoComplete="current-password" required />
      </div>
      <Link href="/recuperar" style={{ fontSize: 14, alignSelf: 'flex-end' }}>¿Olvidaste tu clave?</Link>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? 'Ingresando…' : 'Ingresar'}
      </button>
    </form>
  );
}
