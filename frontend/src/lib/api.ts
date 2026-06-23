const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function parseApiError(message: string) {
  try {
    const parsed = JSON.parse(message) as {
      message?: string | string[];
    };

    if (Array.isArray(parsed.message)) {
      return parsed.message.join(", ");
    }

    if (parsed.message) {
      return parsed.message;
    }
  } catch {
    // Response was plain text, not JSON.
  }

  return message;
}

export async function api<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(parseApiError(message) || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function apiFormData<T>(
  endpoint: string,
  formData: FormData,
  method = "POST",
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(parseApiError(message) || "Request failed");
  }

  return response.json();
}

export async function apiDownload(
  endpoint: string,
  filename: string,
): Promise<void> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error("Download failed");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}
