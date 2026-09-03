import { promises } from "../meta";

/**
 * The hero is a page of paper: the first sheet of a report.
 *
 * Left, the claim. Right, a real-looking source file with proof marks in the
 * margin — the review happening in front of you. Everything below the rule is
 * the offer, stated as terms.
 */
export const hero = {
  runningHead: {
    left: "Review № 0001",
    centre: "Sheet 1 of 1",
    right: "Read-only · Written · Free",
    rightShort: "Free",
  },
  /** One word-group per line. Set very large, so it must hold at every width. */
  headline: ["Every repo", "has a line", "it hopes nobody", "reads."],
  standfirst: `Send us the repository. ${promises.turnaroundDays} business days later you have a written report: what is exposed, where it lives, and what to fix first.`,
  cta: {
    primary: "Book the free review",
    secondary: "Read the sample report",
  },
  terms: [
    { value: `${promises.turnaroundDays}d`, label: "turnaround" },
    { value: `${promises.weeklyCapacity}/wk`, label: "reviews taken" },
    { value: `${promises.retentionDays}d`, label: "then deleted" },
  ],
} as const;

export type ProofMark = "circle" | "underline" | "strike";

export interface ProofLine {
  code: string;
  mark?: ProofMark;
  note?: string;
  severity?: "critical" | "high";
}

/**
 * The sheet being reviewed. A plausible route file with three findings, each
 * carrying a proof mark and the note a reviewer would write beside it.
 */
export const proofSheet: { file: string; lines: readonly ProofLine[] } = {
  file: "src/api/routes/users.ts",
  lines: [
    { code: 'import { db } from "../db";' },
    { code: 'import { Router } from "express";' },
    { code: "" },
    { code: "const router = Router();" },
    { code: "" },
    {
      code: 'router.get("/users/:id", async (req, res) => {',
      mark: "circle",
      note: "No auth on this route. Anyone can read any user.",
      severity: "critical",
    },
    { code: "  const id = req.params.id;" },
    {
      code: "  const rows = await sql(`SELECT * FROM users WHERE id=${id}`);",
      mark: "underline",
      note: "Interpolated straight into SQL. Injectable from the URL.",
      severity: "critical",
    },
    { code: "  res.json(rows[0]);" },
    { code: "});" },
    { code: "" },
    {
      code: 'const MAIL_KEY = "SG.k2xM9…";',
      mark: "strike",
      note: "Live key in source. Still valid, still in history.",
      severity: "high",
    },
    { code: "export default router;" },
  ],
};
