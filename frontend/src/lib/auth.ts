import { api } from "./api";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "@/types/auth";

const USER_KEY = "user";

export async function login(credentials: LoginCredentials) {
  const data = await api<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  localStorage.setItem("token", data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data;
}

export async function register(credentials: RegisterCredentials) {
  const data = await api<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  localStorage.setItem("token", data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data;
}

export async function getMe() {
  return api<User>("/auth/me");
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

export const LOGOUT_MESSAGE_KEY = "logoutSuccess";

export async function logout() {
  try {
    if (getToken()) {
      await api("/auth/logout", { method: "POST" });
    }
  } catch {
    // Still clear the token locally if the API call fails.
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem(USER_KEY);
    sessionStorage.setItem(LOGOUT_MESSAGE_KEY, "true");
  }
}

export function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}
