"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { company, islandSpring, navSections, severity } from "@/brand";

/**
 * The navigation, built as a Dynamic Island.
 *
 * It behaves like the physical thing it borrows from: one continuous object
 * that changes shape to match what it currently has to say, rather than a bar
 * that shows and hides children.
 *
 *   collapsed  — mark, the section you are currently in, and a live scan dot
 *   expanded   — the same object, grown, now holding the section list
 *
 * HOW THE MORPH WORKS — and why it is built this way.
 *
 * Both layers are always mounted. The active one is in normal flow, so it is
 * what the container measures; the inactive one is taken out of flow with
 * `absolute` so it contributes no size. A single `layout` spring on the
 * container therefore animates width, height and radius as one motion, while
 * the two layers cross-fade *concurrently* underneath it.
 *
 * The previous version used <AnimatePresence mode="wait">, which is the one
 * thing this component must not do: `mode="wait"` runs the outgoing exit to
 * completion (~180ms) *before* starting the incoming enter, while `layout`
 * resizes the box immediately. The result was a box that snapped to full size,
 * sat empty and black for ~180ms, then blurred its contents in — a cross-fade
 * with a stall in the middle, which is the opposite of a morph. Keeping both
 * layers mounted removes the sequencing entirely.
 *
 * The exit blur is gone with it. `filter: blur()` is expensive (especially in
 * Safari) and here it was masking that stall rather than bridging a genuine
 * crossfade.
 *
 * On a notched phone the island sits below the real Dynamic Island using the
 * safe-area inset (see --island-top in globals.css), so it never collides with
 * the hardware cutout it is named after. Note this only ever reports non-zero
 * when the site is installed to the home screen — in Safari the browser's own
 * toolbar already occupies that strip. macOS notches are not a case at all:
 * the viewport begins below the menu bar.
 */
