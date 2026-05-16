"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiRequest, setAuthToken } from '../../lib/api';
import { useAuth } from '../../components/AuthProvider';

const initialForm = {
  email: '',
  password: '',
};

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      setAuthToken(response.token, response.user);
      setSession(response);
      router.push(response.user.role === 'homeowner' ? '/jobs/new' : '/');
      router.refresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card form-card">
        <p className="hero-kicker hero-kicker-dark">Login</p>
        <h1>Welcome back</h1>
        <p className="helper">Sign in as a homeowner or tradesperson to continue.</p>

        <form className="form-grid auth-form" onSubmit={handleSubmit}>
          <div className="field-group form-field full-width">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
          </div>

          <div className="field-group form-field full-width">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Your password" />
          </div>

          <div className="actions full-width auth-actions">
            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
            <Link href="/register" className="secondary-btn">
              Create account
            </Link>
          </div>
        </form>

        {error ? <div className="error form-error">{error}</div> : null}
      </div>
    </section>
  );
}
