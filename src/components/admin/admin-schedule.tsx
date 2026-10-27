"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Copy } from "@/i18n/types";
import {
  getApiErrorMessage,
  getSchedule,
  updateSchedule,
  type SchedulePatch,
} from "@/lib/api";
import { calendarWindow, lastArrivalChoices } from "@/lib/schedule";

// The four lunch days, in the order the admin labels them.
const lunchDays = ["thursday", "friday", "saturday", "sunday"];

export function AdminSchedule({ copy, today }: { copy: Copy; today: string }) {
  const admin = copy.admin;
  const queryClient = useQueryClient();
  const schedule = useQuery({ queryKey: ["schedule"], queryFn: getSchedule });
  const [closedInput, setClosedInput] = useState(today);
  const [saveError, setSaveError] = useState("");
  const rules = schedule.data;

  // One write helper: send the patch, then put the answer straight into the
  // cache, so every React Query reader sees the change without a refetch.
  async function patch(change: SchedulePatch) {
    if (!rules) return;
    setSaveError("");
    try {
      const saved = await updateSchedule(change);
      queryClient.setQueryData(["schedule"], saved);
      console.info("[iturrieta] lunch updated", JSON.stringify(change));
    } catch (error) {
      setSaveError(getApiErrorMessage(error));
    }
  }

  function toggleDay(name: string) {
    if (!rules) return;
    const open = rules.openDays.includes(name);
    // The API refuses a schedule with nothing open, so keep at least one day.
    if (open && rules.openDays.length === 1) return;
    const next = open ? rules.openDays.filter((day) => day !== name) : [...rules.openDays, name];
    patch({ openDays: next });
  }

  function closeDay() {
    const iso = closedInput;
    if (!rules || rules.closedDates.includes(iso) || iso < today) return;
    patch({ closedDates: [...rules.closedDates, iso] });
  }

  function reopenDay(iso: string) {
    if (!rules) return;
    patch({ closedDates: rules.closedDates.filter((date) => date !== iso) });
  }

  if (!rules) return <div className="min-h-[8rem]" />;

  return (
    <div className="grid gap-8">
      <fieldset>
        <legend className="font-serif text-2xl text-bark">{admin.openDays}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {lunchDays.map((day, index) => {
            const open = rules.openDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                aria-pressed={open}
                onClick={() => toggleDay(day)}
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
          value={rules.lastArrival}
          onChange={(event) => patch({ lastArrival: event.target.value })}
          className="mt-1 w-full border-b border-bark/20 bg-transparent py-2 text-base text-bark outline-none"
        >
          {lastArrivalChoices.map((slot) => (
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
            value={closedInput}
            min={today}
            max={calendarWindow(today).at(-1)}
            onChange={(event) => setClosedInput(event.target.value)}
            className="border-b border-bark/20 bg-transparent py-2 text-bark outline-none"
          />
          <button
            type="button"
            disabled={schedule.isPending}
            onClick={closeDay}
            className="rounded-full bg-pour px-4 py-2 text-sm font-medium text-bark disabled:text-bark/40"
          >
            {admin.closeDay}
          </button>
        </div>
        {rules.closedDates.length === 0 ? (
          <p className="mt-4 text-haze">{admin.noClosed}</p>
        ) : (
          <ul className="mt-4 grid gap-2">
            {rules.closedDates.map((iso) => (
              <li key={iso} className="flex items-center justify-between gap-3 border-t border-bark/10 py-2">
                <span className="text-bark">{iso}</span>
                <button type="button" onClick={() => reopenDay(iso)} className="text-sm text-pit">
                  {admin.reopen}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* The number field holds its own draft and saves on blur, so typing
          10 does not write 1 to the API on the way. */}
      <label className="block max-w-xs text-sm text-haze">
        {admin.maxParty}
        <input
          type="number"
          min={2}
          max={12}
          defaultValue={rules.maxParty}
          key={rules.maxParty}
          onBlur={(event) => {
            const value = Math.min(12, Math.max(2, Number(event.target.value) || rules.maxParty));
            event.target.value = String(value);
            if (value !== rules.maxParty) patch({ maxParty: value });
          }}
          className="mt-1 w-full border-b border-bark/20 bg-transparent py-2 text-base text-bark outline-none focus:border-leaf"
        />
      </label>

      {saveError && <p className="text-sm text-pit">{saveError}</p>}
    </div>
  );
}
