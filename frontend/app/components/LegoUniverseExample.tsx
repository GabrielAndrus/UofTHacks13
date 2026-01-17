/**
 * Example usage of LegoUniverse component
 * 
 * This demonstrates how to use the Universal LEGO Renderer
 * with a Canvas from React Three Fiber.
 */

'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { LegoUniverse, LegoManifest } from './LegoUniverse';

// Example manifest (you can load this from an API or file)
const exampleManifest: LegoManifest = {
  manifest_version: '1.0',
  total_bricks: 148,
  bricks: [
    {
      part_id: '3004',
      position: [-10, 0, -10],
      rotation: 0,
      color_id: 9,
      is_verified: true,
    },
    // ... more bricks
  ],
};

export function LegoUniverseExample({ manifest }: { manifest?: LegoManifest }) {
  const displayManifest = manifest || exampleManifest;

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas
        shadows
        gl={{ antialias: true }}
        camera={{ position: [0, 50, 100], fov: 50 }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Camera controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={20}
          maxDistance={500}
        />

        {/* LEGO Universe */}
        <LegoUniverse manifest={displayManifest} showScenery={true} />

        {/* Grid helper */}
        <gridHelper args={[200, 20]} />
      </Canvas>
    </div>
  );
}
