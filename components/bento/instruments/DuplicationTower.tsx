"use client";

/**
 * Duplication, as an object.
 *
 * Four upright stacks of slabs — the same function, written four times. Three
 * are in lockstep. The fourth is white and runs out of phase, because one of
 * the four implementations disagrees with the other three.
 *
 * This was a WebGL canvas and it rendered empty on the page. Rather than debug
 * a context that may or may not exist on a given device, it is now CSS 3D: it
 * cannot fail to draw, it needs no fallback, it inherits the card's pointer
 * tilt for free, and it costs nothing. WebGL earns its place in the repo
 * vault, which has 150 moving parts. It never earned it for 24 boxes.
 */

const TOWERS = 4;
const SLABS = 6;
/** The stack whose implementation disagrees. */
const ODD_ONE = 2;

export default function DuplicationTower() {
  return (
    <div
      className="layer relative mt-5 w-full"
      style={{ height: 185, perspective: "700px" }}
      aria-hidden="true"
    >
      <div
        className="dup-rig layer absolute inset-0 flex items-center justify-center gap-5"
      >
        {Array.from({ length: TOWERS }).map((_, tower) => {
          const odd = tower === ODD_ONE;
          return (
            <div
              key={tower}
              className="layer relative"
              style={{
                width: 26,
                height: SLABS * 19,
                transform: `translateZ(${(tower - 1.5) * 24}px)`,
              }}
            >
              {Array.from({ length: SLABS }).map((_, slab) => (
                <span
                  key={slab}
                  className={`dup-slab absolute left-0 block rounded-[2px] border ${
                    odd ? "border-white/70" : "border-ink-400"
                  }`}
                  style={
                    {
                      width: 26,
                      height: 12,
                      top: slab * 19,
                      background: odd ? "#FFFFFF" : "#141414",
                      // The odd stack breathes faster and further, so the
                      // disagreement is legible before the caption is read.
                      "--amp": odd ? "10px" : "3px",
                      animationDuration: odd ? "1.9s" : "3.4s",
                      animationDelay: `${slab * (odd ? 0.09 : 0.16)}s`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          );
        })}
      </div>

      <style>{`
        .dup-slab {
          animation-name: dup-breathe;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          animation-direction: alternate;
        }
        @keyframes dup-breathe {
          from { transform: translateX(0); }
          to   { transform: translateX(var(--amp)); }
        }
        .dup-rig {
          transform-style: preserve-3d;
          animation: dup-turn 24s linear infinite;
        }
        @keyframes dup-turn {
          from { transform: rotateX(22deg) rotateY(-24deg); }
          to   { transform: rotateX(22deg) rotateY(336deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .dup-slab { animation: none; }
          .dup-rig  { animation: none; transform: rotateX(22deg) rotateY(-24deg); }
        }
      `}</style>
    </div>
  );
}
