import { NextRequest, NextResponse } from 'next/server';
import { searchCVE } from '@/services/cveService';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q');
    if (!q) return NextResponse.json({ error: 'Query required' }, { status: 400 });
    const results = await searchCVE(q);
    return NextResponse.json(results);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
