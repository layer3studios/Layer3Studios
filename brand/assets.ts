/**
 * Every image, logo and file path used by the site.
 *
 * Nothing else in the codebase should contain a string starting with "/".
 * Swap a file here and it changes everywhere.
 */

export const logo = {
  /** Wordmark used in the nav island and footer. */
  mark: "/brand/mark.svg",
  /** Favicon / app icon source. */
  icon: "/brand/icon.svg",
} as const;

export const images = {
  /** Redacted screenshot of a real finding. Replace with the genuine article. */
  proofFinding: {
    src: "/brand/proof-finding.png",
    alt: "A redacted screenshot of a live API key found in a repository's git history",
    width: 1600,
    height: 900,
  },
  /** Open-graph share card. */
  ogCard: {
    src: "/brand/og.png",
    alt: "layer3studios",
    width: 1200,
    height: 630,
  },
} as const;

export const documents = {
  /** Public sample report, linked from the proof section. */
  sampleReport: "/brand/sample-report.pdf",
} as const;
