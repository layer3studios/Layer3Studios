import { company } from "../meta";

/**
 * The hire sheet. The second way to reach us: not the free review, but a
 * direct engagement. It is an email in the shape of a form, and the copy
 * says so. Pricing is never quoted here; it depends on the project.
 */
export const hire = {
  eyebrow: "Hire us",
  heading: "Tell us about the project",
  intro:
    "This goes straight to our inbox as an email. We reply with questions or a written quote, sized to the project — there is no rate card.",
  fields: {
    name: { label: "Your name", placeholder: "" },
    email: { label: "Your email", placeholder: "you@company.com" },
    company: { label: "Company", placeholder: "Optional" },
    brief: {
      label: "What do you need?",
      placeholder: "What it is, what state it's in, what's worrying you, and when you need it by.",
    },
  },
  serviceLabel: "What for",
  sizeLabel: "Roughly how big",
  sizes: [
    { id: "small", label: "Small", hint: "under 50k lines" },
    { id: "medium", label: "Medium", hint: "50k–250k lines" },
    { id: "large", label: "Large", hint: "250k+ or several repos" },
    { id: "unsure", label: "Not sure", hint: "we'll work it out" },
  ],
  timelineLabel: "When",
  timelines: ["This week", "This month", "This quarter", "No rush"],
  submit: "Send the email",
  submitting: "Sending…",
  or: "Or write to us directly at",
  email: company.email,
  success: {
    heading: "Sent.",
    body: "It's in our inbox. You'll hear back from whoever will do the work, usually within a business day, with questions or a quote.",
    close: "Close",
  },
  note: "Quotes are written per project. Nothing starts until you've agreed one in writing.",
} as const;
