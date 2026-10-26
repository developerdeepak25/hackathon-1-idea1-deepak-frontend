"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { swapLocale } from "@/i18n/get-copy";
import type { Locale } from "@/i18n/types";

const options: Locale[] = ["en", "es"];

export function LanguageSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <div className="relative flex h-9 w-[4.5rem] items-center rounded-full bg-bark/10 p-1">
      <motion.span
        aria-hidden
        className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-pour"
        animate={{ x: locale === "es" ? "100%" : "0%" }}
        transition={
          reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }
        }
      />
      {options.map((option) => (
        <Link
          key={option}
          href={swapLocale(pathname, option)}
          hrefLang={option}
          className={`relative z-10 flex-1 text-center text-xs font-medium tracking-[0.08em] uppercase ${
            locale === option ? "text-bark" : "text-haze"
          }`}
        >
          {option}
        </Link>
      ))}
    </div>
  );
}
