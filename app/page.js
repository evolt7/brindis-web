import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { EVENT_TYPES, CITIES, GUEST_RANGES } from '@/lib/config';

const sampleVendors = [
  { cat: 'Venue', name: 'Hacienda en Tumbaco', status: 'Reservado', ok: true },
  { cat: 'Catering', name: 'Menú de 3 tiempos, 120 personas', status: 'Reservado', ok: true },
  { cat: 'Música', name: 'Banda en vivo y DJ', status: 'Reservado', ok: true },
  { cat: 'Fotografía y video', name: 'Cobertura completa', status: 'Reservado', ok: true },
  { cat: 'Flores y decoración', name: 'Disponible en tu fecha', status: 'Por elegir', ok: false },
];

const categories = [
  'Venues y haciendas', 'Catering', 'Música y DJ', 'Fotografía y video', 'Flores y decoración',
  'Pastel y dulces', 'Hora loca', 'Belleza', 'Mobiliario e iluminación', 'Transporte',
];

const events = [
  { name: 'Bodas', desc: 'Civiles, eclesiásticas o en la playa, de 30 a 300 invitados.' },
  { name: 'Bodas de oro y plata', desc: 'Celebra 25 o 50 años juntos con toda la familia.' },
  { name: 'Aniversarios', desc: 'Una cena íntima o una fiesta sorpresa.' },
  { name: 'Quinceañeras', desc: 'Salón, decoración, vals y hora loca en un solo lugar.' },
  { name: 'Bautizos y primeras comuniones', desc: 'Recepciones familiares sin complicaciones.' },
];

const tools = ['Presupuesto y pagos', 'Lista de invitados', 'Mapa de mesas', 'Lista de tareas'];

const benefits = [
  { title: 'Más reservas en fechas libres', desc: 'Publica promociones para viernes, domingos y temporada baja.' },
  { title: 'Anticipos garantizados', desc: 'La pareja paga el anticipo en Brindis; tú recibes tu fecha asegurada.' },
  { title: 'Calendario simple', desc: 'Bloquea y libera fechas en segundos, también por WhatsApp.' },
  { title: 'Sin costo fijo al empezar', desc: 'Perfil gratis con fotos, paquetes y reseñas verificadas.' },
];

const faqs = [
  {
    q: '¿Cuánto cuesta usar Brindis?',
    a: 'Para parejas y familias es gratis. Pagas a cada proveedor el mismo precio que te darían por fuera; Brindis cobra una comisión al proveedor solo cuando reservas.',
  },
  {
    q: '¿Cómo sé que el proveedor está libre en mi fecha?',
    a: 'Cada proveedor mantiene su calendario en Brindis y lo confirmamos con ellos. Si una fecha aparece libre, puedes reservarla en ese momento.',
  },
  {
    q: '¿Qué pasa con mi anticipo?',
    a: 'Pagas el anticipo con tarjeta dentro de Brindis y queda registrado con las condiciones de la reserva. El resto lo pagas directo al proveedor, como acuerden.',
  },
  {
    q: '¿En qué ciudades funciona?',
    a: 'Empezamos en Quito y sus valles. Pronto llegaremos a Guayaquil y Cuenca.',
  },
];

