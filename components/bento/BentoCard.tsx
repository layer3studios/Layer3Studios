"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  ariaLabel?: string;
  ariaExpanded?: boolean;
}

/**
 * A single bento tile.
 *
 * No tilt. Cards used to rotate toward the pointer in 3D; it was the same
 * effect every card on every site does, and with thirteen tiles it turned the
 * grid into a wobbling mess. It has been removed everywhere.
 *
 * What replaces it comes from the subject rather than from a library: on
 * approach, the card is ACQUIRED, the way a scanner locks onto a target.
 * Four corner brackets snap inward, a hairline traces the perimeter once, and
 * a mono readout appears in the corner. Nothing rotates, nothing floats.
 *
 * The perimeter trace is an SVG rect with an animated dash offset, so the line
 * genuinely travels around the edge rather than fading in.
 */
export default function BentoCard({
  children,
  className = "",
  onClick,
  interactive = false,
  ariaLabel,
  ariaExpanded,
}: BentoCardProps) {
  const [locked, setLocked] = useState(false);
  const [rings, setRings] = useState<{ id: number; x: number; y: number }[]>([]);

  const Tag = interactive ? "button" : "div";

  return (
    <Tag
      onClick={(e: React.MouseEvent<HTMLElement>) => {
        // Every tile answers a click with a ring from the point of contact,
        // whether or not it does anything else.
        const r = e.currentTarget.getBoundingClientRect();
        const id = Date.now();
        setRings((cur) => [...cur, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
        window.setTimeout(() => setRings((cur) => cur.filter((k) => k.id !== id)), 800);
        onClick?.();
      }}
      type={interactive ? "button" : undefined}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      onPointerEnter={(e) => {
        if (e.pointerType !== "touch") setLocked(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "touch") setLocked(false);
      }}
      onFocus={() => setLocked(true)}
      onBlur={() => setLocked(false)}
      data-locked={locked ? "true" : "false"}
      className={`card-lock group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-ink-500 bg-ink-700 p-6 text-left transition-colors duration-500 sm:p-7 ${className}`}
    >
      {/* Perimeter trace. Draws itself around the edge on approach. */}
      <svg
        aria-hidden="true"
        className="card-trace pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        <rect
          x="0.5"
          y="0.5"
          width="99.5%"
          height="99.5%"
          rx="15"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1"
          pathLength={100}
        />
      </svg>

      {/* Corner brackets. They sit outside the frame and snap in when locked. */}
      {(
        [
          ["top-3 left-3", "border-l border-t", "-translate-x-1.5 -translate-y-1.5"],
          ["top-3 right-3", "border-r border-t", "translate-x-1.5 -translate-y-1.5"],
          ["bottom-3 left-3", "border-l border-b", "-translate-x-1.5 translate-y-1.5"],
          ["bottom-3 right-3", "border-r border-b", "translate-x-1.5 translate-y-1.5"],
        ] as const
      ).map(([pos, edges, offset]) => (
        <span
          key={pos}
          aria-hidden="true"
          className={`pointer-events-none absolute ${pos} ${edges} size-3 border-vellum opacity-0 transition-all duration-300 ease-[var(--ease-settle)] ${offset} group-data-[locked=true]:translate-x-0 group-data-[locked=true]:translate-y-0 group-data-[locked=true]:opacity-100`}
        />
      ))}

      {rings.map((k) => (
        <motion.span
          key={k.id}
          aria-hidden="true"
          className="pointer-events-none absolute z-20 size-3 rounded-full border border-vellum"
          style={{ left: k.x - 6, top: k.y - 6 }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 40, opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}

      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </Tag>
  );
}
