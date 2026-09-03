"use client";

import { useCallback, useRef } from "react";

/**
 * Pointer state for a 3D stage, kept in a ref so the frame loop reads it
 * without a React render.
 *
 *   x, y   normalised pointer position over the section (-1..1), for the
 *          gentle lean toward the cursor.
 *   rot    extra turn added by dragging, in radians. Persists.
 *   vel    turn velocity after a release, in radians per frame; the model
 *          applies it and bleeds it off, so a flick keeps the object turning.
 *   tilt   a small vertical tilt from dragging up or down.
 *   down   whether a drag is in progress.
 */
export interface StagePointer {
  x: number;
  y: number;
  rot: number;
  vel: number;
  tilt: number;
  down: boolean;
}

export function useStagePointer() {
  const pointer = useRef<StagePointer>({ x: 0, y: 0, rot: 0, vel: 0, tilt: 0, down: false });
  const last = useRef<{ x: number; y: number } | null>(null);

  const onSectionMove = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, []);

  const onStageDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    pointer.current.down = true;
    pointer.current.vel = 0;
    last.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onStageMove = useCallback((e: React.PointerEvent) => {
    if (!pointer.current.down || !last.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    const P = pointer.current;
    P.rot += dx * 0.008;
    P.vel = dx * 0.008 * 0.6;
    P.tilt = Math.max(-0.35, Math.min(0.35, P.tilt + dy * 0.003));
    last.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onStageUp = useCallback(() => {
    pointer.current.down = false;
    last.current = null;
  }, []);

  return {
    pointer,
    /** Spread onto the section, for the lean. */
    sectionBind: { onPointerMove: onSectionMove },
    /** For the stage: drag to turn. Vertical scrolling still passes through on touch. */
    stageBind: {
      onPointerDown: onStageDown,
      onPointerMove: onStageMove,
      onPointerUp: onStageUp,
      onPointerCancel: onStageUp,
      onPointerLeave: onStageUp,
    },
  };
}
