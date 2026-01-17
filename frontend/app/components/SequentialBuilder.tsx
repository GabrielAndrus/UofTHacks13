/**
 * Sequential Builder Component
 * 
 * Animates LEGO brick placement layer by layer with drop-in animations.
 * Groups bricks by Y coordinate and places them sequentially with bounce effects.
 * 
 * Features:
 * - Layer-based building (groups by Y coordinate)
 * - Drop-in animations with bounce
 * - Status HUD showing progress
 * - Backboard Scene Delta sync
 */

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LegoUniverse, LegoManifest, LegoBrick } from './LegoUniverse';

interface BuildLayer {
  y: number;
  bricks: LegoBrick[];
}

interface BrickAnimation {
  brick: LegoBrick;
  startY: number;
  targetY: number;
  progress: number;
  isAnimating: boolean;
  instanceIndex: number;
  partId: string;
}

interface SequentialBuilderProps {
  manifest: LegoManifest;
  threadId?: string;
  buildName?: string;
  layerDelay?: number; // milliseconds between layers
  dropHeight?: number; // height above target to drop from
  showHUD?: boolean;
  onProgress?: (progress: {
    currentLayer: number;
    totalLayers: number;
    bricksPlaced: number;
    totalBricks: number;
  }) => void;
}

interface StatusHUDProps {
  buildName: string;
  currentLayer: number;
  totalLayers: number;
  bricksPlaced: number;
  totalBricks: number;
}

/**
 * Status HUD Component - Must be rendered outside Canvas
 */
