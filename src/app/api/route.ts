import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'CC98 API 代理服务已迁移到 App Router',
    status: 'ok',
    routes: {
      proxy: '/api/proxy/[...path]',
      testWebvpn: '/api/test-webvpn'
    }
  });
} 