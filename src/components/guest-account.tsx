"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import type { Copy, Locale } from "@/i18n/types";
import {
  getGuest,
  getGuestToken,
  loginGuest,
  registerGuest,
  setGuestToken,
  type GuestProfile,
} from "@/lib/api";

export function GuestAccount({
  copy,
  locale,
  returnTo,
}: {
  copy: Copy;
  locale: Locale;
  returnTo?: string;
}) {
  const guestCopy = copy.guest;
  const router = useRouter();
  const [registering, setRegistering] = useState(false);
  const [profile, setProfile] = useState<GuestProfile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!getGuestToken()) return;
    getGuest()
      .then(setProfile)
      .catch(() => setGuestToken(null));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (registering && name.trim().length < 2) {
      setError(guestCopy.nameError);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(guestCopy.emailError);
      return;
    }
    if (registering && password.length < 8) {
      setError(guestCopy.passwordError);
      return;
    }

    setBusy(true);
    try {
      if (registering) {
        await registerGuest({ email: email.trim(), name: name.trim(), password });
      } else {
        await loginGuest(email.trim(), password);
      }
      const destination =
        returnTo?.startsWith(`/${locale}/`) && !returnTo.startsWith("//")
          ? returnTo
          : `/${locale}/bookings`;
      router.replace(destination);
    } catch (caught) {
      if (axios.isAxiosError(caught) && caught.response?.status === 409) {
        setError(guestCopy.emailTaken);
      } else if (axios.isAxiosError(caught) && caught.response?.status === 401) {
        setError(guestCopy.loginError);
      } else {
        setError(guestCopy.apiDown);
      }
    } finally {
      setBusy(false);
    }
  }

  function signOut() {
    setGuestToken(null);
    setProfile(null);
    setPassword("");
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-14 sm:py-20">
      <p className="text-haze">{guestCopy.accountIntro}</p>
      <h1 className="mt-3 font-serif text-5xl leading-tight text-bark sm:text-6xl">
        {guestCopy.accountTitle}
      </h1>

      {profile ? (
        <div className="mt-8 border-t border-bark/10 pt-5">
          <p className="font-serif text-2xl text-bark">{profile.name}</p>
          <p className="mt-1 text-haze">{profile.email}</p>
          <div className="mt-6 flex flex-wrap gap-5">
            <a href={`/${locale}/bookings`} className="text-leaf underline-offset-4 hover:underline">
              {copy.nav.myBookings}
            </a>
            <button type="button" onClick={signOut} className="text-haze underline-offset-4 hover:underline">
              {guestCopy.signOut}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-8 flex gap-6 border-b border-bark/10">
            <button
              type="button"
              aria-pressed={!registering}
              onClick={() => {
                setRegistering(false);
                setError("");
              }}
              className={`border-b py-3 text-sm ${!registering ? "border-pour text-bark" : "border-transparent text-haze"}`}
            >
              {guestCopy.signIn}
            </button>
            <button
              type="button"
              aria-pressed={registering}
              onClick={() => {
                setRegistering(true);
                setError("");
              }}
              className={`border-b py-3 text-sm ${registering ? "border-pour text-bark" : "border-transparent text-haze"}`}
            >
              {guestCopy.register}
            </button>
          </div>
          <form onSubmit={submit} className="mt-6 grid gap-5">
            {registering && (
              <label className="text-sm text-haze">
                {guestCopy.name}
                <input
                  type="text"
                  autoComplete="name"
                  required
                  minLength={2}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1 w-full border-b border-bark/20 bg-transparent py-2 text-base text-bark outline-none focus:border-leaf"
                />
              </label>
            )}
            <label className="text-sm text-haze">
              {guestCopy.email}
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full border-b border-bark/20 bg-transparent py-2 text-base text-bark outline-none focus:border-leaf"
              />
            </label>
            <label className="text-sm text-haze">
              {guestCopy.password}
              <input
                type="password"
                autoComplete={registering ? "new-password" : "current-password"}
                required
                minLength={registering ? 8 : 1}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full border-b border-bark/20 bg-transparent py-2 text-base text-bark outline-none focus:border-leaf"
              />
            </label>
            {error && <p role="alert" className="text-sm text-pit">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="mt-2 justify-self-start rounded-full bg-leaf px-6 py-3 text-sm text-foam disabled:opacity-60"
            >
              {busy
                ? "…"
                : registering
                  ? guestCopy.createAccount
                  : guestCopy.signIn}
            </button>
            <button
              type="button"
              onClick={() => {
                setRegistering((value) => !value);
                setError("");
              }}
              className="justify-self-start text-sm text-haze underline-offset-4 hover:underline"
            >
              {registering ? guestCopy.switchToSignIn : guestCopy.switchToRegister}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
