import './globals.css';
import { AuthProvider } from '../components/AuthProvider';
import Notification from '../components/Notification';
import SiteHeader from '../components/SiteHeader';

export const metadata = {
  title: 'TradeConnect',
  description: 'Mini service request board for trade jobs',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="app-shell">
            <SiteHeader />
            <Notification />
            <main className="main-content">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
