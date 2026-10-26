"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";

const tones = {
  gold: "bg-cider text-ink",
  line: "border border-cider/70 text-cream",
  apple: "bg-apple text-cream",
};

type SealLinkProps = {
  href: string;
  children: ReactNode;
  tone: keyof typeof tones;
  className?: string;
};

export function SealLink({ href, children, tone, className = "" }: SealLinkProps) {
  const reduce = useReducedMotion();
  const face = `relative z-10 inline-flex items-center justify-center rounded-full px-6 py-3 text-center font-medium ${tones[tone]} ${className}`;

  const body = (
    <>
      {/* One outward ring on press, like a wax seal. The face only sinks. */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full border border-wood"
        variants={{
          rest: { opacity: 0, scale: 1 },
          press: {
            opacity: [0.8, 0],
            scale: [1, 1.22],
            transition: { duration: 0.45, ease: "easeOut" },
          },
        }}
      />
      {href.startsWith("#") ? (
        <a href={href} className={face}>
          {children}
        </a>
      ) : (
        <Link href={href} className={face}>
          {children}
        </Link>
      )}
    </>
  );

  return (
    <motion.div
      className={`relative inline-flex ${className.includes("w-full") ? "w-full" : ""}`}
      initial="rest"
      whileTap={reduce ? undefined : "press"}
      variants={{ rest: { y: 0 }, press: { y: 2 } }}
    >
      {body}
    </motion.div>
  );
}
