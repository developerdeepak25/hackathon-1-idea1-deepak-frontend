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

// The lunch rules the calendar and the time chips read. Shape matches
// GET /api/schedule.
export type ScheduleResponse = {
  openDays: string[];
  closedDates: string[];
  lunchStart: string;
  lunchEnd: string;
  lastArrival: string;
  slots: string[];
  slotMinutes: number;
  maxParty: number;
  adultPrice: number;
  childPrice: number;
};

export async function getSchedule() {
  const { data } = await api.get<ScheduleResponse>("/schedule");
  return data;
}

// What the owner is allowed to change on the Lunch screen. The page always
// sends complete lists, never deltas.
export type SchedulePatch = {
  openDays?: string[];
  lastArrival?: string;
  closedDates?: string[];
  maxParty?: number;
};

export async function updateSchedule(patch: SchedulePatch) {
  const { data } = await api.patch<ScheduleResponse>("/schedule", patch);
  return data;
}

// The answer to the party check: a table, or why not. The reason words come
// from the API: need-adult, above-max, no-table, full and the day reasons.
export type AvailabilityResponse = {
  table: { name: string; seats: number } | null;
  reason: string | null;
  maxParty?: number;
};

export async function checkAvailability(input: {
  date: string;
  time: string;
  adults: number;
  children: number;
}) {
  const { data } = await api.get<AvailabilityResponse>("/bookings/availability", {
    params: input,
  });
  return data;
}

// One confirmed booking row, public on the confirmation and owner list.
export type BookingRow = {
  id: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  adults: number;
  children: number;
  seats: number;
  table: string;
  status: string;
};

// Raised when the API refuses a booking with a reason instead of an error
// page, so the flow can answer in words.
export class ApiRefused extends Error {
  reason: string;
  maxParty?: number;

  constructor(reason: string, maxParty?: number) {
    super(`Booking refused: ${reason}`);
    this.reason = reason;
    this.maxParty = maxParty;
  }
}

export async function createBooking(input: {
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  adults: number;
  children: number;
  requestId: string;
}) {
  try {
    const { data } = await api.post<BookingRow>("/bookings", input);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      const body = error.response.data as { reason?: string; maxParty?: number };
      throw new ApiRefused(body.reason ?? "full", body.maxParty);
    }
    throw error;
  }
}

// One day's rows for the owner, each with its arrival slot.
export async function getOwnerBookings(date: string) {
  const { data } = await api.get<BookingRow[]>("/bookings", { params: { date } });
  return data;
}

export async function getOwnerBookingsRange(from: string, to: string) {
  const { data } = await api.get<BookingRow[]>("/bookings/range", {
    params: { from, to },
  });
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
