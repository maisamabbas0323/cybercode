import { NextRequest, NextResponse } from 'next/server';
import { scanWebsite } from '@/services/sslService';

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get('url');
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });
    const result = await scanWebsite(url);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
