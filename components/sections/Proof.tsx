"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { documents, proof, scale, severity, severityLabel } from "@/brand";
import SectionHeading from "@/components/ui/SectionHeading";
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities";
import { usePointerTilt } from "@/hooks/usePointerTilt";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Proof.
 *
 * The one place on the site where scroll drives the signature directly: the
 * redaction bar over the finding is scrubbed off by the scroll position, so
 * the reader uncovers it themselves at their own pace. Pinned, so the
 * uncovering happens in place.
 *
 * The report is a physical card. It tilts toward the pointer, its header and
 * metadata sit on separate depth layers so they parallax against the body,
 * and a specular sheen follows the cursor across the surface.
 */
export default function Proof() {
  const root = useRef<HTMLElement>(null);
  const { reducedMotion, ready } = useDeviceCapabilities();
  const colour = severity[proof.finding.severity];
  const { bind, rotateX, rotateY, px, py } = usePointerTilt(0.5);

  useGSAP(
    () => {
      if (!ready) return;
      if (reducedMotion) {
        gsap.set(".proof-bar", { scaleX: 0 });
        gsap.set(".proof-body", { opacity: 1, y: 0 });
        gsap.set(".proof-meta", { opacity: 1, y: 0 });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".proof-stage",
          start: "top 62%",
          end: "+=90%",
          scrub: 0.8,
          pin: ".proof-stage",
          pinSpacing: true,
          anticipatePin: 1,
        },
      });

      tl.from(".proof-card", { rotateX: 22, y: 80, scale: 0.94, duration: 0.6, ease: "none" })
        .to(".proof-bar", { scaleX: 0, transformOrigin: "right center", ease: "none", duration: 1 })
        .from(".proof-body", { opacity: 0, y: 18, filter: "blur(8px)", duration: 0.8 }, "-=0.35")
        .from(".proof-meta", { opacity: 0, y: 14, stagger: 0.12, duration: 0.6 }, "-=0.4")
        .from(".proof-stamp", { scale: 3, opacity: 0, rotate: -18, duration: 0.5, ease: "power4.out" }, "-=0.2");
    },
    { scope: root, dependencies: [reducedMotion, ready], revertOnUpdate: true },
  );

  return (
    <section id="proof" ref={root} className="px-[var(--gutter)] py-28 sm:py-36">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow={proof.eyebrow} heading={proof.heading} intro={proof.intro} centred />

        <div className="proof-stage mt-14" style={{ perspective: "1400px" }}>
          <motion.div
            {...bind}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="proof-card relative overflow-hidden rounded-2xl border border-ink-500 bg-ink-700"
          >
            {/* Sheen. */}
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-1/2 z-20"
              style={{
                background: "radial-gradient(circle at center, rgba(255,255,255,0.10), transparent 40%)",
                x: useTransformPercent(px),
                y: useTransformPercent(py),
              }}
            />

            <div
              className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-500 bg-ink-800 px-5 py-3.5"
              style={{ transform: "translateZ(30px)" }}
            >
              <span className="label">Finding {proof.finding.ref}</span>
              <span
                className="flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em]"
                style={{ color: colour }}
              >
                <span className="size-1.5 animate-pulse rounded-full" style={{ background: colour }} />
                {severityLabel[proof.finding.severity]}
              </span>
            </div>

            <div className="relative p-6 sm:p-10">
              <div className="relative inline-block max-w-full" style={{ transform: "translateZ(50px)" }}>
                <p className="proof-body font-display text-vellum" style={{ fontSize: scale.card }}>
                  {proof.finding.summary}
                </p>
                <span
                  aria-hidden="true"
                  className="proof-bar absolute inset-x-[-0.4rem] inset-y-[-0.2rem] origin-right bg-vellum"
                />
              </div>

              <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4" style={{ transform: "translateZ(20px)" }}>
                {proof.finding.metadata.map((m) => (
                  <div key={m.label} className="proof-meta">
                    <dt className="label mb-2">{m.label}</dt>
                    <dd
                      className="font-mono text-[0.9375rem]"
                      style={{ color: m.label === "Still valid" ? colour : undefined }}
                    >
                      {m.value}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* The stamp. Lands last, like a verdict. */}
              <span
                aria-hidden="true"
                className="proof-stamp pointer-events-none mt-8 inline-block rotate-[-8deg] rounded-md border-2 border-vellum px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-vellum sm:absolute sm:bottom-10 sm:right-10 sm:mt-0"
                style={{ transform: "translateZ(70px)" }}
              >
                Verified
              </span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <a
            href={documents.sampleReport}
            className="group inline-flex items-center gap-2 text-vellum underline-offset-4 hover:underline"
          >
            {proof.sampleReportLabel}
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/** 0→1 pointer fraction to a percentage offset for the sheen layer. */
function useTransformPercent(v: MotionValue<number>) {
  return useTransform(v, [0, 1], ["-25%", "25%"]);
}
