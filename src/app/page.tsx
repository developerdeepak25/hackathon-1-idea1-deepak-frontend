"use client";

import { useEffect, useState } from "react";
import { apiUrl, getHealth, type HealthResponse } from "@/lib/api";

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getHealth()
      .then((result) => {
        if (active) setHealth(result);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not reach the API");
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <main className="flex w-full max-w-xl flex-col gap-8 rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-950">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium tracking-wide text-zinc-500 uppercase">
            hack-1
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Next.js and NestJS
          </h1>
          <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            The web app is running on port 3000. API status comes from the NestJS
            service.
          </p>
        </div>

        <section className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-medium text-black dark:text-zinc-50">
              API health
            </h2>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                health
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : error
                    ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
              }`}
            >
              {health ? "Connected" : error ? "Unavailable" : "Checking"}
            </span>
          </div>
          <p className="mt-3 font-mono text-sm text-zinc-500">{apiUrl}/health</p>
          {health ? (
            <dl className="mt-4 grid gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <div className="flex justify-between gap-4">
                <dt>Status</dt>
                <dd>{health.status}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Service</dt>
                <dd>{health.service}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Timestamp</dt>
                <dd className="text-right">{health.timestamp}</dd>
              </div>
            </dl>
          ) : null}
          {error ? (
            <p className="mt-4 text-sm text-red-700 dark:text-red-300">
              {error}. From the api folder, run <code>npm run start:dev</code>.
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}
