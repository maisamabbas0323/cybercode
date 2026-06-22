import { NextRequest, NextResponse } from 'next/server';
import { checkUsername } from '@/services/footprintService';

export async function GET(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get('username');
    if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 });
    const result = await checkUsername(username);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
