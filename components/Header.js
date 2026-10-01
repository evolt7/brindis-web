import Link from 'next/link';
import Logo from './Logo';

export default function Header({ minimal = false }) {
  return (
    <header className="site-header">
      <nav className="container nav" aria-label="Principal">
        <Link href="/" className="brand">
          <Logo />
          <span className="brand-name">Brindis</span>
        </Link>
        {!minimal && (
          <div className="nav-links">
            <Link href="/#como-funciona">Cómo funciona</Link>
            <Link href="/#celebraciones">Celebraciones</Link>
            <Link href="/#proveedores">Para proveedores</Link>
            <Link href="/#preguntas">Preguntas</Link>
          </div>
        )}
        <div className="nav-actions">
          <Link href="/ingresar" className="nav-login">Ingresar</Link>
          <Link href="/registro" className="btn btn-primary btn-sm">Crear cuenta</Link>
        </div>
      </nav>
    </header>
  );
}
