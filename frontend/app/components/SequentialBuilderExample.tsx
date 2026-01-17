/**
 * Example usage of SequentialBuilder component
 * 
 * Demonstrates how to use the SequentialBuilder with the bedroom manifest
 * and integrate it with React Three Fiber Canvas.
 */

'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { LegoManifest } from './LegoUniverse';

// Import directly - SequentialBuilderExample is already client-only with 'use client'
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { SequentialBuilder, StatusHUD } from './SequentialBuilder';

// Load manifest from JSON file or API
async function loadManifest(): Promise<LegoManifest> {
  try {
    // Try to load from API first
    const response = await fetch('/api/manifest/bedroom');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('API not available, using fallback');
  }

  // Fallback: load from public folder or use default
  // In production, you'd fetch this from your backend
  const response = await fetch('/bedroom_lego_manifest.json');
  if (response.ok) {
    return await response.json();
  }

  // Ultimate fallback: minimal manifest
  return {
    manifest_version: '1.0',
    total_bricks: 0,
    bricks: [],
  };
}

export default function SequentialBuilderExample() {
  const [manifest, setManifest] = useState<LegoManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [buildProgress, setBuildProgress] = useState({
    currentLayer: 0,
    totalLayers: 0,
    bricksPlaced: 0,
    totalBricks: 0,
  });
  const threadId = 'bedroom_build_001';

  useEffect(() => {
    // Only load on client side
    loadManifest().then((loadedManifest) => {
      setManifest(loadedManifest);
      setLoading(false);
      // Initialize progress
      const totalLayers = new Set(loadedManifest.bricks.map(b => b.position[1])).size;
      setBuildProgress({
        currentLayer: 0,
        totalLayers,
        bricksPlaced: 0,
        totalBricks: loadedManifest.total_bricks,
      });
    });
  }, []);

  // Show loading state until manifest is loaded
  if (loading || !manifest) {
    return (
      <div
        key="loading-manifest"
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1a1a',
          color: 'white',
          fontFamily: 'monospace',
        }}
      >
        Loading LEGO manifest...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh', background: '#1a1a1a', position: 'relative' }}>
      {/* Status HUD - Rendered outside Canvas */}
      {buildProgress.totalLayers > 0 && (
        <StatusHUD
          buildName="Bedroom"
          currentLayer={buildProgress.currentLayer}
          totalLayers={buildProgress.totalLayers}
          bricksPlaced={buildProgress.bricksPlaced}
          totalBricks={buildProgress.totalBricks}
        />
      )}

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

        {/* Sequential Builder - Only Three.js elements inside Canvas */}
        <SequentialBuilder
          manifest={manifest}
          threadId={threadId}
          buildName="Bedroom"
          layerDelay={500}
          dropHeight={10}
          showHUD={false}
          onProgress={setBuildProgress}
        />

        {/* Grid helper */}
        <gridHelper args={[200, 20]} />
      </Canvas>
    </div>
  );
}
