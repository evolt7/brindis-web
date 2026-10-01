import VendorShell from '@/components/VendorShell';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import { getPanelContext } from '@/lib/panel';

export const metadata = { title: 'Calendario de fechas' };
export const dynamic = 'force-dynamic';

export default async function CalendarioPage() {
  const { supabase, user, profile, vendor } = await getPanelContext({ requireVendor: true });
  const start = new Date();
  start.setDate(1);
  const from = start.toISOString().slice(0, 10);
  const { data: busy } = await supabase
    .from('vendor_availability')
    .select('day,status')
    .eq('vendor_id', vendor.id)
    .gte('day', from)
    .order('day', { ascending: true })
    .limit(1000);

  return (
    <VendorShell
      name={profile.full_name || user.email}
      businessName={vendor.business_name}
      title="Calendario de fechas"
      intro="Toca un día para marcarlo como ocupado; tócalo otra vez para liberarlo. Se guarda al instante. Mantenerlo al día evita que te escriban por fechas que ya no tienes."
    >
      <div className="card">
        <AvailabilityCalendar vendorId={vendor.id} initialBusy={busy || []} editable months={2} />
      </div>
    </VendorShell>
  );
}
