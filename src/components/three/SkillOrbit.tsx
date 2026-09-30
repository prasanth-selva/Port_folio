"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html, Sparkles } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

import type { Skill } from "@/lib/types";

type OrbitProps = { skills: Skill[] };

function SkillNode({
  skill,
  index,
  total,
  active,
  onActivate,
}: {
  skill: Skill;
  index: number;
  total: number;
  active: boolean;
  onActivate: (name: string | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ring = index % 3;
  const radius = 2.1 + ring * 0.55;
  const angle0 = (index / total) * Math.PI * 2;
  const speed = 0.05 + (2 - ring) * 0.02;
  const yOff = ((index % 5) - 2) * 0.22;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const m = meshRef.current;
    if (!m) return;
    const a = angle0 + t * speed;
    m.position.set(Math.cos(a) * radius, yOff + Math.sin(t * 0.7 + index) * 0.04, Math.sin(a) * radius);
    m.rotation.y = t * 0.25;
  });

  const color = active ? "#73E0BE" : ring === 1 ? "#B3A0FF" : "#83B9AE";

  return (
    <Float speed={0.8} floatIntensity={0.15}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          onActivate(skill.name);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onActivate(null);
          document.body.style.cursor = "";
        }}
      >
        <icosahedronGeometry args={[active ? 0.24 : 0.16, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 2.2 : 0.9}
          roughness={0.2}
          metalness={0.6}
        />
        <Html center distanceFactor={9} zIndexRange={[10, 0]}>
          <span
            className="pointer-events-none select-none whitespace-nowrap font-mono text-[10px] tracking-wide"
            style={{ color: active ? "#73E0BE" : "rgba(255,255,255,0.66)" }}
          >
            {skill.name}
          </span>
        </Html>
      </mesh>
    </Float>
  );
}

function CoreGlow() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    m.rotation.y = clock.getElapsedTime() * 0.1;
    m.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
  });
  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[0.85, 0]} />
      <meshStandardMaterial
        color="#73E0BE"
        emissive="#73E0BE"
        emissiveIntensity={1.4}
        wireframe
        transparent
        opacity={0.55}
      />
    </mesh>
  );
}

function Rig({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ pointer, clock }) => {
    const g = ref.current;
    if (!g) return;
    g.rotation.y += (pointer.x * 0.12 - g.rotation.y) * 0.02;
    g.rotation.x += (-pointer.y * 0.07 - g.rotation.x) * 0.02;
    void clock;
  });
  return <group ref={ref}>{children}</group>;
}

export default function SkillOrbit({ skills }: OrbitProps) {
  const [active, setActive] = useState<string | null>(null);

  // Orbit rings geometry (lines) — disposed automatically by R3F on unmount.
  const rings = useMemo(
    () => [2.1, 2.65, 3.2].map((r) => new THREE.RingGeometry(r - 0.006, r + 0.006, 128)),
    []
  );

  return (
    <div className="h-[420px] w-full md:h-[480px]" role="img" aria-label={`Interactive 3D orbit of ${skills.length} skills`}>
      <Canvas
        camera={{ position: [0, 1.2, 7.2], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ambientLight intensity={0.35} />
        <pointLight position={[6, 6, 6]} intensity={1.2} color="#73E0BE" />
        <pointLight position={[-6, -4, -4]} intensity={0.7} color="#B3A0FF" />

        <Rig>
          <CoreGlow />
          <Sparkles count={90} scale={[9, 5, 9]} size={1.6} speed={0.08} color="#73E0BE" opacity={0.5} />
          {rings.map((g, i) => (
            <mesh key={i} geometry={g} rotation={[-Math.PI / 2 + (i - 1) * 0.22, 0, 0]}>
              <meshBasicMaterial color={i === 1 ? 0xb3a0ff : 0x73e0be} transparent opacity={0.1} side={THREE.DoubleSide} />
            </mesh>
          ))}
          {skills.map((s, i) => (
            <SkillNode
              key={s.id}
              skill={s}
              index={i}
              total={skills.length}
              active={active === s.name}
              onActivate={setActive}
            />
          ))}
        </Rig>
      </Canvas>
    </div>
  );
}
