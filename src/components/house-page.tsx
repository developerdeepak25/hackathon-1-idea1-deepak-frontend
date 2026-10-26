"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Copy, Locale } from "@/i18n/types";
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
        <section id="house" className="px-4 pt-10 pb-4 sm:pt-14">
          <div className="mx-auto grid max-w-6xl items-end gap-10 lg:grid-cols-[1.35fr_auto] lg:justify-between lg:gap-16">
            <div className="pb-2">
              <p className="text-lg text-haze">{copy.hero.place}</p>
              <h1 className="mt-3 font-serif text-[4.25rem] leading-[0.86] tracking-[-0.03em] text-bark sm:text-[6.25rem]">
                Iturrieta
              </h1>
              {/* The pour: one line, drawn once, like cider leaving the kupela. */}
              <motion.span
                aria-hidden
                className="mt-6 block h-[2px] w-full max-w-xs origin-left bg-pour"
                initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.95, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              />
              <p className="mt-5 font-serif text-2xl text-bark">{copy.hero.established}</p>
              <p className="mt-4 max-w-xl text-lg leading-8 text-haze">{copy.hero.lede}</p>
              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
                <SealLink href={`/${locale}/book`} tone="apple">
                  {copy.hero.book}
                </SealLink>
                <SealLink href="#menu" tone="line">
                  {copy.hero.menu}
                </SealLink>
              </div>
            </div>
            <div className="aspect-[4/5] w-full max-w-[17.5rem] overflow-hidden sm:max-w-[20rem] lg:max-w-[22rem]">
              <img
                src="/barrels.jpg"
                alt="Kupela"
                width={682}
                height={1024}
                className="h-full w-full object-cover object-center"
              />
            </div>
          </div>
        </section>

        <section aria-label={copy.nav.house} className="mt-10 border-y border-bark/10">
          <dl className="mx-auto grid max-w-6xl sm:grid-cols-2 lg:grid-cols-4">
            {copy.facts.map((fact) => (
              <div
                key={fact.label}
                className="flex flex-col-reverse border-b border-bark/10 px-6 py-6 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:border-r lg:border-b-0 lg:px-7 lg:last:border-r-0"
              >
                <dt className="mt-1 text-haze">{fact.label}</dt>
                <dd className="font-serif text-[1.65rem] leading-tight text-bark">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="txotx" className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <Reveal>
            <h2 className="font-serif text-5xl leading-tight text-bark sm:text-6xl">{copy.txotx.title}</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-haze">{copy.txotx.lede}</p>
          </Reveal>
          <ol className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-12">
            {copy.txotx.steps.map((step, index) => (
              <li key={step.title} className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 lg:grid-cols-1">
                <span className="font-serif text-5xl leading-none text-pour">{index + 1}</span>
                <div>
                  <h3 className="font-serif text-2xl leading-tight text-bark lg:mt-4">{step.title}</h3>
                  <p className="mt-2 max-w-sm text-base leading-7 text-haze">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="menu" className="border-t border-bark/10">
          <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 py-16 sm:py-20 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <h2 className="font-serif text-5xl leading-tight text-bark">{copy.lunch.title}</h2>
              <p className="mt-5 max-w-md text-lg leading-8 text-haze">{copy.lunch.body}</p>
              <ul className="mt-8 max-w-md border-t border-bark/10">
                {copy.lunch.notes.map((note) => (
                  <li key={note.label} className="border-b border-bark/10 py-4">
                    <p className="font-serif text-xl text-bark">{note.label}</p>
                    <p className="mt-1 text-haze">{note.value}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="bg-foam px-6 sm:px-10">
                <span aria-hidden className="block h-0.5 bg-pour" />
                {copy.menuItems.map((item) => (
                  <motion.div
                    key={item.name}
                    className="border-b border-bark/10 py-7 last:border-b-0"
                    initial="rest"
                    whileHover={reduce ? undefined : "hover"}
                  >
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="font-serif text-3xl text-bark">{item.name}</p>
                        <p className="mt-1 text-haze">{item.note}</p>
                      </div>
                      <p className="font-serif text-4xl text-leaf">{item.price}</p>
                    </div>
                    <motion.span
                      aria-hidden
                      className="mt-4 block h-px origin-center bg-pour"
                      variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </motion.div>
                ))}
                <p className="pb-8 text-haze">{copy.lunch.included}</p>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="valley" className="mx-auto max-w-6xl px-4 pb-16 sm:pb-20">
          <Reveal>
            <div className="max-w-xl border-t border-bark/10 pt-10">
              <h2 className="font-serif text-5xl leading-tight text-bark">{copy.valley.title}</h2>
              <p className="mt-5 text-lg leading-8 text-haze">{copy.valley.body}</p>
              <p className="mt-6 font-serif text-2xl text-bark">{copy.valley.place}</p>
            </div>
          </Reveal>
        </section>

        <section id="gatherings" className="bg-leaf text-foam">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
            <h2 className="max-w-xl font-serif text-5xl leading-tight">{copy.gatherings.title}</h2>
            <div className="mt-8 max-w-xl border-t border-pour pt-6">
              <p className="font-serif text-3xl">{copy.gatherings.emptyTitle}</p>
              <p className="mt-4 max-w-lg text-lg leading-8 text-foam/80">{copy.gatherings.empty}</p>
            </div>
            <div className="mt-8">
              <SealLink href={`/${locale}/book`} tone="gold">
                {copy.nav.book}
              </SealLink>
            </div>
          </div>
        </section>
      </motion.div>
    </PublicShell>
  );
}
