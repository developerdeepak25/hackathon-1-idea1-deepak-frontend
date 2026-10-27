"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import type { Copy, Locale } from "@/i18n/types";
import { hasGuestToken, setGuestToken, subscribeToGuestToken } from "@/lib/api";
import { LanguageSwitch } from "./language-switch";
import { AppleMark } from "./motifs";
import { SealLink } from "./seal-link";

const linkClass =
  "relative text-haze transition-colors hover:text-bark after:absolute after:bottom-[-3px] after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-pour after:transition-transform hover:after:scale-x-100 focus-visible:after:scale-x-100";

export function SiteHeader({ locale, copy }: { locale: Locale; copy: Copy }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const signedIn = useSyncExternalStore(subscribeToGuestToken, hasGuestToken, () => false);
  const links = [
    { href: `/${locale}#house`, label: copy.nav.house },
    { href: `/${locale}#txotx`, label: copy.nav.txotx },
    { href: `/${locale}#menu`, label: copy.nav.menu },
    { href: `/${locale}#gatherings`, label: copy.nav.gatherings },
  ];
  const adminHref = `/${locale}/admin`;
  const accountHref = `/${locale}/account`;

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-bark/10 bg-valley">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href={`/${locale}`} className="min-w-0 text-bark">
          <motion.span
            className="flex min-w-0 items-center gap-3"
            initial="rest"
            whileHover={reduce ? undefined : "hover"}
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-bark/15 text-leaf">
              <AppleMark className="h-7 w-7" />
            </span>
            <span className="truncate font-serif text-[1.35rem] leading-none tracking-tight">
              Iturrieta
            </span>
          </motion.span>
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          <nav className="flex items-center gap-6 text-[0.95rem]">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}
          </nav>
          <LanguageSwitch locale={locale} />
          {!signedIn ? (
            <>
              <Link
                href={adminHref}
                className="rounded-full border border-bark/25 px-4 py-2 text-sm text-bark transition-colors hover:bg-bark/5 focus-visible:outline-leaf"
              >
                {copy.nav.admin}
              </Link>
              <Link href={accountHref} className={linkClass}>
                {copy.nav.signIn}
              </Link>
            </>
          ) : (
            <AccountMenu locale={locale} copy={copy} reduce={reduce} />
          )}
          <SealLink href={`/${locale}/book`} tone="apple" className="px-4 py-2 text-sm">
            {copy.nav.book}
          </SealLink>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          {signedIn ? <AccountMenu locale={locale} copy={copy} reduce={reduce} /> : null}
          <button
            type="button"
            className="border-b border-bark/30 px-1 py-2 text-sm text-bark"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? copy.nav.close : copy.nav.open}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.nav
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-bark/10 bg-valley lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-1 py-3 text-lg text-bark"
                  onClick={(event) => {
                    event.preventDefault();
                    go(link.href);
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <div className="px-1 py-3">
                <LanguageSwitch locale={locale} />
              </div>
              {!signedIn ? (
                <div className="mt-1 flex items-center justify-between border-t border-bark/10 px-1 pt-3 text-sm">
                  <Link
                    href={accountHref}
                    className={linkClass}
                    onClick={(event) => {
                      event.preventDefault();
                      go(accountHref);
                    }}
                  >
                    {copy.nav.signIn}
                  </Link>
                  <Link
                    href={adminHref}
                    className="rounded-full border border-bark/25 px-4 py-2 text-sm text-bark transition-colors hover:bg-bark/5 focus-visible:outline-leaf"
                    onClick={(event) => {
                      event.preventDefault();
                      go(adminHref);
                    }}
                  >
                    {copy.nav.admin}
                  </Link>
                </div>
              ) : null}
              <SealLink href={`/${locale}/book`} tone="apple" className="mt-1 w-full">
                {copy.nav.book}
              </SealLink>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function AccountMenu({
  locale,
  copy,
  reduce,
}: {
  locale: Locale;
  copy: Copy;
  reduce: boolean | null;
}) {
  const router = useRouter();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountHref = `/${locale}/account`;
  const bookingsHref = `/${locale}/bookings`;

  function go(href: string) {
    setAccountOpen(false);
    router.push(href);
  }

  function signOut() {
    setGuestToken(null);
    setAccountOpen(false);
    router.push(accountHref);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={copy.guest.accountTitle}
        aria-expanded={accountOpen}
        onClick={() => setAccountOpen((value) => !value)}
        className="grid h-10 w-10 place-items-center rounded-full border border-bark/20 text-bark transition-colors hover:bg-bark/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M5.5 20c.45-3.55 2.85-5.5 6.5-5.5s6.05 1.95 6.5 5.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <AnimatePresence>
        {accountOpen ? (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-30 mt-2 grid min-w-44 gap-1 border border-bark/10 bg-valley p-2 shadow-lg"
          >
            <Link
              href={bookingsHref}
              onClick={(event) => {
                event.preventDefault();
                go(bookingsHref);
              }}
              className="px-3 py-2 text-sm text-bark hover:bg-bark/5 focus-visible:outline-leaf"
            >
              {copy.nav.myBookings}
            </Link>
            <Link
              href={accountHref}
              onClick={(event) => {
                event.preventDefault();
                go(accountHref);
              }}
              className="px-3 py-2 text-sm text-bark hover:bg-bark/5 focus-visible:outline-leaf"
            >
              {copy.guest.accountTitle}
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="border-t border-bark/10 px-3 py-2 text-left text-sm text-haze hover:bg-bark/5 hover:text-bark focus-visible:outline-leaf"
            >
              {copy.guest.signOut}
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
