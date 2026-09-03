"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { duration, ease, scale, type ReviewCheck } from "@/brand";
import BentoCard from "@/components/bento/BentoCard";
import Redacted from "@/components/ui/Redacted";
import SeverityMark from "@/components/ui/SeverityMark";

/**
 * One of the four checks, holding a real redacted sample line.
 *
 * Reveal is on hover for pointers and on tap for touch — one piece of state
 * driving both, so there is a single behaviour to reason about.
 */
export default function CheckCard({
  check,
  index,
}: {
  check: ReviewCheck;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <BentoCard
      interactive
      onClick={() => setOpen((o) => !o)}
      ariaLabel={`${check.title}. ${open ? "Hide" : "Show"} sample finding.`}
      ariaExpanded={open}
    >
      <div
        onPointerEnter={(e) => {
          if (e.pointerType !== "touch") setOpen(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== "touch") setOpen(false);
        }}
        className="flex h-full flex-col"
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <span className="label">
            {check.code} / {String(index + 1).padStart(2, "0")}
          </span>
          <SeverityMark level={check.severity} />
        </div>

        <h3 className="font-display text-vellum" style={{ fontSize: scale.card }}>
          {check.title}
        </h3>

        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
          {check.body}
        </p>

        <div className="mt-auto pt-7">
          <div
            className="rounded-xl border border-ink-500 bg-ink-900 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-3 font-mono text-[0.6875rem] text-faint">
              <span className="truncate">{check.sample.path}</span>
              {check.sample.line > 0 && (
                <span className="shrink-0">L{check.sample.line}</span>
              )}
            </div>

            <div className="font-mono text-[0.75rem] leading-relaxed text-vellum sm:text-[0.8125rem]">
              <Redacted revealed={open}>
                <span className="break-all">{check.sample.hidden}</span>
              </Redacted>
            </div>

            <motion.div
              initial={false}
              animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
              transition={{ duration: duration.base, ease: ease.settle }}
              className="overflow-hidden"
            >
              {/* Monochrome: the verdict is emphasised by a rule and white
                  text, since it can no longer be emphasised by hue. */}
              <p className="mt-3 border-l border-vellum pl-3 text-[0.8125rem] leading-relaxed text-vellum">
                {check.sample.verdict}
              </p>
            </motion.div>
          </div>

          <p className="mt-3 font-mono text-[0.6875rem] text-faint">
            <span className="hover-only">Hover to reveal</span>
            <span className="touch-only">Tap to reveal</span>
          </p>
        </div>
      </div>
    </BentoCard>
  );
}
