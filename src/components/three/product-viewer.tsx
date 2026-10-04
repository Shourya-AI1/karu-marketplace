'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Stage, Float } from '@react-three/drei';
import { RotateCw } from 'lucide-react';

/**
 * Lightweight 360° product inspector. Renders a stylised material
 * sample so buyers can inspect form/finish. Falls back to nothing
 * on weak devices (the gallery already shows photography).
 */
function Sample({ color }: { color: string }) {
  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.4}>
      <mesh castShadow rotation={[0.3, 0.2, 0]}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.25} flatShading />
      </mesh>
    </Float>
  );
}

export function ProductViewer({ color = '#cf9f3e' }: { color?: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const enable3d = process.env.NEXT_PUBLIC_ENABLE_3D !== 'false';
    const weak = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency ?? 4) < 4;
    setEnabled(enable3d && !weak);
  }, []);

  if (!enabled) return null;

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-border/60 bg-secondary/40">
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
        <RotateCw className="h-3 w-3" /> Drag to inspect
      </div>
      <Canvas shadows dpr={[1, 1.8]} camera={{ position: [0, 0, 5], fov: 40 }}>
        <Suspense fallback={null}>
          <Stage intensity={0.5} environment="city" shadows={false} adjustCamera={false}>
            <Sample color={color} />
          </Stage>
          <ContactShadows position={[0, -1.5, 0]} opacity={0.3} scale={6} blur={2.5} />
          <Environment preset="studio" />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom minDistance={3} maxDistance={8} autoRotate autoRotateSpeed={0.8} />
      </Canvas>
    </div>
  );
}
