'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient, supabaseConfigured, siteUrl, friendlyError } from '@/lib/supabase/client';
import { EVENT_TYPES, CITIES, GUEST_RANGES, BUDGET_RANGES } from '@/lib/config';

export default function SignupPareja({ initial = {} }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [noDate, setNoDate] = useState(false);

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
          role: 'pareja',
          full_name: String(f.get('full_name')).trim(),
          phone: String(f.get('phone') || '').trim(),
          whatsapp_opt_in: f.get('whatsapp_opt_in') === 'on',
          event_type: f.get('event_type'),
          event_date: noDate ? '' : String(f.get('event_date') || ''),
          event_city: f.get('event_city'),
          event_guests: f.get('event_guests'),
          event_budget: f.get('event_budget'),
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
    <form onSubmit={onSubmit} className="stack gap-20" noValidate={false}>
      <fieldset className="form-grid" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="h3" style={{ marginBottom: 12 }}>Tu evento</legend>
        <div className="field">
          <label htmlFor="event_type">Tipo de evento</label>
          <select id="event_type" name="event_type" className="select" defaultValue={initial.tipo || 'Boda'}>
            {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="event_date">Fecha</label>
          <input id="event_date" name="event_date" type="date" className="input" defaultValue={initial.fecha || ''} disabled={noDate} required={!noDate} />
          <label className="check" style={{ fontWeight: 500 }}>
            <input type="checkbox" checked={noDate} onChange={(e) => setNoDate(e.target.checked)} />
            <span>Todavía no tengo fecha</span>
          </label>
        </div>
        <div className="field">
          <label htmlFor="event_city">Ciudad</label>
          <select id="event_city" name="event_city" className="select" defaultValue={initial.ciudad || 'Quito y valles'}>
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="event_guests">Invitados</label>
          <select id="event_guests" name="event_guests" className="select" defaultValue={initial.invitados || '100 a 150'}>
            {GUEST_RANGES.map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div className="field span-2">
          <label htmlFor="event_budget">Presupuesto aproximado para proveedores</label>
          <select id="event_budget" name="event_budget" className="select" defaultValue="Aún no lo sé">
            {BUDGET_RANGES.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
      </fieldset>

      <div className="divider" />

      <fieldset className="form-grid" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="h3" style={{ marginBottom: 12 }}>Tus datos</legend>
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
        <input type="checkbox" name="whatsapp_opt_in" defaultChecked />
        <span>Quiero recibir por WhatsApp opciones de proveedores disponibles para mi fecha.</span>
      </label>
      <label className="check">
        <input type="checkbox" name="terms" required />
        <span>
          Acepto los <Link href="/terminos" target="_blank">términos de uso</Link> y la{' '}
          <Link href="/privacidad" target="_blank">política de privacidad</Link>.
        </span>
      </label>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? 'Creando tu cuenta…' : 'Crear mi cuenta gratis'}
      </button>
    </form>
  );
}
