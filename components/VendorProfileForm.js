'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, friendlyError } from '@/lib/supabase/client';
import { CITIES, VENDOR_CATEGORIES } from '@/lib/config';

export default function VendorProfileForm({ vendor }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(null);
    const f = new FormData(e.currentTarget);
    const cap = String(f.get('capacity_max') || '').trim();
    const capNum = cap === '' ? null : Number.parseInt(cap, 10);
    if (capNum !== null && (Number.isNaN(capNum) || capNum < 1 || capNum > 5000)) {
      setMsg({ type: 'error', text: 'La capacidad debe ser un número entre 1 y 5.000.' });
      return;
    }
    const businessName = String(f.get('business_name') || '').trim();
    if (businessName.length < 2) {
      setMsg({ type: 'error', text: 'Escribe el nombre de tu negocio.' });
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('vendors')
      .update({
        business_name: businessName,
        category: f.get('category'),
        city: f.get('city'),
        social: String(f.get('social') || '').trim(),
        price_from: String(f.get('price_from') || '').trim(),
        capacity_max: capNum,
        description: String(f.get('description') || '').trim(),
      })
      .eq('id', vendor.id);
    setSaving(false);
    if (error) {
      setMsg({ type: 'error', text: friendlyError(error) });
      return;
    }
    setMsg({ type: 'ok', text: 'Cambios guardados.' });
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card stack gap-20" style={{ maxWidth: 820 }}>
      <div className="form-grid">
        <div className="field span-2">
          <label htmlFor="business_name">Nombre del negocio</label>
          <input id="business_name" name="business_name" className="input" defaultValue={vendor.business_name || ''} required maxLength={120} />
        </div>
        <div className="field">
          <label htmlFor="category">Categoría</label>
          <select id="category" name="category" className="select" defaultValue={vendor.category || 'Otro'}>
            {VENDOR_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="city">Ciudad donde trabajas</label>
          <select id="city" name="city" className="select" defaultValue={vendor.city || 'Quito y valles'}>
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="price_from">Precio desde (USD)</label>
          <input id="price_from" name="price_from" className="input" inputMode="decimal" defaultValue={vendor.price_from || ''} placeholder="Ej. 500" maxLength={20} />
          <span className="hint">El precio más bajo que ofreces. Se muestra como "Desde $…".</span>
        </div>
        <div className="field">
          <label htmlFor="capacity_max">Capacidad máxima (invitados)</label>
          <input id="capacity_max" name="capacity_max" className="input" inputMode="numeric" defaultValue={vendor.capacity_max ?? ''} placeholder="Ej. 200" />
          <span className="hint">Útil para venues y catering. Déjalo vacío si no aplica.</span>
        </div>
        <div className="field span-2">
          <label htmlFor="social">Instagram o página web</label>
          <input id="social" name="social" className="input" defaultValue={vendor.social || ''} placeholder="@tunegocio" maxLength={200} />
        </div>
        <div className="field span-2">
          <label htmlFor="description">Descripción</label>
          <textarea id="description" name="description" className="textarea" style={{ minHeight: 160 }} maxLength={600} defaultValue={vendor.description || ''} placeholder="Qué ofreces, qué te hace diferente, en qué zonas trabajas, con cuánta anticipación reservan…" />
          <span className="hint">Hasta 600 caracteres.</span>
        </div>
      </div>
      {msg && <div className={`alert ${msg.type === 'ok' ? 'alert-ok' : 'alert-error'}`} role={msg.type === 'ok' ? 'status' : 'alert'}>{msg.text}</div>}
      <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
        {saving ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  );
}
