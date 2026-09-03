import { promises } from "../meta";

/**
 * How we handle your code.
 *
 * Written for the person who is nervous, because they should be: they are
 * about to hand source code to strangers. So the section is not a list of
 * policies. It is the chain of custody, hour by hour, from the link they
 * send to the day it is wiped, followed by the four things that never
 * happen and who, exactly, will be reading.
 */
export const safety = {
  eyebrow: "Before you hand it over",
  heading: "Your code never leaves your control",
  intro:
    "You're about to give source code to people you haven't met. So here is exactly what happens to it, from the moment you send the link to the day it's gone, and what never happens at all.",
} as const;

export interface CustodyStation {
  /** Mono time stamp, e.g. "Hour 0". */
  when: string;
  title: string;
  body: string;
  /** Short line the token carries as it passes. */
  status: string;
}

export const custody: CustodyStation[] = [
  {
    when: "Hour 0",
    title: "You send a link",
    body: "Read access to a repository you own. You can revoke it the moment you like. We never ask for more than read.",
    status: "read-only",
  },
  {
    when: "Hour 0",
    title: "An NDA, if you want one",
    body: "Say the word and we sign before opening anything. Your paper or ours, either is fine.",
    status: "under NDA",
  },
  {
    when: "Day 1 to 3",
    title: "One person reads it",
    body: `One of our ${promises.teamSize} engineers reads it start to finish on an encrypted machine. Nothing is run against your systems. Nothing is pushed. Nothing is shared.`,
    status: "being read",
  },
  {
    when: `Day ${promises.turnaroundDays}`,
    title: "The report arrives",
    body: "In writing, to the address you gave us. A plain-language summary first, then the detail for whoever maintains the code.",
    status: "report sent",
  },
  {
    when: `Day ${promises.turnaroundDays + promises.retentionDays}`,
    title: "Everything is deleted",
    body: `${promises.retentionDays} days after the report, the clone and every note about it are wiped from our systems. Sooner if you ask.`,
    status: "deleted",
  },
];

export const never = {
  label: "What never happens",
  lines: [
    { short: "Production", body: "We never touch a live system. The free review is reading, and only reading." },
    { short: "Pushes", body: "We never push, commit, or open a pull request unless you've hired us to." },
    { short: "Active tests", body: "We never probe, scan, or test anything live without a scope you've signed." },
    { short: "Your name", body: "We never name you, publish a finding, or use your logo without written permission." },
  ],
} as const;

export const studio = {
  eyebrow: "Who reads it",
  heading: "Three people. No tool with a sales team behind it.",
  body: [
    `We're ${promises.teamSize} engineers. Every review is read, start to finish, by a person who writes code for a living, and that person is who you talk to.`,
    `Small means we take on ${promises.weeklyCapacity} reviews a week and no more. If there's a wait, that's why, and we'll tell you how long.`,
  ],
  cta: "Want the NDA before anything else? Ask for it",
} as const;
