"use client";

import { motion } from "framer-motion";
import { endpointScan, severity } from "@/brand";
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities";

/**
 * A route table with a scan line running down it.
 *
 * A sweep passes over each route and
 * the unguarded ones stay lit behind it. The rows sit slightly forward of the
 * scan line in Z, so the beam appears to pass underneath them.
 */
export default function EndpointScan() {
  const { reducedMotion } = useDeviceCapabilities();
  const rowHeight = 30;
  const total = endpointScan.routes.length * rowHeight;

  return (
    <div className="layer relative mt-6 w-full overflow-hidden" style={{ height: total }}>
      {/* The beam. Sits behind the rows. */}
      {!reducedMotion && (
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 h-12"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(237,232,220,0.10), transparent)",
          }}
          animate={{ y: [-48, total] }}
          transition={{
            duration: 3.6,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 0.9,
          }}
        />
      )}

      <div className="layer relative" style={{ transform: "translateZ(18px)" }}>
        {endpointScan.routes.map((route) => (
          <div
            key={route.path}
            className="flex items-center gap-3 border-b border-ink-500/60 last:border-0"
            style={{ height: rowHeight }}
          >
            <span
              className="w-11 shrink-0 font-mono text-[0.625rem] uppercase tracking-[0.1em]"
              style={{ color: route.guarded ? "#5C5C5C" : severity.high }}
            >
              {route.method}
            </span>

            <span
              className="truncate font-mono text-[0.75rem]"
              style={{ color: route.guarded ? "#9A9A9A" : "#FFFFFF" }}
            >
              {route.path}
            </span>

            <span className="ml-auto shrink-0">
              {route.guarded ? (
                <span className="font-mono text-[0.625rem] text-faint">auth</span>
              ) : (
                <span
                  className="font-mono text-[0.625rem] uppercase tracking-[0.12em]"
                  style={{ color: severity.high }}
                >
                  open
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      <p
        className="layer mt-4 font-mono text-[0.6875rem]"
        style={{ color: severity.high, transform: "translateZ(30px)" }}
      >
        {endpointScan.finding}
      </p>
    </div>
  );
}
