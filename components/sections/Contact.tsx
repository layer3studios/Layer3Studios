"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";
import { contact, ease, promises, scale, scope } from "@/brand";
import { useBooking } from "@/components/booking/BookingContext";
import SectionHeading from "@/components/ui/SectionHeading";

/**
 * The ask.
 *
 * One enormous button. The form itself lives in the booking sheet, so this
 * section's only job is to make the ask impossible to miss: a full-width
 * paper slab that tilts toward the pointer, a magnetic button that leans
 * toward the cursor, and an orbit of the three promises circling it.
 */
export default function Contact() {
  const { openBooking, openHire, openScope } = useBooking();
  const slab = useRef<HTMLDivElement>(null);

  // Magnetic button: the button drifts toward the pointer within the slab.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const bx = useSpring(mx, { stiffness: 150, damping: 18 });
  const by = useSpring(my, { stiffness: 150, damping: 18 });

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const tiltX = useSpring(rx, { stiffness: 120, damping: 20 });
  const tiltY = useSpring(ry, { stiffness: 120, damping: 20 });

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width - 0.5;
    const fy = (e.clientY - r.top) / r.height - 0.5;
    mx.set(fx * 40);
    my.set(fy * 30);
    rx.set(fy * -6);
    ry.set(fx * 8);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
    rx.set(0);
    ry.set(0);
  };

  const orbit = [
    "Read-only",
    `${promises.turnaroundDays} business days`,
    `Deleted after ${promises.retentionDays}d`,
    "NDA on request",
    "No call",
    `${promises.weeklyCapacity} a week`,
  ];

  return (
    <section id="contact" className="overflow-hidden px-[var(--gutter)] py-28 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow={contact.eyebrow} heading={contact.heading} intro={contact.body} centred />

        <div className="mt-14" style={{ perspective: "1800px" }}>
          <motion.div
            ref={slab}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            initial={{ opacity: 0, y: 80, rotateX: 16 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: ease.settle }}
            style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}
            className="paper relative grid min-h-[26rem] place-items-center overflow-hidden rounded-[2rem] bg-vellum px-6 py-16 text-ink-900 sm:min-h-[30rem]"
          >
            {/* The orbit. Two rings of promises, counter-rotating. */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid scale-[0.55] place-items-center sm:scale-75 lg:scale-100">
              <Ring items={orbit.slice(0, 3)} radius={220} duration={40} />
              <Ring items={orbit.slice(3)} radius={300} duration={55} reverse />
            </div>

            <div className="relative z-10 flex flex-col items-center px-6 py-10 text-center" style={{ transform: "translateZ(60px)", background: "radial-gradient(closest-side, #ffffff 55%, rgba(255,255,255,0.92) 75%, rgba(255,255,255,0) 100%)" }}>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-900/55">
                Free · Written · {promises.turnaroundDays} business days
              </p>
              <motion.button
                type="button"
                onClick={() => openBooking()}
                style={{ x: bx, y: by }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="group mt-8 inline-flex items-center gap-5 rounded-full bg-ink-900 py-6 pl-10 pr-3 text-vellum shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
              >
                <span className="font-display text-[1.75rem] leading-none sm:text-[2.25rem]">{contact.submit}</span>
                <span className="grid size-12 place-items-center rounded-full bg-vellum text-xl text-ink-900 transition-transform duration-500 group-hover:rotate-45 sm:size-14">
                  ↗
                </span>
              </motion.button>
              <p className="mt-6 max-w-xs text-[0.875rem] leading-relaxed text-ink-900/60">
                Opens a three-step sheet. Takes about a minute.
              </p>
              <button
                type="button"
                onClick={() => openScope()}
                className="mt-5 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink-900/60 underline decoration-ink-900/30 underline-offset-[6px] transition-colors hover:text-ink-900 hover:decoration-ink-900"
              >
                {scope.cta}
              </button>
              <button
                type="button"
                onClick={() => openHire()}
                className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink-900/60 underline decoration-ink-900/30 underline-offset-[6px] transition-colors hover:text-ink-900 hover:decoration-ink-900"
              >
                Already know what you need? Hire us directly
              </button>
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center font-mono text-[0.75rem] text-faint"
          style={{ fontSize: scale.small }}
        >
          No call. No follow-up sequence. No retainers.
        </motion.p>
      </div>
    </section>
  );
}

function Ring({ items, radius, duration, reverse = false }: { items: string[]; radius: number; duration: number; reverse?: boolean }) {
  // Pure CSS orbit: each label travels the circle on its own keyframe with a
  // negative delay for its start angle. The label counter-rotates inside the
  // same keyframe, so it stays upright at every point of the orbit.
  return (
    <div className="absolute rounded-full border border-ink-900/10" style={{ width: radius * 2, height: radius * 2 }}>
      {items.map((it, i) => (
        <span
          key={it}
          className="orbit absolute left-1/2 top-1/2"
          style={{
            ["--r" as string]: `${radius}px`,
            animationDuration: `${duration}s`,
            animationDelay: `${-(i / items.length) * duration}s`,
            animationDirection: reverse ? "reverse" : "normal",
          }}
        >
          <span className="block -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-ink-900/15 bg-vellum px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink-900/70 max-sm:opacity-50">
            {it}
          </span>
        </span>
      ))}
    </div>
  );
}
