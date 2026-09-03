"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * The cursor.
 *
 * The native cursor stays and does its job: the hand over anything you can
 * click, the I-beam over text, the grab hand on the 3D stages. On top of it
 * rides a small ink dot and a ring that follows on a spring. Over a link or
 * a button the ring opens wide and the dot shrinks, so the target reads as
 * acquired before you press. Over a text field both fold away. While you
 * drag a stage the ring becomes a pair of brackets.
 *
 * Drawn with mix-blend-mode: difference, so it is white on the dark sections
 * and black on the paper without ever being told which it is on. Never
 * rendered on touch devices.
 */
type Mode = "idle" | "link" | "text" | "grab";

export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const [visible, setVisible] = useState(false);
  const [down, setDown] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 420, damping: 32, mass: 0.5 });
  const ry = useSpring(y, { stiffness: 420, damping: 32, mass: 0.5 });

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);

    const modeFor = (el: Element | null): Mode => {
      if (!el) return "idle";
      if (el.closest("input, textarea, select, [contenteditable='true']")) return "text";
      if (el.closest("[data-cursor='grab']")) return "grab";
      if (el.closest("a[href], button:not(:disabled), [role='button'], label[for], summary")) return "link";
      return "idle";
    };

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      setMode(modeFor(e.target as Element));
    };
    const onLeave = () => setVisible(false);
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [x, y]);

  if (!enabled) return null;

  const ring = mode === "link" ? 44 : mode === "grab" ? 36 : mode === "text" ? 0 : 28;
  const dot = mode === "link" ? 3 : mode === "text" ? 0 : down ? 10 : 6;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90] hidden sm:block" style={{ mixBlendMode: "difference" }}>
      {/* The dot: on the pointer, no lag. */}
      <motion.div
        className="absolute rounded-full bg-white"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ width: dot, height: dot, opacity: visible ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
      {/* The ring: follows on a spring, opens over targets. */}
      <motion.div
        className="absolute rounded-full border border-white"
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: ring,
          height: ring,
          opacity: visible && mode !== "text" ? (mode === "link" ? 0.9 : 0.5) : 0,
          scale: down ? 0.85 : 1,
          borderRadius: mode === "grab" ? "22%" : "50%",
          rotate: mode === "grab" ? 45 : 0,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      />
    </div>
  );
}
