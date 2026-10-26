export const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export type HealthResponse = {
  status: string;
  service: string;
  timestamp: string;
};

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${apiUrl}/health`);

  if (!response.ok) {
    throw new Error(`API responded with ${response.status}`);
  }

  return response.json() as Promise<HealthResponse>;
}
