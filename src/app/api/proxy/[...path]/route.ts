import { NextRequest, NextResponse } from 'next/server';

// WebVPN代理地址
const WEBVPN_API_BASE = 'https://api-cc98-org-s.webvpn.zju.edu.cn:8001';
// 备用HTTP地址（如果HTTPS失败）
const WEBVPN_API_BASE_HTTP = 'http://api-cc98-org-s.webvpn.zju.edu.cn:8001';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'PATCH');
}

async function handleRequest(
  request: NextRequest,
  path: string[],
  method: string
) {
  // 构建完整的API路径
  const apiPath = path.join('/');
  if (!apiPath) {
    return NextResponse.json({ error: 'API path is required' }, { status: 400 });
  }

  // 检查Authorization header
  const authorization = request.headers.get('authorization');
  if (!authorization) {
    return NextResponse.json({ error: 'Authorization header is required' }, { status: 401 });
  }

  // 尝试不同的连接方式
  const attempts = [
    { url: WEBVPN_API_BASE, name: 'HTTPS' },
    { url: WEBVPN_API_BASE_HTTP, name: 'HTTP' }
  ];

  for (const attempt of attempts) {
    try {
      // 构建目标URL
      const targetUrl = new URL(`/${apiPath}`, attempt.url);
      
      // 添加查询参数
      const searchParams = request.nextUrl.searchParams;
      searchParams.forEach((value, key) => {
        targetUrl.searchParams.append(key, value);
      });

      console.log(`[Proxy] Trying ${attempt.name}: ${method} ${targetUrl.toString()}`);

      // 准备请求headers
      const requestHeaders: HeadersInit = {
        'Authorization': authorization,
        'Accept': 'application/json',
        'User-Agent': 'CC98-Hub-Proxy/1.0',
      };

      // 处理Content-Type
      const contentType = request.headers.get('content-type');
      if (contentType) {
        requestHeaders['Content-Type'] = contentType;
      }

      // 构建fetch选项
      const fetchOptions: RequestInit = {
        method,
        headers: requestHeaders,
      };

      // 添加请求体（如果有）
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        const body = await request.text();
        if (body) {
          fetchOptions.body = body;
        }
      }

      // 创建超时控制器
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
      fetchOptions.signal = controller.signal;

      // 发起代理请求
      const response = await fetch(targetUrl.toString(), fetchOptions);
      clearTimeout(timeoutId);

      console.log('response status:', response.status);
      
      // 获取响应数据
      const responseText = await response.text();
      let responseData;

      console.log('responseText length:', responseText.length);
      
      try {
        responseData = JSON.parse(responseText);
      } catch (error) {
        // 检查是否是WebVPN登录重定向页面
        if (responseText.includes('webvpn.zju.edu.cn/portal') && responseText.includes('redirect_uri')) {
          const redirectMatch = responseText.match(/url:"([^"]*webvpn\.zju\.edu\.cn\/portal[^"]*)"/);
          const loginUrl = redirectMatch ? decodeURIComponent(redirectMatch[1]) : 'https://webvpn.zju.edu.cn/portal';
          
          console.log(`[Proxy] WebVPN login required, redirect to: ${loginUrl}`);
          
          return NextResponse.json({
            error: 'WebVPN login required',
            details: 'Please login to WebVPN first before using the API',
            loginUrl: loginUrl,
            instructions: [
              '1. Open the WebVPN login URL in your browser',
              '2. Login with your ZJU account credentials', 
              '3. After successful login, retry the API request'
            ]
          }, { status: 401 });
        }
        
        responseData = responseText;
      }

      // 设置响应headers
      const headers = new Headers();
      headers.set('Content-Type', response.headers.get('content-type') || 'application/json');
      
      // 记录成功响应
      console.log(`[Proxy Success] ${attempt.name} ${response.status} ${response.statusText}`);
      
      // 返回响应
      return NextResponse.json(responseData, { 
        status: response.status,
        headers
      });

    } catch (error: unknown) {
      console.error(`[Proxy Error] ${attempt.name} failed:`, error);
      
      // 如果不是最后一次尝试，继续下一个方式
      if (attempt !== attempts[attempts.length - 1]) {
        continue;
      }
      
      // 最后一次尝试也失败了，返回详细错误
      if (error instanceof Error) {
        // 网络连接错误
        if (error.message.includes('fetch') || error.name === 'TypeError') {
          console.error('[Network Error] All connection attempts failed');
          return NextResponse.json({ 
            error: 'Service unavailable',
            details: 'Unable to connect to WebVPN service using both HTTPS and HTTP. Please check the network or WebVPN service status.',
            debugInfo: process.env.NODE_ENV === 'development' ? {
              message: error.message,
              name: error.name,
              attemptsUsed: attempts.map(a => a.name),
              suggestion: 'Try accessing https://api-cc98-org-s.webvpn.zju.edu.cn:8001 in your browser first'
            } : undefined
          }, { status: 503 });
        }
        
        // 超时错误
        if (error.name === 'AbortError') {
          console.error('[Timeout Error] Request timeout');
          return NextResponse.json({
            error: 'Request timeout',
            details: 'The request to WebVPN service timed out. Please try again.'
          }, { status: 408 });
        }
        
        // SSL/TLS错误
        if (error.message.includes('SSL') || error.message.includes('TLS') || error.message.includes('certificate')) {
          console.error('[SSL/TLS Error]', error.message);
          return NextResponse.json({
            error: 'SSL/TLS connection error',
            details: 'Unable to establish secure connection to WebVPN service. This might be due to SSL/TLS protocol compatibility issues.',
            debugInfo: process.env.NODE_ENV === 'development' ? {
              message: error.message,
              suggestion: 'Try accessing the WebVPN service directly in your browser first, or use HTTP fallback'
            } : undefined
          }, { status: 503 });
        }
      }
      
      return NextResponse.json({ 
        error: 'Internal proxy error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : 'An unexpected error occurred'
      }, { status: 500 });
    }
  }

  // 这个永远不会执行，但为了类型安全而返回
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
} 