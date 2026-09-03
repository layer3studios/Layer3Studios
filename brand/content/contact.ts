import { promises } from "../meta";

export const contact = {
  eyebrow: "Start here",
  heading: "Find out what's in there",
  body: `Send us a link to your repo. You'll get a written report in ${promises.turnaroundDays} business days. No call, no pitch, no obligation.`,
  submit: "Send me my report",
  submitting: "Sending…",
  /** Field labels written the way a person would say them out loud. */
  fields: {
    name: { label: "Your name", placeholder: "" },
    email: { label: "Where should we send the report?", placeholder: "you@company.com" },
    company: { label: "Company", placeholder: "Optional" },
    subject: { label: "Your repository link", placeholder: "github.com/you/project" },
    message: { label: "Anything we should know?", placeholder: "Stack, deadlines, what worries you most." },
  },
  success: {
    heading: "Got it.",
    body: `We'll read your code and email the report within ${promises.turnaroundDays} business days. Nothing else happens in between — no call, no follow-up sequence.`,
  },
  errors: {
    required: "Please fill all required fields.",
    email: "Please enter a valid email.",
    short: "Tell us a little more so we know what we're looking at.",
    failed: "That didn't send. Email us directly and we'll pick it up.",
  },
} as const;

export const footer = {
  /** Sits above the legal line. */
  signoff: "Send the repo. Find out.",
  legalNote: "Active testing only ever happens inside a signed, authorised scope.",
  links: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Responsible disclosure", href: "/disclosure" },
  ],
} as const;
