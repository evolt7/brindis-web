'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient, supabaseConfigured, siteUrl, friendlyError } from '@/lib/supabase/client';
import { CITIES, VENDOR_CATEGORIES } from '@/lib/config';

export default function SignupProveedor() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    const f = new FormData(e.currentTarget);
    const password = String(f.get('password') || '');
    if (password.length < 8) {
      setError('La clave debe tener al menos 8 caracteres.');
      return;
    }
    if (!supabaseConfigured) {
      setError('El registro todavía no está conectado a la base de datos (falta configurar Supabase).');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signUp({
      email: String(f.get('email')).trim(),
      password,
      options: {
        emailRedirectTo: `${siteUrl()}/auth/callback?next=/panel`,
        data: {
          role: 'proveedor',
          full_name: String(f.get('full_name')).trim(),
          phone: String(f.get('phone') || '').trim(),
          business_name: String(f.get('business_name')).trim(),
          category: f.get('category'),
          vendor_city: f.get('vendor_city'),
          social: String(f.get('social') || '').trim(),
          price_from: String(f.get('price_from') || '').trim(),
          description: String(f.get('description') || '').trim(),
          accepted_terms_at: new Date().toISOString(),
        },
      },
    });
    setLoading(false);
    if (err) {
      setError(friendlyError(err));
      return;
    }
    if (data.session) {
      router.push('/panel');
      router.refresh();
    } else {
      router.push('/revisa-tu-correo');
    }
  }

  return (
    <form onSubmit={onSubmit} className="stack gap-20">
      <fieldset className="form-grid" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="h3" style={{ marginBottom: 12 }}>Tu negocio</legend>
        <div className="field span-2">
          <label htmlFor="business_name">Nombre del negocio</label>
          <input id="business_name" name="business_name" className="input" autoComplete="organization" required />
        </div>
        <div className="field">
          <label htmlFor="category">Categoría</label>
          <select id="category" name="category" className="select" defaultValue="" required>
            <option value="" disabled>Elige una</option>
            {VENDOR_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="vendor_city">Ciudad donde trabajas</label>
          <select id="vendor_city" name="vendor_city" className="select" defaultValue="Quito y valles">
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="social">Instagram o página web</label>
          <input id="social" name="social" className="input" placeholder="@tunegocio" />
        </div>
        <div className="field">
          <label htmlFor="price_from">Precio desde (USD, opcional)</label>
          <input id="price_from" name="price_from" className="input" inputMode="decimal" placeholder="Ej. 500" />
        </div>
        <div className="field span-2">
          <label htmlFor="description">Cuéntanos qué ofreces (opcional)</label>
          <textarea id="description" name="description" className="textarea" maxLength={600} placeholder="Tipo de servicio, capacidad, zonas donde trabajas…" />
        </div>
      </fieldset>

      <div className="divider" />

      <fieldset className="form-grid" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="h3" style={{ marginBottom: 12 }}>Persona de contacto</legend>
        <div className="field span-2">
          <label htmlFor="full_name">Nombre y apellido</label>
          <input id="full_name" name="full_name" className="input" autoComplete="name" required />
        </div>
        <div className="field">
          <label htmlFor="email">Correo</label>
          <input id="email" name="email" type="email" className="input" autoComplete="email" required />
        </div>
        <div className="field">
          <label htmlFor="phone">WhatsApp</label>
          <input id="phone" name="phone" type="tel" className="input" autoComplete="tel" placeholder="09XXXXXXXX" required />
        </div>
        <div className="field span-2">
          <label htmlFor="password">Crea una clave</label>
          <input id="password" name="password" type="password" className="input" autoComplete="new-password" minLength={8} required />
          <span className="hint">Mínimo 8 caracteres.</span>
        </div>
      </fieldset>

      <label className="check">
        <input type="checkbox" name="terms" required />
        <span>
          Acepto los <Link href="/terminos" target="_blank">términos de uso</Link> y la{' '}
          <Link href="/privacidad" target="_blank">política de privacidad</Link>.
        </span>
      </label>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? 'Registrando tu negocio…' : 'Registrar mi negocio'}
      </button>
    </form>
  );
}
