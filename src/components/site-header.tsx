"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Copy, Locale } from "@/i18n/types";
import { LanguageSwitch } from "./language-switch";
import { AppleMark } from "./motifs";
import { SealLink } from "./seal-link";

const linkClass =
  "relative text-haze transition-colors hover:text-bark after:absolute after:bottom-[-3px] after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-pour after:transition-transform hover:after:scale-x-100 focus-visible:after:scale-x-100";

export function SiteHeader({ locale, copy }: { locale: Locale; copy: Copy }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const links = [
    { href: `/${locale}#house`, label: copy.nav.house },
    { href: `/${locale}#txotx`, label: copy.nav.txotx },
    { href: `/${locale}#menu`, label: copy.nav.menu },
    { href: `/${locale}#gatherings`, label: copy.nav.gatherings },
  ];

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
          <SealLink href={`/${locale}/book`} tone="apple" className="px-4 py-2 text-sm">
            {copy.nav.book}
          </SealLink>
        </div>

        <button
          type="button"
          className="border-b border-bark/30 px-1 py-2 text-sm text-bark lg:hidden"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? copy.nav.close : copy.nav.open}
        </button>
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
