"use client";

import { motion, useReducedMotion } from "motion/react";

type MarkProps = {
  className?: string;
};

const leaf = {
  rest: { rotate: 0 },
  hover: { rotate: 14, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export function AppleMark({ className }: MarkProps) {
  const reduce = useReducedMotion();

  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 64 64"
      className={className}
      fill="none"
    >
      <motion.g className="apple-leaf" variants={reduce ? undefined : leaf}>
        <path d="M34 15c5-6 13-7 16-4-3 5-9 7-14 6" fill="#c4a35a" />
      </motion.g>
      <path
        d="M32 18c1-5 4-9 8-11"
        stroke="#5c3a24"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        fill="currentColor"
        d="M32 20c-7 0-14 6-16 15-2 10 2 20 10 24 3 2 6 1 8 0 2 1 5 2 8 0 8-4 12-14 10-24-2-9-9-15-16-15-1 2-3 3-4 0z"
      />
    </motion.svg>
  );
}

const hoops = [
  "M22 78c18 12 98 12 116 0",
  "M18 108c20 14 104 14 124 0",
  "M24 138c16 12 96 12 112 0",
];

export function BarrelSeal({ className }: MarkProps) {
  const reduce = useReducedMotion();
  const body =
    "M38 46c-8 2-16 22-18 48-2 28 6 62 16 70h88c10-8 18-42 16-70-2-26-10-46-18-48";

  return (
    <motion.div
      className="grid h-64 w-64 place-items-center rounded-full border border-cider/60 sm:h-72 sm:w-72"
      initial="rest"
      whileHover={reduce ? undefined : "lit"}
    >
      <div className="grid h-52 w-52 place-items-center rounded-full border border-cider/40 sm:h-60 sm:w-60">
        <svg
          aria-hidden="true"
          viewBox="0 0 160 200"
          className={className}
          fill="none"
        >
          <path fill="currentColor" d={`${body}H38z`} />
          <ellipse cx="80" cy="46" rx="42" ry="15" fill="#e7d3a2" />
          <ellipse cx="80" cy="46" rx="42" ry="15" stroke="#3b2416" strokeWidth="3" />
          <g clipPath="url(#iturrieta-barrel)">
            {hoops.map((d, index) => (
              <motion.path
                key={d}
                d={d}
                stroke="#3b2416"
                strokeWidth={index === 1 ? 7 : 6}
                strokeLinecap="round"
                initial={{ pathLength: reduce ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 0.9,
                  delay: 0.15 + index * 0.16,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            ))}
          </g>
          <motion.circle
            cx="80"
            cy="108"
            r="4.5"
            variants={{
              rest: { fill: "#3b2416" },
              lit: { fill: "#f6f1e7" },
            }}
          />
          <clipPath id="iturrieta-barrel">
            <path d={`${body}H38z`} />
          </clipPath>
        </svg>
      </div>
    </motion.div>
  );
}
