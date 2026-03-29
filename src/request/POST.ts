/**
 * POST请求函数
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
    console.log(`[POST] Requesting: ${url}`);

    const res = await fetch(url, {
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
