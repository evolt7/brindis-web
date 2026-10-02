'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, friendlyError } from '@/lib/supabase/client';

export default function RemoveSavedButton({ eventId, vendorId, name }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm(`¿Quitar ${name} de tu evento?`)) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from('event_vendors').delete().eq('event_id', eventId).eq('vendor_id', vendorId);
    setBusy(false);
    if (error) {
      window.alert(friendlyError(error));
      return;
    }
    router.refresh();
  }

  return (
    <button type="button" className="link-button" onClick={remove} disabled={busy} aria-label={`Quitar ${name} de mi evento`}>
      {busy ? 'Quitando…' : 'Quitar'}
    </button>
  );
}
