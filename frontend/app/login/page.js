"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiRequest, setAuthToken } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: 'demo@tradeconnect.com', password: 'password123' });
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

      setAuthToken(response.token);
      router.push('/');
      router.refresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="form-card login-card">
      <p className="hero-kicker">Authentication</p>
      <h1>Login to post or delete jobs.</h1>
      <p className="helper">Use the demo credentials unless you override them in the backend env.</p>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field-group full">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" value={form.email} onChange={handleChange} />
        </div>

        <div className="field-group full">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <div className="actions full">
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </div>
      </form>

      {error ? <div className="error">{error}</div> : null}
    </section>
  );
}