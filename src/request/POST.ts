export async function POST<T, R>(url: string, payload: T, token?: string): Promise<R> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data as R;
  } catch (error) {
    console.error('POST request failed:', error);
    throw error;
  }
}