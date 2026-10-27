"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import type { Copy } from "@/i18n/types";
import { getOwnerBookingsRange, getSchedule } from "@/lib/api";
import { calendarWindow, dayState } from "@/lib/schedule";

const bookingsPerPage = 10;

function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIsoDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDisplayDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function AdminBookings({ copy, today }: { copy: Copy; today: string }) {
  const admin = copy.admin;
  const book = copy.book;

  const schedule = useQuery({ queryKey: ["schedule"], queryFn: getSchedule });
  const rules = schedule.data;
  const days = useMemo(
    () => (rules ? calendarWindow(today).filter((iso) => dayState(iso, today, rules) === "open") : []),
    [rules, today],
  );

  const initialDay = days.includes(today) ? today : days[0] ?? today;
  const defaultRange: DateRange = {
    from: parseIsoDate(initialDay),
    to: parseIsoDate(initialDay),
  };
  const [range, setRange] = useState<DateRange>();
  const [draftRange, setDraftRange] = useState<DateRange>();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [page, setPage] = useState(0);
  const pickerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedRange = range ?? defaultRange;

  useEffect(() => {
    if (!pickerOpen) return;

    function closeOnOutsideClick(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !pickerRef.current?.contains(event.target) &&
        !triggerRef.current?.contains(event.target)
      ) {
        setPickerOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPickerOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [pickerOpen]);

  const from = selectedRange.from ? formatIsoDate(selectedRange.from) : initialDay;
  const to = selectedRange.to ? formatIsoDate(selectedRange.to) : from;

  const bookings = useQuery({
    queryKey: ["bookings-range", from, to],
    queryFn: () => getOwnerBookingsRange(from, to),
    enabled: Boolean(rules),
  });

  const rows = bookings.data;
  const waiting = bookings.isPending || schedule.isPending;
  const rangeStart = selectedRange.from ?? parseIsoDate(initialDay);
  const rangeEnd = selectedRange.to ?? rangeStart;
  const rangeLabel = `${formatDisplayDate(rangeStart)} – ${formatDisplayDate(rangeEnd)}`;

  return (
    <div>
      <div className="relative max-w-md">
        <span id="booking-range-label" className="block text-sm text-haze">
          {admin.dateRange}
        </span>
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={pickerOpen}
          aria-controls={pickerOpen ? "booking-range-dialog" : undefined}
          aria-labelledby="booking-range-label booking-range-value"
          onClick={() => {
            setDraftRange(selectedRange);
            setPickerOpen((open) => !open);
          }}
          className="mt-1 flex w-full items-center gap-3 rounded-md border border-bark/20 bg-foam px-3 py-2.5 text-left text-bark hover:border-bark/40 focus-visible:outline-leaf"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-4 w-4 shrink-0 text-haze"
          >
            <rect x="3.5" y="5" width="17" height="16" rx="2" />
            <path d="M7.5 3v4M16.5 3v4M3.5 9.5h17" />
          </svg>
          <span id="booking-range-value" className="min-w-0 flex-1 truncate text-sm">
            {rangeLabel}
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-4 w-4 shrink-0 text-haze"
          >
            <path d="m5 7.5 5 5 5-5" />
          </svg>
        </button>

        {pickerOpen && (
          <div
            ref={pickerRef}
            id="booking-range-dialog"
            role="dialog"
            aria-label={admin.dateRange}
            className="absolute left-0 top-full z-30 mt-2 w-max max-w-[calc(100vw-2rem)] overflow-x-auto rounded-xl border border-bark/15 bg-foam p-3 shadow-lg sm:p-4"
          >
            <DayPicker
              mode="range"
              selected={draftRange}
              onSelect={setDraftRange}
              numberOfMonths={2}
              navLayout="around"
              min={1}
              disabled={(day) => !days.includes(formatIsoDate(day))}
              className="booking-date-picker text-bark"
            />
            <div className="mt-3 flex justify-end gap-2 border-t border-bark/10 pt-3">
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="rounded-full border border-bark/20 px-4 py-2 text-sm text-bark hover:bg-bark/5"
              >
                {admin.cancel}
              </button>
              <button
                type="button"
                disabled={!draftRange?.from || !draftRange.to}
                onClick={() => {
                  setRange(draftRange);
                  setPage(0);
                  setPickerOpen(false);
                }}
                className="rounded-full bg-leaf px-4 py-2 text-sm text-foam hover:bg-leaf-deep disabled:cursor-not-allowed disabled:opacity-50"
              >
                {admin.apply}
              </button>
            </div>
          </div>
        )}
      </div>

      {waiting ? (
        <div className="min-h-[8rem]" />
      ) : bookings.isError ? (
        <p className="mt-6 text-sm text-pit">{book.apiDown}</p>
      ) : rows?.length === 0 ? (
        <p className="mt-6 text-haze">{admin.noBookings}</p>
      ) : (
        <>
          <ul className="mt-6 grid gap-3">
            {rows
              ?.slice(page * bookingsPerPage, (page + 1) * bookingsPerPage)
              .map((booking) => (
                <li key={booking.id} className="border-t border-bark/10 py-3">
                  <p className="font-serif text-2xl text-bark">{booking.name}</p>
                  <p className="mt-1 text-haze">
                    {booking.date}
                    {" · "}
                    {booking.time}
                    {", "}
                    {admin.partyLine
                      .replace("{seats}", String(booking.seats))
                      .replace("{table}", booking.table)}
                  </p>
                  <p className="mt-1 text-sm text-haze">
                    {booking.phone}
                    {", "}
                    {booking.email}
                  </p>
                </li>
              ))}
          </ul>
          {rows && rows.length > bookingsPerPage && (
            <nav
              aria-label={admin.bookingsPagination}
              className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-bark/10 pt-4"
            >
              <p className="text-sm text-haze" aria-live="polite">
                {admin.paginationSummary
                  .replace("{start}", String(page * bookingsPerPage + 1))
                  .replace("{end}", String(Math.min((page + 1) * bookingsPerPage, rows.length)))
                  .replace("{total}", String(rows.length))}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((current) => Math.max(0, current - 1))}
                  className="rounded-full border border-bark/20 px-4 py-2 text-sm text-bark hover:bg-bark/5 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {admin.previousPage}
                </button>
                <button
                  type="button"
                  disabled={(page + 1) * bookingsPerPage >= rows.length}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-full border border-bark/20 px-4 py-2 text-sm text-bark hover:bg-bark/5 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {admin.nextPage}
                </button>
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
