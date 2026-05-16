"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, LogOut, Plus, UserPlus } from 'lucide-react';
import { useAuth } from './AuthProvider';

export default function SiteHeader() {
  const pathname = usePathname();
  const { ready, user, clearSession } = useAuth();
  const jobsActive = pathname === '/';
  const newJobActive = pathname.startsWith('/jobs/new');
  const loginActive = pathname.startsWith('/login');
  const registerActive = pathname.startsWith('/register');
  const isHomeowner = user?.role === 'homeowner';
  const isTradesperson = user?.role === 'tradesperson';

  function handleLogout() {
    clearSession();
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>TradeConnect</span>
        </Link>
      </div>
      <nav className="topnav">
        <Link href="/" className={jobsActive ? 'active-link' : ''}>
          Jobs
        </Link>
        {isHomeowner ? (
          <Link href="/jobs/new" className={newJobActive ? 'active-link' : ''}>
            New Job
          </Link>
        ) : null}
        {!user ? (
          <Link href="/register" className={registerActive ? 'active-link' : ''}>
            Register
          </Link>
        ) : null}
      </nav>
      <div className="topbar-right">
        {ready && user ? (
          <span className={`role-pill role-pill-${user.role}`}>{isHomeowner ? 'Homeowner' : 'Tradesperson'}</span>
        ) : null}
        {!user ? (
          <>
            <Link href="/login" className={loginActive ? 'nav-link-cta nav-link-active' : 'nav-link-cta'}>
              <LogIn size={16} /> Login
            </Link>
            <Link href="/register" className={registerActive ? 'nav-link-cta nav-link-active' : 'nav-link-cta'}>
              <UserPlus size={16} /> Register
            </Link>
          </>
        ) : null}
        {isHomeowner ? (
          <Link href="/jobs/new" className="nav-cta">
            <Plus size={18} style={{ marginRight: '6px' }} /> Post a New Job
          </Link>
        ) : null}
        {isTradesperson ? (
          <Link href="/" className="nav-cta">
            <Plus size={18} style={{ marginRight: '6px' }} /> View Jobs
          </Link>
        ) : null}
        {user ? (
          <button type="button" className="nav-link-cta nav-logout" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        ) : null}
      </div>
    </header>
  );
}