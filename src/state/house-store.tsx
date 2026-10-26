"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  lastArrival,
  logHouse,
  maxParty,
  sampleClosedDate,
  tables,
  type BookingRecord,
  type HouseEvent,
  type HouseView,
  type Table,
} from "@/mocks/house";

type HouseState = HouseView & { events: HouseEvent[]; closedReady: boolean };

export function houseView(state: HouseState, today: string): HouseState {
  if (state.closedReady) return state;
  return { ...state, closedDates: [sampleClosedDate(today)] };
}

type HouseApi = {
  state: HouseState;
  moveTable: (id: string, x: number, y: number) => void;
  addTable: () => void;
  updateTable: (id: string, patch: Partial<Pick<Table, "name" | "seats" | "active">>) => void;
  setWeekday: (day: number, open: boolean) => void;
  setLastArrival: (value: string) => void;
  addClosed: (iso: string, today: string) => void;
  removeClosed: (iso: string, today: string) => void;
  setMaxParty: (value: number) => void;
  addBooking: (booking: Omit<BookingRecord, "id">) => void;
  addEvent: (event: Omit<HouseEvent, "id" | "published">) => void;
  updateEvent: (id: string, patch: Partial<Omit<HouseEvent, "id">>) => void;
};

const HouseContext = createContext<HouseApi | null>(null);

function seed(): HouseState {
  return {
    tables: tables.map((table) => ({ ...table })),
    openWeekdays: [0, 4, 5, 6],
    lastArrival,
    closedDates: [],
    closedReady: false,
    maxParty,
    bookings: [],
    events: [],
  };
}

function opened(current: HouseState, today: string): HouseState {
  if (current.closedReady) return current;
  return { ...current, closedReady: true, closedDates: [sampleClosedDate(today)] };
}

export function HouseProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HouseState>(seed);

  const api = useMemo<HouseApi>(
    () => ({
      state,
      moveTable(id, x, y) {
        setState((current) => ({
          ...current,
          tables: current.tables.map((table) =>
            table.id === id ? { ...table, x, y } : table,
          ),
        }));
        logHouse("table moved", { id, x, y });
      },
      addTable() {
        const id = `t${Date.now()}`;
        const table: Table = { id, name: "", seats: 2, x: 50, y: 50, active: true };
        setState((current) => {
          const next = { ...table, name: String(current.tables.length + 1) };
          return { ...current, tables: [...current.tables, next] };
        });
        logHouse("table added", { id, seats: 2 });
      },
      updateTable(id, patch) {
        setState((current) => ({
          ...current,
          tables: current.tables.map((table) => (table.id === id ? { ...table, ...patch } : table)),
        }));
        logHouse("table updated", { id, ...patch });
      },
      setWeekday(day, open) {
        setState((current) => {
          const openWeekdays = open
            ? [...new Set([...current.openWeekdays, day])]
            : current.openWeekdays.filter((item) => item !== day);
          return { ...current, openWeekdays };
        });
        logHouse("weekday", { day, open });
      },
      setLastArrival(value) {
        setState((current) => ({ ...current, lastArrival: value }));
        logHouse("last arrival", { value });
      },
      addClosed(iso, today) {
        setState((current) => {
          const base = opened(current, today);
          if (base.closedDates.includes(iso)) return base;
          return { ...base, closedDates: [...base.closedDates, iso].sort() };
        });
        logHouse("day closed", { iso });
      },
      removeClosed(iso, today) {
        setState((current) => {
          const base = opened(current, today);
          return { ...base, closedDates: base.closedDates.filter((item) => item !== iso) };
        });
        logHouse("day reopened", { iso });
      },
      setMaxParty(value) {
        setState((current) => ({ ...current, maxParty: value }));
        logHouse("max party", { value });
      },
      addBooking(booking) {
        const id = `b${Date.now()}`;
        setState((current) => ({
          ...current,
          bookings: [...current.bookings, { ...booking, id }],
        }));
        logHouse("booking added", { id, date: booking.date, tableId: booking.tableId });
      },
      addEvent(event) {
        const id = `e${Date.now()}`;
        setState((current) => ({
          ...current,
          events: [...current.events, { ...event, id, published: false }],
        }));
        logHouse("event added", { id });
      },
      updateEvent(id, patch) {
        setState((current) => ({
          ...current,
          events: current.events.map((event) => (event.id === id ? { ...event, ...patch } : event)),
        }));
        logHouse("event updated", { id, ...patch });
      },
    }),
    [state],
  );

  return <HouseContext.Provider value={api}>{children}</HouseContext.Provider>;
}

export function useHouse() {
  const value = useContext(HouseContext);
  if (!value) throw new Error("useHouse must be used inside HouseProvider");
  return value;
}
