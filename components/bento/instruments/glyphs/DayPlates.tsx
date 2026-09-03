"use client";

import { promises } from "@/brand";

/**
 * Turnaround, as an object: one plate per business day, hinged like a
 * flip-clock and turning through in sequence. The last plate is white — the
 * day the report lands.
 *
 * CSS 3D rather than a fourth WebGL canvas. The form is simple enough that a
 * canvas would be waste, and it inherits the card's pointer tilt for free
 * because it lives inside the same preserve-3d context.
 */
export default function DayPlates() {
  const days = Array.from({ length: promises.turnaroundDays });

  return (
    <div
      className="layer pointer-events-none absolute bottom-6 right-6"
      style={{ perspective: "520px" }}
      aria-hidden="true"
    >
      <div
        className="layer relative"
        style={{
          width: 58,
          height: 58,
          transform: "rotateX(-22deg) rotateY(-28deg)",
        }}
      >
        {days.map((_, i) => (
          <span
            key={i}
            className="day-plate layer absolute inset-0 rounded-[3px] border border-ink-400"
            style={
              {
                // The depth is a custom property so the keyframe can keep it
                // while animating rotation — an inline transform would be
                // overridden by the animation entirely.
                "--z": `${i * 11 - 11}px`,
                background: i === days.length - 1 ? "#FFFFFF" : "#0A0A0A",
                opacity: 0.4 + (i / days.length) * 0.6,
                animationDelay: `${i * 0.3}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <style>{`
        .day-plate {
          transform: translateZ(var(--z)) rotateX(0deg);
          animation: plate-turn 4.4s ease-in-out infinite;
        }
        @keyframes plate-turn {
          0%, 60%, 100% { transform: translateZ(var(--z)) rotateX(0deg); }
          20%           { transform: translateZ(var(--z)) rotateX(-62deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .day-plate { animation: none; }
        }
      `}</style>
    </div>
  );
}
