export async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data?.error === "string" ? data.error : response.statusText;
    const error = new Error(message);
    (error as Error & { status?: number; data?: unknown }).status =
      response.status;
    (error as Error & { status?: number; data?: unknown }).data = data;
    throw error;
  }

  return data as T;
}
