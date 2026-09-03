import { NextResponse } from "next/server";
import { company, promises } from "@/brand/meta";
import { explain, missingEnv, sendMail, verifyTransport } from "@/lib/mailer";

/**
 * One endpoint for both ways of reaching us.
 *
 *   kind: "review"  the free review booking sheet
 *   kind: "hire"    the hire letter
 *
 * It sends two messages: the enquiry to the studio, with reply-to set to the
 * visitor so a reply goes straight back to them, and an acknowledgement to
 * the visitor. The acknowledgement is best effort: if it fails, the enquiry
 * has still arrived and the visitor still sees success.
 *
 * GET returns a configuration diagnostic outside production, so "the mailer
 * isn't working" has an answer without reading server logs.
 */

export const runtime = "nodejs";

const MAX = { short: 200, long: 4000 };

function clean(v: unknown, limit = MAX.short): string {
  return String(v ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function block(v: unknown): string {
  return String(v ?? "").trim().slice(0, MAX.long);
}

function isEmail(x: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);
}

function list(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => clean(x, 60)).filter(Boolean).slice(0, 12) : [];
}

/**
 * Best-effort rate limit. In-memory, so it holds within one warm instance and
 * resets on a cold start. Real limiting belongs in front of the app.
 *
 * Only sends that actually went out are counted. Counting failures would lock
 * someone out for ten minutes for mistyping their email, which is the one
 * person we must not punish.
 */
const sent = new Map<string, number[]>();
const WINDOW = 10 * 60 * 1000;
const LIMIT = 5;

function recentSends(ip: string): number[] {
  const now = Date.now();
  const recent = (sent.get(ip) ?? []).filter((t) => now - t < WINDOW);
  if (recent.length) sent.set(ip, recent);
  else sent.delete(ip);
  if (sent.size > 500) for (const [k, v] of sent) if (!v.some((t) => now - t < WINDOW)) sent.delete(k);
  return recent;
}

function overLimit(ip: string): boolean {
  return recentSends(ip).length >= LIMIT;
}

function recordSend(ip: string): void {
  sent.set(ip, [...recentSends(ip), Date.now()]);
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "That request wasn't readable." }, { status: 400 });
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (overLimit(ip)) {
    return NextResponse.json(
      { error: "That's a few in a row. Give it ten minutes, or email us directly." },
      { status: 429 },
    );
  }

  const kind = body.kind === "hire" ? "hire" : "review";
  const name = clean(body.name);
  const email = clean(body.email);
  const org = clean(body.company);

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email, please." }, { status: 400 });
  }
  if (!isEmail(email)) {
    return NextResponse.json({ error: "That email doesn't look right." }, { status: 400 });
  }

  let subject: string;
  let lines: string[];
  let ack: string;

  if (kind === "review") {
    const repo = clean(body.repo ?? body.subject, 400);
    const stack = clean(body.stack);
    const notes = block(body.message ?? body.notes);
    const worries = list(body.worries);

    if (!repo) {
      return NextResponse.json({ error: "We need a link to the repository." }, { status: 400 });
    }

    subject = `Free review · ${repo}`;
    lines = [
      "A free review was booked.",
      "",
      `Repository : ${repo}`,
      `Built with : ${stack || "-"}`,
      `Worries    : ${worries.length ? worries.join(", ") : "-"}`,
      "",
      `Name       : ${name}`,
      `Email      : ${email}`,
      `Company    : ${org || "-"}`,
      "",
      "Notes:",
      notes || "-",
    ];
    ack = [
      `Hi ${name.split(" ")[0] || "there"},`,
      "",
      `We have your repository and it's in the queue: ${repo}`,
      "",
      `One of us will read it start to finish and email you a written report within ${promises.turnaroundDays} business days.`,
      "No call is booked and none is needed. If we need read access we'll ask in reply to this message.",
      "",
      `Read-only. Your clone is deleted ${promises.retentionDays} days after the report. NDA on request.`,
      "",
      company.name,
      company.email,
    ].join("\n");
  } else {
    const service = clean(body.service, 80);
    const size = clean(body.size, 80);
    const timeline = clean(body.timeline, 80);
    const brief = block(body.brief);

    if (!brief) {
      return NextResponse.json({ error: "Tell us a little about the project." }, { status: 400 });
    }

    subject = `Hire · ${service || "project"}${size ? ` · ${size}` : ""}`;
    lines = [
      "A direct hire enquiry.",
      "",
      `Service    : ${service || "-"}`,
      `Size       : ${size || "-"}`,
      `Timeline   : ${timeline || "-"}`,
      "",
      `Name       : ${name}`,
      `Email      : ${email}`,
      `Company    : ${org || "-"}`,
      "",
      "Brief:",
      brief,
    ];
    ack = [
      `Hi ${name.split(" ")[0] || "there"},`,
      "",
      "Thanks for the brief. It's with us.",
      "",
      "You'll hear back from whoever would do the work, usually within a business day, with questions or a written quote sized to the project.",
      "Nothing starts until you've agreed one in writing.",
      "",
      company.name,
      company.email,
    ].join("\n");
  }

  lines.push("", `— sent from ${company.url} · ip ${ip}`);

  try {
    await sendMail({ subject, text: lines.join("\n"), replyTo: email });
  } catch (err) {
    const e = explain(err);
    // The detail goes to the server log; the visitor gets the short version.
    console.error("[enquiry]", e.message);
    return NextResponse.json({ error: e.publicMessage, code: e.code }, { status: 502 });
  }

  recordSend(ip);

  // The acknowledgement must never fail the request.
  try {
    await sendMail({
      to: email,
      subject: kind === "review" ? `Your free review is booked · ${company.name}` : `We have your brief · ${company.name}`,
      text: ack,
    });
  } catch (err) {
    console.warn("[enquiry] acknowledgement not sent:", explain(err).message);
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available." }, { status: 404 });
  }
  const missing = missingEnv();
  if (missing.length) {
    return NextResponse.json({
      configured: false,
      missing,
      hint: "Copy .env.example to .env.local, fill it in, and restart the dev server.",
    });
  }
  const check = await verifyTransport();
  return NextResponse.json(
    check.ok
      ? { configured: true, verified: true, host: process.env.SMTP_HOST, to: process.env.CONTACT_TO }
      : { configured: true, verified: false, code: check.error.code, reason: check.error.publicMessage, detail: check.error.message },
  );
}
