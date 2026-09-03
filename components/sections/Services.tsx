"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { ease, serviceList, services, type Service } from "@/brand";
import { useBooking } from "@/components/booking/BookingContext";
import type { ModelKind } from "@/components/three/ServiceModel";
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities";
import { useOnScreen } from "@/hooks/useOnScreen";

const ServiceModel = dynamic(() => import("@/components/three/ServiceModel"), { ssr: false });

const MODEL: Record<string, ModelKind> = { audit: "shield", fixes: "wrench", build: "stack" };

/**
 * After the report: the second sheet of paper.
 *
 * Built with the hero's grammar so it reads as the same document: a mono
 * running head on a hard rule, the heading set large and left, the intro
 * beside it, and the three services as three ruled columns on the page
 * rather than cards on top of it. Each column has its object drawn in ink,
 * a title in the display face, mono meta, the body, a ruled list of what is
 * included, and a mono link. A terms strip closes the sheet.
 *
 * Clicking a column hits its object (the cage bursts, the tool spins up, the
 * tower scatters) and sends an ink ring out from the click.
 */
export default function Services() {
  const words = services.heading.split(" ");
  return (
    <section id="services" className="paper overflow-x-clip bg-vellum text-ink-900">
      <div className="mx-auto w-full max-w-[96rem] px-[var(--gutter)] py-16 sm:px-[max(var(--gutter),3rem)] sm:py-20">
        {/* Running head. */}
        <motion.header
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 gap-3 border-b border-ink-900 pb-3 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-ink-900/60 sm:grid-cols-3 sm:text-[0.6875rem] sm:tracking-[0.16em]"
        >
          <span>{services.eyebrow}</span>
          <span className="hidden text-center sm:block">Sheet 2 of 2</span>
          <span className="whitespace-nowrap text-right">Priced per project</span>
        </motion.header>

        {/* The heading and the intro, side by side, like the hero's spread. */}
        <div className="grid grid-cols-1 gap-8 pt-12 lg:grid-cols-12 lg:items-end lg:gap-12 lg:pt-14">
          <motion.h2
            initial="hidden"
            whileInView="shown"
            viewport={{ once: true, amount: 0.6 }}
            className="font-display text-ink-900 lg:col-span-7"
            style={{ fontSize: "clamp(2.6rem, 1rem + 5vw, 5.5rem)", lineHeight: 0.94, letterSpacing: "-0.03em" }}
            aria-label={services.heading}
          >
            {words.map((w, i) => (
              <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.08em] align-top">
                <motion.span
                  className="inline-block"
                  variants={{
                    hidden: { y: "110%" },
                    shown: { y: "0%", transition: { duration: 0.9, delay: 0.05 + i * 0.07, ease: ease.settle } },
                  }}
                >
                  {w}
                </motion.span>
                {i < words.length - 1 ? " " : ""}
              </span>
            ))}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4, ease: ease.enter }}
            className="max-w-sm text-[1.0625rem] leading-relaxed text-ink-900/70 lg:col-span-5 lg:justify-self-end"
          >
            {services.intro}
          </motion.p>
        </div>

        {/* The three columns. */}
        <div className="mt-14 grid grid-cols-1 border-t border-ink-900 lg:grid-cols-3">
          {serviceList.map((service, i) => (
            <Column key={service.id} service={service} index={i} />
          ))}
        </div>

        {/* The terms strip. */}
        <motion.footer
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: ease.enter }}
          className="flex flex-col gap-4 border-t border-ink-900 pt-5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink-900/55 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>No retainers · No packages · Every quote written for the project</span>
          <span className="text-ink-900">Nothing starts until you've agreed one</span>
        </motion.footer>
      </div>
    </section>
  );
}

function Column({ service, index }: { service: Service; index: number }) {
  const { openHire } = useBooking();
  const { allowWebgl, ready } = useDeviceCapabilities();
  const reduce = useReducedMotion();
  const { ref, onScreen } = useOnScreen<HTMLDivElement>("120px");
  const pulse = useRef(0);
  const [rings, setRings] = useState<{ id: number; x: number; y: number }[]>([]);

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
      initial={reduce ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay: index * 0.12, ease: ease.settle }}
      onClick={hit}
      className="group relative flex cursor-pointer flex-col border-b border-ink-900/15 py-8 last:border-b-0 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
    >
      {/* Column head. */}
      <div className="flex items-baseline justify-between font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink-900/50">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span>{service.priceNote}</span>
      </div>

      {/* The object, in ink, on the page. */}
      <div className="relative mt-4 h-52 overflow-hidden">
        {ready && allowWebgl ? (
          <ServiceModel kind={MODEL[service.id]} pulse={pulse} active={onScreen} paper />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <span className="block size-24 rounded-full border border-ink-900/30" />
          </div>
        )}
        <span className="pointer-events-none absolute bottom-0 right-0 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-900/35 transition-colors group-hover:text-ink-900/70">
          click
        </span>
        {rings.map((k) => (
          <motion.span
            key={k.id}
            aria-hidden="true"
            className="pointer-events-none absolute size-4 rounded-full border border-ink-900"
            style={{ left: k.x - 8, top: k.y - 8 }}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 14, opacity: 0 }}
            transition={{ duration: 0.85, ease: ease.settle }}
          />
        ))}
      </div>

      <h3 className="font-display mt-6 text-ink-900" style={{ fontSize: "clamp(1.6rem, 1.1rem + 1.4vw, 2.3rem)", lineHeight: 1.02 }}>
        {service.title}
      </h3>
      <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-ink-900/70">{service.body}</p>

      <ul className="mt-6 border-t border-ink-900/15">
        {service.includes.map((item, i) => (
          <motion.li
            key={item}
            initial={reduce ? false : { opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 + i * 0.06, duration: 0.45, ease: ease.enter }}
            className="flex items-baseline gap-3 border-b border-ink-900/15 py-2.5 font-mono text-[0.75rem] text-ink-900/75"
          >
            <span className="text-ink-900/35">{String(i + 1).padStart(2, "0")}</span>
            {item}
          </motion.li>
        ))}
      </ul>

      {service.precondition && (
        <p className="mt-4 font-mono text-[0.65rem] leading-relaxed text-ink-900/50">{service.precondition}</p>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          openHire(service.id);
        }}
        data-cursor="grab"
        className="group/btn mt-auto inline-flex w-fit items-center gap-3 pt-7 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-ink-900"
      >
        <span className="relative">
          {services.hireCta}
          <span className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-100 bg-ink-900/30 transition-colors duration-300 group-hover/btn:bg-ink-900" />
        </span>
        <span className="transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
      </button>
    </motion.div>
  );
}
