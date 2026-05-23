import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seed } from '@/lib/seed';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    seed();
    const db = getDb();
    const { searchParams } = new URL(request.url);

    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || '';
    const state = searchParams.get('state') || '';
    const minFee = parseInt(searchParams.get('min_fee') || '0');
    const maxFee = parseInt(searchParams.get('max_fee') || '99999999');
    const minRating = parseFloat(searchParams.get('min_rating') || '0');
    const sort = searchParams.get('sort') || 'rating_desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '12')));
    const offset = (page - 1) * limit;

    // Build the query
    const conditions: string[] = [];
    const params: Record<string, string | number> = {};

    if (q) {
      // Use FTS for search
      const ftsResults = db.prepare(`
        SELECT rowid FROM colleges_fts WHERE colleges_fts MATCH ? ORDER BY rank
      `).all(q + '*') as { rowid: number }[];
      
      if (ftsResults.length === 0) {
        return NextResponse.json({ colleges: [], total: 0, page, limit, totalPages: 0 });
      }
      const ids = ftsResults.map(r => r.rowid).join(',');
      conditions.push(`c.id IN (${ids})`);
    }

    if (type) { conditions.push('c.type = @type'); params.type = type; }
    if (state) { conditions.push('c.state = @state'); params.state = state; }
    conditions.push('c.total_fee >= @minFee'); params.minFee = minFee;
    conditions.push('c.total_fee <= @maxFee'); params.maxFee = maxFee;
    conditions.push('c.rating >= @minRating'); params.minRating = minRating;

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const sortMap: Record<string, string> = {
      rating_desc: 'c.rating DESC',
      rating_asc: 'c.rating ASC',
      fee_asc: 'c.total_fee ASC',
      fee_desc: 'c.total_fee DESC',
      name_asc: 'c.name ASC',
      nirf_rank: 'c.nirf_rank ASC',
    };
    const orderBy = sortMap[sort] || 'c.rating DESC';

    const countQuery = `SELECT COUNT(*) as total FROM colleges c ${where}`;
    const { total } = db.prepare(countQuery).get(params) as { total: number };

    const dataQuery = `
      SELECT c.*, p.avg_package, p.highest_package, p.placement_rate
      FROM colleges c
      LEFT JOIN placements p ON p.college_id = c.id
      ${where}
      ORDER BY ${orderBy}
      LIMIT @limit OFFSET @offset
    `;
    const colleges = db.prepare(dataQuery).all({ ...params, limit, offset });

    return NextResponse.json({
      colleges,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Colleges API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
