import PanelHeader from '@/components/PanelHeader';
import VendorTabs from '@/components/VendorTabs';

// Envuelve cada página del panel del proveedor con el encabezado y las pestañas.
export default function VendorShell({ name, businessName, title, intro, children }) {
  return (
    <>
      <PanelHeader name={name} />
      <main className="container" style={{ paddingTop: 40, paddingBottom: 88 }}>
        <div className="stack gap-24">
          <div className="stack gap-8">
            <span className="eyebrow">{businessName}</span>
            <h1 className="h2">{title}</h1>
            {intro && <p className="body" style={{ maxWidth: 680 }}>{intro}</p>}
          </div>
          <VendorTabs />
          {children}
        </div>
      </main>
    </>
  );
}
