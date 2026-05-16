"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiRequest, setAuthToken } from '../../lib/api';
import { useAuth } from '../../components/AuthProvider';

const roleOptions = [
  { value: 'homeowner', label: 'Homeowner' },
  { value: 'tradesperson', label: 'Tradesperson' },
];

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'homeowner',
};

export default function RegisterPage() {
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
      const response = await apiRequest('/api/auth/register', {
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
        <p className="hero-kicker hero-kicker-dark">Register</p>
        <h1>Create your account</h1>
        <p className="helper">Homeowners can post jobs. Tradespeople can update job status.</p>

        <form className="form-grid auth-form" onSubmit={handleSubmit}>
          <div className="field-group form-field full-width">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Your name" />
          </div>

          <div className="field-group form-field full-width">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
          </div>

          <div className="field-group form-field full-width">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="At least 8 characters" />
          </div>

          <div className="field-group form-field full-width">
            <label htmlFor="role">Account type</label>
            <select id="role" name="role" value={form.role} onChange={handleChange}>
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="actions full-width auth-actions">
            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
            <Link href="/login" className="secondary-btn">
              I already have an account
            </Link>
          </div>
        </form>

        {error ? <div className="error form-error">{error}</div> : null}
      </div>
    </section>
  );
}
