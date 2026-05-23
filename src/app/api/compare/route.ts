import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seed } from '@/lib/seed';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    seed();
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids') || '';
    const ids = idsParam.split(',').map(Number).filter(Boolean).slice(0, 3);

    if (ids.length < 2) {
      return NextResponse.json({ error: 'Provide at least 2 college IDs' }, { status: 400 });
    }

    const placeholders = ids.map(() => '?').join(',');

    const colleges = db.prepare(`SELECT * FROM colleges WHERE id IN (${placeholders})`).all(...ids);
    const placements = db.prepare(`SELECT * FROM placements WHERE college_id IN (${placeholders})`).all(...ids);
    const courses = db.prepare(`SELECT * FROM courses WHERE college_id IN (${placeholders})`).all(...ids) as { college_id: number }[];

    // Group courses by college_id
    const coursesByCollege: Record<number, typeof courses> = {};
    for (const c of courses) {
      if (!coursesByCollege[c.college_id]) coursesByCollege[c.college_id] = [];
      coursesByCollege[c.college_id].push(c);
    }

    // Parse placements
    const placementsById: Record<number, Record<string, unknown>> = {};
    for (const p of placements as { college_id: number; top_recruiters: string }[]) {
      const parsed = { ...p, top_recruiters: JSON.parse(p.top_recruiters) };
      placementsById[p.college_id] = parsed;
    }

    const result = (colleges as { id: number }[]).map(college => ({
      ...college,
      placement: placementsById[college.id] || null,
      courses: coursesByCollege[college.id] || [],
    }));

    return NextResponse.json({ colleges: result });
  } catch (error) {
    console.error('Compare API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
