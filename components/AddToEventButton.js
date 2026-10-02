'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient, friendlyError } from '@/lib/supabase/client';

// planner: { kind: 'anon' | 'vendor' | 'pareja', event, saved: [vendorIds] }
export default function AddToEventButton({ vendorId, planner, returnTo, size = 'sm', block = false }) {
  const router = useRouter();
  const [saved, setSaved] = useState(() => Boolean(planner?.saved?.includes(vendorId)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const cls = `btn ${size === 'sm' ? 'btn-sm' : ''} ${block ? 'btn-block' : ''}`;

  if (!planner || planner.kind === 'vendor') return null;

  if (planner.kind === 'anon') {
    const next = encodeURIComponent(returnTo || `/proveedores/${vendorId}`);
    return (
      <Link href={`/ingresar?next=${next}`} className={`${cls} btn-primary`}>
        Agregar a mi evento
      </Link>
    );
  }

  if (!planner.event) {
    return <span className="hint">Crea tu evento desde tu panel para guardar proveedores.</span>;
  }

  async function toggle() {
    setError('');
    setBusy(true);
    const supabase = createClient();
    const res = saved
      ? await supabase.from('event_vendors').delete().eq('event_id', planner.event.id).eq('vendor_id', vendorId)
      : await supabase.from('event_vendors').insert({ event_id: planner.event.id, vendor_id: vendorId });
    setBusy(false);
    if (res.error && res.error.code !== '23505') {
      const m = res.error.message || '';
      setError(m.includes('Máximo 40') ? 'Ya guardaste 40 proveedores en tu evento.' : friendlyError(res.error));
      return;
    }
    setSaved(!saved);
    router.refresh();
  }

  return (
    <span className="stack gap-8" style={block ? { width: '100%' } : undefined}>
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={`${cls} ${saved ? 'btn-saved' : 'btn-primary'}`}
        aria-pressed={saved}
        title={saved ? 'Quitar de mi evento' : undefined}
      >
        {busy ? 'Guardando…' : saved ? '✓ En mi evento' : 'Agregar a mi evento'}
      </button>
      {saved && !busy && block && <span className="hint" style={{ textAlign: 'center' }}>Toca otra vez para quitarlo.</span>}
      {error && <span className="alert alert-error" role="alert" style={{ fontSize: 14 }}>{error}</span>}
    </span>
  );
}
