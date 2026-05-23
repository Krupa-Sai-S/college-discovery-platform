'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PredictedCollege {
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
  cutoff_rank: number;
  chance: 'High' | 'Medium' | 'Low';
}

const EXAMS = [
  { value: 'JEE Advanced', label: 'JEE Advanced', placeholder: 'e.g. 1500', hint: 'Enter rank (1 – 40,000)' },
  { value: 'JEE Mains', label: 'JEE Mains', placeholder: 'e.g. 15000', hint: 'Enter rank (1 – 2,50,000)' },
  { value: 'BITSAT', label: 'BITSAT', placeholder: 'e.g. 350', hint: 'Enter score (0 – 450)' },
  { value: 'KCET', label: 'KCET', placeholder: 'e.g. 5000', hint: 'Enter rank (Karnataka)' },
  { value: 'MHT CET', label: 'MHT CET', placeholder: 'e.g. 10000', hint: 'Enter rank (Maharashtra)' },
  { value: 'AP EAPCET', label: 'AP EAPCET', placeholder: 'e.g. 8000', hint: 'Enter rank (Andhra Pradesh)' },
  { value: 'TS EAPCET', label: 'TS EAPCET', placeholder: 'e.g. 8000', hint: 'Enter rank (Telangana)' },
  { value: 'WBJEE', label: 'WBJEE', placeholder: 'e.g. 5000', hint: 'Enter rank (West Bengal)' },
  { value: 'CAT', label: 'CAT (MBA)', placeholder: 'e.g. 97', hint: 'Enter percentile (0 – 100)' },
  { value: 'GMAT', label: 'GMAT (MBA)', placeholder: 'e.g. 740', hint: 'Enter score (200 – 800)' },
];

const CATEGORIES = ['General', 'OBC', 'SC', 'ST'];
const BRANCHES = ['CSE', 'ECE', 'ME', 'EE', 'MBA'];

function formatFee(fee: number) {
  if (fee >= 100000) return `₹${(fee / 100000).toFixed(1)}L`;
  return `₹${(fee / 1000).toFixed(0)}K`;
}

function formatPkg(pkg: number) {
  if (pkg >= 100000) return `₹${(pkg / 100000).toFixed(1)} LPA`;
  return `₹${pkg}`;
}

