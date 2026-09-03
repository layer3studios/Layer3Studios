"use client";

import { severityLabel, severityWeight, type SeverityLevel } from "@/brand";

/**
 * Severity, without colour.
 *
 * Four marks. Filled ones count up to the level; the rest stay hollow.
 * Critical is four solid, low is one. Fill carries the meaning, so it survives
 * being read by a colourblind visitor, printed in black and white, or
 * screenshotted into a grey Slack thread — none of which a red/amber/green
 * scale survives.
 */
export default function SeverityMark({
  level,
  showLabel = true,
}: {
  level: SeverityLevel;
  showLabel?: boolean;
}) {
  const filled = severityWeight[level];

  return (
    <span className="flex items-center gap-2.5">
      <span
        className="flex items-center gap-[3px]"
        role="img"
        aria-label={`Severity: ${severityLabel[level]}`}
      >
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            aria-hidden="true"
            className="block size-[7px]"
            style={
              i < filled
                ? { background: "#FFFFFF" }
                : { border: "1px solid #333333" }
            }
          />
        ))}
      </span>

      {showLabel && (
        <span
          className="font-mono text-[0.6875rem] uppercase tracking-[0.16em]"
          style={{ color: filled >= 3 ? "#FFFFFF" : "#9A9A9A" }}
        >
          {severityLabel[level]}
        </span>
      )}
    </span>
  );
}
