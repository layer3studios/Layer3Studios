"use client";

import dynamic from "next/dynamic";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { custody, ease, never, safety, scale, studio, type CustodyStation } from "@/brand";
import { useBooking } from "@/components/booking/BookingContext";
import SectionHeading from "@/components/ui/SectionHeading";
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities";
import { useOnScreen } from "@/hooks/useOnScreen";

const VaultModel = dynamic(() => import("@/components/three/VaultModel"), { ssr: false });

/**
 * How we handle your code.
 *
 * THE VAULT. A glass chamber on a sticky stage, right of the text. The five
 * stations of custody scroll past on the left, and as each one reaches the
 * middle of the screen the vault acts it out: your code flies in, a seal
 * closes around the chamber, a light circles it and a scan line reads the
 * slab, the report rises out of the top, and finally the slab bursts into
 * dust and the chamber is empty. Scroll back and it all reverses.
 *
 * THE FOUR NEVERS. Four plates, each one word struck through as it enters,
 * lifting in 3D under the pointer.
 *
 * WHO READS IT. Three people, and one line to ask for the NDA first.
 */

const STAGE_LABELS = ["waiting", "received", "sealed", "being read", "report sent", "deleted"];

export default function Safety() {
  const [active, setActive] = useState(-1);
  const { allowWebgl, ready } = useDeviceCapabilities();
  const { ref: stageRef, onScreen } = useOnScreen<HTMLDivElement>("200px");
  const pointer = useRef({ x: 0, y: 0 });
  const reduce = useReducedMotion();
  const { openHire } = useBooking();

  const state = active + 1; // 0 = empty chamber

  return (
    <section
      id="safety"
      className="overflow-x-clip px-[var(--gutter)] py-28 sm:py-36"
      onPointerMove={(e) => {
        if (e.pointerType === "touch") return;
        pointer.current = { x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 };
      }}
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow={safety.eyebrow} heading={safety.heading} intro={safety.intro} centred />

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* The stage. On the right, so this section reads the other way round from the review. */}
          <div className="lg:order-2 lg:col-span-6">
            <div
              ref={stageRef}
              className="sticky z-10 overflow-hidden rounded-3xl border border-ink-500 bg-ink-700"
              style={{ top: "calc(var(--island-clear) + 0.5rem)" }}
            >
              <div className="relative h-[46svh] min-h-[18rem] lg:h-[calc(100svh-var(--island-clear)-3rem)] lg:min-h-[30rem]">
                <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(55%_50%_at_50%_55%,rgba(255,255,255,0.07),transparent_70%)]" />
                {ready && allowWebgl ? (
                  <VaultModel state={reduce ? 1 : state} active={onScreen} pointer={pointer} />
                ) : (
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="size-40 rounded-md border border-ink-400" />
                  </div>
                )}

                {/* The rail. */}
                <ol className="absolute left-5 top-5 hidden flex-col gap-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] sm:left-6 sm:top-6 sm:flex">
                  {custody.map((s, i) => {
                    const on = i === active;
                    return (
                      <li key={s.title} className="flex items-center gap-3">
                        <motion.span
                          aria-hidden="true"
                          className="block h-px bg-vellum"
                          animate={{ width: on ? 20 : 8, opacity: on ? 1 : 0.35 }}
                          transition={{ duration: 0.4, ease: ease.settle }}
                        />
                        <span className={on ? "text-vellum" : "text-faint"}>{s.when}</span>
                      </li>
                    );
                  })}
                </ol>

                {/* The status stamp. */}
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-6 sm:left-6 sm:right-6">
                  <motion.span
                    key={state}
                    initial={{ opacity: 0, scale: 1.4, rotate: -4 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 24 }}
                    className={`rounded-sm border px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] ${
                      state === 5 ? "border-vellum bg-vellum text-ink-900" : "border-vellum text-vellum"
                    }`}
                  >
                    {STAGE_LABELS[state]}
                  </motion.span>
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-faint">
                    {active < 0 ? "00" : String(active + 1).padStart(2, "0")} / {String(custody.length).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* The stations. */}
          <div className="lg:order-1 lg:col-span-6">
            {custody.map((s, i) => (
              <Station key={s.title} station={s} index={i} onEnter={() => setActive(i)} />
            ))}
          </div>
        </div>

        {/* The four nevers. */}
        <div className="mt-24">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="label mb-6 text-center"
          >
            {never.label}
          </motion.p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" style={{ perspective: "1400px" }}>
            {never.lines.map((n, i) => (
              <NeverPlate key={n.short} index={i} short={n.short} body={n.body} />
            ))}
          </div>
        </div>

        {/* Who reads it. */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 8 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: ease.settle }}
          className="mt-16 grid grid-cols-1 gap-8 rounded-3xl border border-ink-500 bg-ink-700 p-7 sm:p-10 lg:grid-cols-12"
        >
          <div className="lg:col-span-4">
            <p className="label">{studio.eyebrow}</p>
            <div className="mt-6 flex items-end gap-3" aria-hidden="true">
              {[0, 1, 2].map((i) => {
                const h = [0, 56, 44][i] + 20;
                return (
                  <motion.span
                    key={i}
                    className="block w-8 origin-bottom rounded-t-full bg-vellum"
                    style={{ height: h }}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: [0, 1, 0.94, 1] }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.12, duration: 0.9, ease: ease.settle }}
                  >
                    {/* Breath: each mark rises and settles on its own beat, forever. */}
                    <motion.span
                      className="block h-full w-full rounded-t-full bg-vellum"
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2.6 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                    />
                  </motion.span>
                );
              })}
            </div>
          </div>
          <div className="lg:col-span-8">
            <motion.h3
              initial="hidden"
              whileInView="shown"
              viewport={{ once: true, amount: 0.6 }}
              className="font-display max-w-xl text-vellum"
              style={{ fontSize: scale.card }}
              aria-label={studio.heading}
            >
              {studio.heading.split(" ").map((w, i) => (
                <motion.span
                  key={i}
                  aria-hidden="true"
                  className="inline-block"
                  variants={{
                    hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
                    shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { delay: 0.15 + i * 0.05, duration: 0.5, ease: ease.enter } },
                  }}
                >
                  {w}&nbsp;
                </motion.span>
              ))}
            </motion.h3>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {studio.body.map((para, i) => (
                <motion.p
                  key={para}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.15, duration: 0.6, ease: ease.enter }}
                  className="text-[0.9375rem] leading-relaxed text-muted"
                >
                  {para}
                </motion.p>
              ))}
            </div>
            <button
              type="button"
              onClick={() => openHire()}
              className="group mt-8 inline-flex items-center gap-3 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-vellum"
            >
              <span className="relative">
                {studio.cta}
                <span className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-vellum transition-transform duration-300 group-hover:scale-x-100" />
              </span>
              {/* The arrow nudges on its own every few seconds, and follows the hover. */}
              <motion.span
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 2.4, ease: ease.settle }}
              >
                →
              </motion.span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/** One station. Tall enough that only one sits in the middle of the screen at a time. */
