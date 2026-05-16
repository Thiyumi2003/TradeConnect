"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ChevronDown,
  PencilLine,
  Trash2,
  Calendar,
  MapPin,
  ArrowRight,
  Droplet,
  Zap,
  Paintbrush,
  Box,
  LayoutGrid,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../../lib/api';
import { showSuccess, showError } from '../../../lib/notify';
import { useAuth } from '../../../components/AuthProvider';

const categoryOptions = ['Plumbing', 'Electrical', 'Painting', 'Joinery'];

const emptyForm = {
  title: '',
  description: '',
  category: '',
  location: '',
  contactName: '',
  contactEmail: '',
};

function formatDate(value) {
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusClass(status) {
  if (status === 'Open') return 'badge status-open';
  if (status === 'In Progress') return 'badge status-progress';
  return 'badge status-closed';
}

function categoryIconClass(category) {
  if (category === 'Plumbing') return 'cat-icon cat-plumbing';
  if (category === 'Electrical') return 'cat-icon cat-electrical';
  if (category === 'Painting') return 'cat-icon cat-painting';
  if (category === 'Joinery') return 'cat-icon cat-joinery';
  return 'cat-icon';
}

function CategoryIcon({ category, size = 18 }) {
  if (category === 'Plumbing') return <Droplet size={size} />;
  if (category === 'Electrical') return <Zap size={size} />;
  if (category === 'Painting') return <Paintbrush size={size} />;
  if (category === 'Joinery') return <Box size={size} />;
  return <LayoutGrid size={size} />;
}

export default function NewJobPage() {
  const router = useRouter();
  const { ready, user, role } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [ownJobs, setOwnJobs] = useState([]);
  const [loadingOwnJobs, setLoadingOwnJobs] = useState(false);

  const isHomeowner = user?.role === 'homeowner';

  useEffect(() => {
    let ignore = false;

    async function loadOwnJobs() {
      if (!ready || !isHomeowner) {
        setOwnJobs([]);
        return;
      }

      setLoadingOwnJobs(true);

      try {
        const response = await apiRequest('/api/jobs/mine');
        if (!ignore) {
          setOwnJobs(response.data || []);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      } finally {
        if (!ignore) {
          setLoadingOwnJobs(false);
        }
      }
    }

    loadOwnJobs();

    return () => {
      ignore = true;
    };
  }, [isHomeowner, ready]);

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
      setForm(emptyForm);
      setFieldErrors({});
      setOwnJobs((current) => [response.data, ...current]);
    } catch (requestError) {
      const message = requestError.message || 'Failed to create job';
      setError(message);
      showError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteJob(jobId) {
    const shouldDelete = window.confirm('Delete this job request?');

    if (!shouldDelete) {
      return;
    }

    try {
      await apiRequest(`/api/jobs/${jobId}`, { method: 'DELETE' });
      setOwnJobs((current) => current.filter((job) => job._id !== jobId));
      showSuccess('Job deleted successfully');
    } catch (requestError) {
      const message = requestError.message || 'Failed to delete job';
      showError(message);
      setError(message);
    }
  }

  if (!ready) {
    return <div className="note">Loading access...</div>;
  }

  if (!user || role !== 'homeowner') {
    return (
      <section className="auth-page">
        <div className="auth-card form-card auth-gate">
          <p className="hero-kicker hero-kicker-dark">Homeowner Access</p>
          <h1>Login as a homeowner to post jobs</h1>
          <p className="helper">
            Public users can browse jobs. Homeowners can post new requests and manage their own jobs.
          </p>
          <div className="auth-actions">
            <Link href="/login" className="primary-btn">
              Login
            </Link>
            <Link href="/register" className="secondary-btn">
              Register
            </Link>
          </div>
        </div>
      </section>
    );
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

      <section className="my-jobs-section">
        <div className="section-heading-row">
          <div>
            <p className="hero-kicker hero-kicker-dark">Your jobs</p>
            <h2>Your posted jobs</h2>
          </div>
          <span className="helper">{loadingOwnJobs ? 'Loading your jobs...' : `${ownJobs.length} posted job(s)`}</span>
        </div>

        {ownJobs.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">No jobs posted yet.</p>
            <p className="empty-state-text">Your job requests will appear here after you create them.</p>
          </div>
        ) : null}

        {ownJobs.length > 0 ? (
          <div className="my-jobs-grid">
            {ownJobs.map((job) => (
              <div key={job._id} className="mine-job-card">
                <Link href={`/jobs/${job._id}`} className="mine-job-card-link">
                  <div className="mine-job-icon">
                    {/* small category icon */}
                    <span className={categoryIconClass(job.category)}>
                      <CategoryIcon category={job.category} size={18} />
                    </span>
                  </div>

                  <div className="mine-job-main">
                    <div className="mine-job-top">
                      <div>
                        <h3 className="mine-job-title">{job.title}</h3>
                        <p className="mine-job-meta">{job.category || 'Uncategorized'}</p>
                      </div>
                    </div>
                    <p className="mine-job-description">{job.description}</p>
                    <div className="mine-job-info">
                      <span><Calendar size={14} /> {formatDate(job.createdAt)}</span>
                      <span><MapPin size={14} /> {job.location || 'Location not set'}</span>
                    </div>
                  </div>
                </Link>

                <div className="mine-job-actions">
                  <span className={statusClass(job.status)}>{job.status}</span>

                  <button
                    type="button"
                    className="danger-btn mine-job-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteJob(job._id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </section>
  );
}