function PredictorContent() {
  const searchParams = useSearchParams();

  const [exam, setExam] = useState(searchParams.get('exam') || 'JEE Advanced');
  const [rank, setRank] = useState('');
  const [category, setCategory] = useState('General');
  const [branch, setBranch] = useState('CSE');
  const [results, setResults] = useState<PredictedCollege[] | null>(null);
  const [resultMeta, setResultMeta] = useState<{ exam: string; rank: number; category: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const examData = EXAMS.find(e => e.value === exam) ?? EXAMS[0];
  const isMBA = exam === 'CAT' || exam === 'GMAT';

  const handlePredict = async () => {
    if (!rank.trim()) {
      setError('Please enter your rank or score.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/predictor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam, rank, category, branch: isMBA ? 'MBA' : branch }),
      });
      const data = await res.json();
      setResults(data.colleges);
      setResultMeta({ exam: data.exam, rank: data.rank, category: data.category });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const chanceColors = { High: 'var(--accent-green)', Medium: 'var(--accent-gold)', Low: 'var(--accent-orange)' };

  return (
    <div className="predictor-page">
      <div className="page-container">
        <div className="section-header" style={{ marginBottom: '32px' }}>
          <h1 className="section-title">College Predictor</h1>
          <span className="section-tag">AI-Powered</span>
        </div>

        <div className="predictor-layout">
          {/* Form */}
          <div className="predictor-form-card">
            <div className="predictor-form-title">🎯 Find Your Colleges</div>
            <div className="predictor-form-subtitle">
              Enter your exam details to see which colleges you&apos;re likely to get admission in, along with your admission chances.
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="exam-select">Entrance Exam</label>
              <select
                id="exam-select"
                className="form-select"
                value={exam}
                onChange={e => { setExam(e.target.value); setResults(null); }}
              >
                {EXAMS.map(e => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rank-input">
                {isMBA ? 'Score / Percentile' : 'Your Rank'}
              </label>
              <input
                id="rank-input"
                type="number"
                className="form-input"
                placeholder={examData.placeholder}
                value={rank}
                onChange={e => setRank(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePredict()}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {examData.hint}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="category-select">Category</label>
              <select
                id="category-select"
                className="form-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {!isMBA && (
              <div className="form-group">
                <label className="form-label" htmlFor="branch-select">Preferred Branch</label>
                <select
                  id="branch-select"
                  className="form-select"
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                >
                  {BRANCHES.filter(b => b !== 'MBA').map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <div style={{
                background: 'rgba(255,100,100,0.12)', border: '1px solid rgba(255,100,100,0.3)',
                borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem', color: '#ff6b6b',
                marginBottom: '12px'
              }}>
                ⚠ {error}
              </div>
            )}

            <button
              id="predict-btn"
              className="btn-predict"
              onClick={handlePredict}
              disabled={loading}
            >
              {loading ? '🔍 Predicting...' : '🚀 Predict Colleges'}
            </button>
          </div>

          {/* Results */}
          <div>
            {results === null && !loading && (
              <div className="empty-state" style={{ paddingTop: '40px' }}>
                <div className="empty-icon">🎓</div>
                <div className="empty-title">Your results will appear here</div>
                <div className="empty-subtitle">
                  Fill in your exam details and click Predict to see matching colleges.
                </div>
              </div>
            )}

            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '12px' }} />
                ))}
              </div>
            )}

            {results !== null && !loading && (
              <>
                <div className="predictor-results-header">
                  <h2 className="predictor-results-title">
                    {results.length} College{results.length !== 1 ? 's' : ''} Found
                  </h2>
                  <div className="predictor-results-subtitle">
                    Based on {resultMeta?.exam} rank {resultMeta?.rank} ({resultMeta?.category} category)
                  </div>

                  {/* Legend */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {(['High', 'Medium', 'Low'] as const).map(chance => (
                      <span key={chance} className={`chance-badge chance-${chance}`}>
                        ● {chance} Chance
                      </span>
                    ))}
                  </div>
                </div>

                {results.length === 0 ? (
                  <div className="empty-state" style={{ padding: '40px 0' }}>
                    <div className="empty-icon">😔</div>
                    <div className="empty-title">No matches found</div>
                    <div className="empty-subtitle">
                      Try a different rank, category, or exam. You can also{' '}
                      <Link href="/colleges" style={{ color: 'var(--accent-secondary)' }}>browse all colleges</Link>.
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {results.map((c, idx) => (
                      <Link
                        key={c.id}
                        href={`/colleges/${c.id}`}
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '12px',
                          padding: '16px 20px',
                          display: 'grid',
                          gridTemplateColumns: '1fr auto',
                          gap: '16px',
                          alignItems: 'center',
                          transition: 'all 250ms',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-primary)';
                          (e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
                          (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)';
                        }}
                      >
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          <div
                            style={{
                              width: '48px', height: '48px', borderRadius: '10px', flexShrink: 0,
                              background: `linear-gradient(135deg, ${c.image_color || '#6c5ce7'}, ${c.image_color || '#6c5ce7'}88)`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '1.2rem', fontWeight: 700, color: 'white',
                            }}
                          >
                            {idx + 1}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif', marginBottom: '4px' }}>
                              {c.name}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '12px' }}>
                              <span>📍 {c.location}</span>
                              <span>💰 {formatFee(c.total_fee)}</span>
                              {c.avg_package && <span>📈 {formatPkg(c.avg_package)}</span>}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                          <span className={`chance-badge chance-${c.chance}`}>
                            {c.chance} Chance
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Cutoff: {c.cutoff_rank}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--accent-gold)' }}>
                            ⭐ {c.rating.toFixed(1)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PredictorPage() {
  return (
    <Suspense fallback={<div className="page-container" style={{ paddingTop: 40 }}>Loading...</div>}>
      <PredictorContent />
    </Suspense>
  );
}
