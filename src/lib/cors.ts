import { NextRequest, NextResponse } from 'next/server';

// CORS配置
const corsOptions = {
  origin: ['http://localhost:1234', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
  credentials: true,
};

// 设置CORS头
export function setCorsHeaders(response: NextResponse | Response): NextResponse | Response {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
  response.headers.set('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

// 处理OPTIONS预检请求
export function handleOptionsRequest(): NextResponse {
  const response = new NextResponse(null, { status: 200 });
  return setCorsHeaders(response) as NextResponse;
}

// CORS中间件装饰器
export function withCors(handler: (request: NextRequest) => Promise<NextResponse | Response>) {
  return async (request: NextRequest): Promise<NextResponse | Response> => {
    // 处理OPTIONS预检请求
    if (request.method === 'OPTIONS') {
      return handleOptionsRequest();
    }

    // 执行原始处理函数
    const response = await handler(request);
    
    // 添加CORS头
    return setCorsHeaders(response);
  };
} 