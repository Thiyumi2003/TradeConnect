"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearAuthToken, getAuthToken } from '../lib/api';

export default function AuthNav() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(getAuthToken()));
  }, []);

  function handleLogout() {
    clearAuthToken();
    setIsLoggedIn(false);
    router.push('/');
    router.refresh();
  }

  if (!isLoggedIn) {
    return (
      <Link href="/login" className="nav-link">
        Login
      </Link>
    );
  }

  return (
    <button type="button" className="nav-link nav-button" onClick={handleLogout}>
      Logout
    </button>
  );
}