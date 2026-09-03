"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { ease, scope, type ScopeColumn } from "@/brand";
import { useBooking } from "@/components/booking/BookingContext";

/**
 * What's in the free report: the depth we read to.
 *
 * The idea is depth, so the sheet is a gauge. On the left, the codebase as
 * a tall column in three bands: what we always read in full (solid ink),
 * what we read on the surface (half ink), and where the free review stops
 * (hatched, the paid audit). A reading line sweeps down the column and
 * halts at the boundary. Choosing a band lights it and rewinds the line.
 *
 * On the right, that band alone: a heading, a line of context, and its
 * items as tags. Pick a tag to read the one sentence behind it. No columns
 * of prose.
 */

const ORDER: ScopeColumn["id"][] = ["always", "surface", "never"];

/**
 * The three bands, as fractions of the column. The fills are inline rather
 * than classes: solid ink for read in full, a rule pattern for the surface
 * pass, hatching for where the free review stops.
 */
const BANDS: { id: ScopeColumn["id"]; h: number; style: React.CSSProperties }[] = [
  { id: "always", h: 0.42, style: { background: "#0a0a0a" } },
  {
    id: "surface",
    h: 0.28,
    style: {
      backgroundColor: "#e7e3da",
      backgroundImage: "repeating-linear-gradient(180deg, #0a0a0a 0 3px, transparent 3px 8px)",
    },
  },
  {
    id: "never",
    h: 0.3,
    style: {
      backgroundColor: "#ffffff",
      backgroundImage: "repeating-linear-gradient(135deg, rgba(10,10,10,0.5) 0 1.5px, transparent 1.5px 9px)",
    },
  },
];