export default function DynamicIsland() {
  const [expanded, setExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(navSections[0].id);
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  /** The morph itself. Reduced motion gets the shape change without the spring. */
  const morph = reduceMotion ? { duration: 0.15 } : islandSpring;
  /** Layer cross-fade. Runs *with* the morph, never before or after it. */
  const fade = { duration: reduceMotion ? 0.12 : 0.18, ease: [0.16, 1, 0.3, 1] as const };

  // Which section are we in? Drives the label inside the collapsed island.
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    navSections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (!el) return;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(section.id);
        },
        // Middle band of the viewport, so the label changes when a section
        // genuinely occupies the screen rather than when it first peeks in.
        { rootMargin: "-45% 0px -45% 0px" },
      );
      io.observe(el);
      observers.push(io);
    });

    return () => observers.forEach((io) => io.disconnect());
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /**
   * Escape closes, and a pointer press anywhere outside closes.
   *
   * The listeners are attached unconditionally and test `expanded` inside the
   * handler, rather than the effect bailing out with `if (!expanded) return`.
   * That earlier shape was dropped by Fast Refresh: after an HMR update React
   * would record the new dependency `[true]` but never run the effect body, so
   * no listener was ever attached and the island became impossible to dismiss
   * until a full reload. Attaching once, with an empty dependency array, has no
   * such failure mode — and costs one no-op function call per press.
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setExpanded(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  const activeLabel =
    navSections.find((s) => s.id === activeSection)?.label ?? company.name;

  const goTo = (id: string) => {
    setExpanded(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /**
   * A layer that is not the current shape is lifted out of flow so it stops
   * contributing height, made non-interactive, and hidden from assistive tech
   * and the tab order. `absolute left-0 top-0` rather than `inset-0` so the
   * hidden layer keeps its natural size instead of being stretched to the
   * container and distorting as it fades.
   */
  const layer = (active: boolean) =>
    active ? "relative" : "pointer-events-none absolute left-0 top-0";

  return (
    /**
     * The wrapper spans the full width purely to centre the island, so it must
     * not swallow pointer events: while expanded it is ~350px tall and would
     * otherwise lay an invisible strip across the headline, blocking clicks and
     * text selection on the content beneath. Events are re-enabled on the
     * island itself.
     */
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-x-0 z-50 hidden justify-center px-[var(--gutter)] sm:flex"
      style={{ top: "var(--island-top)" }}
    >
      <motion.div
        layout
        transition={morph}
        className="pointer-events-auto relative overflow-hidden rounded-[28px] border border-ink-500/80 bg-ink-800/92 shadow-[0_18px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl"
        style={{ willChange: "transform" }}
      >
        {/* Scan progress. The island carries a live readout of how far through
            the page you are, coloured like a clean finding. */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 z-10 h-px origin-left"
          style={{ scaleX: progress, background: severity.low, opacity: 0.7 }}
        />

        {/* ---------------------------------------------------------------
            Collapsed layer
            --------------------------------------------------------------- */}
        <motion.button
          type="button"
          onClick={() => setExpanded(true)}
          aria-label="Open navigation"
          aria-expanded={expanded}
          inert={expanded}
          animate={{ opacity: expanded ? 0 : 1 }}
          transition={fade}
          whileTap={expanded ? undefined : { scale: 0.97 }}
          className={`${layer(!expanded)} flex items-center gap-3 py-2.5 pl-4 pr-3`}
        >
          {/* Live scan dot. It breathes, so the island always looks awake —
              unless the reader has asked for less movement. */}
          <motion.span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full"
            style={{ background: severity.low }}
            animate={
              reduceMotion ? undefined : { opacity: [1, 0.35, 1], scale: [1, 0.86, 1] }
            }
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />

          <span className="font-mono text-[0.8125rem] tracking-tight text-vellum">
            {company.name}
          </span>

          {/* Once you have scrolled, the island reports where you are.
              The label is mounted and unmounted rather than animated to
              `width: 0`: animating its width fights the container's `layout`
              spring, which is already measuring this layer, and the two
              settled against each other leaving the text permanently clipped
              mid-word. Mounting changes the layer's natural width, the
              container springs to it, and the text only cross-fades. */}
          <AnimatePresence initial={false}>
            {scrolled && (
              <motion.span
                key="section-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={fade}
                className="whitespace-nowrap border-l border-ink-500 pl-3 text-[0.8125rem] text-muted"
              >
                {activeLabel}
              </motion.span>
            )}
          </AnimatePresence>

          <span
            aria-hidden="true"
            className="ml-1 flex flex-col gap-[3px] rounded-full bg-ink-600 px-2 py-2"
          >
            <span className="block h-px w-3 bg-muted" />
            <span className="block h-px w-3 bg-muted" />
          </span>
        </motion.button>

        {/* ---------------------------------------------------------------
            Expanded layer
            --------------------------------------------------------------- */}
        <motion.nav
          aria-label="Sections"
          inert={!expanded}
          animate={{ opacity: expanded ? 1 : 0 }}
          transition={fade}
          className={`${layer(expanded)} flex w-[min(88vw,30rem)] flex-col p-2`}
        >
          <div className="flex items-center justify-between px-3 pb-2 pt-1">
            <span className="label">{company.name}</span>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="label transition-colors hover:text-vellum"
            >
              Close
            </button>
          </div>

          {navSections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => goTo(section.id)}
              className="group flex items-center justify-between rounded-2xl px-3 py-3 text-left transition-colors hover:bg-ink-600"
            >
              <span
                className={
                  section.id === activeSection ? "text-vellum" : "text-muted"
                }
              >
                {section.label}
              </span>
              <span
                aria-hidden="true"
                className="font-mono text-[0.6875rem] tracking-[0.16em] text-faint transition-transform group-hover:translate-x-0.5"
              >
                {section.id === activeSection ? "HERE" : "→"}
              </span>
            </button>
          ))}
        </motion.nav>
      </motion.div>
    </div>
  );
}
