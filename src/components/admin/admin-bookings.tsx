"use client";

import { useState } from "react";
import type { Copy } from "@/i18n/types";
import { bookingWindow, dayState } from "@/mocks/house";
import { houseView, useHouse } from "@/state/house-store";

export function AdminBookings({ copy, today }: { copy: Copy; today: string }) {
  const admin = copy.admin;
  const { state: stored } = useHouse();
  const state = houseView(stored, today);
  const days = bookingWindow(today).filter((iso) => dayState(iso, today, state) === "open");
  const [date, setDate] = useState(days[0] ?? today);
  const chosen = days.includes(date) ? date : (days[0] ?? today);
  const rows = state.bookings.filter((booking) => booking.date === chosen);

  return (
    <div>
      <label className="block max-w-xs text-sm text-haze">
        {copy.book.steps.date}
        <select
          value={chosen}
          onChange={(event) => setDate(event.target.value)}
          className="mt-1 w-full border-b border-bark/20 bg-transparent py-2 text-base text-bark outline-none"
        >
          {days.map((iso) => (
            <option key={iso} value={iso}>
              {iso}
            </option>
          ))}
        </select>
      </label>
      {rows.length === 0 ? (
        <p className="mt-6 text-haze">{admin.noBookings}</p>
      ) : (
        <ul className="mt-6 grid gap-3">
          {rows.map((booking) => {
            const table = state.tables.find((item) => item.id === booking.tableId);
            return (
              <li key={booking.id} className="border-t border-bark/10 py-3">
                <p className="font-serif text-2xl text-bark">{booking.name}</p>
                <p className="mt-1 text-haze">
                  {booking.time}
                  {", "}
                  {admin.partyLine
                    .replace("{seats}", String(booking.seats))
                    .replace("{table}", table?.name ?? booking.tableId)}
                </p>
                <p className="mt-1 text-sm text-haze">
                  {booking.phone}
                  {", "}
                  {booking.email}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
