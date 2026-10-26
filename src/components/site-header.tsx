"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Copy, Locale } from "@/i18n/types";
import { LanguageSwitch } from "./language-switch";
import { AppleMark } from "./motifs";
import { SealLink } from "./seal-link";

export function SiteHeader({ locale, copy }: { locale: Locale; copy: Copy }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const links = [
    { href: `/${locale}#house`, label: copy.nav.house },
    { href: `/${locale}#menu`, label: copy.nav.menu },
    { href: `/${locale}#gatherings`, label: copy.nav.gatherings },
  ];

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-cider/40 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href={`/${locale}`} className="flex min-w-0 items-center gap-3 text-ink">
          <motion.span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-apple text-cream"
            initial="rest"
            whileHover={reduce ? undefined : "hover"}
          >
            <AppleMark className="h-7 w-7" />
          </motion.span>
          <span className="truncate font-serif text-xl tracking-tight">Iturrieta</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <nav className="flex items-center gap-6 text-sm text-wood">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-apple">
                {link.label}
              </Link>
            ))}
          </nav>
          <LanguageSwitch locale={locale} />
          <SealLink href={`/${locale}/book`} tone="apple" className="px-4 py-2 text-sm">
            {copy.nav.book}
          </SealLink>
        </div>

        <button
          type="button"
          className="rounded-full border border-wood/30 px-3 py-2 text-sm text-ink md:hidden"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? copy.nav.close : copy.nav.open}
        </button>
      </div>

      {open ? (
        <nav className="flex flex-col gap-1 border-t border-cider/30 px-4 py-3 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-2 py-3 text-ink"
              onClick={(event) => {
                event.preventDefault();
                go(link.href);
              }}
            >
              {link.label}
            </Link>
          ))}
          <div className="px-2 py-3">
            <LanguageSwitch locale={locale} />
          </div>
          <SealLink href={`/${locale}/book`} tone="apple" className="mt-1 w-full">
            {copy.nav.book}
          </SealLink>
        </nav>
      ) : null}
    </header>
  );
}
