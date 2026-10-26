// Mock house for the booking screens. Slice 4 reads this same file.
// A booked table stays taken for the whole lunch. Arrival is only when the group comes.

export const adultPrice = 45;
export const childPrice = 16;
export const lunchStart = "13:00";
export const lunchEnd = "16:00";
export const lastArrival = "14:30";
export const slotMinutes = 30;

// Higher than the largest table, so both refusals can appear on screen.
export const maxParty = 12;

export type Table = {
  id: string;
  name: string;
  seats: number;
  x: number;
  y: number;
  active: boolean;
};

export const tables: Table[] = [
  { id: "t1", name: "1", seats: 2, x: 18, y: 22, active: true },
  { id: "t2", name: "2", seats: 2, x: 38, y: 22, active: true },
  { id: "t3", name: "3", seats: 4, x: 62, y: 24, active: true },
  { id: "t4", name: "4", seats: 4, x: 82, y: 24, active: true },
  { id: "t5", name: "5", seats: 6, x: 22, y: 55, active: true },
  { id: "t6", name: "6", seats: 6, x: 48, y: 58, active: true },
  { id: "t7", name: "7", seats: 8, x: 74, y: 56, active: true },
  { id: "t8", name: "8", seats: 10, x: 46, y: 82, active: true },
];

export type DayState = "open" | "shut" | "closed" | "past";

export type PartyReason = "need-adult" | "above-max" | "no-table" | "full";

export type PartyResult =
  | { ok: true; tableId: string }
  | { ok: false; reason: PartyReason };

const openWeekdays = new Set([0, 4, 5, 6]);

export function logHouse(action: string, detail: Record<string, unknown>) {
  console.info(`[iturrieta] ${action}`, detail);
}

export function madridToday(now?: Date) {
  const clock = now ?? new Date();
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(clock);
}

function parseDay(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(iso: string, amount: number) {
  const date = parseDay(iso);
  date.setUTCDate(date.getUTCDate() + amount);
  return formatDay(date);
}

function weekday(iso: string) {
  return parseDay(iso).getUTCDay();
}

export function biggestTable() {
  return Math.max(...tables.filter((table) => table.active).map((table) => table.seats));
}

// Next Thursday that is still inside the 28-day window.
export function sampleClosedDate(today: string) {
  let cursor = addDays(today, 7);
  while (weekday(cursor) !== 4) cursor = addDays(cursor, 1);
  return cursor;
}

// Next Sunday, with the two largest tables already held.
export function sampleBusyDate(today: string) {
  let cursor = addDays(today, 1);
  while (weekday(cursor) !== 0) cursor = addDays(cursor, 1);
  return cursor;
}

export function heldTableIds(today: string, date: string) {
  if (date !== sampleBusyDate(today)) return new Set<string>();
  return new Set(["t7", "t8"]);
}

export function dayState(iso: string, today: string): DayState {
  if (iso < today) return "past";
  if (iso === sampleClosedDate(today)) return "closed";
  if (!openWeekdays.has(weekday(iso))) return "shut";
  return "open";
}

export function bookingWindow(today: string) {
  return Array.from({ length: 28 }, (_, index) => addDays(today, index));
}

export function calendarCells(today: string) {
  const days = bookingWindow(today);
  const lead = (weekday(days[0]) + 6) % 7;
  const cells: ({ iso: string; state: DayState } | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...days.map((iso) => ({ iso, state: dayState(iso, today) })),
  ];
  while (cells.length % 7) cells.push(null);
  return cells;
}

export function arrivalSlots() {
  const [startHour, startMinute] = lunchStart.split(":").map(Number);
  const [endHour, endMinute] = lastArrival.split(":").map(Number);
  const slots: string[] = [];
  let minutes = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  while (minutes <= end) {
    const hour = String(Math.floor(minutes / 60)).padStart(2, "0");
    const minute = String(minutes % 60).padStart(2, "0");
    slots.push(`${hour}:${minute}`);
    minutes += slotMinutes;
  }
  return slots;
}

// Smallest free table that fits. Adults and children both take a seat.
export function assignTable(today: string, date: string, seats: number): PartyResult {
  if (seats < 1) return { ok: false, reason: "need-adult" };
  if (seats > maxParty) return { ok: false, reason: "above-max" };
  const largest = biggestTable();
  if (seats > largest) return { ok: false, reason: "no-table" };

  const taken = heldTableIds(today, date);
  const fit = tables
    .filter((table) => table.active && !taken.has(table.id) && table.seats >= seats)
    .sort((a, b) => a.seats - b.seats);

  if (!fit[0]) return { ok: false, reason: "full" };
  return { ok: true, tableId: fit[0].id };
}
