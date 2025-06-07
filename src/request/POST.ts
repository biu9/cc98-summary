/**
 * POST请求函数，自动处理WebVPN代理
 * @param url 完整的API URL 或 相对路径
 * @param payload 请求体数据
 * @param token 访问令牌
 */
export async function POST<T, R>(
  url: string,
  payload: T,
  token?: string
): Promise<R> {
  try {
    // 检查是否需要使用代理（仅在开发环境下）
    let requestUrl = url;
    const isProduction = process.env.NODE_ENV === 'production';

    if (!isProduction) {
      // 开发环境下使用代理
      // 如果URL包含WebVPN地址，转换为代理路径
      if (url.includes("api-cc98-org-s.webvpn.zju.edu.cn:8001")) {
        const urlObj = new URL(url);
        requestUrl = `/api/proxy${urlObj.pathname}${urlObj.search}`;
      }
      // 如果是完整的api.cc98.org地址，也转换为代理路径
      else if (url.includes("api.cc98.org")) {
        const urlObj = new URL(url);
        requestUrl = `/api/proxy${urlObj.pathname}${urlObj.search}`;
      }
      // 如果是以https://开头的URL，提取路径部分
      else if (url.startsWith("https://")) {
        const urlObj = new URL(url);
        requestUrl = `/api/proxy${urlObj.pathname}${urlObj.search}`;
      }
    }
    // 生产环境下直接使用原始URL

    console.log(`[POST] ${isProduction ? 'Production' : 'Development'} - Requesting: ${requestUrl}`);

    const res = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
    }

    return data as R;
  } catch (error) {
    console.error("[POST Error]:", error);
    throw error;
  }
}
