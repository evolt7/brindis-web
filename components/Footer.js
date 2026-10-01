import Link from 'next/link';
import { CONTACT } from '@/lib/config';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="stack gap-12" style={{ maxWidth: 360 }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 700, color: '#FFFFFF' }}>Brindis</span>
          <span style={{ fontSize: 15, lineHeight: 1.6, color: '#D9C4CC' }}>
            Todo tu evento, en un solo brindis. Hecho en Quito, Ecuador.
          </span>
        </div>
        <div className="footer-cols">
          <div className="footer-col">
            <strong>Brindis</strong>
            <Link href="/#como-funciona">Cómo funciona</Link>
            <Link href="/#proveedores">Para proveedores</Link>
            <Link href="/#preguntas">Preguntas</Link>
          </div>
          <div className="footer-col">
            <strong>Contacto</strong>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a href={`https://instagram.com/${CONTACT.instagram}`} target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div>
      </div>
      <div className="footer-legal">
        <div className="container">
          <span>© {new Date().getFullYear()} Brindis · operado por {CONTACT.company}</span>
          <Link href="/terminos">Términos</Link>
          <Link href="/privacidad">Privacidad</Link>
        </div>
      </div>
    </footer>
  );
}
