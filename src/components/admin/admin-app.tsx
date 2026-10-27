"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Copy, Locale } from "@/i18n/types";
import { getOwner, getOwnerToken, loginOwner, setOwnerToken } from "@/lib/api";
import { AdminBookings } from "./admin-bookings";
import { AdminEvents } from "./admin-events";
import { AdminSchedule } from "./admin-schedule";

// The floor plan is temporarily disabled until its layout can be persisted.
const sections = ["schedule", "bookings", "events"] as const;
type Section = (typeof sections)[number];

export function AdminApp({ copy, today }: { copy: Copy; locale: Locale; today: string }) {
  const admin = copy.admin;
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [section, setSection] = useState<Section>("schedule");

  useEffect(() => {
    sessionStorage.removeItem("iturrieta-owner");
    if (!getOwnerToken()) {
      setReady(true);
      return;
    }
    getOwner()
      .then(() => setOpen(true))
      .catch(() => {
        setOwnerToken(null);
        setOpen(false);
      })
      .finally(() => setReady(true));
  }, []);

  async function unlock(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError(admin.passwordError);
      return;
    }
    setBusy(true);
    try {
      await loginOwner(email.trim(), password);
      setOpen(true);
      setError("");
      setPassword("");
    } catch {
      setError(admin.loginError);
    } finally {
      setBusy(false);
    }
  }

  function lock() {
    setOwnerToken(null);
    setOpen(false);
    setPassword("");
  }

  if (!ready) return <div className="min-h-[50vh]" />;

  if (!open) {
    return (
      <section className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-serif text-5xl text-bark">{admin.title}</h1>
        <p className="mt-4 text-lg leading-8 text-haze">{admin.intro}</p>
        <form onSubmit={unlock} className="mt-8 grid gap-4">
          <label className="text-sm text-haze">
            {admin.email}
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full border-b border-bark/20 bg-transparent py-2 text-base text-bark outline-none focus:border-leaf"
            />
          </label>
          <label className="text-sm text-haze">
            {admin.password}
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full border-b border-bark/20 bg-transparent py-2 text-base text-bark outline-none focus:border-leaf"
            />
          </label>
          {error && <p className="mt-3 text-sm text-pit">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-2 justify-self-start rounded-full bg-pour px-5 py-2.5 text-sm font-medium text-bark disabled:opacity-60"
          >
            {admin.enter}
          </button>
        </form>
      </section>
    );
  }

  const labels: Record<Section, string> = {
    schedule: admin.schedule,
    bookings: admin.bookings,
    events: admin.events,
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-5xl text-bark">{admin.title}</h1>
          <p className="mt-3 max-w-xl text-haze">{admin.intro}</p>
        </div>
        <button type="button" onClick={lock} className="text-sm text-haze underline">
          {admin.leave}
        </button>
      </div>
      <div className="mt-8 flex gap-2 overflow-x-auto pb-1">
        {sections.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={section === item}
            onClick={() => setSection(item)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm ${
              section === item ? "bg-leaf text-foam" : "bg-bark/10 text-haze"
            }`}
          >
            {labels[item]}
          </button>
        ))}
      </div>
      <div className="mt-8">
        {section === "schedule" && <AdminSchedule copy={copy} today={today} />}
        {section === "bookings" && <AdminBookings copy={copy} today={today} />}
        {section === "events" && <AdminEvents copy={copy} today={today} />}
      </div>
    </section>
  );
}
