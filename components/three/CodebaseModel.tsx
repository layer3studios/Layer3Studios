"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, type Group, type InstancedMesh, MathUtils, type Mesh, Object3D, Quaternion, Euler, Vector3 } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { makeFileTexture } from "@/components/three/paper";
import type { StagePointer } from "@/hooks/useStagePointer";

/**
 * The codebase, as an object.
 *
 * Forty thin slabs, one per file, that hold one shape per check and slide
 * between shapes as the reader scrolls from one check to the next. Nothing
 * is loaded: the whole thing is one instanced mesh and a small key.
 *
 *   idle       a neat stack. Everything looks fine from the outside.
 *   secrets    one file slides out of the stack, lit, and the key inside it
 *              appears: the one line the repo hoped nobody would read.
 *   leaks      the stack fans open like a hand of cards. Two of the files
 *              are lit: the routes that answer to anyone.
 *   structure  the stack comes apart into a cloud. One slab is four times
 *              the size of the rest: the file that does everything.
 *   duplicate  four small stacks, side by side. Three are identical; the
 *              fourth leans the other way and is lit.
 *
 * Every instance eases toward its target position, rotation, scale and
 * colour each frame, so a change of state is a rearrangement you can watch
 * rather than a cut.
 */

export type CodebaseState = "idle" | "secrets" | "leaks" | "structure" | "duplicate";

const N = 40;
const LIT = new Color("#ffffff");
const DIM = new Color("#6a6762");
const MID = new Color("#9a968f");

/** Deterministic pseudo-random per index. */
const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

interface Target {
  p: Vector3;
  r: Euler;
  s: Vector3;
  c: Color;
}

function targets(state: CodebaseState): Target[] {
  const out: Target[] = [];
  for (let i = 0; i < N; i++) {
    const t: Target = { p: new Vector3(), r: new Euler(), s: new Vector3(1, 1, 1), c: DIM.clone() };
    const stackY = (i - N / 2) * 0.075;

    if (state === "idle") {
      t.p.set(0, stackY, 0);
      t.c.copy(i % 7 === 3 ? MID : DIM);
    } else if (state === "secrets") {
      t.p.set(0, stackY, 0);
      if (i === 17) {
        t.p.set(1.25, stackY, 0.35);
        t.r.set(0, 0.25, 0);
        t.c.copy(LIT);
      }
    } else if (state === "leaks") {
      const a = (i / N - 0.5) * 2.2;
      t.p.set(Math.sin(a) * 1.35, (i / N - 0.5) * 0.5, Math.cos(a) * 1.35 - 0.6);
      t.r.set(0.1, a, 0.15);
      const open = i === 9 || i === 27;
      t.c.copy(open ? LIT : i % 5 === 0 ? MID : DIM);
      if (open) t.p.multiplyScalar(1.18);
    } else if (state === "structure") {
      t.p.set((rnd(i, 1) - 0.5) * 3.4, (rnd(i, 2) - 0.5) * 2.6, (rnd(i, 3) - 0.5) * 2.4);
      t.r.set(rnd(i, 4) * Math.PI, rnd(i, 5) * Math.PI, rnd(i, 6) * Math.PI);
      if (i === 20) {
        t.p.set(0, 0, 0.2);
        t.r.set(0.3, 0.5, 0);
        t.s.set(2.4, 3, 2.4);
        t.c.copy(LIT);
      }
    } else {
      const stack = i % 4;
      const j = Math.floor(i / 4);
      const x = (stack - 1.5) * 0.95;
      t.p.set(x, (j - 5) * 0.11, 0);
      t.s.set(0.62, 1, 0.62);
      if (stack === 3) {
        t.r.set(0, 0.55, 0.08);
        t.c.copy(j % 3 === 0 ? LIT : MID);
      }
    }
    out.push(t);
  }
  return out;
}

