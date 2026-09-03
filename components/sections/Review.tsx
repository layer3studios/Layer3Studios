"use client";

import dynamic from "next/dynamic";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  commitTrail,
  dependencyMap,
  ease,
  endpointScan,
  review,
  reviewChecks,
  reviewStats,
  scale,
  scope,
  type ReviewCheck,
} from "@/brand";
import { useBooking } from "@/components/booking/BookingContext";
import type { CodebaseState } from "@/components/three/CodebaseModel";
import Redacted from "@/components/ui/Redacted";
import SectionHeading from "@/components/ui/SectionHeading";
import SeverityMark from "@/components/ui/SeverityMark";
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities";
import { useOnScreen } from "@/hooks/useOnScreen";
import { useStagePointer } from "@/hooks/useStagePointer";

const CodebaseModel = dynamic(() => import("@/components/three/CodebaseModel"), { ssr: false });

/**
 * What we check.
 *
 * One object and four chapters.
 *
 * The object is the codebase: forty file slabs in a neat stack, drawn in 3D
 * on a stage that stays put on the left while the chapters scroll past on
 * the right. Each chapter is one check. As it comes into view the object
 * rearranges itself into that check's shape: a file slides out with the key
 * inside it, the stack fans open to show the unguarded routes, it comes
 * apart into a mess with one giant file at the centre, it splits into four
 * copies with one that disagrees. Scrolling back reverses it.
 *
 * Beside the object, a rail of the four checks tracks which one is being
 * read and a mono line says what the object is showing. Under everything,
 * the three numbers we promise and the ask.
 */

const STATES: CodebaseState[] = ["secrets", "leaks", "structure", "duplicate"];

/** What the object is doing, per check. Read by the stage caption. */
const CAPTIONS: Record<CodebaseState, string> = {
  idle: "40 files. Looks fine from here.",
  secrets: "One file, pulled. A live key inside it.",
  leaks: "Fanned open. Two routes answer to anyone.",
  structure: "Came apart. One file is doing everything.",
  duplicate: "Four copies. The fourth disagrees.",
};

/** A line of evidence per check, drawn from the instrument content. */
const EVIDENCE: string[] = [
  commitTrail.caption,
  `${endpointScan.finding}. ${dependencyMap.finding}.`,
  "We map what imports what. A file everyone imports and nobody owns is where the next problem lands.",
  "Same name, four files, three implementations. The one that differs is the one in production.",
];

