/**
 * Type roles.
 *
 * Three faces, three jobs, no overlap:
 *   display — Instrument Serif. The report. Used with restraint, large only.
 *   body    — Inter Tight. Everything a person reads in prose.
 *   mono    — JetBrains Mono. Anything that came from a machine: paths, hashes,
 *             severities, counts, labels. Never used for prose.
 *
 * The faces are loaded in app/layout.tsx and exposed as CSS variables.
 */

export const fontVar = {
  display: "var(--font-display)",
  body: "var(--font-body)",
  mono: "var(--font-mono)",
} as const;

/** Fluid display scale. clamp(min, preferred, max). */
export const scale = {
  section: "clamp(2rem, 1.1rem + 3.6vw, 4rem)",
  card: "clamp(1.35rem, 1.1rem + 1.1vw, 2rem)",
  lead: "clamp(1.02rem, 0.96rem + 0.35vw, 1.25rem)",
  body: "1rem",
  small: "0.875rem",
  micro: "0.6875rem",
} as const;

/** Mono labels are always uppercase with wide tracking. */
export const label = {
  fontFamily: fontVar.mono,
  fontSize: scale.micro,
  letterSpacing: "0.16em",
  textTransform: "uppercase" as const,
};
