import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VendorCard from '@/components/VendorCard';
import { CITIES, VENDOR_CATEGORIES, GUEST_RANGES, CONTACT } from '@/lib/config';
import { formatLongDate, todayIso } from '@/lib/vendor';

function queryString(f) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `/proveedores?${s}` : '/proveedores?ver=todos';
}

export default function CatalogView({ filters, vendors, busyCount, planner, usedEventDefaults }) {
  const { categoria, ciudad, fecha, invitados } = filters;
  const returnTo = queryString(filters);
  const anyFilter = Boolean(categoria || ciudad || fecha || invitados);

  let summary = `${vendors.length} ${vendors.length === 1 ? 'proveedor' : 'proveedores'}`;
  if (fecha) summary += ` ${vendors.length === 1 ? 'libre' : 'libres'} el ${formatLongDate(fecha).toLowerCase()}`;

  return (
    <>
      <Header />
      <main className="container" style={{ paddingTop: 40, paddingBottom: 88 }}>
        <div className="stack gap-24">
          <div className="stack gap-8">
            <span className="eyebrow">Proveedores</span>
            <h1 className="h2">Encuentra quién está libre en tu fecha</h1>
            <p className="body" style={{ maxWidth: 680 }}>
              Elige tu fecha y solo verás proveedores disponibles ese día. Guarda los que te gusten en tu evento para compararlos.
            </p>
          </div>

          <form className="filter-bar" action="/proveedores" method="get" aria-label="Filtrar proveedores">
            <div className="field">
              <label htmlFor="c-fecha">Fecha del evento</label>
              <input id="c-fecha" name="fecha" type="date" className="input" min={todayIso()} defaultValue={fecha} />
            </div>
            <div className="field">
              <label htmlFor="c-cat">Categoría</label>
              <select id="c-cat" name="categoria" className="select" defaultValue={categoria}>
                <option value="">Todas</option>
                {VENDOR_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="c-ciudad">Ciudad</label>
              <select id="c-ciudad" name="ciudad" className="select" defaultValue={ciudad}>
                <option value="">Todas</option>
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="c-inv">Invitados</label>
              <select id="c-inv" name="invitados" className="select" defaultValue={invitados}>
                <option value="">Cualquier cantidad</option>
                {GUEST_RANGES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ borderRadius: 12 }}>Buscar</button>
          </form>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
            <p className="body" style={{ fontWeight: 600, color: 'var(--ink)' }} aria-live="polite">
              {summary}
              {fecha && busyCount > 0 && <span className="hint" style={{ fontWeight: 400 }}> · {busyCount} ocupados ese día no se muestran</span>}
            </p>
            {anyFilter && <Link href="/proveedores?ver=todos" style={{ fontSize: 15 }}>Quitar filtros</Link>}
          </div>
          {usedEventDefaults && (
            <p className="hint" style={{ marginTop: -12 }}>Usamos la fecha y los datos de tu evento. Puedes cambiarlos arriba.</p>
          )}

          {vendors.length > 0 ? (
            <div className="vendor-grid">
              {vendors.map((v) => (
                <VendorCard key={v.id} vendor={v} planner={planner} fecha={fecha} returnTo={returnTo} />
              ))}
            </div>
          ) : (
            <div className="card-soft stack gap-12" style={{ textAlign: 'center', alignItems: 'center', padding: 56 }}>
              <span style={{ fontSize: 18, fontWeight: 700 }}>
                {anyFilter ? 'No encontramos proveedores con esos filtros' : 'Estamos sumando proveedores'}
              </span>
              <span className="body" style={{ fontSize: 15, maxWidth: 480 }}>
                {anyFilter
                  ? 'Prueba con otra categoría o ciudad, o escríbenos y te ayudamos a encontrar opciones para tu fecha.'
                  : 'Escríbenos y te recomendamos proveedores para tu fecha mientras completamos el catálogo.'}
              </span>
              <div className="row-wrap gap-12" style={{ justifyContent: 'center' }}>
                {anyFilter && <Link href="/proveedores?ver=todos" className="btn btn-outline btn-sm">Ver todos</Link>}
                <a
                  href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent('Hola Brindis, estoy buscando proveedores para mi evento.')}`}
                  className="btn btn-primary btn-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Pedir ayuda por WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
