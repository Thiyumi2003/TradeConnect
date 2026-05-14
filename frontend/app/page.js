"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';

const categoryOptions = ['All', 'Plumbing', 'Electrical', 'Painting', 'Joinery'];

function statusClass(status) {
  if (status === 'Open') return 'badge status-open';
  if (status === 'In Progress') return 'badge status-progress';
  return 'badge status-closed';
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function HomePage() {
  const [category, setCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (category !== 'All') {
      params.set('category', category);
    }

    if (searchTerm.trim()) {
      params.set('q', searchTerm.trim());
    }

    const serialized = params.toString();
    return serialized ? `?${serialized}` : '';
  }, [category, searchTerm]);

  useEffect(() => {
    let ignore = false;

    async function loadJobs() {
      setLoading(true);
      setError('');

      try {
        const response = await apiRequest(`/api/jobs${queryString}`);
        if (!ignore) {
          setJobs(response.data || []);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadJobs();

    return () => {
      ignore = true;
    };
  }, [queryString]);

  return (
    <div>
      <section className="hero">
        <div className="hero-card">
          <p className="hero-kicker">Mini service request board</p>
          <h1>Browse open jobs and respond fast.</h1>
          <p>
            Homeowners can post requests, and tradespeople can filter by category,
            view details, and update the status as work moves forward.
          </p>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <strong>{jobs.length}</strong>
            <span className="muted">Jobs visible in the current filter</span>
          </div>
          <div className="stat">
            <strong>3 pages</strong>
            <span className="muted">Home, new job form, and detail view</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="toolbar">
          <div className="field-group" style={{ minWidth: 240 }}>
            <label htmlFor="category-filter">Category filter</label>
            <select
              id="category-filter"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="field-group search-group">
            <label htmlFor="search">Keyword search</label>
            <input
              id="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search title or description"
            />
          </div>
          <p className="helper">Click a job to open its detail page.</p>
        </div>

        {loading ? <div className="note">Loading jobs...</div> : null}
        {error ? <div className="error">{error}</div> : null}
        {!loading && !error && jobs.length === 0 ? (
          <div className="note">No jobs found for this filter.</div>
        ) : null}

        {!loading && !error && jobs.length > 0 ? (
          <div className="grid-cards">
            {jobs.map((job) => (
              <Link key={job._id} href={`/jobs/${job._id}`} className="job-card">
                <div className="job-head">
                  <div>
                    <h2 className="job-title">{job.title}</h2>
                    <p className="muted" style={{ margin: '6px 0 0' }}>
                      {job.category || 'Uncategorized'}
                    </p>
                  </div>
                  <span className={statusClass(job.status)}>{job.status}</span>
                </div>
                <div className="job-meta">
                  <div>Location: {job.location || 'Not set'}</div>
                  <div>Contact: {job.contactName || 'Not set'}</div>
                  <div>Created: {formatDate(job.createdAt)}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
