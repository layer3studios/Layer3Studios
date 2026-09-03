export const proof = {
  eyebrow: "Proof",
  heading: "What this looks like in practice",
  intro:
    "One finding from a real review, published with permission and with the repository anonymised.",
  /** TODO: replace with a genuine finding before launch. */
  finding: {
    severity: "critical" as const,
    ref: "L3-0007",
    summary:
      "A live payment provider secret key, committed to a private repo eight months ago and removed in the following commit. It was still readable in the git history, and still valid.",
    metadata: [
      { label: "Found in", value: "git history" },
      { label: "Age", value: "8 months" },
      { label: "Still valid", value: "Yes" },
      { label: "Time to find", value: "11 minutes" },
    ],
  },
  sampleReportLabel: "See a full sample report",
  /** Shown while there is no published finding yet. */
  placeholderNote:
    "Replace this with a real anonymised finding. It is the single highest-value asset on the page.",
} as const;
