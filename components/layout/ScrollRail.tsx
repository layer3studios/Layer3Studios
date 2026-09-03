"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { navSections } from "@/brand";

interface Tick {
  id: string;
  label: string;
  /** 0→1 position down the document. */
  at: number;
}

/**
 * The scrollbar.
 *
 * The native one is hidden (globals.css) and replaced with this rail: a
 * hairline track down the right edge with a thumb that follows the page on a
 * spring, so it moves with weight rather than snapping. While you scroll the
 * thumb thickens and a readout beside it names the section you are in and
 * how far down the page you are; a moment after you stop, both settle back.
 *
 * Section ticks sit on the track at each section's real position. Clicking
 * the track jumps there. Hidden on coarse pointers, where the OS draws its
 * own overlay scrollbar and the readout would fight the thumb.
 */
export default function ScrollRail() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 28, mass: 0.6 });

  const [ticks, setTicks] = useState<Tick[]>([]);
  const [ratio, setRatio] = useState(0.1);
  const [active, setActive] = useState(false);
  const [section, setSection] = useState<string>("Top");
  const [pct, setPct] = useState(0);
  const idle = useRef<number | null>(null);

  // Section positions and the thumb's size come from real layout, measured
  // whenever the document changes height.
  useEffect(() => {
    const measure = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      setRatio(Math.max(0.04, window.innerHeight / doc.scrollHeight));
      setTicks(
        navSections
          .map((s): Tick | null => {
            const el = document.getElementById(s.id);
            if (!el) return null;
            const top = el.getBoundingClientRect().top + window.scrollY;
            return { id: s.id as string, label: s.label as string, at: Math.min(1, Math.max(0, top / total)) };
          })
          .filter((t): t is Tick => t !== null),
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setPct(Math.round(v * 100));
    const current = [...ticks].reverse().find((t) => v >= t.at - 0.02);
    setSection(current ? current.label : "Top");
    setActive(true);
    if (idle.current) window.clearTimeout(idle.current);
    idle.current = window.setTimeout(() => setActive(false), 900);
  });

  // Thumb travel: it must stay inside the track, so it moves (1 - ratio) of it.
  const top = useTransform(progress, [0, 1], ["0%", `${(1 - ratio) * 100}%`]);

  const jump = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const f = (e.clientY - r.top) / r.height;
    const doc = document.documentElement;
    window.scrollTo({ top: f * (doc.scrollHeight - window.innerHeight), behavior: "smooth" });
  };

  return (
    <div
      aria-hidden="true"
      className="scroll-rail pointer-events-none fixed right-0 top-0 z-[70] hidden h-full sm:block"
      style={{ width: "2.25rem" }}
    >
      {/* Track. */}
      <div
        onClick={jump}
        className="pointer-events-auto absolute right-[0.9rem] w-px cursor-pointer bg-ink-500"
        style={{ top: "var(--island-clear)", bottom: "calc(1.5rem + var(--safe-bottom))" }}
      >
        {/* Widen the hit area without widening the line. */}
        <span className="absolute inset-y-0 -left-2 -right-2" />

        {/* Section ticks. */}
        {ticks.map((t) => (
          <span
            key={t.id}
            className="absolute -left-[3px] h-px w-[7px] bg-faint"
            style={{ top: `${t.at * 100}%` }}
          />
        ))}

        {/* Thumb. */}
        <motion.div
          className="absolute -left-px w-[3px] origin-top rounded-full bg-vellum"
          style={{ top, height: `${ratio * 100}%` }}
          animate={{
            scaleX: active ? 2 : 1,
            boxShadow: active ? "0 0 14px 2px rgba(255,255,255,0.45)" : "0 0 0 0 rgba(255,255,255,0)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        />

        {/* Readout. Rides beside the thumb, appears while moving. */}
        <motion.div className="absolute right-4" style={{ top }}>
          <AnimatePresence>
            {active && (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 whitespace-nowrap rounded-sm bg-vellum px-2 py-1 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-900"
              >
                {section}
                <span className="tabular-nums text-ink-900/50">{pct}%</span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
