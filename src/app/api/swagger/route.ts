import { NextResponse } from 'next/server';
import swaggerSpec from '@/lib/swagger';
import { withCors } from '@/lib/cors';

async function handler() {
  return NextResponse.json(swaggerSpec);
}

export const GET = withCors(handler);
export const OPTIONS = withCors(async () => NextResponse.json({})); 