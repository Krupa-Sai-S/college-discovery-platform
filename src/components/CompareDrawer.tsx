'use client';

import { useCompare } from '@/contexts/CompareContext';
import { useRouter } from 'next/navigation';

export default function CompareDrawer() {
  const { compared, removeCollege, clearCompare } = useCompare();
  const router = useRouter();

  const handleCompareNow = () => {
    const ids = compared.map(c => c.id).join(',');
    router.push(`/compare?ids=${ids}`);
  };

  return (
    <div className={`compare-drawer ${compared.length > 0 ? 'visible' : ''}`}>
      <div className="compare-drawer-inner">
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: 600 }}>
          Compare ({compared.length}/3)
        </span>
        <div className="compare-drawer-colleges">
          {compared.map(c => (
            <div key={c.id} className="compare-drawer-item">
              <span>{c.name.length > 30 ? c.name.slice(0, 28) + '…' : c.name}</span>
              <button
                className="compare-drawer-remove"
                onClick={() => removeCollege(c.id)}
                aria-label={`Remove ${c.name}`}
              >
                ×
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 2 - compared.length) }).map((_, i) => (
            <div key={`slot-${i}`} className="compare-drawer-slot">
              + Add college
            </div>
          ))}
        </div>
        <button
          className="btn-secondary"
          style={{ fontSize: '0.8rem', padding: '8px 16px' }}
          onClick={clearCompare}
        >
          Clear
        </button>
        <button
          className="btn-compare-now"
          onClick={handleCompareNow}
          disabled={compared.length < 2}
        >
          Compare Now →
        </button>
      </div>
    </div>
  );
}
