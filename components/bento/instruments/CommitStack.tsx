"use client";

import { commitTrail, severity } from "@/brand";

/**
 * A stack of commits, rendered as physical slabs in Z.
 *
 * The newest commit — the one that removed the key — sits on top and is clean.
 * The ones underneath still contain it. On hover the stack fans apart so you
 * can see past the top slab, which is the entire point being made: the thing
 * you deleted is still under there.
 *
 * Built from CSS translateZ inside the card's existing preserve-3d context, so
 * it inherits the card's pointer tilt for free and costs nothing to render.
 * The fan-out is a group-hover transform swap — no React state, no re-render
 * while the pointer moves.
 */
export default function CommitStack() {
  const slabs = commitTrail.commits;

  return (
    <div
      className="group/stack layer relative mt-6 h-[190px] w-full"
      style={{ perspective: "900px" }}
    >
      <div
        className="layer absolute inset-0"
        style={{ transform: "rotateX(16deg) rotateZ(-2deg)" }}
      >
        {slabs.map((commit, i) => {
          const exposed = commit.state === "exposed";

          return (
            <div
              key={commit.hash}
              className="layer absolute inset-x-0 top-4 rounded-lg border px-3.5 py-2.5 transition-transform duration-500 ease-[var(--ease-settle)] [transform:var(--rest)] group-hover/stack:[transform:var(--open)]"
              style={
                {
                  // Resting: a tight stack. Open: fanned apart in Y and Z.
                  "--rest": `translate3d(0, ${i * 30}px, ${-i * 8}px)`,
                  "--open": `translate3d(0, ${i * 34}px, ${-i * 26}px)`,
                  borderColor: exposed ? "rgba(255,255,255,0.30)" : "#1F1F1F",
                  background: exposed ? "#161616" : "#0A0A0A",
                  boxShadow: `0 ${8 + i * 2}px ${20 + i * 5}px rgba(0,0,0,0.5)`,
                  zIndex: slabs.length - i,
                } as React.CSSProperties
              }
            >
              <div className="flex items-center gap-3">
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ background: exposed ? severity.critical : "#333333" }}
                />
                <span className="shrink-0 font-mono text-[0.6875rem] text-faint">
                  {commit.hash}
                </span>
                <span className="truncate font-mono text-[0.6875rem] text-muted">
                  {commit.message}
                </span>
                {exposed && (
                  <span
                    className="ml-auto shrink-0 font-mono text-[0.625rem] uppercase tracking-[0.14em]"
                    style={{ color: severity.critical }}
                  >
                    key
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
