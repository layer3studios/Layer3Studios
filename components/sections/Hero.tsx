"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { hero } from "@/brand";
import { useBooking } from "@/components/booking/BookingContext";

const ProofSheet = dynamic(() => import("@/components/hero/ProofSheet"), { ssr: true });

/**
 * The hero: the first sheet of a report.
 *
 * The rest of the site is black; this section is paper. It reads as a page
 * laid on the desk before the dark begins, and the hard edge where white meets
 * black at the bottom is the edge of that page. No gradient softens it.
 *
 * Three bands, top to bottom, all left-aligned to a single margin:
 *
 *   running head   — the mono strip a printed report carries on every page
 *   the spread     — the claim on the left, the sheet under review on the right
 *   the terms      — a rule, the two actions, and the three numbers we promise
 *
 * Nothing here is sticky, scrubbed, or rendered on a canvas. The only motion
 * is arrival: the headline rises line by line out of a clipped box, the sheet
 * fills in from the top, and the proof marks are drawn last, one at a time.
 * With reduced motion every element is simply present.
 */

const rise = {
  hidden: { y: "110%" },
  shown: (i: number) => ({
    y: "0%",
    transition: { duration: 0.9, delay: 0.1 + i * 0.09, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 0.61, 0.36, 1] as const },
});

export default function Hero() {
  const reduce = useReducedMotion();
  const { openBooking } = useBooking();
  const at = (d: number) => (reduce ? 0 : d);

  return (
    <section
      className="paper relative bg-vellum text-ink-900"
      style={{ paddingTop: "calc(var(--island-clear) + 1.5rem)" }}
    >
      <div className="mx-auto flex min-h-[100svh] w-full max-w-[96rem] flex-col px-[var(--gutter)] pb-10 sm:px-[max(var(--gutter),3rem)]">
        {/* Running head. */}
        <motion.header
          {...fade(at(0.05))}
          className="grid grid-cols-2 gap-3 border-b border-ink-900 pb-3 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-ink-900/60 sm:grid-cols-3 sm:text-[0.6875rem] sm:tracking-[0.16em]"
        >
          <span>{hero.runningHead.left}</span>
          <span className="hidden text-center sm:block">{hero.runningHead.centre}</span>
          <span className="whitespace-nowrap text-right">
            <span className="hidden sm:inline">{hero.runningHead.right}</span>
            <span className="sm:hidden">{hero.runningHead.rightShort}</span>
          </span>
        </motion.header>

        {/* The spread. */}
        <div className="grid flex-1 grid-cols-1 gap-y-14 pt-10 lg:grid-cols-12 lg:gap-x-10 lg:pt-12">
          <div className="lg:col-span-5">
            <h1
              className="font-display text-ink-900"
              style={{
                fontSize: "clamp(3rem, 1rem + 6.4vw, 6.75rem)",
                lineHeight: 0.92,
                letterSpacing: "-0.03em",
              }}
            >
              {hero.headline.map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.06em]">
                  <motion.span
                    className="block"
                    custom={i}
                    variants={rise}
                    initial={reduce ? false : "hidden"}
                    animate="shown"
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              {...fade(at(0.6))}
              className="mt-10 max-w-[34ch] text-[1.0625rem] leading-relaxed text-ink-900/70 sm:text-[1.125rem]"
            >
              {hero.standfirst}
            </motion.p>
          </div>

          <motion.div {...fade(at(0.8))} className="self-end lg:col-span-7 lg:pl-4 xl:pl-10">
            <ProofSheet />
          </motion.div>
        </div>

        {/* The terms. */}
        <motion.footer
          {...fade(at(1.1))}
          className="mt-14 flex flex-col gap-8 border-t border-ink-900 pt-6 sm:flex-row sm:items-end sm:justify-between lg:mt-20"
        >
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <motion.button
              type="button"
              onClick={() => openBooking()}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-4 rounded-full bg-ink-900 py-4 pl-7 pr-2 font-medium text-vellum"
            >
              <span>{hero.cta.primary}</span>
              <span
                aria-hidden="true"
                className="grid size-9 place-items-center rounded-full bg-vellum text-ink-900 transition-transform duration-300 group-hover:rotate-45"
              >
                ↗
              </span>
            </motion.button>
            <a
              href="#proof"
              className="font-mono text-[0.8125rem] uppercase tracking-[0.14em] text-ink-900/70 underline decoration-ink-900/30 underline-offset-[6px] transition-colors hover:text-ink-900 hover:decoration-ink-900"
            >
              {hero.cta.secondary}
            </a>
          </div>

          <dl className="grid grid-cols-3 gap-x-8 sm:gap-x-12">
            {hero.terms.map((t) => (
              <div key={t.label} className="border-l border-ink-900/20 pl-4">
                <dd className="font-display text-[1.75rem] leading-none text-ink-900 sm:text-[2rem]">
                  {t.value}
                </dd>
                <dt className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink-900/55">
                  {t.label}
                </dt>
              </div>
            ))}
          </dl>
        </motion.footer>
      </div>
    </section>
  );
}
