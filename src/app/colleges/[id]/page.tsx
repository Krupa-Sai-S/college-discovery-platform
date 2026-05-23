'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useCompare } from '@/contexts/CompareContext';

interface Course {
  id: number;
  name: string;
  duration: string;
  fee: number;
  seats: number;
}

interface Placement {
  avg_package: number;
  highest_package: number;
  placement_rate: number;
  top_recruiters: string[];
}

interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
  category: string;
}

interface CollegeDetail {
  id: number;
  name: string;
  location: string;
  state: string;
  type: string;
  rating: number;
  total_fee: number;
  established?: number;
  affiliation?: string;
  overview?: string;
  image_color?: string;
  accreditation?: string;
  nirf_rank?: number;
}

type TabKey = 'overview' | 'courses' | 'placements' | 'reviews';

function formatFee(fee: number) {
  if (fee >= 100000) return `₹${(fee / 100000).toFixed(1)}L`;
  return `₹${(fee / 1000).toFixed(0)}K`;
}

function formatPkg(pkg: number) {
  if (pkg >= 10000000) return `₹${(pkg / 10000000).toFixed(1)} Cr`;
  if (pkg >= 100000) return `₹${(pkg / 100000).toFixed(1)} LPA`;
  return `₹${pkg}`;
}

export default function CollegeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [college, setCollege] = useState<CollegeDetail | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [loading, setLoading] = useState(true);

  const { addCollege, removeCollege, isAdded } = useCompare();
  const added = college ? isAdded(college.id) : false;

  useEffect(() => {
    fetch(`/api/colleges/${id}`)
      .then(r => r.json())
      .then(data => {
        setCollege(data.college);
        setCourses(data.courses);
        setPlacement(data.placement);
        setReviews(data.reviews);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ padding: '60px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="skeleton" style={{ height: '200px', borderRadius: '16px' }} />
          <div className="skeleton" style={{ height: '24px', width: '60%' }} />
          <div className="skeleton" style={{ height: '16px', width: '40%' }} />
        </div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-icon">😕</div>
          <div className="empty-title">College not found</div>
          <Link href="/colleges" className="btn-primary">← Back to Colleges</Link>
        </div>
      </div>
    );
  }

  const bgColor = college.image_color || '#1a237e';

  const TABS: { key: TabKey; label: string; emoji: string }[] = [
    { key: 'overview', label: 'Overview', emoji: '📋' },
    { key: 'courses', label: `Courses (${courses.length})`, emoji: '📚' },
    { key: 'placements', label: 'Placements', emoji: '💼' },
    { key: 'reviews', label: `Reviews (${reviews.length})`, emoji: '⭐' },
  ];

  return (
    <div className="page-container" style={{ paddingBottom: '80px' }}>
      <div className="page-header">
        <Link href="/colleges" className="back-link">
          ← Back to Colleges
        </Link>

        {/* Banner */}
        <div
          className="detail-banner"
          style={{ background: `linear-gradient(135deg, ${bgColor}ff 0%, ${bgColor}88 100%)` }}
        >
          <div className="detail-banner-content">
            <span className={`college-type-badge badge-${college.type}`} style={{ position: 'static', display: 'inline-block', marginBottom: '8px' }}>
              {college.type}
            </span>
            <h1 className="detail-college-name">{college.name}</h1>
          </div>
          {college.nirf_rank && (
            <div className="college-rank-badge" style={{ position: 'absolute', top: 16, right: 16 }}>
              NIRF #{college.nirf_rank}
            </div>
          )}
        </div>

        {/* Meta Row */}
        <div className="detail-meta-row">
          <div className="detail-meta-chip">
            📍 {college.location}, {college.state}
          </div>
          {college.established && (
            <div className="detail-meta-chip">🏛 Est. {college.established}</div>
          )}
          {college.accreditation && college.accreditation !== 'None' && (
            <div className="detail-meta-chip">🏆 {college.accreditation}</div>
          )}
          {college.affiliation && (
            <div className="detail-meta-chip">🔗 {college.affiliation}</div>
          )}
          <div style={{ marginLeft: 'auto' }}>
            <button
              id={`detail-compare-btn-${college.id}`}
              className={`btn-compare ${added ? 'added' : ''}`}
              style={{ padding: '8px 20px', fontSize: '0.875rem' }}
              onClick={() => added ? removeCollege(college.id) : addCollege({ id: college.id, name: college.name, type: college.type })}
            >
              {added ? '✓ Added to Compare' : '+ Add to Compare'}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="detail-stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon">⭐</div>
            <div className="stat-card-value">{college.rating.toFixed(1)}/5</div>
            <div className="stat-card-label">Overall Rating</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">💰</div>
            <div className="stat-card-value">{formatFee(college.total_fee)}</div>
            <div className="stat-card-label">Total Fee</div>
          </div>
          {placement && (
            <>
              <div className="stat-card">
                <div className="stat-card-icon">📈</div>
                <div className="stat-card-value">{formatPkg(placement.avg_package)}</div>
                <div className="stat-card-label">Avg Package</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon">🎯</div>
                <div className="stat-card-value">{placement.placement_rate}%</div>
                <div className="stat-card-label">Placement Rate</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          <p className="overview-content">{college.overview}</p>
          <div className="info-grid">
            {college.established && (
              <div className="info-item">
                <div className="info-item-label">Established</div>
                <div className="info-item-value">{college.established}</div>
              </div>
            )}
            <div className="info-item">
              <div className="info-item-label">Type</div>
              <div className="info-item-value">{college.type}</div>
            </div>
            {college.affiliation && (
              <div className="info-item">
                <div className="info-item-label">Affiliation</div>
                <div className="info-item-value">{college.affiliation}</div>
              </div>
            )}
            {college.accreditation && (
              <div className="info-item">
                <div className="info-item-label">Accreditation</div>
                <div className="info-item-value">{college.accreditation}</div>
              </div>
            )}
            <div className="info-item">
              <div className="info-item-label">Location</div>
              <div className="info-item-value">{college.location}, {college.state}</div>
            </div>
            {college.nirf_rank && (
              <div className="info-item">
                <div className="info-item-label">NIRF Rank</div>
                <div className="info-item-value">#{college.nirf_rank}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div>
          <div className="section-header" style={{ marginBottom: '20px' }}>
            <h2 className="section-title" style={{ fontSize: '1.1rem' }}>Available Programs</h2>
            <span className="section-tag">{courses.length} Programs</span>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Program Name</th>
                  <th>Duration</th>
                  <th>Annual Fee</th>
                  <th>Seats</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course.id}>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{course.name}</td>
                    <td>{course.duration}</td>
                    <td style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>
                      {formatFee(course.fee)}/yr
                    </td>
                    <td>{course.seats}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'placements' && placement && (
        <div>
          <div className="placement-overview">
            <div className="placement-stat-card">
              <div className="placement-stat-label">Average Package</div>
              <div className="placement-stat-value" style={{ color: 'var(--accent-green)' }}>
                {formatPkg(placement.avg_package)}
              </div>
            </div>
            <div className="placement-stat-card">
              <div className="placement-stat-label">Highest Package</div>
              <div className="placement-stat-value" style={{ color: 'var(--accent-gold)' }}>
                {formatPkg(placement.highest_package)}
              </div>
            </div>
            <div className="placement-stat-card">
              <div className="placement-stat-label">Placement Rate</div>
              <div className="placement-stat-value">{placement.placement_rate}%</div>
              <div className="placement-rate-bar">
                <div
                  className="placement-rate-fill"
                  style={{ width: `${placement.placement_rate}%` }}
                />
              </div>
            </div>
          </div>
          <div>
            <div className="filter-section-label" style={{ marginBottom: '12px' }}>Top Recruiters</div>
            <div className="recruiter-chips">
              {placement.top_recruiters.map(r => (
                <span key={r} className="recruiter-chip">{r}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div>
          {reviews.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-icon">💬</div>
              <div className="empty-title">No reviews yet</div>
            </div>
          ) : (
            <div className="reviews-grid">
              {reviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <span className="review-author">{review.author}</span>
                    <span className="review-category">{review.category}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>
                      {Number(review.rating).toFixed(1)}
                    </span>
                    <span style={{ color: 'var(--accent-gold)' }}>{'★'.repeat(Math.round(review.rating))}</span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  <div className="review-date">{review.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
