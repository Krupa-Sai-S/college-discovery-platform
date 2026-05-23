'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

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
  accreditation?: string;
  established?: number;
  placement?: {
    avg_package: number;
    highest_package: number;
    placement_rate: number;
    top_recruiters: string[];
  };
  courses?: { name: string; fee: number }[];
}

function formatFee(fee: number) {
  if (fee >= 100000) return `₹${(fee / 100000).toFixed(1)}L`;
  return `₹${(fee / 1000).toFixed(0)}K`;
}

function formatPkg(pkg: number) {
  if (pkg >= 10000000) return `₹${(pkg / 10000000).toFixed(1)} Cr`;
  if (pkg >= 100000) return `₹${(pkg / 100000).toFixed(1)} LPA`;
  return `₹${pkg}`;
}

type ColRow = { label: string; key: string; format?: (c: College) => string | number; best?: 'max' | 'min' };

const COMPARE_ROWS: ColRow[] = [
  { label: 'Type', key: 'type' },
  { label: 'Location', key: 'location', format: c => `${c.location}, ${c.state}` },
  { label: 'Established', key: 'established', format: c => c.established ? c.established.toString() : '—' },
  { label: 'Accreditation', key: 'accreditation', format: c => c.accreditation || '—' },
  { label: 'NIRF Rank', key: 'nirf_rank', format: c => c.nirf_rank ? `#${c.nirf_rank}` : '—', best: 'min' },
  { label: 'Total Fee', key: 'total_fee', format: c => formatFee(c.total_fee), best: 'min' },
  { label: 'Rating', key: 'rating', format: c => `${c.rating.toFixed(1)} / 5`, best: 'max' },
  { label: 'Avg Package', key: 'avg_package', format: c => c.placement ? formatPkg(c.placement.avg_package) : '—', best: 'max' },
  { label: 'Highest Package', key: 'highest_package', format: c => c.placement ? formatPkg(c.placement.highest_package) : '—', best: 'max' },
  { label: 'Placement Rate', key: 'placement_rate', format: c => c.placement ? `${c.placement.placement_rate}%` : '—', best: 'max' },
];

