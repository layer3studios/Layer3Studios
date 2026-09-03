"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  type Group,
  type InstancedMesh,
  MathUtils,
  type Mesh,
  type MeshPhysicalMaterial,
  type MeshStandardMaterial,
  Object3D,
  type PointLight,
  type Points,
  SRGBColorSpace,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { makeFileTexture, makeReportTexture } from "@/components/three/paper";
import type { StagePointer } from "@/hooks/useStagePointer";

/**
 * The vault.
 *
 * A glass chamber on a plinth, with your code inside it, acting out the
 * chain of custody:
 *
 *   0  empty      the chamber, dust drifting in the light.
 *   1  sent       the file arcs in from the right and settles, hovering, a
 *                 soft shadow under it on the plinth.
 *   2  sealed     two tick-marked rings close around the chamber and a paper
 *                 NDA tag swings on the front. The glass firms up.
 *   3  read       one light circles the chamber, a scan line sweeps the file
 *                 and sparks lift off the lines it has read.
 *   4  report     a written sheet rises out of the top and hangs there.
 *   5  deleted    a flash, and the file bursts into paper dust that falls
 *                 to the plinth and fades. The chamber is empty again.
 *
 * Detail is where the realism lives: the frame is twelve metal bars with
 * corner nodes, the glass reflects a studio, the plinth has a lit edge that
 * reports the state, and nothing is ever perfectly still.
 */

const PARTICLES = 480;
const MOTES = 140;
const SPARKS = 90;
const WHITE = new Color("#ffffff");

const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** The NDA tag: a small paper label. */
function makeTagTexture(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#f2efe8";
  ctx.fillRect(0, 0, 256, 128);
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, 236, 108);
  ctx.fillStyle = "#111";
  ctx.font = "bold 44px ui-monospace, Menlo, monospace";
  ctx.textAlign = "center";
  ctx.fillText("NDA", 128, 62);
  ctx.font = "16px ui-monospace, Menlo, monospace";
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillText("SIGNED · HOUR 0", 128, 96);
  ctx.beginPath();
  ctx.arc(24, 24, 7, 0, Math.PI * 2);
  ctx.fillStyle = "#111";
  ctx.fill();
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

const CHAMBER = { w: 2.2, h: 2.8, d: 2.2 };

/** Twelve edges of the chamber as [position, size]. */
function frameBars(t: number): { p: [number, number, number]; s: [number, number, number] }[] {
  const { w, h, d } = CHAMBER;
  const hw = w / 2;
  const hh = h / 2;
  const hd = d / 2;
  const bars: { p: [number, number, number]; s: [number, number, number] }[] = [];
  for (const y of [-hh, hh]) {
    for (const z of [-hd, hd]) bars.push({ p: [0, y, z], s: [w + t, t, t] });
    for (const x of [-hw, hw]) bars.push({ p: [x, y, 0], s: [t, t, d + t] });
  }
  for (const x of [-hw, hw]) for (const z of [-hd, hd]) bars.push({ p: [x, 0, z], s: [t, h + t, t] });
  return bars;
}

