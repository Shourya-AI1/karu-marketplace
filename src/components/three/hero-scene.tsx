'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Float,
  Environment,
  ContactShadows,
  MeshTransmissionMaterial,
  AdaptiveDpr,
  PerformanceMonitor,
} from '@react-three/drei';
import * as THREE from 'three';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * Hero 3D scene — a floating handcrafted vessel rendered with a
 * glass/ceramic transmission material under warm cinematic lighting.
 * Adaptive DPR + performance monitor keep it at 60fps; degrades
 * gracefully and is skipped entirely on weak/mobile devices.
 */

function Vessel({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 0.6;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 0.6;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [reduced]);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.18;
    if (!reduced) {
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, mouse.current.y, 0.05);
      group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, mouse.current.x, 0.05);
    }
  });

  return (
    <Float speed={reduced ? 0 : 1.4} rotationIntensity={reduced ? 0 : 0.3} floatIntensity={reduced ? 0 : 0.6}>
      <group ref={group}>
        {/* Body — a turned vase silhouette */}
        <mesh castShadow position={[0, 0, 0]}>
          <latheGeometry
            args={[
              (() => {
                const pts: THREE.Vector2[] = [];
                for (let i = 0; i < 20; i++) {
                  const t = i / 19;
                  const y = (t - 0.5) * 2.6;
                  const r = 0.55 + Math.sin(t * Math.PI) * 0.55 + Math.cos(t * Math.PI * 2) * 0.06;
                  pts.push(new THREE.Vector2(Math.max(0.05, r), y));
                }
                return pts;
              })(),
              64,
            ]}
          />
          <MeshTransmissionMaterial
            thickness={0.9}
            roughness={0.12}
            transmission={0.92}
            ior={1.35}
            chromaticAberration={0.04}
            backside
            color="#e6c885"
            attenuationColor="#cf9f3e"
            attenuationDistance={2.4}
          />
        </mesh>
        {/* Accent ring */}
        <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.05, 0.03, 16, 80]} />
          <meshStandardMaterial color="#b88331" metalness={1} roughness={0.25} />
        </mesh>
      </group>
    </Float>
  );
}

function SceneContents() {
  const reduced = prefersReducedMotion();
  return (
    <>
      <ambientLight intensity={0.35} />
      <spotLight position={[5, 8, 6]} angle={0.3} penumbra={1} intensity={2.2} color="#fff6e0" castShadow />
      <pointLight position={[-6, -2, -4]} intensity={1.2} color="#cf9f3e" />
      <Suspense fallback={null}>
        <Vessel reduced={reduced} />
        <ContactShadows position={[0, -1.7, 0]} opacity={0.35} scale={8} blur={2.6} far={3} color="#000000" />
        <Environment preset="sunset" />
      </Suspense>
    </>
  );
}

export function HeroScene() {
  const [enabled, setEnabled] = useState(false);
  const [dpr, setDpr] = useState(1.5);

  useEffect(() => {
    const enable3d = process.env.NEXT_PUBLIC_ENABLE_3D !== 'false';
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const weakGpu = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency ?? 4) < 4;
    setEnabled(enable3d && !isMobile && !weakGpu);
  }, []);

  if (!enabled) {
    // Graceful fallback — an atmospheric gradient orb.
    return (
      <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
        <div className="h-[60vmin] w-[60vmin] animate-float rounded-full bg-gradient-to-br from-champagne-300/40 via-champagne-500/20 to-transparent blur-2xl" />
      </div>
    );
  }

  return (
    <Canvas
      shadows
      dpr={dpr}
      camera={{ position: [0, 0, 6], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      className="!absolute inset-0"
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(2)} />
      <AdaptiveDpr pixelated />
      <SceneContents />
    </Canvas>
  );
}
