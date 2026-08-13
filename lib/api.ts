const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

let _getAccessToken: (() => string | null) | null = null;
let _onUnauthorized: (() => void) | null = null;

export function configureApiClient(
  getAccessToken: () => string | null,
  onUnauthorized: () => void
) {
  _getAccessToken = getAccessToken;
  _onUnauthorized = onUnauthorized;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  skipAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (!skipAuth && _getAccessToken) {
    const token = _getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && _onUnauthorized) {
    _onUnauthorized();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    let message = `API error ${res.status}`;
    try {
      const body = await res.json();
      message = body.message || message;
    } catch {}
    throw new Error(message);
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown, skipAuth = false) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }, skipAuth),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
