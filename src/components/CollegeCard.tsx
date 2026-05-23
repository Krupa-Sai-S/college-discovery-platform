'use client';

import Link from 'next/link';
import { useCompare } from '@/contexts/CompareContext';

interface College {
  id: number;
  name: string;
  location: string;
  state: string;
  type: string;
  rating: number;
  total_fee: number;
  nirf_rank?: number;
  image_color?: string;
  avg_package?: number;
  placement_rate?: number;
}

function formatFee(fee: number): string {
  if (fee >= 100000) return `₹${(fee / 100000).toFixed(1)}L`;
  return `₹${(fee / 1000).toFixed(0)}K`;
}

function formatPackage(pkg: number): string {
  if (pkg >= 10000000) return `₹${(pkg / 10000000).toFixed(1)}Cr`;
  if (pkg >= 100000) return `₹${(pkg / 100000).toFixed(1)}L`;
  return `₹${pkg}`;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="stars">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const partial = !filled && i < rating;
        return (
          <svg key={i} className="star" viewBox="0 0 24 24">
            <defs>
              <linearGradient id={`g-${i}-${rating}`}>
                <stop offset={filled ? '100%' : partial ? `${(rating - Math.floor(rating)) * 100}%` : '0%'} stopColor="currentColor" />
                <stop offset={filled ? '100%' : partial ? `${(rating - Math.floor(rating)) * 100}%` : '0%'} stopColor="currentColor" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill={filled ? 'currentColor' : `url(#g-${i}-${rating})`}
            />
          </svg>
        );
      })}
    </div>
  );
}

export default function CollegeCard({ college }: { college: College }) {
  const { addCollege, removeCollege, isAdded } = useCompare();
  const added = isAdded(college.id);

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (added) removeCollege(college.id);
    else addCollege({ id: college.id, name: college.name, type: college.type });
  };

  // Mouse-tracking glow effect
  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
  };

  const bgColor = college.image_color || '#7c6bff';

  // Generate a subtle grid pattern color
  const patternColor = `${bgColor}22`;

  return (
    <Link
      href={`/colleges/${college.id}`}
      className="college-card"
      onMouseMove={handleMouseMove}
      style={{ '--card-color': bgColor } as React.CSSProperties}
    >
      {/* Banner */}
      <div
        className="college-card-banner"
        style={{
          background: `
            linear-gradient(135deg, ${bgColor}ee 0%, ${bgColor}88 60%, ${bgColor}44 100%)
          `,
        }}
      >
        {/* Decorative pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(${patternColor} 1px, transparent 1px)`,
          backgroundSize: '20px 20px', zIndex: 0,
        }} />

        <span className={`college-type-badge badge-${college.type.replace(/\s+/g, '')}`}>
          {college.type}
        </span>

        {college.nirf_rank && (
          <span className="college-rank-badge">NIRF #{college.nirf_rank}</span>
        )}

        {/* College initial */}
        <div style={{
          position: 'absolute', bottom: 12, right: 16, zIndex: 2,
          width: 40, height: 40, borderRadius: '10px',
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', fontWeight: 900, color: 'white',
          fontFamily: 'Outfit, sans-serif',
        }}>
          {college.name.charAt(0)}
        </div>
      </div>

      {/* Body */}
      <div className="college-card-body">
        <div className="college-card-name">{college.name}</div>

        <div className="college-card-location">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          {college.location}, {college.state}
        </div>

        <div className="college-card-meta">
          <div className="meta-item">
            <span className="meta-label">Total Fee</span>
            <span className="meta-value orange">{formatFee(college.total_fee)}</span>
          </div>
          {college.avg_package != null && (
            <div className="meta-item">
              <span className="meta-label">Avg Package</span>
              <span className="meta-value green">{formatPackage(college.avg_package)}</span>
            </div>
          )}
          {college.placement_rate != null && (
            <div className="meta-item">
              <span className="meta-label">Placement</span>
              <span className="meta-value">{college.placement_rate}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="college-card-footer">
        <div className="rating-stars">
          <span className="rating-value">{college.rating.toFixed(1)}</span>
          <StarRating rating={college.rating} />
        </div>
        <div className="card-actions">
          <button
            id={`compare-btn-${college.id}`}
            className={`btn-compare ${added ? 'added' : ''}`}
            onClick={handleCompare}
            aria-label={added ? 'Remove from compare' : 'Add to compare'}
          >
            {added ? '✓ Added' : '+ Compare'}
          </button>
        </div>
      </div>
    </Link>
  );
}
