/**
 * GET请求函数，自动处理WebVPN代理
 * @param url 完整的API URL 或 相对路径
 * @param token 访问令牌
 */
export function GET<R>(url: string, token?: string): Promise<R> {
  return new Promise((resolve, reject) => {
    // 检查是否需要使用代理
    let requestUrl = url;

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
    // 如果是以API_ROOT开头的URL，提取路径部分
    else if (url.startsWith("https://")) {
      const urlObj = new URL(url);
      requestUrl = `/api/proxy${urlObj.pathname}${urlObj.search}`;
    }

    console.log(`[GET] Requesting: ${requestUrl}`);

    fetch(requestUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            data.error || `HTTP ${res.status}: ${res.statusText}`
          );
        }
        return data;
      })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        console.error("[GET Error]:", err);
        reject(err);
      });
  });
}
