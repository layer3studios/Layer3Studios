"use client";

import { animate, useInView } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { depth, ease } from "@/brand";

interface StatTileProps {
  value: number;
  unit: string;
  label: string;
  /**
   * A 3D glyph for this specific number. Each stat gets its own form — plates
   * turning for the turnaround, an open empty box for what we hold back,
   * filling slots for weekly capacity. A number alone left these tiles reading
   * as empty next to the instrument tiles.
   */
  glyph?: ReactNode;
  /** Short, wide tile: number and glyph share a row. */
  compact?: boolean;
}

/**
 * One number, counted up when it scrolls into view.
 *
 * Three values do not need a chart. The number is set in the display face at
 * hero scale and pushed well forward in Z, so on a tilting card it is the
 * element that moves most — the depth does the work a chart would have done.
 */
export default function StatTile({ value, unit, label, glyph, compact = false }: StatTileProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    // Zero is a real answer here ("0 findings held back") — don't animate it,
    // a counter that stays at zero looks broken.
    if (value === 0) {
      setDisplay(0);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.1,
      ease: ease.settle,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  if (compact) {
    return (
      <div ref={ref} className="relative flex h-full items-center justify-between gap-4">
        <div>
          <p className="label">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-vellum tabular-nums" style={{ fontSize: "2.4rem", lineHeight: 0.9 }}>
              {display}
            </span>
            <span className="font-mono text-[0.7rem] text-faint">{unit}</span>
          </div>
        </div>
        <div className="stat-glyph-compact relative h-16 w-24 shrink-0 overflow-hidden">{glyph}</div>
      </div>
    );
  }

  return (
    <div ref={ref} className="layer relative flex h-full flex-col justify-between">
      <p className="label">{label}</p>

      <div
        className="layer mt-8 flex items-baseline gap-3"
        style={{ transform: `translateZ(${depth.floating}px)` }}
      >
        <span
          className="font-display text-vellum tabular-nums"
          style={{ fontSize: "clamp(3rem, 2rem + 5vw, 5rem)", lineHeight: 0.9 }}
        >
          {display}
        </span>
        <span className="font-mono text-[0.75rem] text-faint">{unit}</span>
      </div>

      {glyph}
    </div>
  );
}
