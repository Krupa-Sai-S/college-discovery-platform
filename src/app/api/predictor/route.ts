import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seed } from '@/lib/seed';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    seed();
    const db = getDb();
    const body = await request.json();
    const { exam, rank, category = 'General', branch = 'CSE' } = body;

    if (!exam || !rank) {
      return NextResponse.json({ error: 'exam and rank are required' }, { status: 400 });
    }

    const numericRank = parseInt(rank);
    if (isNaN(numericRank)) {
      return NextResponse.json({ error: 'rank must be a number' }, { status: 400 });
    }

    // For CAT, rank is percentile — we store as 0-100
    const isPercentile = exam === 'CAT' || exam === 'GMAT';
    
    let eligible: { college_id: number; cutoff_rank: number; branch: string }[];
    
    if (isPercentile) {
      // Higher percentile = better; eligible if cutoff <= rank (cutoff is minimum percentile)
      eligible = db.prepare(`
        SELECT pd.college_id, pd.cutoff_rank, pd.branch
        FROM predictor_data pd
        WHERE pd.exam = ? AND pd.category = ? AND pd.cutoff_rank <= ?
        ORDER BY pd.cutoff_rank DESC
      `).all(exam, category, numericRank) as { college_id: number; cutoff_rank: number; branch: string }[];
    } else {
      // Lower rank = better; eligible if cutoff >= rank
      const buffer = Math.round(numericRank * 0.15); // 15% buffer
      eligible = db.prepare(`
        SELECT pd.college_id, pd.cutoff_rank, pd.branch
        FROM predictor_data pd
        WHERE pd.exam = ? AND pd.category = ? AND pd.branch = ? AND pd.cutoff_rank >= ?
        ORDER BY pd.cutoff_rank ASC
        LIMIT 20
      `).all(exam, category, branch, numericRank - buffer) as { college_id: number; cutoff_rank: number; branch: string }[];
    }

    if (eligible.length === 0) {
      return NextResponse.json({ colleges: [], message: 'No colleges found for given rank. Try a different rank or category.' });
    }

    const ids = [...new Set(eligible.map(e => e.college_id))].slice(0, 15);
    const placeholders = ids.map(() => '?').join(',');
    
    const colleges = db.prepare(`
      SELECT c.*, p.avg_package, p.highest_package, p.placement_rate
      FROM colleges c
      LEFT JOIN placements p ON p.college_id = c.id
      WHERE c.id IN (${placeholders})
      ORDER BY c.rating DESC
    `).all(...ids);

    // Attach cutoff info
    const cutoffMap: Record<number, number> = {};
    for (const e of eligible) { cutoffMap[e.college_id] = e.cutoff_rank; }

    const result = (colleges as { id: number }[]).map(c => ({
      ...c,
      cutoff_rank: cutoffMap[c.id],
      chance: calculateChance(numericRank, cutoffMap[c.id], isPercentile),
    }));

    return NextResponse.json({ colleges: result, exam, rank: numericRank, category, branch });
  } catch (error) {
    console.error('Predictor API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateChance(rank: number, cutoff: number, isPercentile: boolean): 'High' | 'Medium' | 'Low' {
  if (isPercentile) {
    const diff = rank - cutoff;
    if (diff >= 5) return 'High';
    if (diff >= 2) return 'Medium';
    return 'Low';
  } else {
    const ratio = rank / cutoff;
    if (ratio <= 0.7) return 'High';
    if (ratio <= 0.9) return 'Medium';
    return 'Low';
  }
}
