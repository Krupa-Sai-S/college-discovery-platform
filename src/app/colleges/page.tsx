'use client';

import { useState, useEffect, useCallback, Suspense, Fragment } from 'react';
import { useSearchParams } from 'next/navigation';
import CollegeCard from '@/components/CollegeCard';

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

interface ApiResponse {
  colleges: College[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const TYPES = ['IIT', 'NIT', 'IIIT', 'Private', 'Deemed', 'Government'];
const STATES = [
  'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Telangana',
  'Gujarat', 'Uttar Pradesh', 'Rajasthan', 'West Bengal', 'Kerala',
  'Madhya Pradesh', 'Punjab', 'Haryana', 'Bihar', 'Andhra Pradesh',
  'Odisha', 'Jharkhand', 'Uttarakhand', 'Assam'
];
const SORT_OPTIONS = [
  { value: 'rating_desc', label: 'Rating: High to Low' },
  { value: 'rating_asc', label: 'Rating: Low to High' },
  { value: 'fee_asc', label: 'Fee: Low to High' },
  { value: 'fee_desc', label: 'Fee: High to Low' },
  { value: 'nirf_rank', label: 'NIRF Rank' },
  { value: 'name_asc', label: 'Name: A-Z' },
];

function CollegesContent() {
  const searchParams = useSearchParams();

  // Sync state with URL params
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    searchParams.get('type') ? [searchParams.get('type')!] : []
  );
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');
  const [maxFee, setMaxFee] = useState(parseInt(searchParams.get('max_fee') || '2500000'));
  const [minRating, setMinRating] = useState(parseFloat(searchParams.get('min_rating') || '0'));
  const [sort, setSort] = useState(searchParams.get('sort') || 'rating_desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchColleges = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      selectedTypes.forEach(t => params.set('type', t)); // last one wins, good enough for single-select
      if (selectedState) params.set('state', selectedState);
      params.set('max_fee', maxFee.toString());
      params.set('min_rating', minRating.toString());
      params.set('sort', sort);
      params.set('page', page.toString());
      params.set('limit', '12');

      const res = await fetch(`/api/colleges?${params.toString()}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query, selectedTypes, selectedState, maxFee, minRating, sort, page]);

  useEffect(() => { fetchColleges(); }, [fetchColleges]);

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedTypes([]);
    setSelectedState('');
    setMaxFee(2500000);
    setMinRating(0);
    setSort('rating_desc');
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const formatFeeLabel = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${(val / 1000).toFixed(0)}K`;
  };

  return (
    <div className="page-container">
      {/* Search Bar at top of page */}
      <div style={{ paddingTop: '28px', marginBottom: '8px' }}>
        <form onSubmit={handleSearch}>
          <div className="search-bar" style={{ maxWidth: '600px' }}>
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              id="listing-search-input"
              type="text"
              className="search-input"
              placeholder="Search colleges..."
              value={query}
              onChange={e => { setQuery(e.target.value); setPage(1); }}
            />
            <button id="listing-search-btn" type="submit" className="search-button">Search</button>
          </div>
        </form>
      </div>

      <div className="listing-layout">
        {/* Filter Panel */}
        <aside className="filter-panel">
          <div className="filter-panel-title">
            <span>Filters</span>
            <button className="filter-clear-btn" onClick={clearFilters}>Clear All</button>
          </div>

          {/* Type */}
          <div className="filter-section">
            <div className="filter-section-label">College Type</div>
            <div className="filter-options">
              {TYPES.map(type => (
                <label key={type} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => toggleType(type)}
                    id={`filter-type-${type}`}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          {/* State */}
          <div className="filter-section">
            <div className="filter-section-label">State</div>
            <select
              id="filter-state-select"
              className="form-select"
              value={selectedState}
              onChange={e => { setSelectedState(e.target.value); setPage(1); }}
              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            >
              <option value="">All States</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Fee Range */}
          <div className="filter-section">
            <div className="filter-section-label">Max Total Fee</div>
            <div className="filter-range">
              <input
                id="filter-max-fee"
                type="range"
                min={100000}
                max={2500000}
                step={50000}
                value={maxFee}
                onChange={e => { setMaxFee(parseInt(e.target.value)); setPage(1); }}
              />
              <div className="filter-range-values">
                <span>₹1L</span>
                <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>{formatFeeLabel(maxFee)}</span>
                <span>₹25L</span>
              </div>
            </div>
          </div>

          {/* Min Rating */}
          <div className="filter-section">
            <div className="filter-section-label">Min Rating</div>
            <div className="filter-range">
              <input
                id="filter-min-rating"
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={minRating}
                onChange={e => { setMinRating(parseFloat(e.target.value)); setPage(1); }}
              />
              <div className="filter-range-values">
                <span>Any</span>
                <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>⭐ {minRating}+</span>
                <span>5.0</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div>
          <div className="toolbar">
            <div className="toolbar-left">
              <div className="results-count">
                {loading ? (
                  <span style={{ color: 'var(--text-muted)' }}>Searching...</span>
                ) : (
                  <span>
                    <strong>{data?.total ?? 0}</strong> colleges found
                  </span>
                )}
              </div>
            </div>
            <select
              id="sort-select"
              className="sort-select"
              value={sort}
              onChange={e => { setSort(e.target.value); setPage(1); }}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="colleges-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton" style={{ height: '90px', borderRadius: 0 }} />
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="skeleton" style={{ height: '18px', width: '80%' }} />
                    <div className="skeleton" style={{ height: '14px', width: '50%' }} />
                    <div className="skeleton" style={{ height: '14px', width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.colleges.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <div className="empty-title">No colleges found</div>
              <div className="empty-subtitle">Try adjusting your filters or search query.</div>
              <button className="btn-primary" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="colleges-grid">
                {data?.colleges.map(college => (
                  <CollegeCard key={college.id} college={college} />
                ))}
              </div>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="pagination">
                  <button
                    id="page-prev"
                    className="page-btn"
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: data.totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === data.totalPages || Math.abs(p - page) <= 2)
                    .map((p, idx, arr) => {
                      const prev = arr[idx - 1];
                      return (
                        <Fragment key={p}>
                          {prev && p - prev > 1 && (
                            <span style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>
                          )}
                          <button
                            id={`page-btn-${p}`}
                            className={`page-btn ${p === page ? 'active' : ''}`}
                            onClick={() => setPage(p)}
                          >
                            {p}
                          </button>
                        </Fragment>
                      );
                    })}
                  <button
                    id="page-next"
                    className="page-btn"
                    disabled={page >= data.totalPages}
                    onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CollegesPage() {
  return (
    <Suspense fallback={<div className="page-container" style={{ paddingTop: 40 }}>Loading...</div>}>
      <CollegesContent />
    </Suspense>
  );
}
