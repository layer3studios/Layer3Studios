/**
 * Motion tokens.
 *
 * One physical model for the whole site: things behave like a weighted card on
 * a surface. Nothing bounces for decoration; the only springy element is the
 * nav island, because a physical island should feel like an object.
 */

import type { Transition, Variants } from "framer-motion";

/** Custom cubic-beziers. Named for what they feel like, not for a curve number. */
export const ease = {
  /** Default. Fast out, long settle — reads as "confident". */
  settle: [0.16, 1, 0.3, 1] as const,
  /** Redaction wipes. Sharp start, hard stop, like a marker pulled across. */
  wipe: [0.76, 0, 0.24, 1] as const,
  /** Entry from rest. */
  enter: [0.22, 0.61, 0.36, 1] as const,
} as const;

export const duration = {
  instant: 0.14,
  quick: 0.28,
  base: 0.5,
  slow: 0.9,
  reveal: 1.2,
} as const;

/** Spring used only for the nav island, so it feels like a physical object. */
export const islandSpring: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.9,
};

/** Softer spring for pointer-driven 3D tilt. */
export const tiltSpring: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 26,
  mass: 0.6,
};

/** Standard scroll-reveal for a block of content. */
export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  shown: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: duration.slow, ease: ease.enter },
  },
};

/** Parent that staggers its children on reveal. */
export const staggerParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

/**
 * How far a card layer lifts off its surface in 3D, in px.
 * Raised well past the usual token scale — with a 780px perspective these
 * produce parallax you can see without hunting for it.
 */
export const depth = {
  base: 0,
  raised: 48,
  floating: 96,
  signature: 150,
} as const;

/**
 * Maximum pointer tilt, in degrees.
 *
 * Started at 9°, which was invisible in practice. 16° with the shorter
 * perspective is unmistakably three-dimensional while still stopping short of
 * the spinning-card gimmick.
 */
export const maxTilt = 16;
