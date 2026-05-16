const SESSION_KEY = 'tradeconnect-session';

export function getStoredSession() {
  if (typeof window === 'undefined') return null;

  const rawSession = window.localStorage.getItem(SESSION_KEY);
  if (!rawSession) return null;

  try {
    return JSON.parse(rawSession);
  } catch {
    return null;
  }
}

export function setStoredSession(session) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function getStoredToken() {
  return getStoredSession()?.token || '';
}

export function getStoredUser() {
  return getStoredSession()?.user || null;
}
