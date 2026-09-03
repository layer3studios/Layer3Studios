"use client";

/**
 * "Nothing held back", as an object.
 *
 * A real CSS 3D box — five faces, hinged lid standing open, and nothing
 * inside. It turns slowly so you can see it is genuinely empty rather than
 * hiding something behind a face. That is the claim the number is making, so
 * the glyph should be checkable rather than symbolic.
 */
export default function EmptyVault() {
  const S = 46; // half-extent
  const face = "absolute border border-ink-400 bg-ink-800/60";

  return (
    <div
      className="layer pointer-events-none absolute bottom-6 right-6"
      style={{ perspective: "560px" }}
      aria-hidden="true"
    >
      <div
        className="vault layer relative"
        style={{ width: S * 2, height: S * 2 }}
      >
        {/* Four walls and a floor. No ceiling — the lid is open. */}
        <span
          className={face}
          style={{ inset: 0, transform: `translateZ(-${S}px)` }}
        />
        <span
          className={face}
          style={{ inset: 0, transform: `rotateY(90deg) translateZ(${S}px)` }}
        />
        <span
          className={face}
          style={{ inset: 0, transform: `rotateY(-90deg) translateZ(${S}px)` }}
        />
        <span
          className={face}
          style={{ inset: 0, transform: `rotateX(-90deg) translateZ(${S}px)` }}
        />

        {/* The lid, standing open on its hinge. White, so the eye reads it as
            the thing that was lifted. */}
        <span
          className="absolute border border-vellum/70 bg-vellum/10"
          style={{
            inset: 0,
            transformOrigin: "top center",
            transform: `rotateX(90deg) translateZ(${S}px) rotateX(-118deg)`,
          }}
        />
      </div>

      <style>{`
        .vault {
          transform-style: preserve-3d;
          animation: vault-turn 14s linear infinite;
        }
        @keyframes vault-turn {
          from { transform: rotateX(-20deg) rotateY(0deg); }
          to   { transform: rotateX(-20deg) rotateY(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .vault { animation: none; transform: rotateX(-20deg) rotateY(-32deg); }
        }
      `}</style>
    </div>
  );
}
