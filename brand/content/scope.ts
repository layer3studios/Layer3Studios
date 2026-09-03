import { promises } from "../meta";

/**
 * What is in the free report.
 *
 * Three columns, in the order that keeps it honest: what a free review
 * always covers in full, what it covers on the surface, and what it never
 * does because that is the paid audit. The rule under it all is the time
 * box: one person, one sitting.
 */
export interface ScopeItem {
  title: string;
  body: string;
}

export interface ScopeColumn {
  id: "always" | "surface" | "never";
  label: string;
  heading: string;
  note: string;
  items: ScopeItem[];
}

export const scope = {
  eyebrow: "The free report",
  heading: "What's in it, and what isn't.",
  intro: `One person reads your repository for one sitting, about ${promises.freeReviewHours ?? "two to three"} hours, and writes down what they saw. This is the whole scope. There is no hidden tier.`,
  cta: "What's in the free report",
  timebox: {
    label: "The time box",
    value: "1 person · 1 sitting · 2 to 3 h",
    note: "Whatever fits in the box is the scope. Depth beyond it is the paid audit, and the report says so.",
  },
  columns: [
    {
      id: "always",
      label: "Always",
      heading: "Read in full, every time",
      note: "Cheap for us, and the highest-value findings there are.",
      items: [
        { title: "Leaked keys and secrets", body: "Every commit's diff, not just the current files. A key you deleted last year is still in history, and we check whether it still works." },
        { title: "Data left in the repo", body: ".env files, database dumps, credentials in config, private URLs." },
        { title: "Dependencies with published advisories", body: "The lockfile, against what is known to be broken." },
        { title: "Structure and naming", body: "How it is organised, where concerns leak into each other, and the file everything imports that nobody owns." },
        { title: "Duplication", body: "The same logic written four times in four places, and which of the four is wrong." },
      ],
    },
    {
      id: "surface",
      label: "On the surface",
      heading: "Flagged, with examples",
      note: "We show the pattern and one or two concrete cases. Finding every instance is the audit.",
      items: [
        { title: "Routes without authentication", body: "Every route file's first lines are read for an auth check. We name the ones that have none." },
        { title: "Parameters straight into queries", body: "SQL built from strings, unvalidated input reaching the database. Named where we saw it, not exhaustively." },
        { title: "Obvious injection shapes", body: "The code shape is enough to be sure. We do not send a payload to prove it." },
      ],
    },
    {
      id: "never",
      label: "Never",
      heading: "That is the paid audit",
      note: "It needs written authorisation, and it takes days, not hours.",
      items: [
        { title: "Active testing of any kind", body: "No injection attempts, no XSS payloads, no auth bypass, no scanning. Nothing touches a live system." },
        { title: "Full coverage", body: "Every endpoint, every query, every input. The free review finds the pattern; the audit finds every instance." },
        { title: "Fixes", body: "The report tells you what to do. Doing it is a separate, quoted piece of work in a branch you own." },
      ],
    },
  ] as ScopeColumn[],
  footer: "Plain-language summary first, three things to fix first, every finding with its evidence and a fix, and what we did not do. See the sample.",
} as const;
