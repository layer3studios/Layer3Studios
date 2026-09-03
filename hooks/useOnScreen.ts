"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Is this element currently on screen?
 *
 * Used to park WebGL canvases that have scrolled away. Two always-running
 * canvases far down a long page is a meaningful battery cost on a phone for
 * something nobody is looking at.
 */
export function useOnScreen<T extends HTMLElement>(rootMargin = "200px") {
  const ref = useRef<T>(null);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, onScreen };
}