export default function Review() {
  const [active, setActive] = useState(-1);
  const { allowWebgl, ready } = useDeviceCapabilities();
  const { ref: stageRef, onScreen } = useOnScreen<HTMLDivElement>("200px");
  const { pointer, sectionBind, stageBind } = useStagePointer();
  const { openBooking, openScope } = useBooking();
  const reduce = useReducedMotion();

  const state: CodebaseState = active < 0 ? "idle" : STATES[active];

  return (
    <section
      id="review"
      className="overflow-x-clip px-[var(--gutter)] py-28 sm:py-36"
      {...sectionBind}
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow={review.eyebrow} heading={review.heading} intro={review.intro} centred />

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* The stage. Sticky; the object lives here. */}
          <div className="lg:col-span-6">
            <div
              ref={stageRef}
              data-cursor="grab"
              className="sticky z-10 cursor-grab touch-pan-y overflow-hidden rounded-3xl border border-ink-500 bg-ink-700 active:cursor-grabbing"
              style={{ top: "calc(var(--island-clear) + 0.5rem)" }}
              {...stageBind}
            >
              <div className="relative h-[46svh] min-h-[18rem] lg:h-[calc(100svh-var(--island-clear)-3rem)] lg:min-h-[30rem]">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-gradient(55%_50%_at_50%_55%,rgba(255,255,255,0.08),transparent_70%)]"
                />
                {ready && allowWebgl ? (
                  <CodebaseModel state={reduce ? "idle" : state} active={onScreen} pointer={pointer} />
                ) : (
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="space-y-1">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="h-1 w-40 rounded-sm bg-ink-500" />
                      ))}
                    </div>
                  </div>
                )}

                {/* The rail. Which check the object is showing. */}
                <ol className="absolute left-5 top-5 flex flex-col gap-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] sm:left-6 sm:top-6">
                  {reviewChecks.map((c, i) => {
                    const on = i === active;
                    return (
                      <li key={c.id} className="flex items-center gap-3">
                        <motion.span
                          aria-hidden="true"
                          className="block h-px bg-vellum"
                          animate={{ width: on ? 20 : 8, opacity: on ? 1 : 0.35 }}
                          transition={{ duration: 0.4, ease: ease.settle }}
                        />
                        <span className={on ? "text-vellum" : "text-faint"}>{c.code}</span>
                      </li>
                    );
                  })}
                </ol>

                {/* The caption. What the object is doing. */}
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-6 sm:left-6 sm:right-6">
                  <motion.p
                    key={state}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: ease.enter }}
                    className="font-mono text-[0.7rem] leading-relaxed text-muted"
                  >
                    {CAPTIONS[state]}
                  </motion.p>
                  <span className="hidden shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-faint sm:block">
                    {active < 0 ? "00" : String(active + 1).padStart(2, "0")} / 04
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* The chapters. */}
          <div className="lg:col-span-6">
            {reviewChecks.map((check, i) => (
              <Chapter key={check.id} check={check} index={i} evidence={EVIDENCE[i]} onEnter={() => setActive(i)} />
            ))}
          </div>
        </div>

        {/* The numbers. */}
        <motion.dl
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, amount: 0.5 }}
          className="mt-20 grid grid-cols-1 gap-4 border-t border-ink-500 pt-10 sm:grid-cols-3"
        >
          {reviewStats.map((s, i) => (
            <motion.div
              key={s.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                shown: { opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.6, ease: ease.settle } },
              }}
              className="border-l border-ink-500 pl-5"
            >
              <dd className="font-display text-vellum tabular-nums" style={{ fontSize: "clamp(2.5rem, 2rem + 2vw, 4rem)", lineHeight: 0.9 }}>
                {s.value}
                <span className="ml-2 font-mono text-[0.75rem] text-faint">{s.unit}</span>
              </dd>
              <dt className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-faint">{s.label}</dt>
            </motion.div>
          ))}
        </motion.dl>

        {/* The outro and the ask. */}
        <motion.div
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, amount: 0.6 }}
          className="mx-auto mt-20 flex max-w-2xl flex-col items-center text-center"
        >
          <p className="text-vellum" style={{ fontSize: scale.lead }} aria-label={review.outro}>
            {review.outro.split(" ").map((w, i) => (
              <motion.span
                key={i}
                aria-hidden="true"
                className="inline-block"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  shown: { opacity: 1, y: 0, transition: { delay: i * 0.03, duration: 0.5, ease: ease.enter } },
                }}
              >
                {w}&nbsp;
              </motion.span>
            ))}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <motion.button
              type="button"
              onClick={() => openBooking()}
              variants={{
                hidden: { opacity: 0, y: 16 },
                shown: { opacity: 1, y: 0, transition: { delay: 0.9, duration: 0.6, ease: ease.settle } },
              }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-4 rounded-full bg-vellum py-4 pl-7 pr-2 font-medium text-ink-900"
            >
              Book the free review
              <span className="grid size-9 place-items-center rounded-full bg-ink-900 text-vellum transition-transform duration-300 group-hover:rotate-45">↗</span>
            </motion.button>
            <motion.button
              type="button"
              onClick={() => openScope()}
              variants={{
                hidden: { opacity: 0, y: 16 },
                shown: { opacity: 1, y: 0, transition: { delay: 1.0, duration: 0.6, ease: ease.settle } },
              }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-4 rounded-full border border-ink-400 py-4 pl-7 pr-2 font-medium text-vellum transition-colors hover:border-vellum"
            >
              {scope.cta}
              <span className="grid size-9 place-items-center rounded-full border border-ink-400 text-vellum transition-all duration-300 group-hover:border-vellum group-hover:bg-vellum group-hover:text-ink-900">
                ?
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * One check. Tall enough that only one is ever in the middle of the screen,
 * which is what drives the object. Enters from the right, and its sample
 * line unredacts on hover or tap.
 */
function Chapter({
  check,
  index,
  evidence,
  onEnter,
}: {
  check: ReviewCheck;
  index: number;
  evidence: string;
  onEnter: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (inView) onEnter();
    // onEnter is stable per index; re-running on identity change is harmless.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: ease.settle }}
      className="flex min-h-[70svh] flex-col justify-center border-b border-ink-500 py-14 first:pt-0 last:border-b-0 lg:min-h-[85svh]"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="label">
          {check.code} / {String(index + 1).padStart(2, "0")}
        </span>
        <SeverityMark level={check.severity} />
      </div>

      <h3 className="font-display mt-6 text-vellum" style={{ fontSize: "clamp(2rem, 1.3rem + 2.4vw, 3.4rem)", lineHeight: 1 }}>
        {check.title}
      </h3>
      <p className="mt-5 max-w-lg text-[1rem] leading-relaxed text-muted sm:text-[1.0625rem]">{check.body}</p>

      {/* The sample. */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onPointerEnter={(e) => e.pointerType !== "touch" && setOpen(true)}
        onPointerLeave={(e) => e.pointerType !== "touch" && setOpen(false)}
        aria-expanded={open}
        className="mt-8 w-full rounded-2xl border border-ink-500 bg-ink-900 p-5 text-left transition-colors hover:border-ink-400"
      >
        <div className="mb-3 flex items-center justify-between gap-3 font-mono text-[0.6875rem] text-faint">
          <span className="truncate">{check.sample.path}</span>
          {check.sample.line > 0 && <span className="shrink-0">L{check.sample.line}</span>}
        </div>
        <div className="font-mono text-[0.75rem] leading-relaxed text-vellum sm:text-[0.8125rem]">
          <Redacted revealed={open}>
            <span className="break-all">{check.sample.hidden}</span>
          </Redacted>
        </div>
        <motion.div
          initial={false}
          animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: 0.45, ease: ease.settle }}
          className="overflow-hidden"
        >
          <p className="mt-3 border-l border-vellum pl-3 text-[0.8125rem] leading-relaxed text-vellum">{check.sample.verdict}</p>
        </motion.div>
        <p className="mt-3 font-mono text-[0.6875rem] text-faint">
          <span className="hover-only">Hover to reveal</span>
          <span className="touch-only">Tap to reveal</span>
        </p>
      </button>

      <p className="mt-6 flex gap-3 text-[0.875rem] leading-relaxed text-muted">
        <span aria-hidden="true" className="mt-[0.7em] block h-px w-4 shrink-0 bg-ink-400" />
        {evidence}
      </p>
    </motion.article>
  );
}
