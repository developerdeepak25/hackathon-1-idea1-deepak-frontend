import axios from "axios";

export const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export const api = axios.create({
  baseURL: apiUrl,
});

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
