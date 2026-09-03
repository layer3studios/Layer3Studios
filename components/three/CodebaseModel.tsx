"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, type Group, type InstancedMesh, MathUtils, type Mesh, Object3D, Quaternion, Euler, Vector3 } from "three";

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
const DIM = new Color("#2c2c2c");
const MID = new Color("#5a5a5a");

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

function Slabs({ state, pointer }: { state: CodebaseState; pointer: React.RefObject<{ x: number; y: number }> }) {
  const mesh = useRef<InstancedMesh>(null);
  const key = useRef<Mesh>(null);
  const group = useRef<Group>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const goal = useMemo(() => targets(state), [state]);

  // Live values, eased toward the goal each frame.
  const live = useMemo(
    () =>
      Array.from({ length: N }, (_, i) => ({
        p: new Vector3(0, (i - N / 2) * 0.075, 0),
        q: new Quaternion(),
        s: new Vector3(1, 1, 1),
        c: DIM.clone(),
      })),
    [],
  );
  const qGoal = useMemo(() => new Quaternion(), []);
  const keyScale = useRef(0);

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    for (let i = 0; i < N; i++) m.setColorAt(i, live[i].c);
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [live]);

  useFrame(({ clock }, dt) => {
    const m = mesh.current;
    if (!m) return;
    const k = 1 - Math.exp(-4.5 * dt);
    for (let i = 0; i < N; i++) {
      const L = live[i];
      const G = goal[i];
      L.p.lerp(G.p, k);
      qGoal.setFromEuler(G.r);
      L.q.slerp(qGoal, k);
      L.s.lerp(G.s, k);
      L.c.lerp(G.c, k);

      // Breath: a slow ripple through the stack so it is never frozen.
      const breathe = Math.sin(clock.elapsedTime * 1.2 + i * 0.35) * 0.012;
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
      key.current.position.set(1.25, live[17].p.y + 0.16, 0.35);
      key.current.rotation.y += dt * 1.4;
    }

    // The whole object turns slowly and leans toward the pointer.
    if (group.current) {
      const px = pointer.current?.x ?? 0;
      const py = pointer.current?.y ?? 0;
      group.current.rotation.y = MathUtils.damp(group.current.rotation.y, clock.elapsedTime * 0.12 + px * 0.5, 3, dt);
      group.current.rotation.x = MathUtils.damp(group.current.rotation.x, 0.28 - py * 0.3, 3, dt);
    }
  });

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[undefined, undefined, N]} frustumCulled={false}>
        <boxGeometry args={[1.25, 0.05, 0.85]} />
        <meshStandardMaterial color="#ffffff" roughness={0.55} metalness={0.15} />
      </instancedMesh>
      <mesh ref={key} scale={0}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.4} roughness={0.2} />
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
  pointer: React.RefObject<{ x: number; y: number }>;
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
      <ambientLight intensity={0.5} />
      <directionalLight position={[-4, 5, 6]} intensity={2.4} />
      <directionalLight position={[5, -3, -4]} intensity={0.7} />
      <pointLight position={[0, 0, 3]} intensity={6} distance={9} decay={2} />
      <Slabs state={state} pointer={pointer} />
    </Canvas>
  );
}