function Gauge({ tier }: { tier: ScopeColumn["id"] }) {
  const reduce = useReducedMotion();
  // Where the reading line stops, as a fraction of the column.
  const stop = tier === "always" ? 0.42 : 0.7;
  const label = tier === "never" ? "stops here" : "reading";
  return (
    <div className="flex h-[19rem] w-full items-stretch gap-4 sm:h-[24rem]">
      {/* Labels, beside the column and lined up with the bands. */}
      <div className="relative flex w-[6.5rem] shrink-0 flex-col">
        {BANDS.map((b) => {
          const on = b.id === tier;
          const col = scope.columns.find((c) => c.id === b.id)!;
          return (
            <motion.div
              key={b.id}
              className="flex items-start gap-2 pt-2"
              style={{ height: `${b.h * 100}%` }}
              animate={{ opacity: on ? 1 : 0.4 }}
              transition={{ duration: 0.35 }}
            >
              <motion.span
                aria-hidden="true"
                className="mt-[0.45em] block h-px bg-ink-900"
                animate={{ width: on ? 16 : 8 }}
                transition={{ duration: 0.35, ease: ease.settle }}
              />
              <span className="font-mono text-[0.6rem] uppercase leading-tight tracking-[0.16em] text-ink-900">{col.label}</span>
            </motion.div>
          );
        })}
      </div>

      {/* The column. */}
      <div className="relative min-w-0 flex-1">
        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-ink-900">
          {BANDS.map((b) => (
            <motion.div
              key={b.id}
              className="border-b border-ink-900 last:border-b-0"
              style={{ height: `${b.h * 100}%`, ...b.style }}
              animate={{ opacity: b.id === tier ? 1 : 0.4 }}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>

        {/* The reading line. It travels from where it is to the new boundary,
            and only sweeps from the top on the first open. */}
        {!reduce && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[-0.6rem]"
            initial={{ top: "0%", opacity: 0 }}
            animate={{ top: `${stop * 100}%`, opacity: 1 }}
            transition={{
              top: { type: "spring", stiffness: 90, damping: 20, mass: 0.9 },
              opacity: { duration: 0.4, delay: 0.15 },
            }}
          >
            <div className="h-[2px] bg-ink-900 shadow-[0_0_14px_2px_rgba(0,0,0,0.35)]" />
            <span className="absolute -right-1 -top-3 overflow-hidden rounded-sm bg-ink-900 px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-vellum">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={label}
                  className="block"
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {label}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.div>
        )}

        {/* Depth marks. */}
        <div className="pointer-events-none absolute -right-7 inset-y-0 hidden flex-col justify-between py-1 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-ink-900/40 sm:flex">
          <span>0 h</span>
          <span>3 h</span>
        </div>
      </div>
    </div>
  );
}

export default function ScopeModal() {
  const { scopeOpen, closeScope, openBooking } = useBooking();
  const reduce = useReducedMotion();
  const [tier, setTier] = useState<ScopeColumn["id"]>("always");
  const [pick, setPick] = useState<number | null>(null);

  useEffect(() => {
    if (!scopeOpen) return;
    setTier("always");
    setPick(null);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeScope();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [scopeOpen, closeScope]);

  const col = scope.columns.find((c) => c.id === tier)!;
  const choose = (id: ScopeColumn["id"]) => {
    setTier(id);
    setPick(null);
  };

  return (
    <AnimatePresence>
      {scopeOpen && (
        <motion.div
          key="scope-scrim"
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button type="button" aria-label="Close" onClick={closeScope} className="absolute inset-0 bg-ink-900/80 backdrop-blur-sm" />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="scope-heading"
            className="paper relative z-10 flex max-h-[92svh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-vellum text-ink-900 shadow-[0_40px_120px_rgba(0,0,0,0.6)] sm:rounded-3xl"
            initial={reduce ? { opacity: 0 } : { y: 80, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 60, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 36, mass: 0.9 }}
          >
            {/* Header. */}
            <div className="flex items-start justify-between gap-6 border-b border-ink-900 px-6 pb-5 pt-6 sm:px-9">
              <div>
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-900/55">{scope.eyebrow}</p>
                <h2 id="scope-heading" className="font-display mt-2 text-[1.9rem] leading-none sm:text-[2.4rem]">
                  {scope.heading.split(" ").map((w, i) => (
                    <span key={i} className="mr-[0.24em] inline-block overflow-hidden pb-[0.06em] align-top last:mr-0">
                      <motion.span className="inline-block" initial={reduce ? false : { y: "110%" }} animate={{ y: "0%" }} transition={{ duration: 0.7, delay: 0.1 + i * 0.05, ease: ease.settle }}>
                        {w}
                      </motion.span>
                    </span>
                  ))}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeScope}
                aria-label="Close"
                className="group grid size-10 shrink-0 place-items-center rounded-full border border-ink-900/20 transition-colors hover:bg-ink-900 hover:text-vellum"
              >
                <span className="block text-lg leading-none transition-transform duration-300 group-hover:rotate-90">×</span>
              </button>
            </div>

            <div data-lenis-prevent className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto overflow-x-hidden overscroll-contain sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              {/* The gauge. */}
              <div className="flex flex-col border-b border-ink-900/15 px-6 py-8 sm:border-b-0 sm:border-r sm:px-9 sm:py-10">
                <p className="mb-6 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-900/50">How deep we read</p>
                <div className="w-full">
                  <Gauge tier={tier} />
                </div>
                <p className="mt-7 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-900/50">{scope.timebox.label}</p>
                <p className="font-display mt-1 text-[1.4rem] leading-none text-ink-900">{scope.timebox.value}</p>
              </div>

              {/* The band. */}
              <div className="flex flex-col px-6 py-8 sm:px-9 sm:py-10">
                {/* Tier control. */}
                <div className="flex flex-wrap gap-2">
                  {ORDER.map((id) => {
                    const c = scope.columns.find((x) => x.id === id)!;
                    const on = tier === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => choose(id)}
                        aria-pressed={on}
                        className={`relative rounded-full px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] transition-colors ${on ? "text-vellum" : "text-ink-900/60 hover:text-ink-900"}`}
                      >
                        {on && <motion.span layoutId="scope-tier" className="absolute inset-0 rounded-full bg-ink-900" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                        {!on && <span className="absolute inset-0 rounded-full border border-ink-900/20" />}
                        <span className="relative">{c.label}</span>
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={tier}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.35, ease: ease.settle }}
                    className="mt-8 flex flex-1 flex-col"
                  >
                    <h3 className="font-display text-[1.9rem] leading-none text-ink-900 sm:text-[2.3rem]">{col.heading}</h3>
                    <p className="mt-3 max-w-md text-[0.9rem] leading-relaxed text-ink-900/60">{col.note}</p>

                    {/* Tags. */}
                    <div className="mt-6 flex flex-wrap gap-2">
                      {col.items.map((it, i) => {
                        const on = pick === i;
                        return (
                          <motion.button
                            key={it.title}
                            type="button"
                            onClick={() => setPick(on ? null : i)}
                            aria-pressed={on}
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: 0.1 + i * 0.07, type: "spring", stiffness: 420, damping: 26 }}
                            whileTap={{ scale: 0.96 }}
                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[0.875rem] transition-colors ${
                              on ? "border-ink-900 bg-ink-900 text-vellum" : "border-ink-900/25 text-ink-900 hover:border-ink-900"
                            } ${tier === "never" && !on ? "line-through decoration-ink-900/40" : ""}`}
                          >
                            <span className={`block size-1.5 rounded-full ${on ? "bg-vellum" : tier === "always" ? "bg-ink-900" : tier === "surface" ? "border border-ink-900 bg-[linear-gradient(90deg,#000_50%,transparent_50%)]" : "border border-ink-900"}`} />
                            {it.title}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* The one sentence behind the picked tag. */}
                    <div className="mt-6 min-h-[4.5rem]">
                      <AnimatePresence mode="wait">
                        {pick !== null ? (
                          <motion.p
                            key={`${tier}-${pick}`}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.25 }}
                            className="border-l-2 border-ink-900 pl-4 text-[0.95rem] leading-relaxed text-ink-900/80"
                          >
                            {col.items[pick].body}
                          </motion.p>
                        ) : (
                          <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink-900/40">
                            Pick one to read what it means
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* The ask. */}
                <div className="mt-auto flex flex-wrap items-center gap-5 border-t border-ink-900/15 pt-6">
                  <motion.button
                    type="button"
                    onClick={() => {
                      closeScope();
                      openBooking();
                    }}
                    whileTap={{ scale: 0.97 }}
                    className="group inline-flex items-center gap-3 rounded-full bg-ink-900 py-3 pl-6 pr-2 font-medium text-vellum"
                  >
                    Book the free review
                    <span className="grid size-7 place-items-center rounded-full bg-vellum text-ink-900 transition-transform duration-300 group-hover:rotate-45">↗</span>
                  </motion.button>
                  <Link
                    href="/report"
                    onClick={closeScope}
                    className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink-900/70 underline decoration-ink-900/30 underline-offset-[6px] hover:text-ink-900 hover:decoration-ink-900"
                  >
                    Read the sample report
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
