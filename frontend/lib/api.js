import { clearStoredSession, getStoredToken, setStoredSession } from './session';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export function setAuthToken(token, user = null) {
  setStoredSession({ token, user });
}

export function clearAuthToken() {
  clearStoredSession();
}

export function getAuthToken() {
  return getStoredToken();
}

export async function apiRequest(path, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
}
