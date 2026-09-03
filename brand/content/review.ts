import type { SeverityLevel } from "../colors";
import { promises } from "../meta";

export const review = {
  eyebrow: "What we check",
  heading: "The whole scope, for free",
  intro:
    "Not a scan. A person reads your code. This is everything — there's no hidden tier of findings we hold back.",
  outro:
    "You get a written report. If your developer can fix everything in it without hiring us, good — that's a fine outcome.",
} as const;

/* ---------------------------------------------------------------------------
   The four checks. Each is a full tile with a redacted sample line.
   --------------------------------------------------------------------------- */

export interface ReviewCheck {
  id: string;
  /** Mono index shown on the card. These are checks, not steps — no ordering. */
  code: string;
  title: string;
  body: string;
  severity: SeverityLevel;
  sample: {
    path: string;
    line: number;
    /** Text hidden behind the redaction bar. */
    hidden: string;
    /** Verdict shown once revealed. */
    verdict: string;
  };
}

export const reviewChecks: ReviewCheck[] = [
  {
    id: "secrets",
    code: "SEC",
    title: "Exposed secrets",
    body: "API keys, tokens, passwords and .env files committed to your repo — including ones you deleted later, which are still sitting in your git history.",
    severity: "critical",
    sample: {
      path: "src/lib/payments.ts",
      line: 12,
      hidden: 'const STRIPE_SECRET = "sk_live_51H8xQ2eZvKYlo2C…"',
      verdict: "Live key. Committed 8 months ago, deleted in the next commit, still in history.",
    },
  },
  {
    id: "leaks",
    code: "NET",
    title: "Security leaks",
    body: "Publicly reachable endpoints that shouldn't be, missing input validation, unprotected routes, and dependencies with known published vulnerabilities.",
    severity: "high",
    sample: {
      path: "app/api/admin/route.ts",
      line: 4,
      hidden: "export async function POST(req) { /* no auth check */ }",
      verdict: "Admin route with no authentication. Reachable from the open internet.",
    },
  },
  {
    id: "structure",
    code: "ARC",
    title: "Structure",
    body: "How your project is organised, whether concerns are separated, and where the dead code is. Bad structure is where security problems hide.",
    severity: "medium",
    sample: {
      path: "src/utils/index.ts",
      line: 1,
      hidden: "// 4,182 lines. 61 exports. Imported by 94 files.",
      verdict: "One file doing everything. Nothing here can be reviewed in isolation.",
    },
  },
  {
    id: "duplication",
    code: "DUP",
    title: "Duplication",
    body: "The same logic written four times in four places. It means four places to fix when something breaks, and three that get forgotten.",
    severity: "low",
    sample: {
      path: "4 files",
      line: 0,
      hidden: "validateEmail() — defined 4×, 3 implementations disagree",
      verdict: "One of the four accepts addresses the other three reject.",
    },
  },
];

/* ---------------------------------------------------------------------------
   The instruments.

   Small tiles that sit between the checks. Each one demonstrates a piece of
   the review rather than decorating the grid — the commit stack shows why
   deleting a key doesn't remove it, the endpoint list shows what an
   unprotected route looks like, and so on.
   --------------------------------------------------------------------------- */

/** Commit stack: why "I deleted it" isn't the same as "it's gone". */
export const commitTrail = {
  label: "Git history",
  title: "Deleting it doesn't remove it",
  caption:
    "The key was removed in the very next commit. Every commit before it still holds the value, and history is what we read.",
  /** Newest first — the stack renders back to front. */
  commits: [
    { hash: "a3f19c2", message: "remove hardcoded key", state: "clean" as const },
    { hash: "7bd0e41", message: "hotfix: payment flow", state: "exposed" as const },
    { hash: "e92c5aa", message: "add stripe integration", state: "exposed" as const },
    { hash: "1c4f8b0", message: "wire up checkout", state: "exposed" as const },
    { hash: "5ae7d33", message: "initial commit", state: "clean" as const },
  ],
};

/** The .env tile. Flips to show what the file looks like from the outside. */
export const envCard = {
  label: "Config",
  front: {
    title: ".env",
    lines: [
      "DATABASE_URL=…",
      "STRIPE_SECRET=…",
      "JWT_SIGNING_KEY=…",
      "SMTP_PASSWORD=…",
    ],
  },
  back: {
    title: "yoursite.com/.env",
    status: "200 OK",
    note: "Served as a static file. Anyone can read it. We check this first, every time.",
  },
  hint: "Flip",
};

/** Dependency tile: a small constellation with a few known-vulnerable nodes. */
export const dependencyMap = {
  label: "Dependencies",
  title: "Published CVEs",
  caption: "We check what you installed, and what that installed.",
  /** x/y are 0–1 within the tile; depth drives the 3D parallax layer. */
  nodes: [
    { id: "app", x: 0.5, y: 0.5, depth: 3, vulnerable: false, size: 9 },
    { id: "a", x: 0.22, y: 0.28, depth: 2, vulnerable: false, size: 6 },
    { id: "b", x: 0.78, y: 0.24, depth: 1, vulnerable: true, size: 7 },
    { id: "c", x: 0.16, y: 0.72, depth: 1, vulnerable: false, size: 5 },
    { id: "d", x: 0.84, y: 0.68, depth: 2, vulnerable: true, size: 6 },
    { id: "e", x: 0.5, y: 0.14, depth: 0, vulnerable: false, size: 4 },
    { id: "f", x: 0.34, y: 0.86, depth: 0, vulnerable: false, size: 4 },
    { id: "g", x: 0.66, y: 0.88, depth: 1, vulnerable: false, size: 5 },
  ],
  /** Index pairs into nodes. */
  edges: [
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [1, 5],
    [3, 6],
    [4, 7],
  ] as const,
  finding: "2 transitive packages with published advisories",
};

/** Endpoint tile: a route table with a scan sweeping down it. */
export const endpointScan = {
  label: "Routes",
  title: "What's reachable",
  routes: [
    { method: "GET", path: "/api/health", guarded: true },
    { method: "POST", path: "/api/contact", guarded: true },
    { method: "GET", path: "/api/users/:id", guarded: true },
    { method: "POST", path: "/api/admin/purge", guarded: false },
    { method: "GET", path: "/api/internal/debug", guarded: false },
    { method: "POST", path: "/api/auth/login", guarded: true },
  ],
  finding: "2 routes with no authentication",
};

/** Plain numbers. No chart — four values do not need a visualisation. */
export const reviewStats = [
  {
    id: "turnaround",
    value: promises.turnaroundDays,
    unit: "business days",
    label: "Report arrives in",
  },
  {
    id: "held-back",
    value: 0,
    unit: "findings",
    label: "Held back for the paid tier",
  },
  {
    id: "capacity",
    value: promises.weeklyCapacity,
    unit: "a week",
    label: "Reviews we take on",
  },
];

/** Sits on the grid as a quiet, full-width interruption between the tiles. */
export const gridAside = {
  text: "Everything on this page happens before you pay us anything.",
};
