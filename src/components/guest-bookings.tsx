"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Copy, Locale } from "@/i18n/types";
import {
  cancelGuestBooking,
  getGuestBookings,
  getGuestToken,
  setGuestToken,
} from "@/lib/api";

export function GuestBookings({
  copy,
  locale,
  today,
}: {
  copy: Copy;
  locale: Locale;
  today: string;
}) {
  const guestCopy = copy.guest;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getGuestToken()) {
      router.replace(`/${locale}/account?returnTo=/${locale}/bookings`);
      return;
    }
    setReady(true);
  }, [locale, router]);

  const bookings = useQuery({
    queryKey: ["guest-bookings"],
    queryFn: getGuestBookings,
    enabled: ready,
    retry: false,
  });

  const cancel = useMutation({
    mutationFn: cancelGuestBooking,
    onSuccess: async () => {
      setError("");
      await queryClient.invalidateQueries({ queryKey: ["guest-bookings"] });
    },
    onError: (caught) => {
      if (axios.isAxiosError(caught) && caught.response?.status === 409) {
        const reason = (caught.response.data as { reason?: string }).reason;
        setError(reason === "started" ? guestCopy.started : guestCopy.cancelError);
      } else if (axios.isAxiosError(caught) && caught.response?.status === 401) {
        setGuestToken(null);
        router.replace(`/${locale}/account?returnTo=/${locale}/bookings`);
      } else {
        setError(guestCopy.cancelError);
      }
    },
  });

  return (
    <section className="mx-auto max-w-4xl px-4 py-14 sm:py-20">
      <p className="text-haze">{guestCopy.bookingsIntro}</p>
      <h1 className="mt-3 font-serif text-5xl leading-tight text-bark sm:text-6xl">
        {guestCopy.bookingsTitle}
      </h1>
      {error && <p role="alert" className="mt-5 text-sm text-pit">{error}</p>}
      {!ready || bookings.isPending ? (
        <div className="min-h-40" />
      ) : bookings.isError ? (
        <p role="alert" className="mt-8 text-sm text-pit">{guestCopy.apiDown}</p>
      ) : bookings.data.length === 0 ? (
        <p className="mt-8 border-t border-bark/10 pt-5 text-haze">{guestCopy.emptyBookings}</p>
      ) : (
        <ul className="mt-8">
          {bookings.data.map((booking) => (
            <li key={booking.id} className="grid gap-3 border-t border-bark/10 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="font-serif text-2xl text-bark">
                  {booking.date} · {booking.time}
                </p>
                <p className="mt-1 text-haze">
                  {booking.name} · {guestCopy.seats.replace("{n}", String(booking.seats))} · {copy.book.tableAssigned}: {booking.table}
                </p>
                <p className="mt-1 text-sm text-haze">
                  {guestCopy.total}: €{booking.total}
                  {" · "}
                  {booking.status === "cancelled" ? guestCopy.cancelled : guestCopy.confirmed}
                </p>
              </div>
              {booking.status === "confirmed" && booking.date >= today && (
                <button
                  type="button"
                  disabled={cancel.isPending}
                  onClick={() => cancel.mutate(booking.id)}
                  className="justify-self-start rounded-full border border-bark/25 px-4 py-2 text-sm text-bark hover:bg-bark/5 disabled:opacity-50 sm:justify-self-end"
                >
                  {guestCopy.cancel}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
