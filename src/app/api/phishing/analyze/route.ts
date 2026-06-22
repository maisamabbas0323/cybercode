import { NextRequest, NextResponse } from 'next/server';
import { analyzePhishing } from '@/services/phishingService';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });
    const result = await analyzePhishing(url);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
