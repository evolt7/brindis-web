import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.brindis.fun';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Brindis — Todo tu evento, en un solo lugar',
    template: '%s · Brindis',
  },
  description:
    'Reserva venue, catering, música, fotografía y todos los proveedores de tu boda o celebración en Quito, con disponibilidad real por fecha.',
  openGraph: {
    title: 'Brindis — Todo tu evento, en un solo brindis',
    description:
      'Elige tu fecha y mira solo los proveedores libres ese día. Arma tu boda, reserva y paga el anticipo en un solo lugar.',
    locale: 'es_EC',
    type: 'website',
    siteName: 'Brindis',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
