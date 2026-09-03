"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BoxGeometry,
  Color,
  type Group,
  type InstancedMesh,
  MathUtils,
  type Mesh,
  type MeshStandardMaterial,
  Object3D,
  type PointLight,
  Vector3,
} from "three";

/**
 * The vault.
 *
 * A glass chamber with your code inside it, acting out the chain of custody:
 *
 *   0  empty      the chamber, waiting.
 *   1  sent       the slab (your code) flies in from the right and settles.
 *   2  sealed     a ring closes around the chamber; the glass firms up.
 *   3  read       one light circles the chamber and a scan line sweeps the
 *                 slab, top to bottom, over and over. Nothing else moves.
 *   4  report     a white sheet rises out of the chamber and hangs above it.
 *   5  deleted    the slab bursts into particles that drift and fade. The
 *                 chamber is empty again.
 *
 * Everything eases toward its target each frame, so scrolling back and forth
 * plays the sequence in either direction.
 */

const PARTICLES = 420;
const WHITE = new Color("#ffffff");

const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function Scene({ state, pointer }: { state: number; pointer: React.RefObject<{ x: number; y: number }> }) {
  const rig = useRef<Group>(null);
  const slab = useRef<Mesh>(null);
  const slabMat = useRef<MeshStandardMaterial>(null);
  const glass = useRef<Mesh>(null);
  const glassMat = useRef<MeshStandardMaterial>(null);
  const ring = useRef<Mesh>(null);
  const scan = useRef<Mesh>(null);
  const orbit = useRef<PointLight>(null);
  const sheet = useRef<Mesh>(null);
  const dust = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const chamberGeo = useMemo(() => new BoxGeometry(2.2, 2.8, 2.2), []);

  // Eased scalars.
  const v = useRef({ slabIn: 0, seal: 0, read: 0, report: 0, gone: 0, glass: 0.05 });
  const slabPos = useMemo(() => new Vector3(4, 0.6, 0), []);

  const seeds = useMemo(
    () =>
      Array.from({ length: PARTICLES }, (_, i) => ({
        // Start inside the slab volume.
        x: (rnd(i, 1) - 0.5) * 1.1,
        y: (rnd(i, 2) - 0.5) * 1.4,
        z: (rnd(i, 3) - 0.5) * 0.1,
        dx: (rnd(i, 4) - 0.5) * 3.2,
        dy: (rnd(i, 5) - 0.2) * 3.4,
        dz: (rnd(i, 6) - 0.5) * 3.2,
        s: 0.5 + rnd(i, 7),
      })),
    [],
  );

  useEffect(() => {
    const m = dust.current;
    if (!m) return;
    for (let i = 0; i < PARTICLES; i++) m.setColorAt(i, WHITE);
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, []);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const k = 1 - Math.exp(-4 * dt);
    const V = v.current;
    V.slabIn = MathUtils.lerp(V.slabIn, state >= 1 && state < 5 ? 1 : 0, k);
    V.seal = MathUtils.lerp(V.seal, state >= 2 && state < 5 ? 1 : 0, k);
    V.read = MathUtils.lerp(V.read, state === 3 ? 1 : 0, k);
    V.report = MathUtils.lerp(V.report, state >= 4 ? 1 : 0, k);
    V.gone = MathUtils.lerp(V.gone, state >= 5 ? 1 : 0, 1 - Math.exp(-2.2 * dt));
    V.glass = MathUtils.lerp(V.glass, state >= 2 && state < 5 ? 0.16 : 0.05, k);

    // The slab: flies in from the right, hovers, and shrinks away when deleted.
    if (slab.current && slabMat.current) {
      slabPos.set(MathUtils.lerp(4.2, 0, V.slabIn), Math.sin(t * 1.1) * 0.05, 0);
      slab.current.position.copy(slabPos);
      slab.current.rotation.y = MathUtils.lerp(0.9, 0, V.slabIn) + Math.sin(t * 0.6) * 0.08;
      const s = (1 - V.gone) * MathUtils.lerp(0.6, 1, V.slabIn);
      slab.current.scale.setScalar(Math.max(0.0001, s));
      slabMat.current.emissiveIntensity = 0.35 + V.read * 0.9 + Math.sin(t * 2) * 0.08;
      slabMat.current.opacity = MathUtils.lerp(0.3, 1, V.slabIn) * (1 - V.gone);
    }

    // The chamber firms up when sealed.
    if (glassMat.current) glassMat.current.opacity = V.glass;

    // The seal: a ring that closes from wide to snug.
    if (ring.current) {
      const rs = MathUtils.lerp(2.6, 1.0, V.seal);
      ring.current.scale.set(rs, rs, rs);
      ring.current.rotation.z = t * 0.15;
      (ring.current.material as MeshStandardMaterial).opacity = V.seal;
    }

    // The scan line and the orbiting light: only while being read.
    if (scan.current) {
      const y = ((t * 0.55) % 1.6) - 0.8;
      scan.current.position.y = y;
      (scan.current.material as MeshStandardMaterial).opacity = V.read * 0.9;
      scan.current.scale.x = V.read;
    }
    if (orbit.current) {
      orbit.current.position.set(Math.cos(t * 1.4) * 2.2, Math.sin(t * 0.9) * 0.8, Math.sin(t * 1.4) * 2.2);
      orbit.current.intensity = V.read * 12;
    }

    // The report rises out of the top and hangs there, tilted.
    if (sheet.current) {
      sheet.current.position.set(0.2 * V.report, MathUtils.lerp(-0.2, 1.85, V.report) + Math.sin(t * 1.3) * 0.04 * V.report, 0.4 * V.report);
      sheet.current.rotation.set(-0.35 * V.report, 0.25 * V.report, 0.1 * V.report);
      sheet.current.scale.setScalar(Math.max(0.0001, V.report));
    }

    // Deletion: particles from the slab volume, thrown outward and fading.
    if (dust.current) {
      const m = dust.current;
      const g = V.gone;
      for (let i = 0; i < PARTICLES; i++) {
        const p = seeds[i];
        const e = g * g;
        dummy.position.set(p.x + p.dx * e, p.y + p.dy * e - e * e * 1.2, p.z + p.dz * e);
        dummy.rotation.set(e * 6 * p.s, e * 4, 0);
        const sc = g < 0.02 ? 0 : 0.028 * p.s * (1 - g * 0.85);
        dummy.scale.setScalar(Math.max(0.0001, sc));
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
      }
      m.instanceMatrix.needsUpdate = true;
    }

    // The rig turns slowly and leans toward the pointer.
    if (rig.current) {
      const px = pointer.current?.x ?? 0;
      const py = pointer.current?.y ?? 0;
      rig.current.rotation.y = MathUtils.damp(rig.current.rotation.y, t * 0.18 + px * 0.5, 3, dt);
      rig.current.rotation.x = MathUtils.damp(rig.current.rotation.x, 0.18 - py * 0.25, 3, dt);
    }
  });

  return (
    <group ref={rig}>
      {/* The chamber. */}
      <mesh ref={glass}>
        <boxGeometry args={[2.2, 2.8, 2.2]} />
        <meshStandardMaterial ref={glassMat} color="#ffffff" transparent opacity={0.05} roughness={0.1} metalness={0.2} depthWrite={false} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[chamberGeo]} />
        <lineBasicMaterial color="#ffffff" transparent opacity={0.45} />
      </lineSegments>

      {/* The seal. */}
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.75, 0.035, 12, 96]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} transparent opacity={0} />
      </mesh>

      {/* Your code. */}
      <mesh ref={slab}>
        <boxGeometry args={[1.1, 1.4, 0.08]} />
        <meshStandardMaterial ref={slabMat} color="#f2f2f2" emissive="#ffffff" emissiveIntensity={0.4} roughness={0.4} transparent />
      </mesh>

      {/* The scan line. */}
      <mesh ref={scan}>
        <boxGeometry args={[1.4, 0.012, 0.3]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3} transparent opacity={0} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight ref={orbit} color="#ffffff" intensity={0} distance={6} decay={2} />

      {/* The report. */}
      <mesh ref={sheet} scale={0.0001}>
        <boxGeometry args={[0.9, 1.2, 0.02]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} roughness={0.8} />
      </mesh>

      {/* The dust. */}
      <instancedMesh ref={dust} args={[undefined, undefined, PARTICLES]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </instancedMesh>
    </group>
  );
}

function Frame() {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.position.set(0, 0.2, size.width < 640 ? 8.6 : 7.2);
    camera.updateProjectionMatrix();
  }, [camera, size.width]);
  return null;
}

export default function VaultModel({
  state,
  active,
  pointer,
}: {
  state: number;
  active: boolean;
  pointer: React.RefObject<{ x: number; y: number }>;
}) {
  return (
    <Canvas
      camera={{ fov: 32, position: [0, 0.2, 7.2] }}
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      onCreated={({ gl }) => gl.setClearAlpha(0)}
    >
      <Frame />
      <ambientLight intensity={0.35} />
      <directionalLight position={[-4, 5, 6]} intensity={1.8} />
      <directionalLight position={[5, -2, -4]} intensity={0.5} />
      <Scene state={state} pointer={pointer} />
    </Canvas>
  );
}
