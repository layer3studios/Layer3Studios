/**
 * Brand palette — monochrome.
 *
 * There is no hue anywhere on this site. Black, white, and the greys between.
 *
 * This is a constraint with teeth: severity can no longer be signalled with
 * colour, so it is signalled with *fill* instead — a four-mark meter that goes
 * from solid to hollow (see components/ui/SeverityMark). That reads correctly
 * for colourblind users and in print, which a red/amber/green scale never did.
 *
 * It also sharpens the signature: a redaction is a black bar on white or a
 * white bar on black. Nothing else. The whole page is the report.
 *
 */

export const ink = {
  /** Page base. True black. */
  900: "#000000",
  /** The void behind the grid. */
  800: "#050505",
  /** Card surface. */
  700: "#0A0A0A",
  /** Raised surface, card hover. */
  600: "#121212",
  /** Hairlines. */
  500: "#1F1F1F",
  /** Strong border, active hairline. */
  400: "#333333",
} as const;

export const paper = {
  /** Primary text. Pure white. */
  vellum: "#FFFFFF",
  /** Secondary text. */
  muted: "#9A9A9A",
  /** Tertiary text, captions, metadata. */
  faint: "#5C5C5C",
} as const;

/**
 * Severity.
 *
 * Every level is white. What changes is how much of the meter is filled and
 * how bright the mark is — weight carries the meaning, not hue.
 */
export const severity = {
  critical: "#FFFFFF",
  high: "#D4D4D4",
  medium: "#8A8A8A",
  low: "#5C5C5C",
  clean: "#5C5C5C",
} as const;

/** How many of the four marks are filled, per level. */
export const severityWeight = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  clean: 0,
} as const;

/** Interactive accent. White — the only "colour" the site has. */
export const accent = {
  base: "#FFFFFF",
  soft: "rgba(255, 255, 255, 0.08)",
} as const;

export type SeverityLevel = keyof typeof severity;

export const severityLabel: Record<SeverityLevel, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  clean: "Clean",
};
