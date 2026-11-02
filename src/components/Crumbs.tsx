"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef } from "react";
import type { Group } from "three";

function Seeds() {
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (group.current)
      group.current.rotation.z = Math.sin(clock.elapsedTime * 0.12) * 0.08;
  });
  return (
    <group ref={group}>
      {Array.from({ length: 14 }, (_, i) => (
        <Float key={i} speed={0.7} rotationIntensity={0.4} floatIntensity={0.3}>
          <mesh
            position={[
              Math.sin(i * 2.4) * 5.8,
              Math.cos(i * 1.7) * 3.1,
              -2 - (i % 3),
            ]}
            rotation={[i, i * 0.7, i]}
          >
            <sphereGeometry args={[0.025 + (i % 3) * 0.012, 6, 6]} />
            <meshStandardMaterial
              color={i % 3 ? "#b77931" : "#ffab3d"}
              roughness={0.8}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}
export default function Crumbs() {
  return (
    <div className="crumb-canvas" aria-hidden="true">
      <Canvas
        dpr={1}
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      >
        <ambientLight intensity={2} />
        <directionalLight position={[3, 5, 4]} intensity={2} />
        <Seeds />
      </Canvas>
    </div>
  );
}
