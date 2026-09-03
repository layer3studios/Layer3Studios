"use client";

import { CanvasTexture, LinearMipmapLinearFilter, SRGBColorSpace } from "three";

/**
 * Procedural paper.
 *
 * The slabs in the 3D scenes are files, so they are drawn as files: a sheet
 * of warm paper with a filename strip, a small coloured tab, and real lines
 * of code. The report is a written page: a title, a rule, real sentences.
 * Everything is drawn at high resolution with mipmaps and anisotropy, so
 * the type stays crisp at a glancing angle.
 */

const rnd = (seed: number) => {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Paper grain. A 96px noise tile drawn once and repeated as a pattern, so
 * grain costs a few thousand pixels instead of a few million. A per-pixel
 * loop over the whole sheet stalled the page for a visible moment whenever
 * a 3D stage mounted.
 */
function grain(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number, seed: number) {
  const size = 96;
  const tile = document.createElement("canvas");
  tile.width = tile.height = size;
  const tctx = tile.getContext("2d")!;
  const img = tctx.createImageData(size, size);
  const d = img.data;
  const r = rnd(seed);
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * amount;
    const v = 128 + n;
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = v;
    d[i + 3] = 255;
  }
  tctx.putImageData(img, 0, 0);
  const pattern = ctx.createPattern(tile, "repeat");
  if (!pattern) return;
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function finish(c: HTMLCanvasElement): CanvasTexture {
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 16;
  tex.minFilter = LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

/**
 * The site's own faces, read from the page so the paper in the 3D scenes is
 * set in the same type as everything else. next/font exposes them as CSS
 * variables; a canvas needs the resolved family names.
 */
function face(varName: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v ? `${v}, ${fallback}` : fallback;
}
const MONO = face("--font-mono", "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace");
const SERIF = face("--font-display", "Georgia, 'Times New Roman', serif");

const FILES: { name: string; lines: string[] }[] = [
  {
    name: "src/api/routes/users.ts",
    lines: [
      'import { db } from "../db";',
      'import { Router } from "express";',
      "",
      "const router = Router();",
      "",
      'router.get("/users/:id", async (req, res) => {',
      "  const id = req.params.id;",
      "  const rows = await sql(`SELECT * FROM users",
      "    WHERE id=${id}`);",
      "  res.json(rows[0]);",
      "});",
      "",
      'const MAIL_KEY = "SG.k2xM9…";',
      "export default router;",
    ],
  },
  {
    name: "src/lib/payments.ts",
    lines: [
      'import Stripe from "stripe";',
      "",
      "// TODO move to env before launch",
      'const STRIPE_SECRET = "sk_live_51H8xQ2…";',
      "const stripe = new Stripe(STRIPE_SECRET);",
      "",
      "export async function charge(cents: number) {",
      "  return stripe.paymentIntents.create({",
      "    amount: cents,",
      '    currency: "usd",',
      "  });",
      "}",
    ],
  },
  {
    name: "app/api/admin/route.ts",
    lines: [
      'import { purge } from "@/lib/cache";',
      "",
      "export async function POST(req: Request) {",
      "  // no auth check",
      "  const body = await req.json();",
      "  await purge(body.scope);",
      "  return Response.json({ ok: true });",
      "}",
      "",
      "export const runtime = \"nodejs\";",
    ],
  },
  {
    name: "src/utils/index.ts",
    lines: [
      "// 4,182 lines. 61 exports.",
      "export function validateEmail(s: string) {",
      "  return /.+@.+/.test(s);",
      "}",
      "export function slug(s: string) {",
      '  return s.toLowerCase().replace(/\\s+/g, "-");',
      "}",
      "export function money(n: number) {",
      "  return (n / 100).toFixed(2);",
      "}",
      "export function retry(fn, n = 3) {",
      "  /* … */",
      "}",
    ],
  },
  {
    name: "src/auth/session.ts",
    lines: [
      'import jwt from "jsonwebtoken";',
      "",
      'const KEY = process.env.JWT_KEY ?? "dev";',
      "",
      "export function sign(user: User) {",
      "  return jwt.sign({ id: user.id }, KEY, {",
      '    expiresIn: "30d",',
      "  });",
      "}",
      "",
      "export function verify(token: string) {",
      "  return jwt.verify(token, KEY);",
      "}",
    ],
  },
];

/** A source file: real code on warm paper. */
export function makeFileTexture(
  seed = 1,
  opts: { width?: number; height?: number; tab?: string; paper?: string; ink?: string } = {},
): CanvasTexture {
  const w = opts.width ?? 1024;
  const h = opts.height ?? 704;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const r = rnd(seed * 97 + 13);
  const paper = opts.paper ?? "#ece8df";
  const ink = opts.ink ?? "#2b2924";
  const tab = opts.tab ?? "#d9a441";
  const file = FILES[Math.floor(r() * FILES.length)];
  const u = w / 1024; // unit scale

  // Sheet.
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, w, h);
  grain(ctx, w, h, 18, seed);
  const edge = ctx.createLinearGradient(0, 0, 0, h);
  edge.addColorStop(0, "rgba(0,0,0,0.06)");
  edge.addColorStop(0.06, "rgba(0,0,0,0)");
  edge.addColorStop(0.94, "rgba(0,0,0,0)");
  edge.addColorStop(1, "rgba(0,0,0,0.1)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, w, h);

  // Filename strip.
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.fillRect(0, 0, w, 84 * u);
  ctx.fillStyle = tab;
  ctx.fillRect(44 * u, 28 * u, 18 * u, 30 * u);
  ctx.fillStyle = ink;
  ctx.globalAlpha = 0.8;
  ctx.font = `500 ${28 * u}px ${MONO}`;
  ctx.textBaseline = "middle";
  ctx.fillText(file.name, 82 * u, 43 * u);
  ctx.globalAlpha = 0.5;
  ctx.font = `${24 * u}px ${MONO}`;
  ctx.textAlign = "right";
  ctx.fillText(`${file.lines.length + Math.floor(r() * 200)} lines`, w - 44 * u, 43 * u);
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;

  // Code. Line numbers in the gutter, real lines, keywords a little darker.
  // Taller sheets get larger type: fewer lines have to fit, so let them breathe.
  const tall = h > w;
  const fs = (tall ? 38 : 26) * u;
  const lineH = Math.min((tall ? 60 : 38) * u, (h - 120 * u) / Math.max(12, file.lines.length));
  ctx.font = `${fs}px ${MONO}`;
  const kw = /\b(import|from|const|export|async|function|await|return|default|new)\b/g;
  file.lines.forEach((line, i) => {
    const y = 130 * u + i * lineH;
    if (y > h - 30 * u) return;
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.textAlign = "right";
    ctx.fillText(String(i + 1), 66 * u, y);
    ctx.textAlign = "left";
    // Draw token by token so keywords can be darker.
    let x = 96 * u;
    const parts = line.split(/(\s+)/);
    for (const part of parts) {
      ctx.fillStyle = kw.test(part) ? "rgba(0,0,0,0.85)" : /["'`].*["'`]/.test(part) ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.72)";
      kw.lastIndex = 0;
      ctx.fillText(part, x, y);
      x += ctx.measureText(part).width;
    }
  });

  // A faint fold and a fingerprint of use: two soft smudges.
  ctx.fillStyle = "rgba(0,0,0,0.035)";
  ctx.fillRect(0, h * 0.5, w, 2 * u);
  return finish(c);
}

/** The written report: a real page. */
export function makeReportTexture(): CanvasTexture {
  const w = 1024;
  const h = 1365;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#f7f5f0";
  ctx.fillRect(0, 0, w, h);
  grain(ctx, w, h, 12, 7);

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.font = `24px ${MONO}`;
  ctx.fillText("REVIEW № 0001 · SHEET 1 OF 6", 80, 92);
  ctx.textAlign = "right";
  ctx.fillText("READ-ONLY · WRITTEN", w - 80, 92);
  ctx.textAlign = "left";

  ctx.fillStyle = "#111";
  ctx.font = `italic 72px ${SERIF}`;
  ctx.fillText("What we found.", 80, 190);
  ctx.fillRect(80, 218, w - 160, 3);

  const para = (text: string, y: number, size = 27, lineH = 40, font = SERIF, color = "rgba(0,0,0,0.78)") => {
    ctx.font = `${size}px ${font}`;
    ctx.fillStyle = color;
    const words = text.split(" ");
    let line = "";
    let yy = y;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > w - 160) {
        ctx.fillText(line, 80, yy);
        line = word;
        yy += lineH;
      } else line = test;
    }
    if (line) ctx.fillText(line, 80, yy);
    return yy + lineH;
  };

  let y = 280;
  y = para(
    "Summary, in plain language. We read the repository start to finish. Three things need attention before anything else, and one of them is live right now.",
    y,
  );
  y += 18;
  const findings = [
    ["01", "CRITICAL", "A live payment key in src/lib/payments.ts, line 4. Removed in the next commit, still readable in history, still valid."],
    ["02", "CRITICAL", "The admin route in app/api/admin/route.ts accepts requests from anyone. No session check, no token, nothing."],
    ["03", "HIGH", "Users are looked up by string-building SQL. Injectable from the URL."],
  ];
  for (const [n, sev, text] of findings) {
    ctx.font = `bold 22px ${MONO}`;
    ctx.fillStyle = "#111";
    ctx.fillText(`${n}  ${sev}`, 80, y);
    y += 36;
    y = para(text, y, 26, 36);
    y += 10;
  }
  y += 12;
  y = para(
    "What to fix first: rotate the key today, then gate the admin route. The query can be parameterised in an afternoon. The rest of this report is detail for whoever maintains the code.",
    y,
  );

  // Signature and stamp.
  ctx.font = `italic 30px ${SERIF}`;
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.fillText("Read by a person, not a scanner.", 80, h - 150);
  ctx.save();
  ctx.translate(w - 250, h - 190);
  ctx.rotate(-0.12);
  ctx.strokeStyle = "rgba(0,0,0,0.75)";
  ctx.lineWidth = 5;
  ctx.strokeRect(0, 0, 200, 64);
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.font = `bold 26px ${MONO}`;
  ctx.textAlign = "center";
  ctx.fillText("VERIFIED", 100, 42);
  ctx.restore();

  return finish(c);
}
