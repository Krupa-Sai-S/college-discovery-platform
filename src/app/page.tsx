'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const QUICK_SEARCHES = ['IIT', 'NIT', 'IIIT', 'Private', 'MBA', 'Bangalore', 'Mumbai', 'Chennai', 'Delhi'];

const STATS = [
  { value: 54, suffix: '+', label: 'Top Colleges' },
  { value: 15, suffix: '+', label: 'States Covered' },
  { value: 10, suffix: '', label: 'Exams Supported' },
  { value: 98, suffix: '%', label: 'Accuracy Rate' },
];

const FEATURES = [
  {
    emoji: '🔍',
    title: 'Smart College Search',
    desc: 'Filter by type, state, fees, ratings and more. FTS-powered instant results with infinite refinement.',
    href: '/colleges',
    cta: 'Browse Colleges',
    color: '#7c6bff',
  },
  {
    emoji: '⚖️',
    title: 'Side-by-Side Compare',
    desc: 'Compare up to 3 colleges on fees, placements, ratings, and recruiters — at a glance.',
    href: '/compare',
    cta: 'Compare Now',
    color: '#00e5c8',
  },
  {
    emoji: '🎯',
    title: 'Rank Predictor',
    desc: 'Enter your exam rank and see which colleges you qualify for — with High / Medium / Low admission chances.',
    href: '/predictor',
    cta: 'Predict My College',
    color: '#ff7b5c',
  },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1200;
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [activeChip, setActiveChip] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/colleges?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/colleges');
    }
  };

  const handleChip = (chip: string) => {
    setActiveChip(chip);
    const types = ['IIT', 'NIT', 'IIIT', 'Private', 'Government'];
    if (types.includes(chip)) {
      router.push(`/colleges?type=${chip}`);
    } else if (chip === 'MBA') {
      router.push('/predictor?exam=CAT');
    } else {
      router.push(`/colleges?q=${encodeURIComponent(chip)}`);
    }
  };

  // Mouse-tracking glow on feature cards
  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
  };

  return (
    <div>
      {/* Animated Hero */}
      <section className="hero">
        <div className="hero-orb-3" />

        <div className="hero-eyebrow">
          <div className="dot" />
          India&apos;s Smartest College Discovery Tool
        </div>

        <h1 className="hero-title">
          Find Your Perfect<br />
          <span className="gradient-text">College Match</span>
        </h1>

        <p className="hero-subtitle">
          Search, compare, and discover the best engineering and management colleges in India — powered by real data and smart rank prediction.
        </p>

        {/* Search Bar */}
        <form className="search-container" onSubmit={handleSearch}>
          <div className="search-bar">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              id="hero-search-input"
              type="text"
              className="search-input"
              placeholder="Search colleges, cities, exams..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoComplete="off"
            />
            <button id="hero-search-btn" type="submit" className="search-button">
              Search →
            </button>
          </div>

          <div className="quick-filters">
            {QUICK_SEARCHES.map(chip => (
              <button
                key={chip}
                type="button"
                className={`chip ${activeChip === chip ? 'active' : ''}`}
                onClick={() => handleChip(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        </form>

        {/* Animated Stats */}
        <div className="hero-stats">
          {STATS.map(s => (
            <div key={s.label} className="hero-stat">
              <div className="hero-stat-value">
                <AnimatedCounter target={s.value} suffix={s.suffix} />
              </div>
              <div className="hero-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="page-container" style={{ paddingBottom: '96px' }}>
        <div className="section-header">
          <h2 className="section-title">What Can You Do?</h2>
          <span className="section-tag">3 Core Features</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {FEATURES.map(f => (
            <Link
              key={f.title}
              href={f.href}
              className="feature-card"
              onMouseMove={handleMouseMove}
            >
              <div className="feature-card-glow" style={{ background: `radial-gradient(circle, ${f.color}22, transparent)` }} />

              <div style={{ fontSize: '2.8rem', marginBottom: '4px' }}>{f.emoji}</div>

              <div style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.15rem',
                color: 'var(--text-primary)', marginBottom: '4px',
              }}>
                {f.title}
              </div>

              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                {f.desc}
              </div>

              <div className="feature-card-cta" style={{ color: f.color }}>
                {f.cta} →
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div style={{
          marginTop: '60px', padding: '40px 48px',
          background: 'linear-gradient(135deg, rgba(124,107,255,0.12) 0%, rgba(96,165,250,0.08) 100%)',
          border: '1px solid rgba(124,107,255,0.2)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '24px',
        }}>
          <div>
            <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, fontSize: '1.4rem', marginBottom: '8px' }}>
              Don&apos;t know where to start?
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '460px' }}>
              Enter your JEE / CAT rank and let our predictor suggest the best colleges you can get into — with admission chance scores.
            </div>
          </div>
          <Link href="/predictor" className="btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
            🎯 Try Predictor Free
          </Link>
        </div>
      </section>
    </div>
  );
}
