"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ease, scale } from "@/brand";

interface SectionHeadingProps {
  eyebrow: string;
  heading: string;
  intro?: string;
  /** Centres the block. Used where the section has no asymmetric content. */
  centred?: boolean;
}

/**
 * Section heading.
 *
 * The heading is split into words and each word rises out of its own clipped
 * box, tilted back in 3D and settling flat as it lands, so a heading arrives
 * the way a line of type is set rather than fading in. The eyebrow draws a
 * short rule first; the intro follows last.
 */
export default function SectionHeading({
  eyebrow,
  heading,
  intro,
  centred = false,
}: SectionHeadingProps) {
  const reduce = useReducedMotion();
  const words = heading.split(" ");

  return (
    <motion.div
      initial={reduce ? false : "hidden"}
      whileInView="shown"
      viewport={{ once: true, amount: 0.5 }}
      className={centred ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}
    >
      <motion.p
        variants={{
          hidden: { opacity: 0, y: 8 },
          shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.enter } },
        }}
        className={`label mb-5 flex items-center gap-3 ${centred ? "justify-center" : ""}`}
      >
        <motion.span
          aria-hidden="true"
          className="block h-px w-6 origin-left bg-faint"
          variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1, transition: { duration: 0.6, ease: ease.settle } } }}
        />
        {eyebrow}
      </motion.p>

      <h2
        className="font-display text-vellum"
        style={{ fontSize: scale.section, perspective: "600px" }}
        aria-label={heading}
      >
        {words.map((w, i) => (
          <span key={`${w}-${i}`} aria-hidden="true" className="inline-block overflow-hidden pb-[0.08em] align-top">
            <motion.span
              className="inline-block origin-bottom"
              variants={{
                hidden: { y: "110%", rotateX: -60, opacity: 0 },
                shown: {
                  y: "0%",
                  rotateX: 0,
                  opacity: 1,
                  transition: { duration: 0.8, delay: 0.1 + i * 0.06, ease: ease.settle },
                },
              }}
            >
              {w}
            </motion.span>
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </h2>

      {intro && (
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
            shown: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 0.7, delay: 0.25 + words.length * 0.06, ease: ease.enter },
            },
          }}
          className="mt-6 leading-relaxed text-muted"
          style={{ fontSize: scale.lead }}
        >
          {intro}
        </motion.p>
      )}
    </motion.div>
  );
}
