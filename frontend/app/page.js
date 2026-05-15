"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';
import heroImage from '../images/home new.png';
import { 
  Search, 
  ChevronDown, 
  FilterX, 
  Droplet, 
  Zap, 
  Paintbrush, 
  Box, 
  MapPin, 
  Calendar, 
  ArrowRight,
  LayoutGrid
} from 'lucide-react';

const categoryOptions = ['All', 'Plumbing', 'Electrical', 'Painting', 'Joinery'];
const statusOptions = ['All Statuses', 'Open', 'In Progress', 'Closed'];

function statusClass(status) {
  if (status === 'Open') return 'badge status-open';
  if (status === 'In Progress') return 'badge status-progress';
  return 'badge status-closed';
}

function formatDate(value) {
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function CategoryIcon({ category, size = 20 }) {
  if (category === 'Plumbing') return <Droplet size={size} />;
  if (category === 'Electrical') return <Zap size={size} />;
  if (category === 'Painting') return <Paintbrush size={size} />;
  if (category === 'Joinery') return <Box size={size} />;
  return <LayoutGrid size={size} />;
}

function categoryIconClass(category) {
  if (category === 'Plumbing') return 'cat-icon cat-plumbing';
  if (category === 'Electrical') return 'cat-icon cat-electrical';
  if (category === 'Painting') return 'cat-icon cat-painting';
  if (category === 'Joinery') return 'cat-icon cat-joinery';
  return 'cat-icon';
}

export default function HomePage() {
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All Statuses');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(4);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (category !== 'All') {
      params.set('category', category);
    }

    if (status !== 'All Statuses') {
      params.set('status', status);
    }

    if (searchTerm.trim()) {
      params.set('q', searchTerm.trim());
    }

    const serialized = params.toString();
    return serialized ? `?${serialized}` : '';
  }, [category, searchTerm, status]);

  useEffect(() => {
    setVisibleCount(4);
  }, [category, searchTerm, status]);

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
      <section className="hero home-hero">
        <div className="hero-illustration">
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="(max-width: 860px) 100vw, 60vw"
            className="hero-image"
          />
          <div className="hero-overlay">
            <h1>Find trusted tradespeople for your home jobs</h1>
            <br />  <br />
            <p className="hero-subtitle">
              Post your job for free and get it done by skilled local tradespeople.
            </p>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="filter-group filter-row">
          <div className="field-group search-field" style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              id="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search jobs by title or description..."
              style={{ paddingLeft: '46px' }}
            />
          </div>
          <div className="field-group compact-field" style={{ position: 'relative' }}>
            <select
              id="category-filter"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              style={{ appearance: 'none' }}
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'All' ? 'All Categories' : option}
                </option>
              ))}
            </select>
            <ChevronDown size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
          </div>
          <div className="field-group compact-field" style={{ position: 'relative' }}>
            <select
              id="status-filter"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              style={{ appearance: 'none' }}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
          </div>
          <div className="field-group compact-action">
            <button
              type="button"
              className="secondary-btn clear-btn"
              onClick={() => {
                setCategory('All');
                setStatus('All Statuses');
                setSearchTerm('');
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FilterX size={18} /> Clear Filters
            </button>
          </div>
        </div>
        <p className="helper">Click a job to open its detail page.</p>

        {loading ? <div className="note">Loading jobs...</div> : null}
        {error ? <div className="error">Unable to load jobs. {error}</div> : null}
        {!loading && !error && jobs.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">No jobs found.</p>
            <p className="empty-state-text">Try another category or create a new request.</p>
            <Link href="/jobs/new" className="primary-btn">
              Create Job Request
            </Link>
          </div>
        ) : null}

        {!loading && !error && jobs.length > 0 ? (
          <div className="grid-cards">
            {jobs.slice(0, visibleCount).map((job) => (
              <Link key={job._id} href={`/jobs/${job._id}`} className="job-card">
                <div className="job-head">
                  <div className="job-head-left">
                    <span className={categoryIconClass(job.category)}>
                      <CategoryIcon category={job.category} />
                    </span>
                    <h2 className="job-title">{job.title}</h2>
                  </div>
                  <span className={statusClass(job.status)}>{job.status}</span>
                </div>
                <div className="job-meta">
                  <p className="job-category">{job.category || 'Uncategorized'}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} /> {job.location || 'Location not set'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} /> {formatDate(job.createdAt)}
                  </div>
                  <p className="job-description">{job.description || 'No description'}</p>
                </div>
                <div className="job-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  View Details <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        ) : null}

        {!loading && !error && jobs.length > 0 ? (
          <div className="list-footer">
            <span>Showing {Math.min(visibleCount, jobs.length)} to {Math.min(visibleCount, jobs.length)} of {jobs.length} jobs</span>
            <button
              type="button"
              className="view-more"
              disabled={visibleCount >= jobs.length}
              onClick={() => setVisibleCount((count) => count + 4)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              View More Jobs <ChevronDown size={18} />
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
