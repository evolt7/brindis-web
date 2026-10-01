import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Logo from '@/components/Logo';
import { ParejaPanel, ProveedorPanel } from '@/components/PanelViews';
import { signOut } from './actions';

export const metadata = { title: 'Mi panel' };
export const dynamic = 'force-dynamic';

function PanelHeader({ name }) {
  return (
    <header className="site-header">
      <nav className="container nav" aria-label="Panel">
        <Link href="/" className="brand">
          <Logo />
          <span className="brand-name">Brindis</span>
        </Link>
        <div className="nav-actions">
          <span className="nav-login" style={{ fontWeight: 500 }}>{name}</span>
          <form action={signOut}>
            <button type="submit" className="btn btn-outline btn-sm">Salir</button>
          </form>
        </div>
      </nav>
    </header>
  );
}

export default async function PanelPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) redirect('/ingresar');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/ingresar');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  const safeProfile = profile || { full_name: user.user_metadata?.full_name || '', role: user.user_metadata?.role || 'pareja' };

  let content;
  if (safeProfile.role === 'proveedor') {
    const { data: vendor } = await supabase.from('vendors').select('*').eq('owner_id', user.id).maybeSingle();
    content = <ProveedorPanel profile={safeProfile} vendor={vendor} />;
  } else {
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1);
    content = <ParejaPanel profile={safeProfile} event={events?.[0]} />;
  }

  return (
    <>
      <PanelHeader name={safeProfile.full_name || user.email} />
      <main className="container" style={{ paddingTop: 48, paddingBottom: 88 }}>
        {content}
      </main>
    </>
  );
}
