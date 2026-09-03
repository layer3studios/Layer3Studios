"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useMemo, useRef, type RefObject } from "react";
import { Color, type Group, type InstancedMesh, MathUtils, Object3D } from "three";

export type ModelKind = "shield" | "wrench" | "stack";

/**
 * Three small procedural models, one per service. No assets to download:
 * each is built from primitives at runtime, so they can never 404.
 *
 *   shield — the audit. An icosahedron inside a wireframe cage. On click the
 *            cage bursts outward and snaps back.
 *   wrench — the fixes. A torus knot that spins up hard on click and winds
 *            back down, like a tool being run.
 *   stack  — the build. A tower of cubes that scatters apart and rebuilds
 *            itself, one block at a time.
 *
 * `pulse` is a ref (0→1) the parent bumps on click; each model reads it every
 * frame and eases it back to zero. No React state crosses the frame loop.
 */

const WHITE = new Color("#ffffff");
const GREY = new Color("#5c5c5c");
/** On paper the objects are ink: near-black metal with a graphite wire. */
const INK = new Color("#1a1917");
const GRAPHITE = new Color("#6b675f");

function Shield({ pulse, ink, wire }: { pulse: RefObject<number>; ink: Color; wire: Color }) {
  const cage = useRef<Group>(null);
  const core = useRef<Group>(null);
  useFrame((_, dt) => {
    const p = pulse.current;
    if (cage.current) {
      cage.current.rotation.y += dt * 0.35;
      cage.current.rotation.x += dt * 0.12;
      const s = 1 + p * 0.55;
      cage.current.scale.setScalar(MathUtils.damp(cage.current.scale.x, s, 8, dt));
    }
    if (core.current) {
      core.current.rotation.y -= dt * 0.5;
      const s = 1 - p * 0.25;
      core.current.scale.setScalar(MathUtils.damp(core.current.scale.x, s, 8, dt));
    }
  });
  return (
    <>
      <group ref={core}>
        <mesh>
          <icosahedronGeometry args={[0.72, 1]} />
          <meshStandardMaterial color={ink} flatShading roughness={0.35} metalness={0.2} />
        </mesh>
      </group>
      <group ref={cage}>
        <mesh>
          <icosahedronGeometry args={[1.15, 1]} />
          <meshBasicMaterial color={ink} wireframe transparent opacity={0.55} />
        </mesh>
        <mesh rotation={[0.4, 0.8, 0]}>
          <icosahedronGeometry args={[1.32, 0]} />
          <meshBasicMaterial color={wire} wireframe transparent opacity={0.35} />
        </mesh>
      </group>
    </>
  );
}

function Wrench({ pulse, ink, wire }: { pulse: RefObject<number>; ink: Color; wire: Color }) {
  const g = useRef<Group>(null);
  const spin = useRef(0);
  useFrame((_, dt) => {
    spin.current = MathUtils.damp(spin.current, 0.45 + pulse.current * 9, 4, dt);
    if (g.current) {
      g.current.rotation.z += dt * spin.current;
      g.current.rotation.x = Math.sin(performance.now() * 0.0004) * 0.4;
    }
  });
  return (
    <group ref={g}>
      <mesh>
        <torusKnotGeometry args={[0.72, 0.22, 140, 18, 2, 3]} />
        <meshStandardMaterial color={ink} roughness={0.25} metalness={0.6} />
      </mesh>
      <mesh scale={1.06}>
        <torusKnotGeometry args={[0.72, 0.22, 70, 9, 2, 3]} />
        <meshBasicMaterial color={wire} wireframe transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

const STACK = 5;
function Stack({ pulse, ink, wire }: { pulse: RefObject<number>; ink: Color; wire: Color }) {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const g = useRef<Group>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: STACK * 3 }, (_, i) => ({
        x: (i % 3) - 1,
        y: Math.floor(i / 3),
        // Deterministic scatter direction per block.
        dx: Math.sin(i * 12.9898) * 1.6,
        dz: Math.cos(i * 78.233) * 1.6,
        r: Math.sin(i * 3.7) * 1.2,
      })),
    [],
  );
  const spread = useRef(0);
  useFrame((_, dt) => {
    spread.current = MathUtils.damp(spread.current, pulse.current, 6, dt);
    const m = mesh.current;
    if (!m) return;
    const s = spread.current;
    seeds.forEach((b, i) => {
      dummy.position.set(b.x * 0.5 + b.dx * s, (b.y - (STACK - 1) / 2) * 0.5 + s * 0.4 * (b.y - 2), b.dz * s);
      dummy.rotation.set(b.r * s, b.r * s * 0.7, 0);
      dummy.scale.setScalar(1 - s * 0.15);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    if (g.current) g.current.rotation.y += dt * 0.3;
  });
  return (
    <group ref={g} rotation={[0.3, 0.6, 0]}>
      <instancedMesh ref={mesh} args={[undefined, undefined, STACK * 3]}>
        <boxGeometry args={[0.44, 0.44, 0.44]} />
        <meshStandardMaterial color={ink} roughness={0.5} metalness={0.1} />
      </instancedMesh>
      <mesh>
        <boxGeometry args={[1.65, 2.65, 0.6]} />
        <meshBasicMaterial color={wire} wireframe transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

function Decay({ pulse }: { pulse: RefObject<number> }) {
  // The click impulse decays here so every model shares one clock.
  useFrame((_, dt) => {
    pulse.current = Math.max(0, pulse.current - dt * 0.9);
  });
  return null;
}

export default function ServiceModel({
  kind,
  pulse,
  active,
  paper = false,
}: {
  kind: ModelKind;
  pulse: RefObject<number>;
  /** Parks the frame loop when the card is off screen. */
  active: boolean;
  /** On a white section the object is drawn in ink. */
  paper?: boolean;
}) {
  const core = paper ? INK : WHITE;
  const wire = paper ? GRAPHITE : GREY;
  return (
    <Canvas
      camera={{ fov: 32, position: [0, 0, 6] }}
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      onCreated={({ gl }) => gl.setClearAlpha(0)}
    >
      <ambientLight intensity={paper ? 1.4 : 0.35} />
      <directionalLight position={[-3, 4, 5]} intensity={paper ? 3.2 : 2.2} />
      <directionalLight position={[4, -2, -3]} intensity={paper ? 1.6 : 0.6} />
      <Decay pulse={pulse} />
      <Float speed={1.6} rotationIntensity={0.4} floatIntensity={0.8}>
        {kind === "shield" && <Shield pulse={pulse} ink={core} wire={wire} />}
        {kind === "wrench" && <Wrench pulse={pulse} ink={core} wire={wire} />}
        {kind === "stack" && <Stack pulse={pulse} ink={core} wire={wire} />}
      </Float>
    </Canvas>
  );
}
