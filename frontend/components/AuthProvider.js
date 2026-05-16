"use client";

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearStoredSession, getStoredSession, setStoredSession } from '../lib/session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(getStoredSession());
    setReady(true);
  }, []);

  const value = useMemo(() => {
    const user = session?.user || null;

    return {
      ready,
      user,
      token: session?.token || '',
      isAuthenticated: Boolean(user),
      role: user?.role || 'public',
      setSession(nextSession) {
        setStoredSession(nextSession);
        setSession(nextSession);
      },
      clearSession() {
        clearStoredSession();
        setSession(null);
      },
    };
  }, [ready, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