export function StatusHUD({ buildName, currentLayer, totalLayers, bricksPlaced, totalBricks }: StatusHUDProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '14px',
        zIndex: 1000,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '16px' }}>
        🧱 Building: {buildName}
      </div>
      <div style={{ marginBottom: '4px' }}>
        Step: {currentLayer} / {totalLayers}
      </div>
      <div style={{ marginBottom: '4px' }}>
        Bricks: {bricksPlaced} / {totalBricks}
      </div>
      <div
        style={{
          width: '200px',
          height: '6px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '3px',
          marginTop: '8px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${(bricksPlaced / totalBricks) * 100}%`,
            height: '100%',
            background: '#4CAF50',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}

/**
 * Easing function for bounce effect
 */
function easeOutBounce(t: number): number {
  if (t < 1 / 2.75) {
    return 7.5625 * t * t;
  } else if (t < 2 / 2.75) {
    return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
  } else if (t < 2.5 / 2.75) {
    return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
  } else {
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  }
}

/**
 * Fetch Scene Deltas from Backboard API
 * 
 * The endpoint returns a list of Scene Deltas directly or wrapped in { deltas: [...] }
 */
async function fetchSceneDeltas(threadId: string): Promise<any[]> {
  try {
    // Try the API endpoint (adjust URL based on your backend setup)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/backboard/${threadId}/deltas`);
    
    if (!response.ok) {
      console.warn(`Failed to fetch Scene Deltas for thread ${threadId} (${response.status}), using manifest directly`);
      return [];
    }
    
    const data = await response.json();
    
    // The endpoint returns List[Dict] directly, but check if it's wrapped
    if (Array.isArray(data)) {
      return data;
    } else if (data.deltas && Array.isArray(data.deltas)) {
      return data.deltas;
    }
    
    return [];
  } catch (error) {
    console.warn('Backboard API not available, using manifest directly:', error);
    return [];
  }
}

export function SequentialBuilder({
  manifest,
  threadId = 'placeholder_thread_001',
  buildName = 'Bedroom',
  layerDelay = 500,
  dropHeight = 10,
  showHUD = true,
  onProgress,
}: SequentialBuilderProps) {
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
  const [visibleBricks, setVisibleBricks] = useState<Set<string>>(new Set());
  const [animatingBricks, setAnimatingBricks] = useState<Map<string, BrickAnimation>>(new Map());
  const [sceneDeltas, setSceneDeltas] = useState<any[]>([]);
  const animationFrameRef = useRef<number>(null!);
  const layerTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Group bricks by Y coordinate to create build layers
  const buildLayers = useMemo(() => {
    const layerMap = new Map<number, LegoBrick[]>();

    manifest.bricks.forEach((brick) => {
      const y = brick.position[1];
      if (!layerMap.has(y)) {
        layerMap.set(y, []);
      }
      layerMap.get(y)!.push(brick);
    });

    // Sort layers by Y coordinate (bottom to top)
    const sortedLayers: BuildLayer[] = Array.from(layerMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([y, bricks]) => ({ y, bricks }));

    return sortedLayers;
  }, [manifest]);

  // Create a map of brick to unique key for tracking
  const brickKeyMap = useMemo(() => {
    const map = new Map<string, string>();
    manifest.bricks.forEach((brick, index) => {
      const key = `${brick.part_id}_${brick.position[0]}_${brick.position[1]}_${brick.position[2]}_${index}`;
      map.set(key, key);
    });
    return map;
  }, [manifest]);

  // Fetch Scene Deltas on mount
  useEffect(() => {
    fetchSceneDeltas(threadId).then((deltas) => {
      setSceneDeltas(deltas);
      console.log(`Loaded ${deltas.length} Scene Deltas from Backboard`);
    });
  }, [threadId]);

  // Animation loop for drop-in effects
  useFrame((state, delta) => {
    setAnimatingBricks((prev) => {
      const next = new Map(prev);
      let hasUpdates = false;

      prev.forEach((anim, key) => {
        if (!anim.isAnimating) return;

        // Update progress (0 to 1)
        const newProgress = Math.min(anim.progress + delta * 2, 1); // Speed of animation
        
        if (newProgress >= 1) {
          // Animation complete
          const completedAnim = { ...anim, progress: 1, isAnimating: false };
          next.set(key, completedAnim);
          hasUpdates = true;
          
          // Mark brick as fully placed
          setVisibleBricks((prevVisible) => {
            const nextVisible = new Set(prevVisible);
            nextVisible.add(key);
            return nextVisible;
          });
        } else {
          // Update progress
          const updatedAnim = { ...anim, progress: newProgress };
          next.set(key, updatedAnim);
          hasUpdates = true;
        }
      });

      return hasUpdates ? next : prev;
    });
  });

  // Process layers sequentially
  useEffect(() => {
    if (currentLayerIndex >= buildLayers.length) {
      return; // All layers built
    }

    const currentLayer = buildLayers[currentLayerIndex];
    
    // Start animation for all bricks in this layer
    const newAnimations = new Map<string, BrickAnimation>();
    
    currentLayer.bricks.forEach((brick, index) => {
      const animKey = `${brick.part_id}_${brick.position[0]}_${brick.position[1]}_${brick.position[2]}`;
      
      newAnimations.set(animKey, {
        brick,
        startY: brick.position[1] + dropHeight,
        targetY: brick.position[1],
        progress: 0,
        isAnimating: true,
        instanceIndex: index,
        partId: brick.part_id,
      });
    });

    setAnimatingBricks((prev) => {
      const merged = new Map(prev);
      newAnimations.forEach((value, key) => merged.set(key, value));
      return merged;
    });

    // Move to next layer after delay
    layerTimerRef.current = setTimeout(() => {
      setCurrentLayerIndex((prev) => prev + 1);
    }, layerDelay);

    return () => {
      if (layerTimerRef.current) {
        clearTimeout(layerTimerRef.current);
      }
    };
  }, [currentLayerIndex, buildLayers, layerDelay, dropHeight]);

  // Create filtered manifest with only visible bricks
  const visibleManifest = useMemo(() => {
    // Combine visible bricks and animating bricks
    const allVisible = new Set<string>();
    
    // Add fully placed bricks
    visibleBricks.forEach(key => allVisible.add(key));
    
    // Add animating bricks
    animatingBricks.forEach((anim) => {
      const key = `${anim.partId}_${anim.brick.position[0]}_${anim.brick.position[1]}_${anim.brick.position[2]}`;
      allVisible.add(key);
    });

    // Filter and transform bricks
    const animatedBricks = manifest.bricks
      .map((brick, index) => {
        const key = `${brick.part_id}_${brick.position[0]}_${brick.position[1]}_${brick.position[2]}`;
        const isVisible = allVisible.has(key);
        
        if (!isVisible) {
          return null; // Brick not yet visible
        }

        // Check if this brick is animating
        const anim = animatingBricks.get(key);
        
        if (anim && anim.isAnimating) {
          // Return brick with animated Y position
          const currentY = anim.startY + (anim.targetY - anim.startY) * easeOutBounce(anim.progress);
          return {
            ...brick,
            position: [brick.position[0], currentY, brick.position[2]] as [number, number, number],
          };
        }
        
        // Brick is fully placed at target position
        return brick;
      })
      .filter((brick): brick is LegoBrick => brick !== null);

    return {
      ...manifest,
      bricks: animatedBricks,
    };
  }, [manifest, visibleBricks, animatingBricks]);

  // Calculate progress
  const bricksPlaced = visibleBricks.size + Array.from(animatingBricks.values()).filter(a => a.isAnimating).length;
  const totalBricks = manifest.total_bricks;
  const totalLayers = buildLayers.length;

  // Notify parent component of progress updates
  useEffect(() => {
    if (onProgress) {
      onProgress({
        currentLayer: currentLayerIndex + 1,
        totalLayers,
        bricksPlaced,
        totalBricks,
      });
    }
  }, [currentLayerIndex, bricksPlaced, totalBricks, totalLayers, onProgress]);

  // Note: StatusHUD is rendered outside Canvas in SequentialBuilderExample
  // Only render Three.js elements here
  return <LegoUniverse manifest={visibleManifest} showScenery={true} />;
}
