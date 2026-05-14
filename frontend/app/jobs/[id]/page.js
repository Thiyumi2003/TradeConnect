"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiRequest } from '../../../lib/api';

const statusOptions = ['Open', 'In Progress', 'Closed'];

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

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadJob() {
      setLoading(true);
      setError('');

      try {
        const response = await apiRequest(`/api/jobs/${params.id}`);
        if (!ignore) {
          setJob(response.data);
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

    if (params.id) {
      loadJob();
    }

    return () => {
      ignore = true;
    };
  }, [params.id]);

  async function handleStatusChange(event) {
    const nextStatus = event.target.value;

    setSavingStatus(true);
    setError('');

    try {
      const response = await apiRequest(`/api/jobs/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });

      setJob(response.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleDelete() {
    const shouldDelete = window.confirm('Delete this job request?');
    if (!shouldDelete) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      await apiRequest(`/api/jobs/${params.id}`, { method: 'DELETE' });
      router.push('/');
    } catch (requestError) {
      setError(requestError.message);
      setDeleting(false);
    }
  }

  if (loading) {
    return <div className="note">Loading job details...</div>;
  }

  if (error && !job) {
    return (
      <section className="detail-card">
        <div className="error">{error}</div>
        <div className="actions">
          <Link href="/" className="secondary-btn">
            Back to jobs
          </Link>
        </div>
      </section>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <section className="detail-shell">
      <div className="detail-card">
        <div className="detail-top">
          <div>
            <p className="hero-kicker">Job detail</p>
            <h1 className="detail-title">{job.title}</h1>
            <p className="helper">Created {formatDate(job.createdAt)}</p>
          </div>
          <span className={statusClass(job.status)}>{job.status}</span>
        </div>

        <div className="detail-grid">
          <div className="detail-field full">
            <span>Description</span>
            <div>{job.description}</div>
          </div>
          <div className="detail-field">
            <span>Category</span>
            <div>{job.category || 'Not set'}</div>
          </div>
          <div className="detail-field">
            <span>Location</span>
            <div>{job.location || 'Not set'}</div>
          </div>
          <div className="detail-field">
            <span>Contact name</span>
            <div>{job.contactName || 'Not set'}</div>
          </div>
          <div className="detail-field">
            <span>Contact email</span>
            <div>{job.contactEmail}</div>
          </div>
        </div>

        <div className="form-grid" style={{ marginTop: 24 }}>
          <div className="field-group">
            <label htmlFor="status">Change status</label>
            <select
              id="status"
              value={job.status}
              onChange={handleStatusChange}
              disabled={savingStatus || deleting}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="actions">
          <Link href="/" className="secondary-btn">
            Back
          </Link>
          <button className="danger-btn" type="button" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete job'}
          </button>
        </div>

        {savingStatus ? <div className="note">Updating status...</div> : null}
        {error ? <div className="error">{error}</div> : null}
      </div>
    </section>
  );
}
