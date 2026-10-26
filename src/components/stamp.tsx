"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type StampProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
};

// Shared seal press: the face sinks, and one ring flashes outward.
export function Stamp({ children, className = "", disabled = false }: StampProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={`relative inline-flex ${className}`}
      initial="rest"
      animate="rest"
      whileTap={reduce || disabled ? undefined : "press"}
      variants={{ rest: { y: 0 }, press: { y: 2 } }}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full border border-bark opacity-0"
        variants={{
          rest: { opacity: 0, scale: 1 },
          press: {
            opacity: [0.75, 0],
            scale: [1, 1.18],
            transition: { duration: 0.45, ease: "easeOut" },
          },
        }}
      />
      {children}
    </motion.div>
  );
}
