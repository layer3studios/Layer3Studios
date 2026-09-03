import { promises } from "../meta";

/**
 * The booking sheet. Opens from every "book" button on the page.
 *
 * Three steps, each short enough to finish on a phone without scrolling:
 *   1. the repo   — where it is, what it is built with
 *   2. you        — name, email, company
 *   3. the worry  — what they are most afraid we will find, optional
 */
export const booking = {
  eyebrow: "Free review",
  heading: "Book your free code review",
  intro: `We read the repository and send a written report in ${promises.turnaroundDays} business days. No call, no pitch.`,
  steps: [
    { id: "repo", label: "The repo" },
    { id: "you", label: "You" },
    { id: "worry", label: "The worry" },
  ],
  fields: {
    repo: { label: "Repository link", placeholder: "github.com/you/project", hint: "GitHub, GitLab or Bitbucket. Private is fine — we'll ask for read access." },
    stack: { label: "Built with", placeholder: "Next.js, Postgres, Stripe…" },
    name: { label: "Your name", placeholder: "" },
    email: { label: "Where the report goes", placeholder: "you@company.com" },
    company: { label: "Company", placeholder: "Optional" },
    notes: { label: "Anything we should know?", placeholder: "Deadlines, what keeps you up at night, who maintains it." },
  },
  worries: [
    "Leaked keys",
    "Open endpoints",
    "Auth holes",
    "Old dependencies",
    "Injection",
    "Just tell me",
  ],
  interestLabel: "Also interested in",
  next: "Continue",
  back: "Back",
  submit: "Send it",
  submitting: "Sending…",
  success: {
    heading: "Booked.",
    body: `We'll open the repo, read it properly, and email the report within ${promises.turnaroundDays} business days. Nothing happens in between.`,
    close: "Close",
  },
  reassurance: [
    "Read-only access",
    `Deleted after ${promises.retentionDays} days`,
    "NDA on request",
  ],
} as const;
