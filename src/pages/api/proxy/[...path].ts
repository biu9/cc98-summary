import type { NextApiRequest, NextApiResponse } from 'next';

// WebVPN代理地址
const WEBVPN_API_BASE = 'https://api-cc98-org-s.webvpn.zju.edu.cn:8001';
// 备用HTTP地址（如果HTTPS失败）
const WEBVPN_API_BASE_HTTP = 'http://api-cc98-org-s.webvpn.zju.edu.cn:8001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  const { method = 'GET', headers, body } = req;

  // 构建完整的API路径
  const apiPath = Array.isArray(path) ? path.join('/') : path;
  if (!apiPath) {
    return res.status(400).json({ error: 'API path is required' });
  }

  // 检查Authorization header
  const authorization = headers.authorization;
  if (!authorization) {
    return res.status(401).json({ error: 'Authorization header is required' });
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
      const queryString = req.url?.split('?')[1];
      if (queryString) {
        // 移除Next.js的内部参数
        const cleanQuery = queryString.replace(/&?path=[^&]*/g, '');
        if (cleanQuery) {
          targetUrl.search = cleanQuery;
        }
      }

      console.log(`[Proxy] Trying ${attempt.name}: ${method} ${targetUrl.toString()}`);

      // 准备请求headers
      const requestHeaders: HeadersInit = {
        'Authorization': authorization,
        'Accept': 'application/json',
        'User-Agent': 'CC98-Hub-Proxy/1.0',
      };

      // 处理Content-Type
      if (headers['content-type']) {
        requestHeaders['Content-Type'] = headers['content-type'] as string;
      }

      // 构建fetch选项，增加超时和错误处理
      const fetchOptions: RequestInit = {
        method: method as string,
        headers: requestHeaders,
        // 添加超时设置（Node.js环境下需要使用AbortController）
      };

      // 添加请求体（如果有）
      if (body && method !== 'GET' && method !== 'HEAD') {
        fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      }

      // 创建超时控制器
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
      fetchOptions.signal = controller.signal;

      // 发起代理请求
      const response = await fetch(targetUrl.toString(), fetchOptions);
      clearTimeout(timeoutId);
      
      // 获取响应数据
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        // 检查是否是WebVPN登录重定向页面
        if (responseText.includes('webvpn.zju.edu.cn/portal') && responseText.includes('redirect_uri')) {
          const redirectMatch = responseText.match(/url:"([^"]*webvpn\.zju\.edu\.cn\/portal[^"]*)"/);
          const loginUrl = redirectMatch ? decodeURIComponent(redirectMatch[1]) : 'https://webvpn.zju.edu.cn/portal';
          
          console.log(`[Proxy] WebVPN login required, redirect to: ${loginUrl}`);
          
          return res.status(401).json({
            error: 'WebVPN login required',
            details: 'Please login to WebVPN first before using the API',
            loginUrl: loginUrl,
            instructions: [
              '1. Open the WebVPN login URL in your browser',
              '2. Login with your ZJU account credentials', 
              '3. After successful login, retry the API request'
            ]
          });
        }
        
        responseData = responseText;
      }

      // 设置响应headers
      res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
      
      // 记录成功响应
      console.log(`[Proxy Success] ${attempt.name} ${response.status} ${response.statusText}`);
      
      // 返回响应
      return res.status(response.status).json(responseData);

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
          return res.status(503).json({ 
            error: 'Service unavailable',
            details: 'Unable to connect to WebVPN service using both HTTPS and HTTP. Please check the network or WebVPN service status.',
            debugInfo: process.env.NODE_ENV === 'development' ? {
              message: error.message,
              name: error.name,
              attemptsUsed: attempts.map(a => a.name),
              suggestion: 'Try accessing https://api-cc98-org-s.webvpn.zju.edu.cn:8001 in your browser first'
            } : undefined
          });
        }
        
        // 超时错误
        if (error.name === 'AbortError') {
          console.error('[Timeout Error] Request timeout');
          return res.status(408).json({
            error: 'Request timeout',
            details: 'The request to WebVPN service timed out. Please try again.'
          });
        }
        
        // SSL/TLS错误
        if (error.message.includes('SSL') || error.message.includes('TLS') || error.message.includes('certificate')) {
          console.error('[SSL/TLS Error]', error.message);
          return res.status(503).json({
            error: 'SSL/TLS connection error',
            details: 'Unable to establish secure connection to WebVPN service. This might be due to SSL/TLS protocol compatibility issues.',
            debugInfo: process.env.NODE_ENV === 'development' ? {
              message: error.message,
              suggestion: 'Try accessing the WebVPN service directly in your browser first, or use HTTP fallback'
            } : undefined
          });
        }
      }
      
      return res.status(500).json({ 
        error: 'Internal proxy error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : 'An unexpected error occurred'
      });
    }
  }
} 