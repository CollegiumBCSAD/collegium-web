const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

let _getAccessToken: (() => string | null) | null = null;
let _onUnauthorized: (() => void) | null = null;
let _onTokenRefreshed: ((token: string) => void) | null = null;

export function configureApiClient(
  getAccessToken: () => string | null,
  onUnauthorized: () => void,
  onTokenRefreshed?: (token: string) => void
) {
  _getAccessToken = getAccessToken;
  _onUnauthorized = onUnauthorized;
  if (onTokenRefreshed) {
    _onTokenRefreshed = onTokenRefreshed;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  skipAuth = false
): Promise<T> {
  // Don't force JSON content-type for FormData bodies — the browser needs to
  // set its own multipart boundary, which a manual Content-Type header breaks.
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };

  if (!skipAuth && _getAccessToken) {
    const token = _getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });

    if (res.status === 401) {
      if (
        path !== "/auth/refresh" &&
        path !== "/auth/login" &&
        path !== "/auth/register"
      ) {
        try {
          const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });

          if (refreshRes.ok) {
            const refreshData = (await refreshRes.json()) as { access_token?: string };
            if (refreshData.access_token) {
              if (_onTokenRefreshed) {
                _onTokenRefreshed(refreshData.access_token);
              }
              headers["Authorization"] = `Bearer ${refreshData.access_token}`;
            }
            const retryRes = await fetch(`${BASE_URL}${path}`, {
              ...options,
              headers,
              credentials: "include",
            });

            if (retryRes.ok) {
              const text = await retryRes.text();
              return text ? (JSON.parse(text) as T) : ({} as T);
            }
          }
        } catch {}
      }

      if (_onUnauthorized) {
        _onUnauthorized();
      }
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      let message = `API error ${res.status}`;
      try {
        const body = await res.json();
        // NestJS's ValidationPipe returns `message` as a string[] when a DTO
        // fails validation (one entry per failed field) — join it instead of
        // letting `new Error()` stringify the array with a bare comma.
        message = Array.isArray(body.message)
          ? body.message.join(", ")
          : body.message || message;
      } catch {}
      throw new Error(message);
    }

    const text = await res.text();
    return text ? (JSON.parse(text) as T) : ({} as T);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      throw err;
    }
    throw new Error(err instanceof Error ? err.message : "Network error");
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown, skipAuth = false) =>
    request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }, skipAuth),
  postForm: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: "POST", body: formData }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body !== undefined ? JSON.stringify(body) : undefined }),
  patchForm: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: "PATCH", body: formData }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
