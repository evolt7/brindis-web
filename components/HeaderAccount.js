'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient, supabaseConfigured } from '@/lib/supabase/client';

// Muestra "Mi panel" si la persona ya ingresó; si no, "Ingresar" y "Crear cuenta".
export default function HeaderAccount() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) return undefined;
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setLoggedIn(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setLoggedIn(Boolean(session)));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loggedIn) {
    return (
      <div className="nav-actions">
        <Link href="/panel" className="btn btn-primary btn-sm">Mi panel</Link>
      </div>
    );
  }
  return (
    <div className="nav-actions">
      <Link href="/ingresar" className="nav-login">Ingresar</Link>
      <Link href="/registro" className="btn btn-primary btn-sm">Crear cuenta</Link>
    </div>
  );
}
