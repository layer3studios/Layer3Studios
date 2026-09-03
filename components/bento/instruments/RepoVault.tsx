"use client";

/**
 * The repository as a solid object.
 *
 * A wireframe cube of stacked file-planes, turning continuously. Three cells
 * are findings: they sit proud of the surface and glow white.
 *
 * This was a react-three-fiber canvas and it rendered as an empty tile on the
 * page — a WebGL context that never arrived, with no way to tell from the
 * markup. It is now CSS 3D, which cannot silently fail to draw. That removes
 * the last WebGL dependency from the grid.
 */

/** Six faces of a cube, each positioned by a rotation and a push outward. */
const FACES = [
  { transform: "translateZ(var(--half))" },
  { transform: "rotateY(180deg) translateZ(var(--half))" },
  { transform: "rotateY(90deg) translateZ(var(--half))" },
  { transform: "rotateY(-90deg) translateZ(var(--half))" },
  { transform: "rotateX(90deg) translateZ(var(--half))" },
  { transform: "rotateX(-90deg) translateZ(var(--half))" },
];

/** Which cells on the front face are flagged. Deterministic. */
const FINDINGS = new Set([3, 9, 14]);
/** A second set, on the opposite face, so findings are visible at any angle. */
const FINDINGS_BACK = new Set([5, 10]);

export default function RepoVault() {
  return (
    <div
      className="layer relative mt-5 w-full"
      style={{ height: 200, perspective: "760px" }}
      aria-hidden="true"
    >
      <div className="vault-rig absolute left-1/2 top-1/2">
        {FACES.map((face, i) => (
          <span
            key={i}
            className="vault-face absolute grid grid-cols-4 grid-rows-4 border border-white/30 bg-ink-800/50"
            style={face}
          >
            {/* Only the front face carries findings — a cube lit on every side
                would read as decoration rather than as located problems. */}
            {Array.from({ length: 16 }).map((_, cell) => (
              <span
                key={cell}
                className="border-[0.5px] border-white/10"
                style={
                  (i === 0 && FINDINGS.has(cell)) ||
                  (i === 1 && FINDINGS_BACK.has(cell))
                    ? {
                        background: "#FFFFFF",
                        boxShadow: "0 0 16px rgba(255,255,255,0.75)",
                      }
                    : undefined
                }
              />
            ))}
          </span>
        ))}
      </div>

      <style>{`
        .vault-rig {
          --size: 140px;
          --half: 70px;
          width: var(--size);
          height: var(--size);
          margin-left: calc(var(--size) / -2);
          margin-top: calc(var(--size) / -2);
          transform-style: preserve-3d;
          animation: vault-spin 20s linear infinite;
        }
        .vault-face {
          width: var(--size);
          height: var(--size);
        }
        @keyframes vault-spin {
          from { transform: rotateX(-22deg) rotateY(0deg); }
          to   { transform: rotateX(-22deg) rotateY(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .vault-rig {
            animation: none;
            transform: rotateX(-22deg) rotateY(-32deg);
          }
        }
      `}</style>
    </div>
  );
}
