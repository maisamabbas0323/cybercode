import { NextResponse } from 'next/server';
import { getLatestCVE } from '@/services/cveService';

export async function GET() {
  try {
    const results = await getLatestCVE();
    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