function Scene({ state, pointer }: { state: number; pointer: React.RefObject<StagePointer> }) {
  const rig = useRef<Group>(null);
  const slab = useRef<Mesh>(null);
  const slabMat = useRef<MeshStandardMaterial>(null);
  const glassMat = useRef<MeshPhysicalMaterial>(null);
  const ringA = useRef<Mesh>(null);
  const ringB = useRef<Mesh>(null);
  const ticks = useRef<InstancedMesh>(null);
  const tag = useRef<Group>(null);
  const scan = useRef<Mesh>(null);
  const orbit = useRef<PointLight>(null);
  const orbitBulb = useRef<Mesh>(null);
  const sheet = useRef<Mesh>(null);
  const dust = useRef<InstancedMesh>(null);
  const motes = useRef<Points>(null);
  const sparks = useRef<Points>(null);
  const flash = useRef<PointLight>(null);
  const dummy = useMemo(() => new Object3D(), []);

  const fileTex = useMemo(() => makeFileTexture(11, { width: 1024, height: 1300 }), []);
  const reportTex = useMemo(() => makeReportTexture(), []);
  const tagTex = useMemo(() => makeTagTexture(), []);
  const slabGeo = useMemo(() => new RoundedBoxGeometry(1.1, 1.4, 0.09, 3, 0.03), []);
  const sheetGeo = useMemo(() => new RoundedBoxGeometry(0.9, 1.2, 0.02, 2, 0.01), []);
  const barGeo = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 2, 0.35), []);
  const bars = useMemo(() => frameBars(0.045), []);
  useEffect(
    () => () => {
      fileTex.dispose();
      reportTex.dispose();
      tagTex.dispose();
      slabGeo.dispose();
      sheetGeo.dispose();
      barGeo.dispose();
    },
    [fileTex, reportTex, tagTex, slabGeo, sheetGeo, barGeo],
  );

  // Eased scalars.
  const v = useRef({ slabIn: 0, seal: 0, read: 0, report: 0, gone: 0, glass: 0.06, flash: 0 });
  const prevState = useRef(state);
  const turn = useRef(0);
  const slabPos = useMemo(() => new Vector3(4, 0.6, 0), []);

  const seeds = useMemo(
    () =>
      Array.from({ length: PARTICLES }, (_, i) => ({
        x: (rnd(i, 1) - 0.5) * 1.1,
        y: (rnd(i, 2) - 0.5) * 1.4,
        z: (rnd(i, 3) - 0.5) * 0.1,
        dx: (rnd(i, 4) - 0.5) * 2.4,
        dy: (rnd(i, 5) - 0.1) * 2.2,
        dz: (rnd(i, 6) - 0.5) * 2.4,
        s: 0.4 + rnd(i, 7),
        spin: (rnd(i, 8) - 0.5) * 14,
      })),
    [],
  );
  const motePos = useMemo(() => {
    const a = new Float32Array(MOTES * 3);
    for (let i = 0; i < MOTES; i++) {
      a[i * 3] = (rnd(i, 21) - 0.5) * 2.0;
      a[i * 3 + 1] = (rnd(i, 22) - 0.5) * 2.6;
      a[i * 3 + 2] = (rnd(i, 23) - 0.5) * 2.0;
    }
    return a;
  }, []);
  const sparkPos = useMemo(() => new Float32Array(SPARKS * 3), []);

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

    // A deletion begins with a flash.
    if (state !== prevState.current) {
      if (state === 5) V.flash = 1;
      prevState.current = state;
    }
    V.flash = Math.max(0, V.flash - dt * 2.2);

    V.slabIn = MathUtils.lerp(V.slabIn, state >= 1 && state < 5 ? 1 : 0, k);
    V.seal = MathUtils.lerp(V.seal, state >= 2 && state < 5 ? 1 : 0, k);
    V.read = MathUtils.lerp(V.read, state === 3 ? 1 : 0, k);
    V.report = MathUtils.lerp(V.report, state >= 4 ? 1 : 0, k);
    V.gone = MathUtils.lerp(V.gone, state >= 5 ? 1 : 0, 1 - Math.exp(-1.8 * dt));
    V.glass = MathUtils.lerp(V.glass, state >= 2 && state < 5 ? 0.2 : 0.06, k);

    // The file: arcs in from the right, hovers with a slow bob and a
    // slight lean, and shrinks away when deleted.
    if (slab.current && slabMat.current) {
      const arc = Math.sin(V.slabIn * Math.PI) * 0.55;
      slabPos.set(MathUtils.lerp(4.4, 0, V.slabIn), 0.05 + arc + Math.sin(t * 1.1) * 0.04, 0);
      slab.current.position.copy(slabPos);
      slab.current.rotation.set(
        Math.sin(t * 0.7) * 0.03,
        MathUtils.lerp(1.1, 0, V.slabIn) + Math.sin(t * 0.5) * 0.06,
        MathUtils.lerp(-0.3, 0, V.slabIn),
      );
      const s = (1 - V.gone) * MathUtils.lerp(0.55, 1, V.slabIn);
      slab.current.scale.setScalar(Math.max(0.0001, s));
      slabMat.current.emissiveIntensity = 0.06 + V.read * 0.3 + Math.sin(t * 2) * 0.02;
      slabMat.current.opacity = MathUtils.lerp(0.3, 1, V.slabIn) * (1 - V.gone);
    }

    // Glass firms up when sealed.
    if (glassMat.current) glassMat.current.opacity = V.glass;

    // The seals: two rings that close from wide to snug, counter-rotating,
    // with tick marks riding the outer one, and a paper tag that swings.
    const rs = MathUtils.lerp(2.4, 1.0, V.seal);
    if (ringA.current) {
      ringA.current.scale.setScalar(rs);
      ringA.current.rotation.z = t * 0.12;
      (ringA.current.material as MeshStandardMaterial).opacity = V.seal;
    }
    if (ringB.current) {
      ringB.current.scale.setScalar(rs * 1.04);
      ringB.current.rotation.z = -t * 0.08;
      (ringB.current.material as MeshStandardMaterial).opacity = V.seal * 0.7;
    }
    if (ticks.current) {
      const m = ticks.current;
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2 + t * 0.12;
        const r = 1.78 * rs;
        dummy.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
        dummy.rotation.set(0, -a, 0);
        dummy.scale.setScalar(Math.max(0.0001, V.seal));
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
      }
      m.instanceMatrix.needsUpdate = true;
    }
    if (tag.current) {
      const a = t * 0.12 + Math.PI * 0.5;
      const r = 1.78 * rs;
      tag.current.position.set(Math.cos(a) * r, -0.32, Math.sin(a) * r);
      tag.current.rotation.set(0, -a + Math.PI / 2, Math.sin(t * 1.7) * 0.12 * V.seal);
      tag.current.scale.setScalar(Math.max(0.0001, V.seal));
    }

    // Reading: the scan line, the circling light, and sparks lifting off
    // the lines the light has just read.
    const scanY = ((t * 0.5) % 1.7) - 0.85;
    if (scan.current) {
      scan.current.position.set(slabPos.x, slabPos.y + scanY, slabPos.z);
      (scan.current.material as MeshStandardMaterial).opacity = V.read * 0.95;
      scan.current.scale.set(Math.max(0.0001, V.read), 1, 1);
    }
    if (orbit.current) {
      orbit.current.position.set(Math.cos(t * 1.3) * 2.0, Math.sin(t * 0.8) * 0.9, Math.sin(t * 1.3) * 2.0);
      orbit.current.intensity = V.read * 10;
      if (orbitBulb.current) {
        orbitBulb.current.position.copy(orbit.current.position);
        orbitBulb.current.scale.setScalar(Math.max(0.0001, V.read * 0.05));
      }
    }
    if (sparks.current) {
      const arr = sparks.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < SPARKS; i++) {
        const life = (t * 0.6 + rnd(i, 31)) % 1;
        arr[i * 3] = slabPos.x + (rnd(i, 32) - 0.5) * 1.0 + Math.sin(t * 2 + i) * 0.02;
        arr[i * 3 + 1] = slabPos.y + scanY + life * 0.5;
        arr[i * 3 + 2] = slabPos.z + 0.08 + life * 0.25;
      }
      sparks.current.geometry.attributes.position.needsUpdate = true;
      (sparks.current.material as { opacity: number }).opacity = V.read * 0.9;
    }

    // The report rises out of the top and hangs there, turning to face you.
    if (sheet.current) {
      sheet.current.position.set(
        0.15 * V.report,
        MathUtils.lerp(-0.2, 1.4, V.report) + Math.sin(t * 1.3) * 0.04 * V.report,
        0.35 * V.report,
      );
      sheet.current.rotation.set(-0.18 * V.report, 0.3 * V.report + Math.sin(t * 0.6) * 0.05, 0.05 * V.report);
      sheet.current.scale.setScalar(Math.max(0.0001, V.report));
    }

    // Deletion: paper dust from the file volume, thrown out, falling to the
    // plinth and fading. A flash at the start.
    if (dust.current) {
      const m = dust.current;
      const g = V.gone;
      const floor = -CHAMBER.h / 2 + 0.03;
      for (let i = 0; i < PARTICLES; i++) {
        const p = seeds[i];
        const e = g * g;
        let y = p.y + p.dy * e - e * e * 2.6;
        if (y < floor) y = floor + rnd(i, 9) * 0.02;
        dummy.position.set(p.x + p.dx * e, y, p.z + p.dz * e);
        dummy.rotation.set(e * p.spin, e * p.spin * 0.6, 0);
        const sc = g < 0.02 ? 0 : 0.024 * p.s * (1 - g * 0.8);
        dummy.scale.set(Math.max(0.0001, sc * 1.6), Math.max(0.0001, sc), Math.max(0.0001, sc * 1.2));
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
      }
      m.instanceMatrix.needsUpdate = true;
    }
    if (flash.current) flash.current.intensity = V.flash * V.flash * 40;

    // Dust motes drift, always.
    if (motes.current) {
      const arr = motes.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < MOTES; i++) {
        arr[i * 3] = motePos[i * 3] + Math.sin(t * 0.25 + i) * 0.08;
        arr[i * 3 + 1] = motePos[i * 3 + 1] + Math.sin(t * 0.18 + i * 0.7) * 0.1;
        arr[i * 3 + 2] = motePos[i * 3 + 2] + Math.cos(t * 0.22 + i * 1.3) * 0.08;
      }
      motes.current.geometry.attributes.position.needsUpdate = true;
    }

    // The rig turns slowly, leans toward the pointer, and can be dragged.
    // Turn is accumulated per rendered frame (never from the clock), so a
    // stage that was parked off-screen resumes where it left off instead of
    // catching up in a burst.
    if (rig.current) {
      const P = pointer.current;
      const step = Math.min(dt, 1 / 30);
      turn.current += step * 0.16;
      if (P && !P.down) {
        P.rot += P.vel;
        P.vel *= Math.exp(-2.2 * step);
      }
      const px = P?.x ?? 0;
      const py = P?.y ?? 0;
      rig.current.rotation.y = MathUtils.damp(rig.current.rotation.y, turn.current + (P?.rot ?? 0) + px * 0.35, 5, step);
      rig.current.rotation.x = MathUtils.damp(rig.current.rotation.x, 0.16 - py * 0.22 + (P?.tilt ?? 0), 5, step);
    }
  });

  return (
    <group ref={rig} position={[0, 0.15, 0]}>
      {/* Glass. */}
      <mesh>
        <boxGeometry args={[CHAMBER.w, CHAMBER.h, CHAMBER.d]} />
        <meshPhysicalMaterial
          ref={glassMat}
          color="#ffffff"
          transparent
          opacity={0.06}
          roughness={0.08}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1.2}
          depthWrite={false}
        />
      </mesh>

      {/* Frame bars and corner nodes. */}
      {bars.map((b, i) => (
        <mesh key={i} geometry={barGeo} position={b.p} scale={b.s}>
          <meshStandardMaterial color="#cfcfcf" roughness={0.3} metalness={0.9} envMapIntensity={1.4} />
        </mesh>
      ))}
      {[-1, 1].map((x) =>
        [-1, 1].map((y) =>
          [-1, 1].map((z) => (
            <mesh key={`${x}${y}${z}`} position={[(x * CHAMBER.w) / 2, (y * CHAMBER.h) / 2, (z * CHAMBER.d) / 2]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial color="#e6e6e6" roughness={0.2} metalness={1} envMapIntensity={1.6} />
            </mesh>
          )),
        ),
      )}

      {/* Seals. */}
      <mesh ref={ringA} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.7, 0.03, 16, 128]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.7} roughness={0.25} metalness={0.8} transparent opacity={0} />
      </mesh>
      <mesh ref={ringB} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.7, 0.012, 12, 128]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} roughness={0.3} metalness={0.7} transparent opacity={0} />
      </mesh>
      <instancedMesh ref={ticks} args={[undefined, undefined, 24]} frustumCulled={false}>
        <boxGeometry args={[0.02, 0.12, 0.05]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} roughness={0.3} metalness={0.7} />
      </instancedMesh>
      <group ref={tag} scale={0.0001}>
        <mesh>
          <boxGeometry args={[0.42, 0.21, 0.01]} />
          <meshStandardMaterial map={tagTex} roughness={0.9} />
        </mesh>
        {/* The string. */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.2, 6]} />
          <meshStandardMaterial color="#bbbbbb" roughness={0.6} />
        </mesh>
      </group>

      {/* Your code. */}
      <mesh ref={slab} geometry={slabGeo}>
        <meshStandardMaterial
          ref={slabMat}
          map={fileTex}
          color="#ffffff"
          emissive="#ffffff"
          emissiveMap={fileTex}
          emissiveIntensity={0.06}
          roughness={0.85}
          transparent
        />
      </mesh>

      {/* The scan line, the reading light, and the sparks. */}
      <mesh ref={scan}>
        <boxGeometry args={[1.34, 0.022, 0.26]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3} transparent opacity={0} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight ref={orbit} color="#ffffff" intensity={0} distance={6} decay={2} />
      <mesh ref={orbitBulb} scale={0.0001}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <points ref={sparks}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparkPos, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#ffffff" size={0.028} sizeAttenuation transparent opacity={0} blending={AdditiveBlending} depthWrite={false} />
      </points>

      {/* The report. */}
      <mesh ref={sheet} scale={0.0001} geometry={sheetGeo}>
        <meshStandardMaterial map={reportTex} color="#ffffff" emissive="#ffffff" emissiveMap={reportTex} emissiveIntensity={0.12} roughness={0.9} />
      </mesh>

      {/* Paper dust, and the flash that starts it. */}
      <instancedMesh ref={dust} args={[undefined, undefined, PARTICLES]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ece8df" roughness={0.9} />
      </instancedMesh>
      <pointLight ref={flash} color="#ffffff" intensity={0} distance={8} decay={2} />

      {/* Dust motes. */}
      <points ref={motes}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[motePos, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#ffffff" size={0.014} sizeAttenuation transparent opacity={0.45} depthWrite={false} />
      </points>
    </group>
  );
}

function Frame() {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.position.set(0, 0.35, size.width < 640 ? 8.8 : 7.4);
    camera.lookAt(0, 0, 0);
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
  pointer: React.RefObject<StagePointer>;
}) {
  return (
    <Canvas
      camera={{ fov: 32, position: [0, 0.35, 7.4] }}
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      onCreated={({ gl }) => gl.setClearAlpha(0)}
    >
      <Frame />
      <ambientLight intensity={0.35} />
      <directionalLight position={[-4, 6, 5]} intensity={1.6} />
      <directionalLight position={[5, -2, -4]} intensity={0.4} />
      <Suspense fallback={null}>
        {/* Self-hosted studio HDRI: real reflections on the metal and glass. */}
        <Environment files="/hdri/studio_1k.hdr" />
      </Suspense>
      <Scene state={state} pointer={pointer} />
    </Canvas>
  );
}
