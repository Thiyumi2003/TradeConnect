"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiRequest } from '../../../lib/api';

const emptyForm = {
  title: '',
  description: '',
  category: '',
  location: '',
  contactName: '',
  contactEmail: '',
};

export default function NewJobPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function validateForm() {
    if (!form.title.trim()) return 'Title is required.';
    if (!form.description.trim()) return 'Description is required.';
    if (!form.category.trim()) return 'Category is required.';
    if (!form.location.trim()) return 'Location is required.';
    if (!form.contactName.trim()) return 'Contact name is required.';
    if (!form.contactEmail.trim()) return 'Contact email is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.contactEmail.trim())) {
      return 'Enter a valid email address.';
    }

    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationMessage = validateForm();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await apiRequest('/api/jobs', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      router.push(`/jobs/${response.data._id}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="form-card">
      <p className="hero-kicker">New job request</p>
      <h1>Create a request for a homeowner.</h1>
      <p className="helper">Submit goes straight to the Express API and MongoDB.</p>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field-group full">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" value={form.title} onChange={handleChange} />
        </div>

        <div className="field-group full">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div className="field-group">
          <label htmlFor="category">Category</label>
          <input id="category" name="category" value={form.category} onChange={handleChange} />
        </div>

        <div className="field-group">
          <label htmlFor="location">Location</label>
          <input id="location" name="location" value={form.location} onChange={handleChange} />
        </div>

        <div className="field-group">
          <label htmlFor="contactName">Contact name</label>
          <input
            id="contactName"
            name="contactName"
            value={form.contactName}
            onChange={handleChange}
          />
        </div>

        <div className="field-group">
          <label htmlFor="contactEmail">Contact email</label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            value={form.contactEmail}
            onChange={handleChange}
          />
        </div>

        <div className="actions full">
          <button className="primary-btn" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Submit job'}
          </button>
        </div>
      </form>

      {error ? <div className="error">{error}</div> : null}
    </section>
  );
}