function Slabs({ state, pointer }: { state: CodebaseState; pointer: React.RefObject<StagePointer> }) {
  const mesh = useRef<InstancedMesh>(null);
  const key = useRef<Mesh>(null);
  const group = useRef<Group>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const goal = useMemo(() => targets(state), [state]);
  const paper = useMemo(() => makeFileTexture(3), []);
  const geo = useMemo(() => new RoundedBoxGeometry(1.25, 0.06, 0.85, 3, 0.02), []);
  useEffect(() => () => { paper.dispose(); geo.dispose(); }, [paper, geo]);

  /**
   * Live bodies. Each file is a small rigid body: a spring pulls it toward
   * its target, drag bleeds off speed, and files that would pass through
   * each other are pushed apart along the axis where they overlap least.
   * The files are thin boxes, so the overlap test is box-shaped too: a
   * neat stack (0.075 apart, 0.06 thick) is not a collision, but two files
   * crossing mid-flight is, and they slide around each other instead.
   */
  const live = useMemo(
    () =>
      Array.from({ length: N }, (_, i) => ({
        p: new Vector3(0, (i - N / 2) * 0.075, 0),
        v: new Vector3(),
        q: new Quaternion(),
        s: new Vector3(1, 1, 1),
        c: DIM.clone(),
      })),
    [],
  );
  const qGoal = useMemo(() => new Quaternion(), []);
  const tmp = useMemo(() => new Vector3(), []);

  const STIFFNESS = 38; // spring toward the target
  const DRAG = 6.5; // per-second velocity decay
  const HALF_X = 0.64;
  const HALF_Y = 0.03;
  const HALF_Z = 0.44;
  const PUSH = 26; // separation strength
  const keyScale = useRef(0);
  const turn = useRef(0);

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    for (let i = 0; i < N; i++) m.setColorAt(i, live[i].c);
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [live]);

  useFrame(({ clock }, dt) => {
    const m = mesh.current;
    if (!m) return;
    const step = Math.min(dt, 1 / 30);
    const k = 1 - Math.exp(-4.5 * step);
    const damp = Math.exp(-DRAG * step);

    // 1. Springs and drag.
    for (let i = 0; i < N; i++) {
      const L = live[i];
      const G = goal[i];
      tmp.copy(G.p).sub(L.p).multiplyScalar(STIFFNESS * step);
      L.v.add(tmp).multiplyScalar(damp);
    }

    // 2. Separation. Box overlap in the stack's own frame, scaled by size.
    for (let i = 0; i < N; i++) {
      const A = live[i];
      for (let j = i + 1; j < N; j++) {
        const B = live[j];
        const sx = HALF_X * (A.s.x + B.s.x);
        const sy = HALF_Y * (A.s.y + B.s.y) + 0.002;
        const sz = HALF_Z * (A.s.z + B.s.z);
        const dx = B.p.x - A.p.x;
        const dy = B.p.y - A.p.y;
        const dz = B.p.z - A.p.z;
        const ox = sx - Math.abs(dx);
        const oy = sy - Math.abs(dy);
        const oz = sz - Math.abs(dz);
        if (ox <= 0 || oy <= 0 || oz <= 0) continue;
        // Resolve along the thinnest overlap, as two real sheets would.
        const rx = ox / sx;
        const ry = oy / sy;
        const rz = oz / sz;
        let fx = 0;
        let fy = 0;
        let fz = 0;
        if (ry <= rx && ry <= rz) fy = (dy >= 0 ? 1 : -1) * oy * PUSH * 8;
        else if (rx <= rz) fx = (dx >= 0 ? 1 : -1) * ox * PUSH;
        else fz = (dz >= 0 ? 1 : -1) * oz * PUSH;
        A.v.x -= fx * step;
        A.v.y -= fy * step;
        A.v.z -= fz * step;
        B.v.x += fx * step;
        B.v.y += fy * step;
        B.v.z += fz * step;
      }
    }

    // 3. Integrate, and ease the properties that are not physical.
    for (let i = 0; i < N; i++) {
      const L = live[i];
      const G = goal[i];
      L.p.addScaledVector(L.v, step);
      qGoal.setFromEuler(G.r);
      L.q.slerp(qGoal, k);
      L.s.lerp(G.s, k);
      L.c.lerp(G.c, k);

      // Breath: a slow ripple through the stack so it is never frozen.
      const breathe = Math.sin(clock.elapsedTime * 1.2 + i * 0.35) * 0.006;
      dummy.position.copy(L.p);
      dummy.position.y += breathe;
      dummy.quaternion.copy(L.q);
      dummy.scale.copy(L.s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      m.setColorAt(i, L.c);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;

    // The key inside the pulled-out file.
    if (key.current) {
      const want = state === "secrets" ? 1 : 0;
      keyScale.current = MathUtils.damp(keyScale.current, want, 6, dt);
      key.current.scale.setScalar(keyScale.current * 0.16);
      key.current.position.set(live[17].p.x, live[17].p.y + 0.16, live[17].p.z);
      key.current.rotation.y += dt * 1.4;
    }

    // The whole object turns slowly, leans toward the pointer, and can be
    // dragged. Turn accumulates per rendered frame, never from the clock, so
    // a parked stage resumes where it stopped instead of spinning to catch up.
    if (group.current) {
      const P = pointer.current;
      turn.current += step * 0.12;
      if (P && !P.down) {
        P.rot += P.vel;
        P.vel *= Math.exp(-2.2 * step);
      }
      const px = P?.x ?? 0;
      const py = P?.y ?? 0;
      group.current.rotation.y = MathUtils.damp(group.current.rotation.y, turn.current + (P?.rot ?? 0) + px * 0.35, 5, step);
      group.current.rotation.x = MathUtils.damp(group.current.rotation.x, 0.28 - py * 0.3 + (P?.tilt ?? 0), 5, step);
    }
  });

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[geo, undefined, N]} frustumCulled={false}>
        <meshStandardMaterial map={paper} color="#ffffff" roughness={0.85} metalness={0} />
      </instancedMesh>
      <mesh ref={key} scale={0}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#d9a441" emissive="#d9a441" emissiveIntensity={1.1} roughness={0.25} metalness={0.6} />
      </mesh>
    </group>
  );
}

function Resize() {
  // Keep the object framed on narrow viewports.
  const { camera, size } = useThree();
  useEffect(() => {
    camera.position.z = size.width < 640 ? 7.5 : 6;
    camera.updateProjectionMatrix();
  }, [camera, size.width]);
  return null;
}

export default function CodebaseModel({
  state,
  active,
  pointer,
}: {
  state: CodebaseState;
  /** Parks the frame loop when the stage is off screen. */
  active: boolean;
  pointer: React.RefObject<StagePointer>;
}) {
  return (
    <Canvas
      camera={{ fov: 34, position: [0, 0, 6] }}
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      onCreated={({ gl }) => gl.setClearAlpha(0)}
    >
      <Resize />
      <ambientLight intensity={0.6} />
      <directionalLight position={[-4, 5, 6]} intensity={2.8} />
      <directionalLight position={[5, -3, -4]} intensity={0.7} />
      <pointLight position={[0, 0, 3]} intensity={6} distance={9} decay={2} />
      <Slabs state={state} pointer={pointer} />
    </Canvas>
  );
}
