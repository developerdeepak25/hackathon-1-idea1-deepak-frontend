// Calendar helpers for the booking page, driven by the API schedule instead
// of the mock. Dates stay "YYYY-MM-DD" strings; no Date objects are stored,
// so the page and the API in Europe/Madrid agree on what a day is.

import type { ScheduleResponse } from "./api";

// Weekday names in getDay() order, same list the API uses.
const weekdayNames = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

// The four chips the owner can move the last arrival to, matching the API's
// restriction. The time step shows these as the choices.
export const lastArrivalChoices = ["13:00", "13:30", "14:00", "14:30"];

export type DayState = "open" | "shut" | "closed" | "past";

export type CalendarCell = { iso: string; state: DayState };

function parseDay(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(iso: string, amount: number) {
  const date = parseDay(iso);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function weekday(iso: string) {
  return parseDay(iso).getUTCDay();
}

// One day chip's state: open, shut by the lunch rules, closed by the owner,
// or already gone.
export function dayState(
  iso: string,
  today: string,
  schedule: ScheduleResponse,
): DayState {
  if (iso < today) return "past";
  if (schedule.closedDates.includes(iso)) return "closed";
  const open = schedule.openDays.map((name) => weekdayNames.indexOf(name));
  if (!open.includes(weekday(iso))) return "shut";
  return "open";
}

// The 28 days of the booking window, today included, newest first in order.
export function calendarWindow(today: string) {
  return Array.from({ length: 28 }, (_, index) => addDays(today, index));
}

// Calendar grid cells for a 7-column week view; the week starts on Monday.
export function calendarCells(
  today: string,
  schedule: ScheduleResponse,
): { cells: (CalendarCell | null)[] } {
  const days = calendarWindow(today);
  const lead = (weekday(days[0]) + 6) % 7;
  const cells: (CalendarCell | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...days.map((iso) => ({ iso, state: dayState(iso, today, schedule) })),
  ];
  while (cells.length % 7) cells.push(null);
  return { cells };
}
