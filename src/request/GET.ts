/**
 * GET请求函数
 * @param url 完整的API URL 或 相对路径
 * @param token 访问令牌
 */
export function GET<R>(url: string, token?: string): Promise<R> {
  return new Promise((resolve, reject) => {
    console.log(`[GET] Requesting: ${url}`);

    fetch(url, {
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