function getBestIdx(colleges: College[], key: string, best: 'max' | 'min'): number {
  const values = colleges.map(c => {
    if (key === 'avg_package') return c.placement?.avg_package ?? (best === 'max' ? -Infinity : Infinity);
    if (key === 'highest_package') return c.placement?.highest_package ?? (best === 'max' ? -Infinity : Infinity);
    if (key === 'placement_rate') return c.placement?.placement_rate ?? (best === 'max' ? -Infinity : Infinity);
    if (key === 'nirf_rank') return c.nirf_rank ?? (best === 'min' ? Infinity : -Infinity);
    return (c as any)[key] as number;
  });
  const extreme = best === 'max' ? Math.max(...values) : Math.min(...values);
  return values.indexOf(extreme);
}

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idsParam = searchParams.get('ids') || '';

  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!idsParam) return;
    setLoading(true);
    fetch(`/api/compare?ids=${idsParam}`)
      .then(r => r.json())
      .then(d => setColleges(d.colleges || []))
      .finally(() => setLoading(false));
  }, [idsParam]);

  const removeCollege = (id: number) => {
    const newIds = colleges.filter(c => c.id !== id).map(c => c.id).join(',');
    if (newIds) {
      router.push(`/compare?ids=${newIds}`);
    } else {
      router.push('/compare');
    }
  };

  if (!idsParam || colleges.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⚖️</div>
        <div className="empty-title">No colleges to compare</div>
        <div className="empty-subtitle">
          Go to the college listing page and click "+ Compare" on at least 2 colleges.
        </div>
        <Link href="/colleges" className="btn-primary">Browse Colleges →</Link>
      </div>
    );
  }

  const numCols = colleges.length + 1; // +1 for label column

  return (
    <div className="compare-page">
      {/* Compare Rows & Header inside the scroll container for perfect alignment */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: `${numCols * 200}px` }}>
          {/* Header Row */}
          <div
            className="compare-header-row"
            style={{ gridTemplateColumns: `200px repeat(${colleges.length}, 1fr)`, marginBottom: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Link href="/colleges" className="back-link">← Add More</Link>
            </div>
            {colleges.map(c => (
              <div key={c.id} className="compare-college-header">
                <button
                  className="compare-remove-btn"
                  onClick={() => removeCollege(c.id)}
                  aria-label={`Remove ${c.name}`}
                >
                  ×
                </button>
                <div
                  style={{
                    height: '6px',
                    background: c.image_color || '#6c5ce7',
                    marginBottom: '16px',
                    borderRadius: '3px',
                  }}
                />
                <span className={`college-type-badge badge-${c.type}`}>{c.type}</span>
                <div className="compare-college-name">{c.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  📍 {c.location}
                </div>
                <Link
                  href={`/colleges/${c.id}`}
                  style={{ display: 'inline-block', marginTop: '12px', fontSize: '0.8rem', color: 'var(--accent-secondary)' }}
                >
                  View Details →
                </Link>
              </div>
            ))}
          </div>

          {/* General Info */}
          <div className="compare-section">
            <div className="compare-section-title">📋 General Information</div>
            {COMPARE_ROWS.slice(0, 5).map(row => {
              const bestIdx = row.best ? getBestIdx(colleges, row.key, row.best) : -1;
              return (
                <div
                  key={row.key}
                  className="compare-row"
                  style={{ gridTemplateColumns: `200px repeat(${colleges.length}, 1fr)` }}
                >
                  <div className="compare-label">{row.label}</div>
                  {colleges.map((c, idx) => (
                    <div
                      key={c.id}
                      className={`compare-value ${bestIdx === idx ? 'best' : ''}`}
                    >
                      {row.format ? row.format(c) : String((c as any)[row.key] ?? '—')}
                      {bestIdx === idx && <span style={{ marginLeft: '4px', fontSize: '0.8rem' }}>✓</span>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Fees & Rating */}
          <div className="compare-section">
            <div className="compare-section-title">💰 Fees & Rating</div>
            {COMPARE_ROWS.slice(5, 7).map(row => {
              const bestIdx = row.best ? getBestIdx(colleges, row.key, row.best) : -1;
              const values = colleges.map(c => (c as any)[row.key] as number);
              const maxVal = Math.max(...values);
              return (
                <div
                  key={row.key}
                  className="compare-row"
                  style={{ gridTemplateColumns: `200px repeat(${colleges.length}, 1fr)` }}
                >
                  <div className="compare-label">{row.label}</div>
                  {colleges.map((c, idx) => {
                    const val = (c as any)[row.key] as number;
                    const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
                    return (
                      <div key={c.id} className={`compare-value ${bestIdx === idx ? 'best' : ''}`}>
                        {row.format ? row.format(c) : val}
                        <div className="compare-bar">
                          <div className="compare-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Placements */}
          <div className="compare-section">
            <div className="compare-section-title">💼 Placements</div>
            {COMPARE_ROWS.slice(7, 10).map(row => {
              const bestIdx = row.best ? getBestIdx(colleges, row.key, row.best) : -1;
              return (
                <div
                  key={row.key}
                  className="compare-row"
                  style={{ gridTemplateColumns: `200px repeat(${colleges.length}, 1fr)` }}
                >
                  <div className="compare-label">{row.label}</div>
                  {colleges.map((c, idx) => (
                    <div key={c.id} className={`compare-value ${bestIdx === idx ? 'best' : ''}`}>
                      {row.format ? row.format(c) : '—'}
                      {bestIdx === idx && <span style={{ marginLeft: '4px', fontSize: '0.8rem' }}>✓</span>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Top Recruiters */}
          <div className="compare-section">
            <div className="compare-section-title">🏢 Top Recruiters</div>
            <div
              className="compare-row"
              style={{ gridTemplateColumns: `200px repeat(${colleges.length}, 1fr)`, alignItems: 'start' }}
            >
              <div className="compare-label">Companies</div>
              {colleges.map(c => (
                <div key={c.id} className="compare-value" style={{ textAlign: 'left' }}>
                  {c.placement?.top_recruiters ? (
                    <div className="recruiter-chips" style={{ justifyContent: 'flex-start' }}>
                      {c.placement.top_recruiters.slice(0, 4).map(r => (
                        <span key={r} className="recruiter-chip">{r}</span>
                      ))}
                    </div>
                  ) : '—'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <div className="page-container">
      <div style={{ paddingTop: '32px' }}>
        <div className="section-header">
          <h1 className="section-title">College Comparison</h1>
          <span className="section-tag">Side by Side</span>
        </div>
      </div>
      <Suspense fallback={<div style={{ padding: '40px 0', textAlign: 'center' }}>Loading comparison...</div>}>
        <CompareContent />
      </Suspense>
    </div>
  );
}
