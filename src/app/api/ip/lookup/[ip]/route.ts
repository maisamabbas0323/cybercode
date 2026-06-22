import { NextResponse } from 'next/server';
import { lookupIP } from '@/services/ipService';

export async function GET(_req: Request, { params }: { params: Promise<{ ip: string }> }) {
  try {
    const { ip } = await params;
    const result = await lookupIP(ip);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
