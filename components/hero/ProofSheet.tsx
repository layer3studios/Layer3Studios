"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { proofSheet, severityWeight, type ProofMark } from "@/brand";

/**
 * The sheet under review.
 *
 * A source file, set in mono on paper, with three findings marked the way an
 * editor marks a proof: a ring, an underline, a strike. Each mark is a stroke
 * drawn in over time, so it appears the way a pen would draw it. Each note
 * sits in the margin, in reading order; below lg the margin folds under the
 * sheet as a list.
 *
 * Hovering or focusing a marked line inverts it and brings its note forward,
 * and vice versa, so the pairing reads without colour.
 */

/** The sheet starts once the headline has landed. */
const T0 = 0.85;
const LINE_STEP = 0.05;

const paths: Record<ProofMark, string> = {
  circle:
    "M -1 6.5 C 4 -0.5, 62 -1.5, 90 1 C 102 2.5, 102 9.5, 90 10.8 C 70 12.8, 20 12.8, 5 10.5 C -3 9, -2.5 3, 6 1.2",
  underline: "M 1 10.8 C 20 10.2, 45 11.4, 70 10.6 C 85 10.1, 92 11, 99 10.5",
  strike: "M 1 6.4 C 20 5.9, 45 6.8, 70 6.1 C 85 5.8, 92 6.6, 99 6.2",
};

function Mark({ kind, delay }: { kind: ProofMark; delay: number }) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute -inset-x-[0.35em] -inset-y-[0.3em] h-[calc(100%+0.6em)] w-[calc(100%+0.7em)] overflow-visible"
      viewBox="0 0 100 12"
      preserveAspectRatio="none"
    >
      <motion.path
        d={paths[kind]}
        fill="none"
        stroke="currentColor"
        strokeWidth={kind === "circle" ? 1.5 : 1.9}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 0.7, delay, ease: [0.76, 0, 0.24, 1] },
          opacity: { duration: 0.01, delay },
        }}
      />
    </svg>
  );
}

/** Severity meter, inverted for paper. */
function Meter({ level }: { level: "critical" | "high" }) {
  const filled = severityWeight[level];
  return (
    <span className="flex items-center gap-[3px]" role="img" aria-label={`Severity: ${level}`}>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`block size-[6px] ${i < filled ? "bg-ink-900" : "border border-ink-900/40"}`}
        />
      ))}
    </span>
  );
}

export default function ProofSheet() {
  const reduce = useReducedMotion();
  const [hot, setHot] = useState<number | null>(null);

  const marked = proofSheet.lines
    .map((l, i) => ({ ...l, i }))
    .filter((l) => l.mark !== undefined);

  const markDelay = (rank: number) =>
    reduce ? 0 : T0 + proofSheet.lines.length * LINE_STEP + 0.15 + rank * 0.5;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_12.5rem] lg:gap-x-6">
      {/* The file. */}
      <figure className="min-w-0">
        <figcaption className="flex items-baseline justify-between border-b border-ink-900/15 pb-3 font-mono text-[0.75rem] text-ink-900/60">
          <span className="truncate">{proofSheet.file}</span>
          <span className="ml-4 shrink-0 tabular-nums">
            {marked.length} findings · {proofSheet.lines.length} lines
          </span>
        </figcaption>

        <ol className="mt-4 font-mono text-[0.75rem] leading-[1.95] text-ink-900 sm:text-[0.8125rem]">
          {proofSheet.lines.map((line, i) => {
            const rank = marked.findIndex((m) => m.i === i);
            const on = hot === i;
            return (
              <motion.li
                key={i}
                className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-baseline"
                initial={reduce ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.4,
                  delay: reduce ? 0 : T0 + i * LINE_STEP,
                  ease: [0.22, 0.61, 0.36, 1],
                }}
              >
                <span className="select-none pr-3 text-right text-[0.7rem] tabular-nums text-ink-900/35">
                  {i + 1}
                </span>
                {line.mark ? (
                  <button
                    type="button"
                    className={`-mx-1 w-fit max-w-full cursor-default whitespace-pre max-sm:whitespace-pre-wrap max-sm:break-all rounded-[3px] px-1 text-left transition-colors duration-200 ${
                      on ? "bg-ink-900 text-vellum" : ""
                    }`}
                    onMouseEnter={() => setHot(i)}
                    onMouseLeave={() => setHot(null)}
                    onFocus={() => setHot(i)}
                    onBlur={() => setHot(null)}
                    aria-describedby={`proof-note-${i}`}
                  >
                    <span className="relative inline-block">
                      {line.code}
                      <Mark kind={line.mark} delay={markDelay(rank)} />
                    </span>
                  </button>
                ) : (
                  <span className="whitespace-pre text-ink-900/75 max-sm:whitespace-pre-wrap max-sm:break-all">{line.code || " "}</span>
                )}
              </motion.li>
            );
          })}
        </ol>
      </figure>

      {/* The margin. */}
      <aside className="mt-8 border-t border-ink-900/15 pt-5 lg:mt-0 lg:border-t-0 lg:pt-0">
        <p className="label text-ink-900/50 lg:pt-[3.15rem]">Margin</p>
        <ol className="mt-4 space-y-5">
          {marked.map((m, rank) => {
            const on = hot === m.i;
            return (
              <motion.li
                key={m.i}
                id={`proof-note-${m.i}`}
                className={`grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 border-l pl-3 transition-colors duration-200 ${
                  on ? "border-ink-900" : "border-ink-900/15"
                }`}
                onMouseEnter={() => setHot(m.i)}
                onMouseLeave={() => setHot(null)}
                initial={reduce ? false : { opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.5,
                  delay: reduce ? 0 : markDelay(rank) + 0.35,
                  ease: [0.22, 0.61, 0.36, 1],
                }}
              >
                <span className="pt-[2px] font-mono text-[0.7rem] tabular-nums text-ink-900/45">
                  L{m.i + 1}
                </span>
                <div>
                  <p
                    className={`text-[0.9rem] leading-snug transition-colors duration-200 ${
                      on ? "text-ink-900" : "text-ink-900/70"
                    }`}
                  >
                    {m.note}
                  </p>
                  <div className="mt-2 flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink-900/55">
                    <Meter level={m.severity!} />
                    {m.severity}
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </aside>
    </div>
  );
}
