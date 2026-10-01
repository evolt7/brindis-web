import { CONTACT } from '@/lib/config';

function formatDate(iso) {
  if (!iso) return 'Por definir';
  const d = new Date(`${iso}T12:00:00Z`);
  const txt = d.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

function daysUntil(iso) {
  if (!iso) return null;
  const target = new Date(`${iso}T12:00:00Z`).getTime();
  const diff = Math.ceil((target - Date.now()) / 86400000);
  return diff > 0 ? diff : null;
}

const vendorChecklist = ['Venue o hacienda', 'Catering', 'Música y DJ', 'Fotografía y video', 'Flores y decoración', 'Pastel y dulces'];

export function ParejaPanel({ profile, event }) {
  const days = daysUntil(event?.event_date);
  const firstName = (profile.full_name || '').split(' ')[0] || 'hola';
  return (
    <div className="stack gap-32">
      <div className="stack gap-8">
        <span className="eyebrow">Tu evento</span>
        <h1 className="h2">¡Hola, {firstName}! Empecemos a armar tu celebración.</h1>
        {days && <p className="lead">Faltan {days} días para tu evento.</p>}
      </div>

      <div className="panel-grid">
        <div className="card stack gap-20">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
            <h2 className="h3">{event?.event_type || 'Tu evento'}</h2>
            <span className="badge badge-wine">En planificación</span>
          </div>
          <dl className="kv" style={{ margin: 0 }}>
            <div><dt>Fecha</dt><dd>{formatDate(event?.event_date)}</dd></div>
            <div><dt>Ciudad</dt><dd>{event?.city || 'Por definir'}</dd></div>
            <div><dt>Invitados</dt><dd>{event?.guests || 'Por definir'}</dd></div>
            <div><dt>Presupuesto</dt><dd>{event?.budget || 'Por definir'}</dd></div>
          </dl>
          <div className="divider" />
          <h3 className="h3" style={{ fontSize: 17 }}>Tus proveedores</h3>
          <div className="stack gap-12">
            {vendorChecklist.map((c) => (
              <div className="vendor-row" key={c}>
                <span className="vendor-name">{c}</span>
                <span className="badge badge-wine">Por elegir</span>
              </div>
            ))}
          </div>
        </div>

        <div className="stack gap-16">
          <div className="promo promo-blush" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 24 }}>Qué sigue</h3>
            <ol className="steps">
              <li>Revisamos qué proveedores están libres para tu fecha.</li>
              <li>Te escribimos por WhatsApp con opciones y precios.</li>
              <li>Eliges, reservas y lo verás aquí en tu tablero.</li>
            </ol>
            <a
              href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent('Hola Brindis, acabo de crear mi cuenta y quiero ver proveedores para mi evento.')}`}
              className="btn btn-primary btn-sm"
              style={{ alignSelf: 'flex-start' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Escribir por WhatsApp
            </a>
          </div>
          <div className="card stack gap-8">
            <span style={{ fontWeight: 700 }}>Muy pronto en tu panel</span>
            <span className="body" style={{ fontSize: 15 }}>
              Catálogo con disponibilidad por fecha, presupuesto, lista de invitados y mapa de mesas.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProveedorPanel({ profile, vendor }) {
  const firstName = (profile.full_name || '').split(' ')[0] || 'hola';
  const approved = vendor?.status === 'aprobado';
  return (
    <div className="stack gap-32">
      <div className="stack gap-8">
        <span className="eyebrow">Tu negocio</span>
        <h1 className="h2">¡Hola, {firstName}! Gracias por sumarte a Brindis.</h1>
      </div>

      <div className="panel-grid">
        <div className="card stack gap-20">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
            <h2 className="h3">{vendor?.business_name || 'Tu negocio'}</h2>
            <span className={`badge ${approved ? 'badge-ok' : 'badge-wait'}`}>{approved ? 'Publicado' : 'En revisión'}</span>
          </div>
          <dl className="kv" style={{ margin: 0 }}>
            <div><dt>Categoría</dt><dd>{vendor?.category || '—'}</dd></div>
            <div><dt>Ciudad</dt><dd>{vendor?.city || '—'}</dd></div>
            <div><dt>Instagram o web</dt><dd>{vendor?.social || '—'}</dd></div>
            <div><dt>Precio desde</dt><dd>{vendor?.price_from ? `$${vendor.price_from}` : '—'}</dd></div>
          </dl>
          {vendor?.description && <p className="body">{vendor.description}</p>}
        </div>

        <div className="stack gap-16">
          <div className="promo promo-blush" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 24 }}>Qué sigue</h3>
            <ol className="steps">
              <li>Verificamos tu negocio (1 a 3 días hábiles).</li>
              <li>Te contactamos por WhatsApp para completar tu perfil con fotos y paquetes.</li>
              <li>Tu perfil se publica y empiezas a recibir solicitudes.</li>
            </ol>
            <a
              href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent('Hola Brindis, acabo de registrar mi negocio en la plataforma.')}`}
              className="btn btn-primary btn-sm"
              style={{ alignSelf: 'flex-start' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Escribir por WhatsApp
            </a>
          </div>
          <div className="card stack gap-8">
            <span style={{ fontWeight: 700 }}>Muy pronto en tu panel</span>
            <span className="body" style={{ fontSize: 15 }}>
              Calendario de fechas, fotos, paquetes, promociones y solicitudes de reserva.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

