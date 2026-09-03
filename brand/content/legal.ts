import { company, promises } from "../meta";

/**
 * The three small pages linked from the footer. Written the way the rest of
 * the site is written: short, plain, and honest about what we do and don't
 * do. No boilerplate. Each page is a list of sections with a heading and
 * one or more paragraphs; lists are paragraphs that start with "• ".
 */

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalPage {
  slug: string;
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}

export const privacy: LegalPage = {
  slug: "privacy",
  eyebrow: "Privacy",
  title: "What we keep, and for how long.",
  intro:
    "This site asks you for very little, and we keep it for as short a time as we can. Here is the whole picture.",
  updated: "September 2026",
  sections: [
    {
      heading: "What you give us",
      body: [
        "When you book a free review or write to us, we receive what you type: your name, your email address, your company if you add it, a link to a repository, and anything you tell us in the notes.",
        "If you grant us read access to a repository, we receive a copy of its contents for the purpose of reading it. Nothing else is collected from the repository host.",
      ],
    },
    {
      heading: "What this site collects on its own",
      body: [
        "Nothing. There are no analytics, no advertising pixels, and no tracking cookies. The site sets no cookies at all. Our hosting provider keeps ordinary server logs (IP address, time, page requested) for a short period, as every host does.",
      ],
    },
    {
      heading: "How we use it",
      body: [
        "To read your code and send you the report you asked for, and to answer if you write to us. We do not add you to a mailing list. We do not sell, rent, or share your details with anyone. We do not use your code, your findings, or your name in marketing without your written permission.",
      ],
    },
    {
      heading: "How long we keep it",
      body: [
        `Your code is deleted from our systems ${promises.retentionDays} days after we send the report, sooner if you ask. Our working notes about it are deleted at the same time.`,
        "Your email and the report itself stay in our mailbox so we can pick the thread back up if you reply. Ask, and we will delete those too.",
      ],
    },
    {
      heading: "Where it lives",
      body: [
        "Code is read on encrypted machines under our control. Email is handled by our mail provider. We do not upload your code to third-party scanning services or AI tools.",
      ],
    },
    {
      heading: "Your rights",
      body: [
        `You can ask what we hold about you, ask us to correct it, or ask us to delete it. Write to ${company.email} and we will do it within a few business days.`,
      ],
    },
  ],
};

export const terms: LegalPage = {
  slug: "terms",
  eyebrow: "Terms",
  title: "The terms of a free review.",
  intro:
    "Short, because the arrangement is simple: you give us read access, we give you a written report, and nothing else happens unless you ask for it.",
  updated: "September 2026",
  sections: [
    {
      heading: "What the free review is",
      body: [
        `A person reads your repository and writes down what they found: exposed secrets, security leaks, structural problems, and duplication. You get that in writing, usually within ${promises.turnaroundDays} business days. It costs nothing and creates no obligation on either side.`,
        `We take on ${promises.weeklyCapacity} reviews a week. If there is a wait we will tell you how long. Repositories over ${promises.freeRepoLimit} may need a scoped review instead; we will say so before doing anything.`,
      ],
    },
    {
      heading: "What it is not",
      body: [
        "It is not a penetration test, an audit certificate, or a guarantee that your code is secure. We read carefully, but reading finds what reading can find. A clean report means we found nothing in what we read, not that nothing is there.",
        "The free review is passive. We do not run your code against live systems, probe your infrastructure, or test anything in production. Active testing only ever happens inside a scope you have signed.",
      ],
    },
    {
      heading: "Access and conduct",
      body: [
        "You confirm you are entitled to give us access to the repository you send. We use read-only access, never push, commit, or open pull requests uninvited, and never share what we see. You can revoke access at any time.",
      ],
    },
    {
      heading: "Confidentiality",
      body: [
        "Everything we see is confidential by default. We will sign an NDA before opening anything if you want one, on your paper or ours. We never name you or publish a finding without your written permission.",
      ],
    },
    {
      heading: "Paid work",
      body: [
        "Audits, fixes, and builds are quoted per project in writing. Nothing starts, and nothing is owed, until you have agreed a quote. Those engagements come with their own short agreement that covers scope, authorisation for any active testing, and payment.",
      ],
    },
    {
      heading: "Liability",
      body: [
        "The free review is provided as-is. To the extent the law allows, we are not liable for decisions you make on the basis of it. You keep full responsibility for your code and your systems.",
      ],
    },
    {
      heading: "Changes",
      body: [
        "If we change these terms we will change the date at the top of this page. Questions go to " + company.email + ".",
      ],
    },
  ],
};

export const disclosure: LegalPage = {
  slug: "disclosure",
  eyebrow: "Responsible disclosure",
  title: "Found something in our site? Tell us.",
  intro:
    "We read other people's code for a living, so we would be embarrassed to be careless with our own. If you have found a security issue in anything we run, here is how to reach us and what you can expect.",
  updated: "September 2026",
  sections: [
    {
      heading: "What is in scope",
      body: [
        `${company.url} and anything it serves, including the booking and contact forms and the email that receives them.`,
        "Out of scope: our clients' code and systems (that is their disclosure policy, not ours), denial of service, social engineering, and physical attacks.",
      ],
    },
    {
      heading: "How to report",
      body: [
        `Email ${company.email} with the subject line "Security". Tell us what you found, where, and how to reproduce it. Screenshots and a short proof of concept help. If you would like to encrypt the report, ask for our key in a first message.`,
      ],
    },
    {
      heading: "What we ask of you",
      body: [
        "• Give us a reasonable chance to fix it before you talk about it publicly.",
        "• Do not access, change, or delete data that is not yours, and stop as soon as you have enough to demonstrate the issue.",
        "• Do not run automated scanners against the site at a volume that affects it.",
      ],
    },
    {
      heading: "What you can expect from us",
      body: [
        "• An acknowledgement within two business days, from a person.",
        "• A straight answer about whether we can reproduce it and when it will be fixed.",
        "• Credit here, by name or handle, if you want it, once the fix is out.",
        "• No legal action against anyone who reports in good faith and follows the asks above. We consider that research authorised.",
      ],
    },
    {
      heading: "Thanks",
      body: ["Nobody has reported anything yet. When somebody does, and wants to be named, this is where their name goes."],
    },
  ],
};
