"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';

export default function SiteHeader() {
  const pathname = usePathname();
  const jobsActive = pathname === '/';
  const newJobActive = pathname.startsWith('/jobs/new');

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
        <Link href="/jobs/new" className={newJobActive ? 'active-link' : ''}>
          New Job
        </Link>
      </nav>
      <div className="topbar-right">
        <Link href="/jobs/new" className="nav-cta">
          <Plus size={18} style={{ marginRight: '6px' }} /> Post a New Job
        </Link>
      </div>
    </header>
  );
}