import { promises } from "../meta";

export const faq = {
  eyebrow: "Questions",
  heading: "The things you're actually wondering",
} as const;

export interface FaqItem {
  q: string;
  a: string;
}

export const faqItems: FaqItem[] = [
  {
    q: "Why is this free?",
    a: "Because the fastest way to show you we're good at this is to be good at it, on your actual code, before you've paid anything. Some people hire us afterwards. Most don't, and that's the deal.",
  },
  {
    q: "What's the catch?",
    a: "You get a report. We don't call you. We email it, and if you want more you reply. That's the whole thing.",
  },
  {
    q: "Do I need to be technical?",
    a: "No. Every report opens with a plain-language summary of what we found and what it means. The technical detail is underneath it, for whoever maintains your code.",
  },
  {
    q: "Is my code safe with you?",
    a: `Read-only access, never touched in production, deleted after ${promises.retentionDays} days, NDA on request. The full list is above.`,
  },
  {
    q: "What languages and stacks do you review?",
    a: "[DECIDE — list them specifically. Saying 'anything' reads as inexperience.]",
  },
  {
    q: "How big a repo can you review for free?",
    a: `Up to ${promises.freeRepoLimit}. Larger than that and we'll tell you what a scoped review would cost before doing anything.`,
  },
  {
    q: "What if you don't find anything?",
    a: "We'll tell you that. A report saying “this is clean, here are three small things” is a real result and you'll get it in writing.",
  },
  {
    q: "What do you need from me?",
    a: "A link to your repository and read access. Nothing else.",
  },
];
