/** Company identity and anything that ends up in a <head> tag or a legal line. */

export const company = {
  name: "layer3studios",
  /** Used where the name starts a sentence. */
  nameCapitalised: "Layer3studios",
  tagline: "We read your code and tell you what's exposed.",
  email: "hello@layer3studios.com",
  /** TODO: replace before launch. */
  url: "https://layer3studios.com",
  foundedYear: 2025,
} as const;

export const seo = {
  title: `${company.name} — code review and security audits`,
  description:
    "We read your codebase and tell you exactly what's exposed: leaked API keys, open endpoints, and the structural mess that hides them. Free, in writing, no call required.",
} as const;

/**
 * Promises stated on the page. They are commitments, so they live in one place
 * and are never retyped into copy.
 */
export const promises = {
  /** Turnaround for the free review. */
  turnaroundDays: 3,
  /** How long we keep client code after sending the report. */
  retentionDays: 14,
  /** Reviews accepted per week. */
  weeklyCapacity: 4,
  /** Studio headcount. */
  teamSize: 3,
  /** Upper repo size accepted on the free tier. */
  freeRepoLimit: "250k lines",
} as const;

export const navSections = [
  { id: "review", label: "Free review" },
  { id: "proof", label: "Proof" },
  { id: "services", label: "Services" },
  { id: "safety", label: "Your code" },
  { id: "faq", label: "Questions" },
] as const;
