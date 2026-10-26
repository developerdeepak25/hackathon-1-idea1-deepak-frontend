"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Copy, Locale } from "@/i18n/types";
import { BarrelSeal } from "./motifs";
import { PublicShell } from "./public-shell";
import { Reveal } from "./reveal";
import { SealLink } from "./seal-link";

export function HousePage({ locale, copy }: { locale: Locale; copy: Copy }) {
  const reduce = useReducedMotion();

  return (
    <PublicShell locale={locale} copy={copy}>
      <motion.div
        key={locale}
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <section id="house" className="overflow-hidden bg-apple-deep text-cream">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:py-20 lg:grid-cols-[1.35fr_0.85fr] lg:py-24">
            <div>
              <p className="flex items-center gap-3 text-sm tracking-[0.22em] text-cider uppercase">
                <motion.span
                  aria-hidden
                  className="inline-block h-px bg-cider"
                  initial={{ width: reduce ? 28 : 0 }}
                  animate={{ width: 28 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
                {copy.hero.eyebrow}
              </p>
              <h1 className="mt-5 font-serif text-6xl leading-[0.9] sm:text-8xl">
                Iturrieta
              </h1>
              <p className="mt-4 font-serif text-2xl text-cider">
                {copy.hero.established}
              </p>
              <p className="mt-6 max-w-xl text-lg leading-8 text-cream/85">
                {copy.hero.lede}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <SealLink href={`/${locale}/book`} tone="gold">
                  {copy.hero.book}
                </SealLink>
                <SealLink href="#menu" tone="line">
                  {copy.hero.menu}
                </SealLink>
              </div>
            </div>
            <div className="mx-auto text-cider">
              <BarrelSeal className="h-40 w-32 sm:h-44 sm:w-36" />
            </div>
          </div>
        </section>

        <section className="border-b border-cider/40">
          <dl className="mx-auto grid max-w-6xl sm:grid-cols-2 lg:grid-cols-4">
            {copy.facts.map((fact, index) => (
              <Reveal
                key={fact.label}
                delay={index * 0.08}
                className="border-b border-cider/30 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:border-r lg:border-b-0 lg:last:border-r-0"
              >
                <div className="px-6 py-7">
                  <dt className="text-xs tracking-[0.18em] text-oxblood uppercase">
                    {fact.label}
                  </dt>
                  <dd className="mt-2 font-serif text-2xl text-ink">{fact.value}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </section>

        <section id="menu" className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="grid items-start gap-10 lg:grid-cols-[0.8fr_1.1fr]">
            <Reveal>
              <p className="text-sm tracking-[0.22em] text-oxblood uppercase">
                {copy.lunch.eyebrow}
              </p>
              <h2 className="mt-3 font-serif text-5xl leading-none text-ink">
                {copy.lunch.title}
              </h2>
              <p className="mt-5 max-w-md text-lg leading-8 text-wood">
                {copy.lunch.body}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="border border-wood/15 bg-[#fffaf3] px-6 py-2 shadow-[0_18px_40px_rgba(59,36,22,0.05)] sm:px-8">
                {copy.menuItems.map((item) => (
                  <motion.div
                    key={item.name}
                    className="border-b border-cider/40 py-6 last:border-b-0"
                    initial="rest"
                    whileHover={reduce ? undefined : "hover"}
                  >
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="font-serif text-3xl text-ink">{item.name}</p>
                        <p className="mt-1 text-wood">{item.note}</p>
                      </div>
                      <p className="font-serif text-4xl text-apple">{item.price}</p>
                    </div>
                    <motion.span
                      aria-hidden
                      className="mt-4 block h-px origin-center bg-cider"
                      variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </motion.div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section id="gatherings" className="bg-apple text-cream">
          <Reveal className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
            <p className="text-sm tracking-[0.22em] text-cider uppercase">
              {copy.gatherings.eyebrow}
            </p>
            <h2 className="mt-3 max-w-xl font-serif text-5xl leading-none">
              {copy.gatherings.title}
            </h2>
            {/* Published events replace this empty line in a later slice. */}
            <p className="mt-6 max-w-lg text-lg leading-8 text-cream/80">
              {copy.gatherings.empty}
            </p>
          </Reveal>
        </section>
      </motion.div>
    </PublicShell>
  );
}
