"use client";

import { ChevronDown, PencilLine } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiRequest } from '../../../lib/api';
import { showSuccess, showError } from '../../../lib/notify';

const categoryOptions = ['Plumbing', 'Electrical', 'Painting', 'Joinery'];

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
  const [fieldErrors, setFieldErrors] = useState({});

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function validateForm() {
    const errors = {};

    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.description.trim()) errors.description = 'Description is required';
    if (!form.category.trim()) errors.category = 'Category is required';
    if (!form.location.trim()) errors.location = 'Location is required';
    if (!form.contactName.trim()) errors.contactName = 'Contact name is required';
    if (!form.contactEmail.trim()) errors.contactEmail = 'Contact email is required';
    if (form.contactEmail.trim() && !/^\S+@\S+\.\S+$/.test(form.contactEmail.trim())) {
      errors.contactEmail = 'Please enter a valid email address';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      setError('Please fix the errors above');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await apiRequest('/api/jobs', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      showSuccess('Job created successfully');
      router.push(`/jobs/${response.data._id}`);
    } catch (requestError) {
      const message = requestError.message || 'Failed to create job';
      setError(message);
      showError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="new-job-page">
      <div className="new-job-hero">
        <p className="hero-kicker hero-kicker-dark">New Job Request</p>
        <h1>Post a new service request</h1>
        <p className="hero-subtitle">Provide details about the job you need help with.</p>
      </div>

      <div className="new-job-card">
        <form className="new-job-form" onSubmit={handleSubmit}>
          <div className="form-row two-col">
            <div className="field-group form-field">
              <label htmlFor="title">
                Title <span className="required-mark">*</span>
              </label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Need plumber for leaking tap"
              />
              {fieldErrors.title ? <span className="field-error">{fieldErrors.title}</span> : null}
            </div>

            <div className="field-group form-field select-field">
              <label htmlFor="category">
                Category <span className="required-mark">*</span>
              </label>
              <select id="category" name="category" value={form.category} onChange={handleChange}>
                <option value="">Select a category</option>
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="field-select-icon" size={18} />
              {fieldErrors.category ? <span className="field-error">{fieldErrors.category}</span> : null}
            </div>
          </div>

          <div className="field-group form-field full-width">
            <label htmlFor="description">
              Description <span className="required-mark">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the issue in detail..."
            />
            {fieldErrors.description ? <span className="field-error">{fieldErrors.description}</span> : null}
          </div>

          <div className="form-row two-col bottom-row">
            <div className="field-group form-field">
              <label htmlFor="location">
                Location <span className="required-mark">*</span>
              </label>
              <input
                id="location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Kelaniya"
              />
              {fieldErrors.location ? <span className="field-error">{fieldErrors.location}</span> : null}
            </div>

            <div className="field-group form-field">
              <label htmlFor="contactName">
                Contact Name <span className="required-mark">*</span>
              </label>
              <input
                id="contactName"
                name="contactName"
                value={form.contactName}
                onChange={handleChange}
                placeholder="Your full name"
              />
              {fieldErrors.contactName ? <span className="field-error">{fieldErrors.contactName}</span> : null}
            </div>
          </div>

          <div className="form-row one-col">
            <div className="field-group form-field email-field">
              <label htmlFor="contactEmail">
                Contact Email <span className="required-mark">*</span>
              </label>
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={handleChange}
                placeholder="email@example.com"
              />
              {fieldErrors.contactEmail ? <span className="field-error">{fieldErrors.contactEmail}</span> : null}
            </div>
          </div>

          <div className="new-job-actions">
            <button className="primary-btn submit-job-btn" type="submit" disabled={submitting}>
              <PencilLine size={16} /> {submitting ? 'Posting...' : 'Post Job'}
            </button>
            <button className="secondary-btn cancel-job-btn" type="button" onClick={() => router.push('/')}>
              Cancel
            </button>
          </div>
        </form>

        {error ? <div className="error form-error">{error}</div> : null}
      </div>
    </section>
  );
}