function Shield({ size = 20, strokeWidth = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#7A2E4A" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section id="inicio" className="container hero">
          <div className="hero-grid">
            <div className="stack gap-24">
              <span className="eyebrow pill-eyebrow">Primero en Quito · Ecuador</span>
              <h1 className="display">Todo tu evento, en un solo brindis.</h1>
              <p className="lead" style={{ maxWidth: 560 }}>
                Elige tu fecha y mira solo los proveedores que están libres ese día. Arma tu boda, reserva y paga
                el anticipo en un solo lugar, sin decenas de chats de WhatsApp.
              </p>
              <div className="row-wrap gap-12">
                <Link href="/registro/pareja" className="btn btn-primary">Crear mi cuenta gratis</Link>
                <Link href="/registro/proveedor" className="btn btn-outline">Soy proveedor</Link>
              </div>
              <div className="hero-proof">
                <span>Gratis para parejas y familias</span>
                <span>Disponibilidad real por fecha</span>
                <span>Anticipo protegido</span>
              </div>
            </div>

            <div className="event-card" aria-label="Ejemplo de un evento armado en Brindis">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>Tu evento</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, marginTop: 4 }}>Boda de Ana y Diego</div>
                  <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>Sábado 13 de febrero de 2027 · 120 invitados · Quito</div>
                </div>
                <span className="badge badge-ok">4 de 6 listos</span>
              </div>
              <div className="divider" />
              {sampleVendors.map((v) => (
                <div className="vendor-row" key={v.cat}>
                  <div className="stack" style={{ gap: 2 }}>
                    <span className="vendor-cat">{v.cat}</span>
                    <span className="vendor-name">{v.name}</span>
                  </div>
                  <span className={`badge ${v.ok ? 'badge-ok' : 'badge-wine'}`}>{v.status}</span>
                </div>
              ))}
              <div className="divider" />
              <div className="note-box">
                <Shield />
                <span>Tu anticipo queda protegido hasta el día del evento.</span>
              </div>
            </div>
          </div>

          <form className="search-bar" action="/registro/pareja" method="get" aria-label="Buscar proveedores disponibles">
            <div className="field">
              <label htmlFor="f-tipo">Tipo de evento</label>
              <select id="f-tipo" name="tipo" className="select" defaultValue="Boda">
                {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="f-fecha">Fecha</label>
              <input id="f-fecha" name="fecha" type="date" className="input" />
            </div>
            <div className="field">
              <label htmlFor="f-ciudad">Ciudad</label>
              <select id="f-ciudad" name="ciudad" className="select" defaultValue="Quito y valles">
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="f-inv">Invitados</label>
              <select id="f-inv" name="invitados" className="select" defaultValue="100 a 150">
                {GUEST_RANGES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ borderRadius: 12, padding: '14px 24px' }}>Ver disponibles</button>
          </form>
        </section>

        <section id="como-funciona" className="band">
          <div className="container section stack gap-48">
            <div className="stack gap-12 max-640">
              <span className="eyebrow">Cómo funciona</span>
              <h2 className="h2">De la fecha a la fiesta, en tres pasos.</h2>
            </div>
            <div className="grid-auto-260">
              <div className="card-soft stack gap-12">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#7A2E4A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18" /><path d="M8 3v4" /><path d="M16 3v4" /><path d="M9 15l2 2 4-4" /></svg>
                <h3 className="h3">1. Elige tu fecha</h3>
                <p className="body">Dinos el día, la ciudad y cuántos invitados tendrás. Solo verás proveedores que de verdad están libres esa fecha.</p>
              </div>
              <div className="card-soft stack gap-12">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#7A2E4A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M17.5 14v7" /><path d="M14 17.5h7" /></svg>
                <h3 className="h3">2. Arma tu evento</h3>
                <p className="body">Compara precios, fotos y reseñas. Agrega el venue, la comida, la música y todo lo demás a tu tablero, o elige un paquete armado.</p>
              </div>
              <div className="card-soft stack gap-12">
                <Shield size={36} strokeWidth={1.6} />
                <h3 className="h3">3. Reserva con garantía</h3>
                <p className="body">Paga el anticipo con tarjeta dentro de Brindis. El dinero queda protegido y el proveedor tiene tu fecha asegurada.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="container section stack gap-32">
          <div className="stack gap-12 max-640">
            <span className="eyebrow">Proveedores</span>
            <h2 className="h2">Todo lo que necesitas, sin buscar por tu cuenta.</h2>
          </div>
          <div className="row-wrap gap-12">
            {categories.map((c) => <span className="chip" key={c}>{c}</span>)}
          </div>
        </section>

        <section className="container" style={{ paddingBottom: 88 }}>
          <div className="split">
            <div className="promo promo-wine">
              <span className="eyebrow" style={{ color: '#F3D9E2' }}>Paquetes Brindis</span>
              <h3>Una boda completa, con precio cerrado.</h3>
              <p className="body" style={{ color: '#F7EAF0' }}>
                Venue, comida, música, fotografía y decoración ya coordinados entre sí. Eliges el paquete, ajustas lo que quieras y reservas todo de una vez.
              </p>
              <Link href="/registro/pareja" className="btn btn-light btn-sm" style={{ alignSelf: 'flex-start', marginTop: 8 }}>Ver paquetes</Link>
            </div>
            <div className="promo promo-blush">
              <span className="eyebrow">Fechas con descuento</span>
              <h3>¿Viernes, domingo o temporada baja? Ahorra.</h3>
              <p className="body">
                Los proveedores publican promociones para sus fechas libres. Si tu fecha es flexible, Brindis te muestra dónde está el mejor precio.
              </p>
              <Link href="/registro/pareja" className="btn btn-dark btn-sm" style={{ alignSelf: 'flex-start', marginTop: 8 }}>Ver promociones</Link>
            </div>
          </div>
        </section>

        <section id="celebraciones" className="band">
          <div className="container section stack gap-32">
            <div className="stack gap-12" style={{ maxWidth: 700 }}>
              <span className="eyebrow">Para cada celebración</span>
              <h2 className="h2">No solo bodas. Cada momento merece un brindis.</h2>
            </div>
            <div className="grid-auto-200">
              {events.map((e) => (
                <div key={e.name} className="stack gap-8" style={{ border: '1px solid var(--line)', borderRadius: 18, padding: 24, background: 'var(--ground)' }}>
                  <span className="event-type-name">{e.name}</span>
                  <span className="body" style={{ fontSize: 15 }}>{e.desc}</span>
                </div>
              ))}
            </div>
            <div className="stack gap-16">
              <h3 className="h3">Y herramientas gratis para organizarte</h3>
              <div className="grid-auto-220">
                {tools.map((t) => (
                  <div className="tool-item" key={t}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7A2E4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l4 4 10-10" /></svg>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="proveedores" className="container section">
          <div className="split-uneven">
            <div className="stack gap-20">
              <span className="eyebrow">Para proveedores</span>
              <h2 className="h2">Llena tus fechas libres. Cobra sin perseguir transferencias.</h2>
              <p className="lead" style={{ fontSize: 18 }}>
                Tu perfil es gratis. Solo pagas una comisión cuando una pareja reserva contigo a través de Brindis.
              </p>
              <Link href="/registro/proveedor" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Registrar mi negocio</Link>
            </div>
            <div className="grid-auto-240">
              {benefits.map((b) => (
                <div className="card stack gap-8" key={b.title}>
                  <span style={{ fontSize: 18, fontWeight: 700 }}>{b.title}</span>
                  <span className="body" style={{ fontSize: 15 }}>{b.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="preguntas" className="band">
          <div className="narrow section stack gap-32">
            <h2 className="h2" style={{ textAlign: 'center' }}>Preguntas frecuentes</h2>
            <div className="faq stack gap-12">
              {faqs.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="container" style={{ padding: '96px 24px', textAlign: 'center' }}>
          <div className="stack gap-20" style={{ alignItems: 'center' }}>
            <h2 className="display" style={{ fontSize: 'clamp(36px, 5vw, 56px)', maxWidth: 760, letterSpacing: '-1px' }}>
              Empieza a planear tu celebración hoy.
            </h2>
            <p className="lead" style={{ fontSize: 18, maxWidth: 560 }}>
              Crea tu cuenta gratis, cuéntanos tu fecha y te mostramos quién está disponible.
            </p>
            <div className="row-wrap gap-12" style={{ justifyContent: 'center' }}>
              <Link href="/registro/pareja" className="btn btn-primary">Crear mi cuenta gratis</Link>
              <Link href="/registro/proveedor" className="btn btn-outline">Registrar mi negocio</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
