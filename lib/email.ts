import { company, promises } from "@/brand/meta";

/**
 * Email templates, in the site's language.
 *
 * Ink ground, a sheet of paper, a mono running head on a hard rule, the
 * headline in the display serif, mono labels, and a terms strip at the foot.
 * Mail clients want tables and inline styles, and only web-safe faces, so
 * Georgia stands in for Instrument Serif and Courier for JetBrains Mono.
 * Every template also returns plain text, which is what a reply quotes.
 */

const INK = "#000000";
const PAPER = "#ffffff";
const STOCK = "#f4f2ec";
const MUTED = "#6b6b6b";
const FAINT = "#9a9a9a";
const RULE = "#e5e3dd";

const SERIF = "Georgia, 'Times New Roman', serif";
const MONO = "'Courier New', Courier, monospace";
const SANS = "Helvetica, Arial, sans-serif";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const nl2br = (s: string) => esc(s).replace(/\n/g, "<br>");

const label = (text: string) =>
  `<span style="font-family:${MONO};font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${MUTED}">${esc(text)}</span>`;

/** A key/value row in the mono face. */
function row(k: string, v: string, last = false): string {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid ${last ? "transparent" : RULE};vertical-align:top;width:120px">${label(k)}</td>
    <td style="padding:10px 0;border-bottom:1px solid ${last ? "transparent" : RULE};font-family:${MONO};font-size:13px;color:${INK};vertical-align:top">${nl2br(v || "—")}</td>
  </tr>`;
}

interface Sheet {
  /** Running head: left, centre, right. */
  head: [string, string, string];
  eyebrow: string;
  title: string;
  intro?: string;
  rows?: [string, string][];
  /** A block set on stock, for a brief or notes. */
  block?: { label: string; text: string };
  paragraphs?: string[];
  /** One pill button. */
  cta?: { label: string; href: string };
  /** Mono terms strip at the foot. */
  terms: string[];
}

function render(s: Sheet): string {
  const rows = s.rows?.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid ${INK};margin-top:28px">
        ${s.rows.map(([k, v], i) => row(k, v, i === s.rows!.length - 1)).join("")}
       </table>`
    : "";

  const block = s.block
    ? `<div style="margin-top:28px">${label(s.block.label)}
         <div style="margin-top:10px;padding:18px 20px;background:${STOCK};border:1px solid ${RULE};border-radius:12px;font-family:${MONO};font-size:13px;line-height:1.8;color:${INK}">${nl2br(s.block.text)}</div>
       </div>`
    : "";

  const paras = s.paragraphs?.length
    ? `<div style="margin-top:28px">${s.paragraphs
        .map((p) => `<p style="margin:0 0 14px;font-family:${SANS};font-size:15px;line-height:1.65;color:#2a2a2a">${nl2br(p)}</p>`)
        .join("")}</div>`
    : "";

  const cta = s.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px"><tr>
         <td style="background:${INK};border-radius:999px">
           <a href="${esc(s.cta.href)}" style="display:inline-block;padding:14px 26px;font-family:${SANS};font-size:14px;font-weight:600;color:${PAPER};text-decoration:none">${esc(s.cta.label)} &nbsp;&#8599;</a>
         </td></tr></table>`
    : "";

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(s.title)}</title></head>
<body style="margin:0;padding:0;background:${INK}">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${INK}"><tr><td align="center" style="padding:40px 16px">
  <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:${PAPER};border-radius:20px">
    <tr><td style="padding:36px 40px 44px">

      <!-- Running head -->
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-bottom:1px solid ${INK}"><tr>
        <td style="padding-bottom:12px">${label(s.head[0])}</td>
        <td align="center" style="padding-bottom:12px">${label(s.head[1])}</td>
        <td align="right" style="padding-bottom:12px">${label(s.head[2])}</td>
      </tr></table>

      <div style="margin-top:36px">${label(s.eyebrow)}</div>
      <h1 style="margin:12px 0 0;font-family:${SERIF};font-weight:400;font-size:38px;line-height:1.02;letter-spacing:-0.5px;color:${INK}">${esc(s.title)}</h1>
      ${s.intro ? `<p style="margin:16px 0 0;font-family:${SANS};font-size:15px;line-height:1.65;color:${MUTED}">${nl2br(s.intro)}</p>` : ""}

      ${rows}${block}${paras}${cta}

      <!-- Terms strip -->
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid ${INK};margin-top:40px"><tr>
        <td style="padding-top:14px">${label(s.terms.join(" · "))}</td>
      </tr></table>
      <p style="margin:18px 0 0;font-family:${MONO};font-size:11px;color:${FAINT}">${esc(company.name)} · <a href="mailto:${company.email}" style="color:${FAINT}">${company.email}</a> · <a href="${company.url}" style="color:${FAINT}">${company.url.replace(/^https?:\/\//, "")}</a></p>

    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

/* ---------------------------------------------------------------------------
   The four messages.
   --------------------------------------------------------------------------- */

export interface ReviewEnquiry {
  name: string;
  email: string;
  company: string;
  repo: string;
  stack: string;
  worries: string[];
  notes: string;
  ip: string;
}

export interface HireEnquiry {
  name: string;
  email: string;
  company: string;
  service: string;
  size: string;
  timeline: string;
  brief: string;
  ip: string;
}

const first = (name: string) => name.trim().split(/\s+/)[0] || "there";
const deleteDay = promises.turnaroundDays + promises.retentionDays;

export function reviewToStudio(r: ReviewEnquiry): { subject: string; html: string; text: string } {
  const subject = `Free review · ${r.repo}`;
  const html = render({
    head: ["Enquiry", "Free review", "Reply goes to sender"],
    eyebrow: "A free review was booked",
    title: r.repo,
    rows: [
      ["Repository", r.repo],
      ["Built with", r.stack],
      ["Worries", r.worries.join(", ")],
      ["Name", r.name],
      ["Email", r.email],
      ["Company", r.company],
    ],
    block: { label: "Notes", text: r.notes || "—" },
    cta: { label: "Reply to " + first(r.name), href: `mailto:${r.email}?subject=${encodeURIComponent(`Re: your free review · ${r.repo}`)}` },
    terms: [`Turnaround ${promises.turnaroundDays} business days`, `Delete on day ${deleteDay}`, `ip ${r.ip}`],
  });
  const text = [
    "A free review was booked.",
    "",
    `Repository : ${r.repo}`,
    `Built with : ${r.stack || "-"}`,
    `Worries    : ${r.worries.length ? r.worries.join(", ") : "-"}`,
    "",
    `Name       : ${r.name}`,
    `Email      : ${r.email}`,
    `Company    : ${r.company || "-"}`,
    "",
    "Notes:",
    r.notes || "-",
    "",
    `— sent from ${company.url} · ip ${r.ip}`,
  ].join("\n");
  return { subject, html, text };
}

export function reviewToVisitor(r: ReviewEnquiry): { subject: string; html: string; text: string } {
  const subject = `Your free review is booked · ${company.name}`;
  const html = render({
    head: [`Review booked`, "Sheet 0 of 1", "Read-only · Written"],
    eyebrow: `Hi ${first(r.name)}`,
    title: "It's in the queue.",
    intro: `One of us will read it start to finish and email you a written report within ${promises.turnaroundDays} business days. No call is booked and none is needed.`,
    rows: [
      ["Repository", r.repo],
      ["Report by", `Day ${promises.turnaroundDays}`],
      ["Deleted on", `Day ${deleteDay}`],
    ],
    paragraphs: ["If we need read access we'll ask in reply to this message. If you want an NDA first, just say so."],
    cta: { label: "What's in the report", href: `${company.url}/report` },
    terms: ["Read-only", `Deleted after ${promises.retentionDays} days`, "NDA on request", "No call"],
  });
  const text = [
    `Hi ${first(r.name)},`,
    "",
    `We have your repository and it's in the queue: ${r.repo}`,
    "",
    `One of us will read it start to finish and email you a written report within ${promises.turnaroundDays} business days.`,
    "No call is booked and none is needed. If we need read access we'll ask in reply to this message.",
    "",
    `Read-only. Your clone is deleted ${promises.retentionDays} days after the report. NDA on request.`,
    "",
    company.name,
    company.email,
  ].join("\n");
  return { subject, html, text };
}

