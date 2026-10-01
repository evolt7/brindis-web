import Link from 'next/link';
import Logo from '@/components/Logo';
import { signOut } from '@/app/panel/actions';

export default function PanelHeader({ name }) {
  return (
    <header className="site-header">
      <nav className="container nav" aria-label="Panel">
        <Link href="/" className="brand">
          <Logo />
          <span className="brand-name">Brindis</span>
        </Link>
        <div className="nav-actions">
          <span className="nav-login" style={{ fontWeight: 500 }}>{name}</span>
          <form action={signOut}>
            <button type="submit" className="btn btn-outline btn-sm">Salir</button>
          </form>
        </div>
      </nav>
    </header>
  );
}
