"use client";

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Building2, CalendarDays, ChevronDown, MapPin, PencilLine, Trash2, User, Mail, LockKeyhole, Wrench } from 'lucide-react';
import Modal from '../../../components/Modal';
import { apiRequest } from '../../../lib/api';
import { showSuccess, showError } from '../../../lib/notify';

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
  if (status === 'Open') return 'badge detail-badge detail-badge-open';
  if (status === 'In Progress') return 'badge detail-badge detail-badge-progress';
  return 'badge detail-badge detail-badge-closed';
}

function categoryIconClass(category) {
  if (category === 'Plumbing') return 'detail-job-icon detail-job-icon-blue';
  if (category === 'Electrical') return 'detail-job-icon detail-job-icon-amber';
  if (category === 'Painting') return 'detail-job-icon detail-job-icon-purple';
  if (category === 'Joinery') return 'detail-job-icon detail-job-icon-orange';
  return 'detail-job-icon';
}

function CategoryIcon({ category }) {
  if (category === 'Plumbing') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 10V8.5C6 7.12 7.12 6 8.5 6H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 6H15.5C17.43 6 19 7.57 19 9.5V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 12V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 12V16C8 17.1 8.9 18 10 18H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19 11H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M14 18C14 19.1 13.1 20 12 20C10.9 20 10 19.1 10 18C10 16.9 12 15 12 15C12 15 14 16.9 14 18Z" fill="currentColor" />
      </svg>
    );
  }
  if (category === 'Electrical') return <Building2 size={22} />;
  if (category === 'Painting') return <PencilLine size={22} />;
  if (category === 'Joinery') return <Building2 size={22} />;
  return <Wrench size={22} />;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const statusSelectRef = useRef(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
      showSuccess('Status updated successfully');
    } catch (requestError) {
      setError(requestError.message);
      showError(requestError.message);
    } finally {
      setSavingStatus(false);
    }
  }

  function handleDeleteClick() {
    setShowDeleteModal(true);
  }

  async function handleConfirmDelete() {
    setShowDeleteModal(false);
    setDeleting(true);
    setError('');

    try {
      await apiRequest(`/api/jobs/${params.id}`, { method: 'DELETE' });
      showSuccess('Job deleted successfully');
      router.push('/');
    } catch (requestError) {
      const message = requestError.message || 'Failed to delete job';
      setError(message);
      showError(message);
      setDeleting(false);
    }
  }

  function handleCancelDelete() {
    setShowDeleteModal(false);
  }

  if (loading) {
    return <div className="note">Loading job details...</div>;
  }

  if (error && !job) {
    return (
      <div className="detail-page-shell">
        <Link href="/" className="back-link">
          <ArrowLeft size={14} /> Back to Jobs
        </Link>
        <div className="detail-card detail-card-empty">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="detail-page-shell">
      <Link href="/" className="back-link">
        <ArrowLeft size={14} /> Back to Jobs
      </Link>

      <article className="detail-card detail-layout">
        <div className="detail-header">
          <div className="detail-title-block">
            <div className={categoryIconClass(job.category)}>
              <CategoryIcon category={job.category} />
            </div>
            <div className="detail-title-copy">
              <div className="detail-title-row">
                <h1 className="detail-title">{job.title}</h1>
                <span className={statusClass(job.status)}>{job.status}</span>
              </div>
              <p className="detail-category">{job.category || 'Uncategorized'}</p>
              <p className="detail-posted">Posted on {formatDate(job.createdAt)}</p>
            </div>
          </div>

          <div className="detail-actions">
            <button
              type="button"
              className="detail-outline-btn"
              onClick={() => statusSelectRef.current?.focus()}
            >
              <PencilLine size={15} /> Edit Status
            </button>
            <button
              type="button"
              className="detail-outline-btn detail-delete-btn"
              onClick={handleDeleteClick}
              disabled={deleting}
            >
              <Trash2 size={15} /> {deleting ? 'Deleting...' : 'Delete Job'}
            </button>
          </div>
        </div>

        <div className="detail-body">
          <div className="detail-main">
            <section className="detail-section detail-description-section">
              <h2 className="detail-section-title">Description</h2>
              <p className="detail-description">{job.description}</p>
            </section>

            <section className="detail-status-panel">
              <h2 className="detail-section-title">Update Status</h2>
              <div className="detail-status-row">
                <div className="detail-select-wrap">
                  <select
                    id="status"
                    ref={statusSelectRef}
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
                  <ChevronDown className="field-select-icon detail-select-icon" size={18} />
                </div>
                <button
                  type="button"
                  className="detail-update-btn"
                  onClick={() => statusSelectRef.current?.focus()}
                  disabled={savingStatus || deleting}
                >
                  <LockKeyhole size={15} /> {savingStatus ? 'Updating Status...' : 'Update Status'}
                </button>
              </div>
            </section>
          </div>

          <aside className="detail-sidebar">
            <div className="detail-sidebar-field">
              <h3>Location</h3>
              <p>
                <MapPin size={15} /> {job.location || 'Not specified'}
              </p>
            </div>
            <div className="detail-sidebar-field">
              <h3>Contact Name</h3>
              <p>
                <User size={15} /> {job.contactName || 'Not specified'}
              </p>
            </div>
            <div className="detail-sidebar-field">
              <h3>Contact Email</h3>
              <p>
                <Mail size={15} /> {job.contactEmail || 'Not specified'}
              </p>
            </div>
          </aside>
        </div>
      </article>

      {error ? <div className="error detail-error">{error}</div> : null}

      <Modal
        isOpen={showDeleteModal}
        title="Delete Job"
        message="Are you sure you want to delete this job request? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
