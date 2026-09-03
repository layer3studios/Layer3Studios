"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth scrolling.
 *
 * The hand-off between the hero and the grid read badly partly because native
 * scroll snaps section-to-section with no weight to it. Lenis gives the page
 * momentum, so leaving the hero feels like the lens is being pulled away
 * rather than the page jumping.
 *
 * ScrollTrigger has to be driven from Lenis's own loop, or the pinned Proof
 * section calculates against a scroll position that is no longer authoritative.
 *
 * Disabled entirely under prefers-reduced-motion: hijacking scroll is exactly
 * the kind of thing that setting is asking us not to do.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      // Long, flat tail. Matches the settle easing used everywhere else.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Native scrolling on touch. Overriding it on a phone fights the OS and
      // always feels worse than the real thing.
      smoothWheel: true,
      touchMultiplier: 1,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const onRaf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onRaf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onRaf);
      lenis.destroy();
    };
  }, []);

  return null;
}
