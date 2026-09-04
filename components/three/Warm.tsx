"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

/**
 * Warms a canvas right after it mounts: compiles every material's shaders
 * and draws one frame while the stage is still off-screen. Without this,
 * all of that happens on the first frame the stage scrolls into view, and
 * the page stalls for as long as the GPU takes (seconds on weak hardware).
 *
 * `delay` staggers the work so several canvases on one page do not all
 * compile in the same frame. The second pass catches materials that change
 * after an environment map loads.
 */
export default function Warm({ delay = 0 }: { delay?: number }) {
  const { gl, scene, camera, invalidate } = useThree();
  useEffect(() => {
    const run = () => {
      try {
        gl.compile(scene, camera);
      } catch {
        /* a material that is not ready yet simply compiles on its first frame */
      }
      invalidate();
    };
    const a = window.setTimeout(run, delay);
    const b = window.setTimeout(run, delay + 2000);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [gl, scene, camera, invalidate, delay]);
  return null;
}
