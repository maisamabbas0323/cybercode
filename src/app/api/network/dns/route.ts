import { NextRequest, NextResponse } from 'next/server';
import { analyzeDNS } from '@/services/dnsService';

export async function GET(req: NextRequest) {
  try {
    const hostname = req.nextUrl.searchParams.get('hostname');
    if (!hostname) return NextResponse.json({ error: 'Hostname required' }, { status: 400 });
    const result = await analyzeDNS(hostname);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
