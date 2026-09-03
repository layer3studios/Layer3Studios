"use client";

import { promises } from "@/brand";

/**
 * Weekly capacity, as an object.
 *
 * One upright slab per review slot we take, standing in a row receding into
 * depth. They fill one at a time, left to right, then the week resets — the
 * number on the tile is a limit, and a limit is easier to feel as slots
 * filling than as a digit.
 */
export default function CapacitySlots() {
  const slots = Array.from({ length: promises.weeklyCapacity });

  return (
    <div
      className="layer pointer-events-none absolute bottom-6 right-6"
      style={{ perspective: "600px" }}
      aria-hidden="true"
    >
      <div
        className="layer relative flex items-end gap-2"
        style={{ height: 66, transform: "rotateX(-14deg) rotateY(-30deg)" }}
      >
        {slots.map((_, i) => (
          <span
            key={i}
            className="slot layer relative block w-3 rounded-[2px] border border-ink-400"
            style={
              {
                height: 66,
                // Each slab sits a little further back, so the row has depth
                // rather than being a flat bar chart.
                transform: `translateZ(${-i * 9}px)`,
                "--d": `${i * 0.75}s`,
              } as React.CSSProperties
            }
          >
            <span className="slot-fill absolute inset-x-0 bottom-0 block bg-vellum" />
          </span>
        ))}
      </div>

      <style>{`
        .slot-fill {
          height: 0%;
          animation: slot-fill 6s ease-in-out infinite;
          animation-delay: var(--d);
        }
        @keyframes slot-fill {
          0%, 8%   { height: 0%; }
          38%, 78% { height: 100%; }
          92%, 100%{ height: 0%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .slot-fill { animation: none; height: 100%; }
        }
      `}</style>
    </div>
  );
}
