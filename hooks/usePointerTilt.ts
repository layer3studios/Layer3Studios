"use client";

import { useCallback, useRef } from "react";
import { useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { maxTilt, tiltSpring } from "@/brand";

interface TiltResult {
  /** Spread onto the tilting element. */
  bind: {
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => void;
    onPointerLeave: () => void;
    onPointerEnter: () => void;
  };
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  /** 0→1 pointer position within the element. Drives the specular sweep. */
  px: MotionValue<number>;
  py: MotionValue<number>;
  /** 0 when idle, 1 while the pointer is over the element. */
  hovered: MotionValue<number>;
}

/**
 * Pointer-driven 3D tilt.
 *
 * Reads the pointer position against the element's own box and maps it to a
 * bounded rotation. Everything runs on MotionValues, so nothing here triggers
 * a React render while the pointer moves.
 *
 * Touch devices never call onPointerMove with a hover, so on mobile the tilt
 * simply stays at rest and the tap interaction carries the interest instead.
 */
export function usePointerTilt(strength = 1): TiltResult {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const hovered = useMotionValue(0);

  // Cache the rect so we don't force layout on every pointer move.
  const rect = useRef<DOMRect | null>(null);

  const onPointerEnter = useCallback(() => {
    hovered.set(1);
  }, [hovered]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      // Coarse pointers report a move on tap; tilting on tap feels broken.
      if (e.pointerType === "touch") return;

      if (!rect.current) rect.current = e.currentTarget.getBoundingClientRect();
      const r = rect.current;
      px.set((e.clientX - r.left) / r.width);
      py.set((e.clientY - r.top) / r.height);
    },
    [px, py],
  );

  const onPointerLeave = useCallback(() => {
    rect.current = null;
    hovered.set(0);
    px.set(0.5);
    py.set(0.5);
  }, [hovered, px, py]);

  const limit = maxTilt * strength;

  const rotateX = useSpring(useTransform(py, [0, 1], [limit, -limit]), tiltSpring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-limit, limit]), tiltSpring);

  return {
    bind: { onPointerMove, onPointerLeave, onPointerEnter },
    rotateX,
    rotateY,
    px,
    py,
    hovered,
  };
}