function Station({ station, index, onEnter }: { station: CustodyStation; index: number; onEnter: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (inView) onEnter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: ease.settle }}
      className={`flex min-h-[60svh] flex-col justify-center border-b border-ink-500 py-12 first:pt-0 last:border-b-0 lg:min-h-[75svh] ${
        inView ? "" : "lg:opacity-40"
      } transition-opacity duration-500`}
    >
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-faint">
        <span className="text-vellum">{station.when}</span>
        <span className="mx-2">·</span>
        {String(index + 1).padStart(2, "0")} / {String(custody.length).padStart(2, "0")}
      </p>
      <h3 className="font-display mt-5 text-vellum" style={{ fontSize: "clamp(2rem, 1.3rem + 2.4vw, 3.4rem)", lineHeight: 1 }}>
        {station.title}
      </h3>
      <p className="mt-5 max-w-md text-[1rem] leading-relaxed text-muted sm:text-[1.0625rem]">{station.body}</p>
      <p className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-ink-500 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted">
        <span className="block size-1.5 rounded-full bg-vellum" />
        {station.status}
      </p>
    </motion.article>
  );
}

function NeverPlate({ index, short, body }: { index: number; short: string; body: string }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [strikes, setStrikes] = useState(0);
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 16 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ delay: index * 0.1, duration: 0.8, ease: ease.settle }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType === "touch") return;
        const r = e.currentTarget.getBoundingClientRect();
        setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -10, y: ((e.clientX - r.left) / r.width - 0.5) * 12 });
      }}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      // Hovering re-strikes the word: the line wipes off and draws back on.
      onPointerEnter={(e) => e.pointerType !== "touch" && setStrikes((n) => n + 1)}
      className="group"
      style={{ transformStyle: "preserve-3d" }}
    >
      <motion.div
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="flex h-full flex-col rounded-2xl border border-ink-500 bg-ink-700 p-6 transition-colors duration-500 group-hover:border-ink-400"
        style={{ transformStyle: "preserve-3d" }}
      >
        <span className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-faint">
          <motion.span
            aria-hidden="true"
            className="block size-1.5 rounded-full bg-vellum"
            animate={{ opacity: [1, 0.15, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
          />
          never
        </span>
        <span className="relative mt-3 inline-block w-fit font-display text-vellum" style={{ fontSize: "1.9rem", lineHeight: 1, transform: "translateZ(24px)" }}>
          {short}
          <motion.span
            key={strikes}
            aria-hidden="true"
            className="absolute left-[-0.1em] right-[-0.1em] top-[52%] h-[3px] origin-left bg-vellum"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: strikes ? 0.05 : 0.5 + index * 0.1, duration: 0.35, ease: ease.wipe }}
          />
        </span>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.45 + index * 0.08, duration: 0.5, ease: ease.enter }}
          className="mt-4 text-[0.875rem] leading-relaxed text-muted"
        >
          {body}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
