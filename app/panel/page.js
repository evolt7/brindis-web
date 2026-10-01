import PanelHeader from '@/components/PanelHeader';
import { ParejaPanel, ProveedorPanel } from '@/components/PanelViews';
import { getPanelContext } from '@/lib/panel';
import { todayIso } from '@/lib/vendor';

export const metadata = { title: 'Mi panel' };
export const dynamic = 'force-dynamic';

export default async function PanelPage() {
  const { supabase, user, profile, vendor } = await getPanelContext();

  let content;
  if (profile.role === 'proveedor') {
    let stats = { photos: 0, packages: 0, busyDays: 0, cover: null };
    if (vendor) {
      const [photos, packages, busy] = await Promise.all([
        supabase.from('vendor_photos').select('path', { count: 'exact' }).eq('vendor_id', vendor.id).order('position', { ascending: true }).limit(1),
        supabase.from('vendor_packages').select('id', { count: 'exact', head: true }).eq('vendor_id', vendor.id),
        supabase.from('vendor_availability').select('day', { count: 'exact', head: true }).eq('vendor_id', vendor.id).gte('day', todayIso()),
      ]);
      stats = {
        photos: photos.count || 0,
        packages: packages.count || 0,
        busyDays: busy.count || 0,
        cover: photos.data?.[0]?.path || null,
      };
    }
    content = (
      <ProveedorPanel profile={profile} vendor={vendor} stats={stats} />
    );
  } else {
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1);
    content = <ParejaPanel profile={profile} event={events?.[0]} />;
  }

  return (
    <>
      <PanelHeader name={profile.full_name || user.email} />
      <main className="container" style={{ paddingTop: 40, paddingBottom: 88 }}>
        {content}
      </main>
    </>
  );
}
