"use client";

import { motion } from "framer-motion";
import { company, ease, footer, promises, scale } from "@/brand";
import { useBooking } from "@/components/booking/BookingContext";

/**
 * Footer.
 *
 * A marquee of the sign-off runs the full width, the signoff itself arrives
 * letter by letter, and the wordmark at the bottom is set enormous and
 * clipped by the page edge, the way a printed sheet ends.
 */
export default function Footer() {
  const year = new Date().getFullYear();
  const { openBooking } = useBooking();
  const letters = footer.signoff.split("");

  return (
    <footer
      className="relative overflow-hidden border-t border-ink-500 pt-20 max-sm:pb-[var(--dock-clear)]"
      style={{ paddingBottom: "calc(2rem + var(--safe-bottom))" }}
    >
      {/* Marquee. */}
      <div aria-hidden="true" className="marquee mb-16 border-y border-ink-500 py-3 font-mono text-[0.75rem] uppercase tracking-[0.2em] text-faint">
        <div className="marquee-track">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="px-8">
              {footer.signoff} · Free code review · Read-only · Written in {promises.turnaroundDays} days ·
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-[var(--gutter)]">
        <motion.p
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, amount: 0.6 }}
          className="font-display max-w-xl text-vellum"
          style={{ fontSize: scale.section }}
          aria-label={footer.signoff}
        >
          {letters.map((ch, i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              className="inline-block"
              variants={{
                hidden: { opacity: 0, y: 20, rotateX: -50 },
                shown: { opacity: 1, y: 0, rotateX: 0, transition: { delay: i * 0.025, duration: 0.5, ease: ease.settle } },
              }}
            >
              {ch === " " ? " " : ch}
            </motion.span>
          ))}
        </motion.p>

        <motion.button
          type="button"
          onClick={() => openBooking()}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.97 }}
          className="group mt-8 inline-flex items-center gap-3 rounded-full border border-ink-400 py-3 pl-6 pr-2 text-vellum transition-colors hover:bg-vellum hover:text-ink-900"
        >
          Book the free review
          <span className="grid size-8 place-items-center rounded-full bg-vellum text-ink-900 transition-transform duration-300 group-hover:rotate-45 group-hover:bg-ink-900 group-hover:text-vellum">
            ↗
          </span>
        </motion.button>

        <div className="mt-16 flex flex-col gap-10 border-t border-ink-500 pt-10 md:flex-row md:justify-between">
          <div>
            <p className="font-mono text-[0.9375rem] text-vellum">{company.name}</p>
            <a
              href={`mailto:${company.email}`}
              className="mt-2 block text-muted underline-offset-4 transition-colors hover:text-vellum hover:underline"
            >
              {company.email}
            </a>
          </div>

          <nav aria-label="Legal" className="flex flex-wrap gap-x-8 gap-y-3">
            {footer.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[0.9375rem] text-muted underline-offset-4 transition-colors hover:text-vellum hover:underline"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 font-mono text-[0.75rem] text-faint">
          <p>{footer.legalNote}</p>
          <p>
            © {company.foundedYear}–{year} {company.name}
          </p>
        </div>
      </div>

      {/* The wordmark, cut by the page edge. */}
      <motion.p
        aria-hidden="true"
        initial={{ y: "40%" }}
        whileInView={{ y: "12%" }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.2, ease: ease.settle }}
        className="pointer-events-none mt-10 select-none whitespace-nowrap text-center font-display leading-none text-ink-600"
        style={{ fontSize: "clamp(5rem, 18vw, 18rem)", marginBottom: "-0.28em" }}
      >
        {company.name}
      </motion.p>
    </footer>
  );
}
