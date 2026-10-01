import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CONTACT } from '@/lib/config';

export const metadata = { title: 'Términos de uso' };

// BORRADOR: revisar con un abogado antes del lanzamiento público.
export default function TerminosPage() {
  return (
    <>
      <Header />
      <main className="narrow legal" style={{ paddingTop: 56, paddingBottom: 88 }}>
        <h1>Términos de uso</h1>
        <p>Última actualización: [FECHA]</p>

        <h2>1. Qué es Brindis</h2>
        <p>
          Brindis es una plataforma operada por {CONTACT.company} (RUC [RUC]) que conecta a personas que organizan eventos
          con proveedores de servicios para eventos en Ecuador. Brindis no presta directamente los servicios de los
          proveedores: cada proveedor es responsable de lo que ofrece y entrega.
        </p>

        <h2>2. Tu cuenta</h2>
        <p>
          Debes ser mayor de edad para crear una cuenta, dar información verdadera y cuidar tu clave. Podemos suspender cuentas
          que den información falsa o usen la plataforma de forma indebida.
        </p>

        <h2>3. Para parejas y familias</h2>
        <p>
          Usar Brindis es gratis. Los precios, condiciones, políticas de cancelación y anticipos de cada servicio los define el
          proveedor y se muestran antes de reservar.
        </p>

        <h2>4. Para proveedores</h2>
        <p>
          El registro y el perfil son gratuitos. Brindis cobra una comisión sobre las reservas que se concreten a través de la
          plataforma, según el acuerdo comercial firmado con cada proveedor. El proveedor debe mantener su disponibilidad y
          precios actualizados y cumplir los servicios reservados.
        </p>

        <h2>5. Pagos y anticipos</h2>
        <p>[Por definir cuando se active el cobro de anticipos en línea: cómo se cobra, cuándo se libera al proveedor y qué pasa si hay una cancelación.]</p>

        <h2>6. Contenido</h2>
        <p>
          Los proveedores declaran tener los derechos sobre las fotos y textos que publican. Las reseñas deben ser reales y
          respetuosas.
        </p>

        <h2>7. Responsabilidad</h2>
        <p>
          Brindis hace su mejor esfuerzo para que la información de la plataforma sea correcta, pero no responde por el
          incumplimiento de un proveedor, sin perjuicio de los derechos que te reconoce la ley.
        </p>

        <h2>8. Contacto y ley aplicable</h2>
        <p>Estos términos se rigen por las leyes de Ecuador. Para cualquier consulta escríbenos a {CONTACT.email}.</p>
      </main>
      <Footer />
    </>
  );
}
