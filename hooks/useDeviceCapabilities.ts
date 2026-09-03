"use client";

import { useEffect, useState } from "react";

export interface DeviceCapabilities {
  /** prefers-reduced-motion: reduce */
  reducedMotion: boolean;
  /** No hover — phones and tablets. Drives tap-vs-hover affordances. */
  coarsePointer: boolean;
  /**
   * Whether it is reasonable to run a heavy WebGL effect. False on reduced
   * motion, on very low core counts, and when the device reports save-data.
   */
  allowWebgl: boolean;
  /** Resolved once on the client. Guards against SSR/hydration mismatch. */
  ready: boolean;
}

/**
 * One place that answers "how much motion can this device take".
 *
 * The site is opened on desktops, Android phones and iPhones, so every heavy
 * effect asks here first rather than assuming a big machine.
 */
export function useDeviceCapabilities(): DeviceCapabilities {
  const [caps, setCaps] = useState<DeviceCapabilities>({
    reducedMotion: false,
    coarsePointer: false,
    allowWebgl: false,
    ready: false,
  });

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerQuery = window.matchMedia("(hover: none)");

    const resolve = () => {
      const reducedMotion = motionQuery.matches;
      const coarsePointer = pointerQuery.matches;

      const cores = navigator.hardwareConcurrency ?? 4;
      // Chromium-only, and intentionally optional.
      const saveData = (
        navigator as Navigator & { connection?: { saveData?: boolean } }
      ).connection?.saveData;

      setCaps({
        reducedMotion,
        coarsePointer,
        allowWebgl: !reducedMotion && cores > 2 && !saveData,
        ready: true,
      });
    };

    resolve();
    motionQuery.addEventListener("change", resolve);
    pointerQuery.addEventListener("change", resolve);
    return () => {
      motionQuery.removeEventListener("change", resolve);
      pointerQuery.removeEventListener("change", resolve);
    };
  }, []);

  return caps;
}
