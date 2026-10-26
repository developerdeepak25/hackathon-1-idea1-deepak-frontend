"use client";

import { useState } from "react";
import type { Copy } from "@/i18n/types";
import { arrivalSlots, bookingWindow, dayState } from "@/mocks/house";
import { houseView, useHouse } from "@/state/house-store";

const lunchDays = [4, 5, 6, 0];

export function AdminSchedule({ copy, today }: { copy: Copy; today: string }) {
  const admin = copy.admin;
  const house = useHouse();
  const state = houseView(house.state, today);
  const { setWeekday, setLastArrival, addClosed, removeClosed, setMaxParty } = house;
  const [day, setDay] = useState(today);
  const slots = arrivalSlots("14:30");

  function closeDay() {
    if (dayState(day, today, { ...state, closedDates: [] }) === "past") return;
    addClosed(day, today);
  }

  return (
    <div className="grid gap-8">
      <fieldset>
        <legend className="font-serif text-2xl text-bark">{admin.openDays}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {lunchDays.map((weekday, index) => {
            const open = state.openWeekdays.includes(weekday);
            return (
              <button
                key={weekday}
                type="button"
                aria-pressed={open}
                onClick={() => setWeekday(weekday, !open)}
                className={`rounded-full px-4 py-2 text-sm ${
                  open ? "bg-leaf text-foam" : "bg-bark/10 text-haze"
                }`}
              >
                {admin.days[index]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="block max-w-xs text-sm text-haze">
        {admin.lastArrival}
        <select
          value={state.lastArrival}
          onChange={(event) => setLastArrival(event.target.value)}
          className="mt-1 w-full border-b border-bark/20 bg-transparent py-2 text-base text-bark outline-none"
        >
          {slots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>
      </label>

      <div>
        <h3 className="font-serif text-2xl text-bark">{admin.closedDays}</h3>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <input
            type="date"
            value={day}
            min={today}
            max={bookingWindow(today).at(-1)}
            onChange={(event) => setDay(event.target.value)}
            className="border-b border-bark/20 bg-transparent py-2 text-bark outline-none"
          />
          <button
            type="button"
            onClick={closeDay}
            className="rounded-full bg-pour px-4 py-2 text-sm font-medium text-bark"
          >
            {admin.closeDay}
          </button>
        </div>
        {state.closedDates.length === 0 ? (
          <p className="mt-4 text-haze">{admin.noClosed}</p>
        ) : (
          <ul className="mt-4 grid gap-2">
            {state.closedDates.map((iso) => (
              <li key={iso} className="flex items-center justify-between gap-3 border-t border-bark/10 py-2">
                <span className="text-bark">{iso}</span>
                <button
                  type="button"
                  onClick={() => removeClosed(iso, today)}
                  className="text-sm text-pit"
                >
                  {admin.reopen}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <label className="block max-w-xs text-sm text-haze">
        {admin.maxParty}
        <input
          type="number"
          min={1}
          max={40}
          value={state.maxParty}
          onChange={(event) => setMaxParty(Math.max(1, Number(event.target.value) || 1))}
          className="mt-1 w-full border-b border-bark/20 bg-transparent py-2 text-base text-bark outline-none focus:border-leaf"
        />
      </label>
    </div>
  );
}
