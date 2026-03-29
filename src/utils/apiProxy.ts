import { API_ROOT } from "../../config";

interface ApiProxyOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  details?: string;
}

/**
 * 调用CC98接口
 * @param path API路径，例如 'me/recent-topic'
 * @param accessToken 访问令牌
 * @param options 请求选项
 */
export async function callCC98Api<T = any>(
  path: string,
  accessToken: string,
  options: ApiProxyOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, headers = {} } = options;

  try {
    // 构建完整的API URL
    const apiUrl = `${API_ROOT}/${path}`;

    // 准备请求选项
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    // 添加请求体
    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(apiUrl, fetchOptions);
    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || 'API request failed',
        details: data.details,
      };
    }

    return { data };

  } catch (error) {
    console.error('[API Error]:', error);
    return {
      error: 'Network error',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 获取用户最近的话题
 */
export async function getUserRecentTopics(accessToken: string, from = 0, size = 20) {
  return callCC98Api(`me/recent-topic?from=${from}&size=${size}`, accessToken);
}

/**
 * 获取用户信息
 */
export async function getUserInfo(accessToken: string) {
  return callCC98Api('me', accessToken);
}

/**
 * 搜索话题
 */
export async function searchTopics(accessToken: string, keyword: string, from = 0, size = 20) {
  return callCC98Api(`topic/search?keyword=${encodeURIComponent(keyword)}&from=${from}&size=${size}`, accessToken);
} 