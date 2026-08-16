import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export async function GET() {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', database: 'connected', checkedAt: new Date().toISOString(), latencyMs: Date.now() - started }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ status: 'error', database: 'unavailable', checkedAt: new Date().toISOString() }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
