export const services = {
  eyebrow: "After the report",
  heading: "Then it's your call",
  intro:
    "Most people take the report and fix things themselves. Some ask us to go further. Both are fine.",
  outro: "No retainers. No packages. Every quote is written for the project in front of us.",
  hireCta: "Hire us for this",
} as const;

export interface Service {
  id: string;
  title: string;
  /** How this is priced. There is no number: it depends on the project. */
  priceNote: string;
  body: string;
  /** Concrete inclusions. Mono-set on the card. */
  includes: string[];
  /** Shown only where a legal precondition genuinely exists. */
  precondition?: string;
}

export const serviceList: Service[] = [
  {
    id: "audit",
    title: "Deep security audit",
    priceNote: "Priced by scope",
    body: "We stop reading and start testing. You get a full report: every finding, how we found it, what it lets an attacker do, and how to fix it.",
    includes: [
      "Cross-site scripting",
      "Injection",
      "Authentication & session handling",
      "Access control",
      "Public infrastructure recon",
    ],
    precondition: "Scoped and authorised in writing before we begin.",
  },
  {
    id: "fixes",
    title: "We fix it",
    priceNote: "Priced by project size",
    body: "You have the findings and no time. We do the repairs, in a branch you review, with each fix explained so your team knows what changed and why.",
    includes: [
      "Work in a branch you own",
      "One commit per finding",
      "Written explanation per fix",
      "Re-test after merge",
    ],
  },
  {
    id: "build",
    title: "We build it",
    priceNote: "Priced by project size",
    body: "Your next project, built the way we'd want to audit it. Exactly what you asked for, with none of the problems we spend our days finding.",
    includes: [
      "Built to your spec",
      "Secrets handled properly from commit one",
      "Reviewed as we go",
      "Handover you can maintain",
    ],
  },
];
