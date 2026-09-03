"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { ease, revealVariants, scale, serviceList, services, staggerParent, type Service } from "@/brand";
import { useBooking } from "@/components/booking/BookingContext";
import type { ModelKind } from "@/components/three/ServiceModel";
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities";
import { useOnScreen } from "@/hooks/useOnScreen";
import SectionHeading from "@/components/ui/SectionHeading";

const ServiceModel = dynamic(() => import("@/components/three/ServiceModel"), { ssr: false });

const MODEL: Record<string, ModelKind> = { audit: "shield", fixes: "wrench", build: "stack" };

/**
 * The ladder, as three objects on plinths.
 *
 * Each service is a tall card with a 3D model in its upper half. Clicking
 * anywhere on the card hits the model (the cage bursts, the tool spins up,
 * the tower scatters) and sends a ring out from the click point. The card
 * also lifts toward the pointer in 3D on hover. The "ask about this" button
 * opens the booking sheet with the service pre-filled.
 *
 * Deliberately not numbered: these are options after the free report, not a
 * pipeline.
 */
export default function Services() {
  return (
    <section id="services" className="overflow-hidden px-[var(--gutter)] py-28 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow={services.eyebrow} heading={services.heading} intro={services.intro} centred />

        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, amount: 0.1 }}
          className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3"
          style={{ perspective: "1400px" }}
        >
          {serviceList.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </motion.div>

        <motion.p
          variants={revealVariants}
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true }}
          className="mt-12 text-center font-mono text-[0.875rem] text-muted"
        >
          {services.outro}
        </motion.p>
      </div>
    </section>
  );
}

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const { openHire } = useBooking();
  const { allowWebgl, ready } = useDeviceCapabilities();
  const reduce = useReducedMotion();
  const { ref, onScreen } = useOnScreen<HTMLDivElement>("120px");
  const pulse = useRef(0);
  const [rings, setRings] = useState<{ id: number; x: number; y: number }[]>([]);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const hit = (e: React.MouseEvent<HTMLDivElement>) => {
    pulse.current = 1;
    const r = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRings((cur) => [...cur, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    window.setTimeout(() => setRings((cur) => cur.filter((k) => k.id !== id)), 900);
  };

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 70, rotateX: 18 },
        shown: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.9, delay: index * 0.12, ease: ease.settle } },
      }}
      onClick={hit}
      onPointerMove={(e) => {
        if (reduce || e.pointerType === "touch") return;
        const r = e.currentTarget.getBoundingClientRect();
        setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -8, y: ((e.clientX - r.left) / r.width - 0.5) * 10 });
      }}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      animate={{ rotateX: tilt.x, rotateY: tilt.y }}
      transition={{ type: "spring", stiffness: 200, damping: 24 }}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-ink-500 bg-ink-700 transition-colors duration-500 hover:border-ink-400"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* The plinth. */}
      <div className="relative h-64 border-b border-ink-500 bg-[radial-gradient(60%_60%_at_50%_60%,rgba(255,255,255,0.07),transparent_70%)]">
        {ready && allowWebgl ? (
          <ServiceModel kind={MODEL[service.id]} pulse={pulse} active={onScreen} />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <span className="block size-24 rounded-full border border-ink-400" />
          </div>
        )}
        <span className="pointer-events-none absolute left-5 top-5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-faint">
          {service.priceNote}
        </span>
        <span className="pointer-events-none absolute right-5 top-5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-faint">
          click
        </span>

        {/* Click rings. */}
        {rings.map((k) => (
          <motion.span
            key={k.id}
            aria-hidden="true"
            className="pointer-events-none absolute size-4 rounded-full border border-vellum"
            style={{ left: k.x - 8, top: k.y - 8 }}
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ scale: 18, opacity: 0 }}
            transition={{ duration: 0.85, ease: ease.settle }}
          />
        ))}
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7" style={{ transform: "translateZ(30px)" }}>
        <h3 className="font-display text-vellum" style={{ fontSize: scale.card }}>
          {service.title}
        </h3>
        <p className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-faint">{service.priceNote}</p>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">{service.body}</p>

        <ul className="mt-6 space-y-2">
          {service.includes.map((item, i) => (
            <motion.li
              key={item}
              initial={reduce ? false : { opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.07, duration: 0.5, ease: ease.enter }}
              className="flex gap-3 font-mono text-[0.8125rem] text-muted"
            >
              <span aria-hidden="true" className="mt-[0.6em] block h-px w-3 shrink-0 bg-ink-400 transition-colors group-hover:bg-vellum" />
              {item}
            </motion.li>
          ))}
        </ul>

        {service.precondition && (
          <p className="mt-6 font-mono text-[0.7rem] leading-relaxed text-faint">{service.precondition}</p>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openHire(service.id);
          }}
          className="group/btn mt-auto inline-flex w-fit items-center gap-3 pt-7 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-vellum"
        >
          <span className="relative">
            {services.hireCta}
            <span className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-vellum transition-transform duration-300 group-hover/btn:scale-x-100" />
          </span>
          <span className="transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
        </button>
      </div>
    </motion.div>
  );
}
