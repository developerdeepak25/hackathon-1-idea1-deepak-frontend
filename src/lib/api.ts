import axios from "axios";

export const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

const tokenKey = "iturrieta-token";

export const api = axios.create({
  baseURL: apiUrl,
});

export function getOwnerToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(tokenKey);
}

export function setOwnerToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) sessionStorage.setItem(tokenKey, token);
  else sessionStorage.removeItem(tokenKey);
}

api.interceptors.request.use((config) => {
  const token = getOwnerToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export type OwnerSession = {
  email: string;
  token: string;
};

export async function loginOwner(email: string, password: string) {
  const { data } = await api.post<OwnerSession>("/auth/login", { email, password });
  setOwnerToken(data.token);
  return data;
}

export async function getOwner() {
  const { data } = await api.get<{ email: string }>("/auth/me");
  return data;
}

export type HealthResponse = {
  status: string;
  service: string;
  database: string;
  timestamp: string;
};

export async function getHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>("/health");
  return data;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status) return `API responded with ${status}`;
    return error.message;
  }

  if (error instanceof Error) return error.message;
  return "Could not reach the API";
}
