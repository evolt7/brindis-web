import VendorShell from '@/components/VendorShell';
import VendorProfileForm from '@/components/VendorProfileForm';
import { getPanelContext } from '@/lib/panel';

export const metadata = { title: 'Perfil de mi negocio' };
export const dynamic = 'force-dynamic';

export default async function PerfilPage() {
  const { user, profile, vendor } = await getPanelContext({ requireVendor: true });
  return (
    <VendorShell
      name={profile.full_name || user.email}
      businessName={vendor.business_name}
      title="Perfil de tu negocio"
      intro="Esto es lo que verán las parejas y familias en tu página de Brindis."
    >
      <VendorProfileForm vendor={vendor} />
    </VendorShell>
  );
}
