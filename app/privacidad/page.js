import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CONTACT } from '@/lib/config';

export const metadata = { title: 'Política de privacidad' };

// BORRADOR: revisar con un abogado antes del lanzamiento público (Ley Orgánica de Protección de Datos Personales).
export default function PrivacidadPage() {
  return (
    <>
      <Header />
      <main className="narrow legal" style={{ paddingTop: 56, paddingBottom: 88 }}>
        <h1>Política de privacidad</h1>
        <p>Última actualización: [FECHA]</p>

        <h2>1. Quién es responsable de tus datos</h2>
        <p>
          Brindis es operado por {CONTACT.company}, con RUC [RUC] y domicilio en [DIRECCIÓN], Ecuador. Para cualquier
          consulta sobre tus datos escríbenos a {CONTACT.email}.
        </p>

        <h2>2. Qué datos recogemos</h2>
        <ul>
          <li>Parejas y familias: nombre, correo, número de WhatsApp y datos de tu evento (tipo, fecha, ciudad, invitados y presupuesto aproximado).</li>
          <li>Proveedores: nombre del negocio, categoría, ciudad, redes o web, precios de referencia, descripción y datos de la persona de contacto.</li>
          <li>Datos técnicos básicos necesarios para que la plataforma funcione, como las cookies de sesión.</li>
        </ul>

        <h2>3. Para qué los usamos</h2>
        <ul>
          <li>Crear y administrar tu cuenta.</li>
          <li>Mostrarte proveedores disponibles para tu evento y gestionar tus solicitudes y reservas.</li>
          <li>Contactarte por correo o WhatsApp sobre tu evento o tu negocio, si lo autorizaste.</li>
          <li>Mejorar el servicio con estadísticas agregadas que no te identifican.</li>
        </ul>

        <h2>4. Base legal</h2>
        <p>Tratamos tus datos con tu consentimiento, que nos das al crear tu cuenta, y para cumplir el servicio que nos pides.</p>

        <h2>5. Con quién los compartimos</h2>
        <p>
          Solo compartimos los datos de tu evento con los proveedores que eliges o a quienes pides una cotización o reserva.
          Usamos proveedores tecnológicos (alojamiento web y base de datos) que pueden tener servidores fuera de Ecuador y
          que tratan los datos solo por cuenta nuestra. No vendemos tus datos.
        </p>

        <h2>6. Cuánto tiempo los guardamos</h2>
        <p>Mientras tu cuenta esté activa y el tiempo que exija la ley. Puedes pedir que eliminemos tu cuenta en cualquier momento.</p>

        <h2>7. Tus derechos</h2>
        <p>
          Puedes pedir acceso, rectificación, actualización, eliminación, oposición y portabilidad de tus datos, y retirar tu
          consentimiento, escribiendo a {CONTACT.email}. Responderemos en los plazos que establece la Ley Orgánica de
          Protección de Datos Personales.
        </p>

        <h2>8. Cambios a esta política</h2>
        <p>Si cambiamos esta política te lo avisaremos en la plataforma o por correo.</p>
      </main>
      <Footer />
    </>
  );
}
