const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    let errorBody: unknown;

    try {
      errorBody = await response.json();
    } catch {
      errorBody = null;
    }

    throw new Error(
      typeof errorBody === "object" &&
        errorBody !== null &&
        "error" in errorBody
        ? String(
            (errorBody as { error: { message: string } }).error
              .message,
          )
        : `Request failed with status ${response.status}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getApiUrl(path: string) {
  return `${API_URL}${path}`;
}