export function hireToStudio(h: HireEnquiry): { subject: string; html: string; text: string } {
  const subject = `Hire · ${h.service || "project"}${h.size ? ` · ${h.size}` : ""}`;
  const html = render({
    head: ["Enquiry", "Hire", "Reply goes to sender"],
    eyebrow: "A direct hire enquiry",
    title: h.service || "A project",
    rows: [
      ["Service", h.service],
      ["Size", h.size],
      ["Timeline", h.timeline],
      ["Name", h.name],
      ["Email", h.email],
      ["Company", h.company],
    ],
    block: { label: "Brief", text: h.brief },
    cta: { label: "Reply to " + first(h.name), href: `mailto:${h.email}?subject=${encodeURIComponent(`Re: ${h.service || "your project"}`)}` },
    terms: ["Quote per project", "Nothing starts unsigned", `ip ${h.ip}`],
  });
  const text = [
    "A direct hire enquiry.",
    "",
    `Service    : ${h.service || "-"}`,
    `Size       : ${h.size || "-"}`,
    `Timeline   : ${h.timeline || "-"}`,
    "",
    `Name       : ${h.name}`,
    `Email      : ${h.email}`,
    `Company    : ${h.company || "-"}`,
    "",
    "Brief:",
    h.brief,
    "",
    `— sent from ${company.url} · ip ${h.ip}`,
  ].join("\n");
  return { subject, html, text };
}

export function hireToVisitor(h: HireEnquiry): { subject: string; html: string; text: string } {
  const subject = `We have your brief · ${company.name}`;
  const html = render({
    head: ["Brief received", h.service || "Project", "Quoted per project"],
    eyebrow: `Hi ${first(h.name)}`,
    title: "Thanks for the brief.",
    intro: "It's with us. You'll hear back from whoever would do the work, usually within a business day, with questions or a written quote sized to the project.",
    rows: [
      ["Service", h.service],
      ["Size", h.size],
      ["Timeline", h.timeline],
    ],
    block: { label: "What you sent", text: h.brief },
    paragraphs: ["Nothing starts until you've agreed a quote in writing."],
    terms: ["No retainers", "No packages", "Every quote written for the project"],
  });
  const text = [
    `Hi ${first(h.name)},`,
    "",
    "Thanks for the brief. It's with us.",
    "",
    "You'll hear back from whoever would do the work, usually within a business day, with questions or a written quote sized to the project.",
    "Nothing starts until you've agreed one in writing.",
    "",
    company.name,
    company.email,
  ].join("\n");
  return { subject, html, text };
}
