import { NextResponse } from "next/server";
import { hireToStudio, hireToVisitor, reviewToStudio, reviewToVisitor } from "@/lib/email";
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

  let studio: { subject: string; html: string; text: string };
  let visitor: { subject: string; html: string; text: string };

  if (kind === "review") {
    const repo = clean(body.repo ?? body.subject, 400);
    if (!repo) {
      return NextResponse.json({ error: "We need a link to the repository." }, { status: 400 });
    }
    const r = {
      name,
      email,
      company: org,
      repo,
      stack: clean(body.stack),
      worries: list(body.worries),
      notes: block(body.message ?? body.notes),
      ip,
    };
    studio = reviewToStudio(r);
    visitor = reviewToVisitor(r);
  } else {
    const brief = block(body.brief);
    if (!brief) {
      return NextResponse.json({ error: "Tell us a little about the project." }, { status: 400 });
    }
    const h = {
      name,
      email,
      company: org,
      service: clean(body.service, 80),
      size: clean(body.size, 80),
      timeline: clean(body.timeline, 80),
      brief,
      ip,
    };
    studio = hireToStudio(h);
    visitor = hireToVisitor(h);
  }

  try {
    await sendMail({ subject: studio.subject, text: studio.text, html: studio.html, replyTo: email });
  } catch (err) {
    const e = explain(err);
    // The detail goes to the server log; the visitor gets the short version.
    console.error("[enquiry]", e.message);
    return NextResponse.json({ error: e.publicMessage, code: e.code }, { status: 502 });
  }

  recordSend(ip);

  // The acknowledgement must never fail the request.
  try {
    await sendMail({ to: email, subject: visitor.subject, text: visitor.text, html: visitor.html });
  } catch (err) {
    console.warn("[enquiry] acknowledgement not sent:", explain(err).message);
  }

  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available." }, { status: 404 });
  }

  // Template preview, with sample data, so the emails can be checked in a browser.
  const preview = new URL(req.url).searchParams.get("preview");
  if (preview) {
    const r = {
      name: "Priya Raman",
      email: "priya@acme.dev",
      company: "Acme",
      repo: "github.com/acme/api",
      stack: "Next.js, Postgres, Stripe",
      worries: ["Leaked keys", "Auth holes"],
      notes: "We ship in six weeks and would like the review before that. Two engineers, no security review yet.",
      ip: "203.0.113.7",
    };
    const h = {
      name: "Sam Okafor",
      email: "sam@build.co",
      company: "Build Co",
      service: "Deep security audit",
      size: "Medium",
      timeline: "This month",
      brief: "Next.js app with Stripe. Two engineers, no security review yet. We ship in six weeks and want the audit done before that.",
      ip: "203.0.113.7",
    };
    const html =
      preview === "review-studio" ? reviewToStudio(r).html
      : preview === "review-visitor" ? reviewToVisitor(r).html
      : preview === "hire-studio" ? hireToStudio(h).html
      : preview === "hire-visitor" ? hireToVisitor(h).html
      : null;
    if (!html) return NextResponse.json({ error: "preview must be review-studio, review-visitor, hire-studio or hire-visitor" }, { status: 400 });
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
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
