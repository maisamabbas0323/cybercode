import { NextResponse } from 'next/server';
import { getOSInfo } from '@/services/osService';

export async function GET() {
  try {
    const info = await getOSInfo();
    return NextResponse.json(info);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
