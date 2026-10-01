'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, friendlyError } from '@/lib/supabase/client';
import { formatPrice, MAX_PACKAGES } from '@/lib/vendor';

const UNITS = ['por evento', 'por persona', 'por hora'];

function toIntOrNull(v) {
  const s = String(v ?? '').trim();
  if (!s) return null;
  const n = Number.parseInt(s, 10);
  return Number.isNaN(n) ? NaN : n;
}

function PackageForm({ initial, onCancel, onSave, saving }) {
  return (
    <form
      className="card stack gap-16"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(new FormData(e.currentTarget));
      }}
    >
      <div className="form-grid">
        <div className="field span-2">
          <label htmlFor="pk-name">Nombre del paquete o servicio</label>
          <input id="pk-name" name="name" className="input" defaultValue={initial?.name || ''} required minLength={2} maxLength={80} placeholder="Ej. Paquete Oro, Cobertura completa, Menú de 3 tiempos" />
        </div>
        <div className="field">
          <label htmlFor="pk-price">Precio (USD)</label>
          <input id="pk-price" name="price" className="input" inputMode="decimal" defaultValue={initial?.price ?? ''} placeholder="Ej. 2500" />
        </div>
        <div className="field">
          <label htmlFor="pk-unit">Se cobra</label>
          <select id="pk-unit" name="price_unit" className="select" defaultValue={initial?.price_unit || 'por evento'}>
            {UNITS.map((u) => <option key={u}>{u}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="pk-min">Mínimo de invitados (opcional)</label>
          <input id="pk-min" name="min_guests" className="input" inputMode="numeric" defaultValue={initial?.min_guests ?? ''} />
        </div>
        <div className="field">
          <label htmlFor="pk-max">Máximo de invitados (opcional)</label>
          <input id="pk-max" name="max_guests" className="input" inputMode="numeric" defaultValue={initial?.max_guests ?? ''} />
        </div>
        <div className="field span-2">
          <label htmlFor="pk-desc">Qué incluye</label>
          <textarea id="pk-desc" name="description" className="textarea" maxLength={800} defaultValue={initial?.description || ''} placeholder="Una línea por cada cosa incluida: horas de servicio, personal, montaje, etc." />
        </div>
      </div>
      <div className="row-wrap gap-12">
        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Guardando…' : 'Guardar paquete'}</button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancel} disabled={saving}>Cancelar</button>
      </div>
    </form>
  );
}

export default function PackageManager({ vendorId, initialPackages }) {
  const router = useRouter();
  const [packages, setPackages] = useState(initialPackages);
  const [editing, setEditing] = useState(null); // 'new' | id | null
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save(f) {
    setError('');
    const priceRaw = String(f.get('price') || '').trim().replace(',', '.');
    const price = priceRaw === '' ? null : Number(priceRaw);
    const minG = toIntOrNull(f.get('min_guests'));
    const maxG = toIntOrNull(f.get('max_guests'));
    if (price !== null && (Number.isNaN(price) || price < 0)) return setError('Revisa el precio: solo números.');
    if (Number.isNaN(minG) || Number.isNaN(maxG)) return setError('Los invitados deben ser números enteros.');
    if (minG !== null && maxG !== null && minG > maxG) return setError('El mínimo de invitados no puede ser mayor que el máximo.');
    const row = {
      name: String(f.get('name')).trim(),
      description: String(f.get('description') || '').trim() || null,
      price,
      price_unit: f.get('price_unit'),
      min_guests: minG,
      max_guests: maxG,
    };
    setSaving(true);
    const supabase = createClient();
    let res;
    if (editing === 'new') {
      const position = packages.length ? Math.max(...packages.map((p) => p.position)) + 1 : 0;
      res = await supabase.from('vendor_packages').insert({ ...row, vendor_id: vendorId, position }).select().single();
    } else {
      res = await supabase.from('vendor_packages').update(row).eq('id', editing).select().single();
    }
    setSaving(false);
    if (res.error) {
      const m = res.error.message || '';
      return setError(m.includes('Máximo 20') ? 'Ya tienes el máximo de 20 paquetes.' : friendlyError(res.error));
    }
    setPackages((prev) => (editing === 'new' ? [...prev, res.data] : prev.map((p) => (p.id === res.data.id ? res.data : p))));
    setEditing(null);
    router.refresh();
  }

  async function remove(pkg) {
    if (!window.confirm(`¿Eliminar "${pkg.name}"?`)) return;
    setError('');
    const supabase = createClient();
    const { error: err } = await supabase.from('vendor_packages').delete().eq('id', pkg.id);
    if (err) return setError(friendlyError(err));
    setPackages((prev) => prev.filter((p) => p.id !== pkg.id));
    router.refresh();
  }

  return (
    <div className="stack gap-20" style={{ maxWidth: 820 }}>
      {error && <div className="alert alert-error" role="alert">{error}</div>}

      {packages.length === 0 && editing !== 'new' && (
        <div className="card-soft stack gap-8" style={{ textAlign: 'center', alignItems: 'center', padding: 48 }}>
          <span style={{ fontWeight: 700 }}>Todavía no tienes paquetes</span>
          <span className="body" style={{ fontSize: 15 }}>Agrega tus servicios con precio para que las parejas sepan qué esperar.</span>
        </div>
      )}

      {packages.map((p) =>
        editing === p.id ? (
          <PackageForm key={p.id} initial={p} saving={saving} onSave={save} onCancel={() => setEditing(null)} />
        ) : (
          <div key={p.id} className="card stack gap-12">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div className="stack gap-4">
                <span style={{ fontSize: 18, fontWeight: 700 }}>{p.name}</span>
                <span className="body" style={{ fontSize: 15 }}>
                  {p.price !== null ? `${formatPrice(p.price)} ${p.price_unit}` : 'Precio a consultar'}
                  {(p.min_guests || p.max_guests) &&
                    ` · ${p.min_guests ? `desde ${p.min_guests}` : ''}${p.min_guests && p.max_guests ? ' ' : ''}${p.max_guests ? `hasta ${p.max_guests}` : ''} invitados`}
                </span>
              </div>
              <div className="row-wrap gap-8">
                <button type="button" className="btn btn-outline btn-xs" onClick={() => setEditing(p.id)} disabled={editing !== null}>Editar</button>
                <button type="button" className="btn btn-outline btn-xs" onClick={() => remove(p)} disabled={editing !== null}>Eliminar</button>
              </div>
            </div>
            {p.description && <p className="body" style={{ whiteSpace: 'pre-line', fontSize: 15 }}>{p.description}</p>}
          </div>
        )
      )}

      {editing === 'new' ? (
        <PackageForm saving={saving} onSave={save} onCancel={() => setEditing(null)} />
      ) : (
        <button
          type="button"
          className="btn btn-primary btn-sm"
          style={{ alignSelf: 'flex-start' }}
          onClick={() => setEditing('new')}
          disabled={editing !== null || packages.length >= MAX_PACKAGES}
        >
          Agregar paquete
        </button>
      )}
    </div>
  );
}
