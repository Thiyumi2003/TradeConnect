import './globals.css';
import Link from 'next/link';
import AuthNav from '../components/AuthNav';

export const metadata = {
  title: 'TradeConnect',
  description: 'Mini service request board for trade jobs',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="topbar">
            <Link href="/" className="brand">
              TradeConnect
            </Link>
            <nav className="topnav">
              <Link href="/">Jobs</Link>
              <Link href="/jobs/new" className="nav-cta">
                New Job
              </Link>
              <AuthNav />
            </nav>
          </header>
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
