import './globals.css';
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
        <div className="app-shell">
          <SiteHeader />
          <Notification />
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
