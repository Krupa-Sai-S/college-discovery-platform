import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seed } from '@/lib/seed';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    seed();
    const db = getDb();
    const { id } = await params;
    const collegeId = parseInt(id);

    if (isNaN(collegeId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const college = db.prepare('SELECT * FROM colleges WHERE id = ?').get(collegeId);
    if (!college) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 });
    }

    const courses = db.prepare('SELECT * FROM courses WHERE college_id = ?').all(collegeId);
    const placement = db.prepare('SELECT * FROM placements WHERE college_id = ?').get(collegeId);
    const reviews = db.prepare('SELECT * FROM reviews WHERE college_id = ? ORDER BY date DESC').all(collegeId);

    // Parse top recruiters
    const placementData = placement as { top_recruiters: string } & Record<string, unknown>;
    if (placementData?.top_recruiters) {
      (placementData as Record<string, unknown>).top_recruiters = JSON.parse(placementData.top_recruiters);
    }

    return NextResponse.json({ college, courses, placement: placementData, reviews });
  } catch (error) {
    console.error('College detail API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
