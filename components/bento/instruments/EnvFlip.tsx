"use client";

import { useState } from "react";
import { envCard, severity } from "@/brand";

/**
 * A .env file that flips over to show what it looks like from the outside.
 *
 * Front: the file as you wrote it, values masked.
 * Back:  the same file, fetched over HTTP, returning 200.
 *
 * A genuine 3D card flip on rotateY with backface culling — the two faces are
 * the same object, which is the point. Flips on hover for pointers and on tap
 * for touch, so the tile works identically on a phone.
 */
export default function EnvFlip() {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      onPointerEnter={(e) => {
        if (e.pointerType !== "touch") setFlipped(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "touch") setFlipped(false);
      }}
      aria-label={`${envCard.front.title}. ${flipped ? "Showing" : "Show"} what it looks like from the outside.`}
      aria-pressed={flipped}
      className="layer relative mt-6 block h-[170px] w-full text-left"
      style={{ perspective: "1000px" }}
    >
      <div
        className="layer relative h-full w-full transition-transform duration-700 ease-[var(--ease-settle)]"
        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* Front — the file */}
        <div
          className="absolute inset-0 rounded-xl border border-ink-500 bg-ink-800 p-4"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <p className="mb-3 font-mono text-[0.6875rem] text-faint">
            {envCard.front.title}
          </p>
          <div className="space-y-1.5">
            {envCard.front.lines.map((line) => (
              <p key={line} className="font-mono text-[0.75rem] text-muted">
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Back — the same file, over HTTP */}
        <div
          className="absolute inset-0 rounded-xl border p-4"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            borderColor: "rgba(255,255,255,0.30)",
            background: "rgba(255,255,255,0.05)",
          }}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="truncate font-mono text-[0.6875rem] text-muted">
              {envCard.back.title}
            </p>
            <span
              className="shrink-0 font-mono text-[0.6875rem]"
              style={{ color: severity.critical }}
            >
              {envCard.back.status}
            </span>
          </div>
          <p className="text-[0.8125rem] leading-relaxed text-muted">
            {envCard.back.note}
          </p>
        </div>
      </div>
    </button>
  );
}
