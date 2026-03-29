import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'CC98 API 服务',
    status: 'ok',
    routes: {
      summary: '/api/summary',
      mbti: '/api/mbti',
      chat: '/api/llm/chat'
    }
  });
} 