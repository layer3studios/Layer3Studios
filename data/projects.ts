export type Project = {
  title: string;
  description: string;
  tags: string[];
  year: string;
  highlights?: string[];
  outcomes?: { label: string; value: string }[];
  href?: string; // live link
  source?: string; // optional github
};
  
  export const projects: Project[] = [
    {
      title: "Clawhost SaaS",
      description: "Subscription SaaS with dashboard UX, auth, billing, and runtime APIs — designed to scale from MVP to v1.",
      tags: ["Next.js", "Node", "MongoDB", "Stripe"],
      year: "2026",
      href: "https://example.com",
      highlights: [
        "Built end‑to‑end subscription flow (plans, checkout, webhooks)",
        "Secure auth + role-based dashboard routes",
        "Runtime API + admin tools for operators",
      ],
      outcomes: [
        { label: "Deliverable", value: "MVP → v1" },
        { label: "Focus", value: "Billing + UX" },
      ],
    },
    {
      title: "Bill Flow",
      description: "Finance workflow tool with strict access control, token refresh, and a cleaner UI for daily operations.",
      tags: ["React", "Express", "JWT", "UI Redesign"],
      year: "2026",
      highlights: [
        "Redesigned core screens for clarity and speed",
        "JWT access + refresh flow with safe storage patterns",
        "Reusable component patterns to keep new screens consistent",
      ],
      outcomes: [
        { label: "Deliverable", value: "Redesign + Build" },
        { label: "Focus", value: "Security" },
      ],
    },
    {
      title: "Studio Portfolio",
      description: "Premium studio site with case-study structure, sharp messaging, and SEO-first content hierarchy.",
      tags: ["Next.js", "Tailwind", "Content"],
      year: "2025",
      highlights: [
        "Story-first sections (services, process, proof, CTA)",
        "Reusable blocks to add new work quickly",
        "Metadata + structured content for discoverability",
      ],
      outcomes: [
        { label: "Deliverable", value: "Marketing site" },
        { label: "Focus", value: "SEO + Content" },
      ],
    },
  ];