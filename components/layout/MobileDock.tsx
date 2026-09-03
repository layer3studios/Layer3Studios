"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { company, ease, navSections, severity } from "@/brand";
import { useBooking } from "@/components/booking/BookingContext";

/**
 * The mobile nav: a dock, not an island.
 *
 * On a phone the top of the screen belongs to the hardware (the real Dynamic
 * Island, the status bar, Safari's own chrome), and the thumb lives at the
 * bottom. So below the tablet breakpoint the floating island is replaced by
 * a dock that sits just above the home indicator, paying back the bottom
 * safe-area inset:
 *
 *   [ wordmark ]  [ current section ▴ ]  [ Book ]
 *
 * A hairline across its top fills with scroll progress. Tapping the section
 * opens a sheet that slides up from the dock with the section list, the two
 * ways to reach us, and the email. It closes on a tap outside, on Escape, or
 * on choosing a section.
 */
export default function MobileDock() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState<string>(navSections[0].id);
  const { openBooking, openHire } = useBooking();
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    navSections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (!el) return;
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) setActive(s.id);
        },
        { rootMargin: "-40% 0px -50% 0px" },
      );
      io.observe(el);
      observers.push(io);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  /**
   * The dock gets out of the way while the page is moving and comes back the
   * moment it stops. It never hides at the very top or bottom of the page, and
   * never while the sheet is open. Plain scroll events, so it behaves the same
   * in Safari, Chrome, and inside a home-screen app.
   */
  useEffect(() => {
    let timer: number | null = null;
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const atEdge = y < 24 || y > max - 24;
      if (!open && !atEdge && Math.abs(y - lastY) > 2) setHidden(true);
      lastY = y;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => setHidden(false), 420);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timer) window.clearTimeout(timer);
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const label = navSections.find((s) => s.id === active)?.label ?? "Top";

  const goTo = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className="sm:hidden">
      {/* Scrim + sheet. */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="dock-scrim"
            className="fixed inset-0 z-[55]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-ink-900/70 backdrop-blur-sm" />
            <motion.nav
              aria-label="Sections"
              className="absolute inset-x-[var(--gutter)] rounded-3xl border border-ink-500 bg-ink-800 p-2 shadow-[0_30px_80px_rgba(0,0,0,0.7)]"
              style={{ bottom: "calc(4.75rem + var(--safe-bottom))" }}
              initial={reduce ? { opacity: 0 } : { y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { y: 16, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            >
              <ol>
                {navSections.map((s, i) => {
                  const on = s.id === active;
                  return (
                    <motion.li
                      key={s.id}
                      initial={reduce ? false : { opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 + i * 0.04, duration: 0.3, ease: ease.enter }}
                    >
                      <button
                        type="button"
                        onClick={() => goTo(s.id)}
                        className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-[1.0625rem] ${
                          on ? "bg-ink-600 text-vellum" : "text-muted"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="font-mono text-[0.65rem] text-faint">{String(i + 1).padStart(2, "0")}</span>
                          {s.label}
                        </span>
                        <span className="font-mono text-[0.65rem] tracking-[0.16em] text-faint">{on ? "HERE" : "→"}</span>
                      </button>
                    </motion.li>
                  );
                })}
              </ol>
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-ink-500 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    openBooking();
                  }}
                  className="rounded-2xl bg-vellum px-4 py-3.5 text-[0.9375rem] font-medium text-ink-900"
                >
                  Free review
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    openHire();
                  }}
                  className="rounded-2xl border border-ink-500 px-4 py-3.5 text-[0.9375rem] text-vellum"
                >
                  Hire us
                </button>
              </div>
              <a
                href={`mailto:${company.email}`}
                className="mt-2 block px-4 pb-2 pt-1 text-center font-mono text-[0.7rem] text-faint"
              >
                {company.email}
              </a>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The dock. */}
      <motion.div
        className="pointer-events-none fixed inset-x-[var(--gutter)] z-[60]"
        style={{ bottom: "calc(0.75rem + var(--safe-bottom))" }}
        animate={{ y: hidden ? 140 : 0, opacity: hidden ? 0.5 : 1 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
      >
        <div className="pointer-events-auto relative flex h-14 items-center gap-2 overflow-hidden rounded-full border border-ink-500/80 bg-ink-800/95 pl-4 pr-1.5 shadow-[0_18px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px origin-left"
            style={{ scaleX: progress, background: severity.low, opacity: 0.8 }}
          />
          <span className="font-mono text-[0.75rem] tracking-tight text-vellum">{company.name}</span>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label="Open sections"
            className="flex min-w-0 flex-1 items-center justify-center gap-2 border-l border-ink-500 py-2 pl-3 text-[0.8125rem] text-muted"
          >
            <span className="truncate">{label}</span>
            <motion.span
              aria-hidden="true"
              className="text-[0.6rem]"
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.25, ease: ease.settle }}
            >
              ▲
            </motion.span>
          </button>

          <motion.button
            type="button"
            onClick={() => openBooking()}
            whileTap={{ scale: 0.95 }}
            className="h-11 shrink-0 rounded-full bg-vellum px-4 text-[0.875rem] font-medium text-ink-900"
          >
            Book
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
