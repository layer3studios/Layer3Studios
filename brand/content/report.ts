import type { SeverityLevel } from "../colors";
import { company, promises } from "../meta";

/**
 * The sample report.
 *
 * One real-shaped review, anonymised, published at /report. It is also the
 * house style: every report we send follows this shape (see
 * REPORT-TEMPLATE.md at the project root). Plain summary first, three things
 * to fix first, then the findings in full, then what we read and what we
 * did not, then custody.
 */

export interface ReportFinding {
  ref: string;
  severity: SeverityLevel;
  title: string;
  /** Where it lives. */
  path: string;
  line: number;
  /** The evidence, one to four lines of code. Lines marked `hide` are redacted until read. */
  code: { text: string; hide?: boolean; dim?: boolean }[];
  /** What it means, in plain language. */
  means: string;
  /** How to fix it, concretely. */
  fix: string;
  /** Effort to fix, in a phrase. */
  effort: string;
  /** How we found it. */
  how: string;
}

export const report = {
  ref: "L3-0001",
  title: "What we found.",
  head: {
    left: "Review № 0001",
    centre: "Sample · anonymised",
    right: "Read-only · Written",
  },
  meta: [
    { label: "Repository", value: "acme/api (private, anonymised)" },
    { label: "Read by", value: "One engineer, start to finish" },
    { label: "Time spent", value: "2 h 40 min", counter: 160, unit: "min" },
    { label: "Lines read", value: "38,412", counter: 38412 },
    { label: "Sent", value: "Day 3, 09:14" },
    { label: "Code deleted", value: `Day ${promises.turnaroundDays + promises.retentionDays}` },
  ],
  summary: [
    "We read the repository from the first commit to the last. It is a well-organised Next.js and Postgres application, and most of it is in good shape.",
    "Three things need attention before anything else, and one of them is live right now: a payment key that was removed from the code eight months ago is still in the git history and still works. The other two are an admin route that answers to anyone and a database query built from the URL.",
    "None of this needs a rewrite. Rotating the key is an hour. Gating the route and parameterising the query is an afternoon. The rest of this report is detail for whoever maintains the code.",
  ],
  fixFirst: [
    { n: "01", text: "Rotate the payment key today. It is still valid.", severity: "critical" as SeverityLevel },
    { n: "02", text: "Put a session check in front of /api/admin.", severity: "critical" as SeverityLevel },
    { n: "03", text: "Parameterise the users query.", severity: "high" as SeverityLevel },
  ],
  findings: [
    {
      ref: "L3-0001-A",
      severity: "critical",
      title: "A live payment key in git history",
      path: "src/lib/payments.ts",
      line: 4,
      code: [
        { text: 'import Stripe from "stripe";', dim: true },
        { text: "// TODO move to env before launch", dim: true },
        { text: 'const STRIPE_SECRET = "sk_live_51H8x••••••••••••••Pz9Wd";', hide: true },
        { text: "const stripe = new Stripe(STRIPE_SECRET);", dim: true },
      ],
      means:
        "The key was removed in the next commit, but git keeps every commit. Anyone with read access to the repository, now or in the past, can recover it in one command. We checked: it is still accepted by the provider.",
      fix: "Rotate the key at the provider first, then move the new one to an environment variable. Rewriting history is optional once the key is dead; rotating it is not.",
      effort: "About an hour",
      how: "Every commit's diff was searched for key-shaped strings, and each hit was checked against the provider's key format. One was then tested read-only with a harmless balance call, with your permission.",
    },
    {
      ref: "L3-0001-B",
      severity: "critical",
      title: "An admin route with no authentication",
      path: "app/api/admin/route.ts",
      line: 3,
      code: [
        { text: 'import { purge } from "@/lib/cache";', dim: true },
        { text: "export async function POST(req: Request) {" },
        { text: "  // no auth check", hide: true },
        { text: "  await purge((await req.json()).scope);", hide: true },
      ],
      means:
        "The route clears caches by scope, and nothing checks who is asking. From the open internet, one request empties production caches. It is not data loss, but it is a free way to slow your site down at will, and the same pattern may exist elsewhere.",
      fix: "Wrap it in the same session middleware the dashboard uses, and return 401 before parsing the body. Then grep for other routes under /api/admin and /api/internal with the same shape; we found one more (see C).",
      effort: "An afternoon, including the audit of sibling routes",
      how: "Every route file was listed and its first ten lines read for an auth call. Two had none.",
    },
    {
      ref: "L3-0001-C",
      severity: "high",
      title: "A user lookup built from the URL",
      path: "src/api/routes/users.ts",
      line: 8,
      code: [
        { text: 'router.get("/users/:id", async (req, res) => {', dim: true },
        { text: "  const id = req.params.id;", dim: true },
        { text: "  const rows = await sql(`SELECT * FROM users WHERE id=${id}`);", hide: true },
        { text: "  res.json(rows[0]);", dim: true },
      ],
      means:
        "The id is dropped straight into the SQL string. A crafted URL can read other tables. We did not attempt it, because the free review is read-only; the shape is enough to be sure.",
      fix: "Use the parameterised form your database client already offers: sql`SELECT * FROM users WHERE id = ${id}` with the tagged template, or a placeholder. Then search for other template strings passed to sql().",
      effort: "An hour for this one; a morning to sweep the rest",
      how: "Every call to the database client was read. This was the only string-built query, but the pattern is easy to reintroduce, so it is worth a lint rule.",
    },
    {
      ref: "L3-0001-D",
      severity: "medium",
      title: "One file that does everything",
      path: "src/utils/index.ts",
      line: 1,
      code: [
        { text: "// 4,182 lines. 61 exports. Imported by 94 files.", hide: true },
        { text: "export function validateEmail(s: string) { … }", dim: true },
        { text: "export function money(n: number) { … }", dim: true },
        { text: "export function retry(fn, n = 3) { … }", dim: true },
      ],
      means:
        "Not a security hole in itself, but it is where the next one will hide. Nothing in this file can be reviewed or tested in isolation, and every change to it touches 94 importers.",
      fix: "Split by concern over a few sprints, not at once: validation, money, async helpers. Move the money functions first; they are the ones a mistake in costs real money.",
      effort: "Ongoing; two days for the first split",
      how: "The import graph was built from the compiler's own resolution and sorted by fan-in.",
    },
    {
      ref: "L3-0001-E",
      severity: "low",
      title: "validateEmail, four times, three answers",
      path: "4 files",
      line: 0,
      code: [
        { text: "src/utils/index.ts        /.+@.+/", dim: true },
        { text: "src/auth/validate.ts      /^[^@]+@[^@]+\\.[a-z]{2,}$/", dim: true },
        { text: "app/signup/schema.ts      z.string().email()", dim: true },
        { text: "src/legacy/forms.js       /^\\S+@\\S+$/", hide: true },
      ],
      means: "The same check is written four times, and three of them disagree. The one in production for signup accepts addresses the others reject, so a user can sign up and then fail to reset their password.",
      fix: "Keep the zod one, delete the other three, and export it from one place.",
      effort: "An hour",
      how: "Functions with the same name across files were diffed.",
    },
  ] as ReportFinding[],
  scope: {
    read: [
      "Every file in the default branch, and every commit's diff for secret-shaped strings.",
      "Every route handler's first lines, for authentication.",
      "Every call to the database client.",
      "The lockfile, against published advisories.",
      "The import graph, for the files everything depends on.",
    ],
    notRead: [
      "Nothing was run against a live system. No requests were sent to production.",
      "No active testing: no injection attempts, no auth bypass attempts, no scanning.",
      "The free review is time-boxed to one person for one sitting. Depth beyond this is the paid audit.",
    ],
  },
  custody: [
    { when: "Hour 0", what: "Read access granted. NDA signed." },
    { when: "Day 1 to 3", what: "Read on an encrypted machine. Nothing pushed, nothing shared." },
    { when: "Day 3", what: "This report sent, in writing." },
    { when: `Day ${promises.turnaroundDays + promises.retentionDays}`, what: "Clone and notes deleted." },
  ],
  signoff: {
    line: "Read by a person, not a scanner.",
    from: company.name,
    email: company.email,
  },
} as const;
