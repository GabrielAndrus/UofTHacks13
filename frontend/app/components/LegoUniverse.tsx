/**
 * Universal LEGO Renderer
 * 
 * Generic component that renders any LEGO manifest following the bricks[] schema.
 * Uses LDraw library to dynamically load and render LEGO parts with InstancedMesh
 * for optimal performance.
 * 
 * Features:
 * - Dynamic cataloging of unique part_ids
 * - LDraw geometry caching
 * - InstancedMesh factory for each part type
 * - Batch transformations with rotation support
 * - Adaptive scenery/environment loading
 */

'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';

// Types
export interface LegoBrick {
  part_id: string;
  position: [number, number, number];
  rotation: number; // 0, 90, 180, 270 degrees
  color_id: number;
  is_verified?: boolean;
}

export interface LegoManifest {
  manifest_version: string;
  total_bricks: number;
  bricks: LegoBrick[];
  scenery_origin?: [number, number, number];
  room_id?: string;
  layers?: Record<string, number>;
  inventory?: Array<{
    part_id: string;
    color_id: number;
    quantity: number;
  }>;
}

interface PartCache {
  [partId: string]: {
    geometry: any;
    material: any;
    loaded: boolean;
    loading: boolean;
  };
}

interface LegoUniverseProps {
  manifest: LegoManifest;
  showScenery?: boolean;
  wireframeScenery?: boolean;
}

// LDraw part base URL (adjust based on your LDraw library location)
const LDrawBaseURL = 'https://cdn.jsdelivr.net/npm/ldraw-parts@1.6.4/parts/';
// Alternative: local path if hosting LDraw files
// const LDrawBaseURL = '/ldraw/parts/';

/**
 * Convert rotation degrees to Three.js Euler rotation
 */
function degreesToEuler(degrees: number): THREE.Euler {
  // LEGO rotations are typically around Y-axis (vertical)
  // 0° = no rotation, 90° = quarter turn, 180° = half turn, 270° = three-quarter turn
  const radians = (degrees * Math.PI) / 180;
  return new THREE.Euler(0, radians, 0, 'XYZ');
}

/**
 * Load LDraw part geometry
 */
async function loadLDrawPart(partId: string): Promise<{ geometry: any; material: any }> {
  // Dynamically import LDrawLoader to avoid SSR issues
  const { LDrawLoader } = await import('three/examples/jsm/loaders/LDrawLoader.js');
  
  const loader = new LDrawLoader();
  loader.setPartsLibraryPath(LDrawBaseURL);
  
  // LDraw part files use lowercase with leading zeros
  // e.g., "3004" becomes "3004.dat"
  const partFileName = `${partId.toLowerCase()}.dat`;
  const partUrl = `${LDrawBaseURL}${partFileName}`;
  
  return new Promise((resolve, reject) => {
    loader.load(
      partUrl,
      (object) => {
        // LDrawLoader returns a Group, extract geometry and material
        const mesh = object.children[0] as any;
        if (mesh && mesh.geometry && mesh.material) {
          resolve({
            geometry: mesh.geometry,
            material: mesh.material,
          });
        } else {
          reject(new Error(`Invalid LDraw part structure for ${partId}`));
        }
      },
      undefined,
      (error) => {
        console.warn(`Failed to load LDraw part ${partId}:`, error);
        // Fallback: create a simple box geometry
        const fallbackGeometry = new THREE.BoxGeometry(8, 9.6, 8); // Standard LEGO brick size
        const fallbackMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        resolve({
          geometry: fallbackGeometry,
          material: fallbackMaterial,
        });
      }
    );
  });
}

/**
 * Get LEGO color from Rebrickable color ID
 * This is a simplified mapping - you may want to use a full color database
 */
function getColorFromId(colorId: number): THREE.Color {
  // Common LEGO colors mapping (simplified)
  const colorMap: Record<number, number> = {
    0: 0x05131d, // Black
    1: 0xffffff, // White
    4: 0xe4cd9e, // Tan
    9: 0xe4cd9e, // Light Tan
    12: 0xfcb76d, // Trans-Orange
    13: 0x68abe3, // Trans-Medium Blue
    15: 0xfe8a18, // Trans-Orange
    18: 0x923978, // Trans-Dark Pink
    21: 0xa0a5a9, // Trans-Black
    23: 0x6b5a5a, // Trans-Dark Blue
    25: 0x635f52, // Trans-Brown
    27: 0xfeccb0, // Trans-Red
    28: 0x05131d, // Trans-Black
    29: 0x05131d, // Trans-Dark Blue
    33: 0x05131d, // Trans-Brown
    36: 0x05131d, // Trans-Light Blue
    40: 0x05131d, // Trans-Yellow
    41: 0x05131d, // Trans-Clear
    42: 0x05131d, // Trans-Purple
    46: 0x05131d, // Trans-Neon Green
    47: 0x05131d, // Trans-Neon Orange
    48: 0x05131d, // Trans-Neon Yellow
    49: 0x05131d, // Trans-Neon Red
    50: 0x05131d, // Trans-Neon Blue
    1089: 0xe4cd9e, // Light Tan (common)
  };
  
  const hexColor = colorMap[colorId] || 0xcccccc; // Default gray
  return new THREE.Color(hexColor);
}

export function LegoUniverse({ manifest, showScenery = true, wireframeScenery = true }: LegoUniverseProps) {
  const partCacheRef = useRef<PartCache>({});
  const instancedMeshesRef = useRef<Map<string, THREE.InstancedMesh>>(new Map());
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Extract unique part IDs from manifest
  const uniquePartIds = useMemo(() => {
    const partIds = new Set<string>();
    manifest.bricks.forEach((brick) => {
      partIds.add(brick.part_id);
    });
    return Array.from(partIds);
  }, [manifest]);

  // Group bricks by part_id for instancing
  const bricksByPartId = useMemo(() => {
    const groups: Record<string, LegoBrick[]> = {};
    manifest.bricks.forEach((brick) => {
      if (!groups[brick.part_id]) {
        groups[brick.part_id] = [];
      }
      groups[brick.part_id].push(brick);
    });
    return groups;
  }, [manifest]);

  // Load all unique parts
  useEffect(() => {
    let loadedCount = 0;
    const totalParts = uniquePartIds.length;

    if (totalParts === 0) {
      setIsLoading(false);
      return;
    }

    uniquePartIds.forEach(async (partId) => {
      if (partCacheRef.current[partId]?.loaded) {
        loadedCount++;
        setLoadingProgress((loadedCount / totalParts) * 100);
        if (loadedCount === totalParts) {
          setIsLoading(false);
        }
        return;
      }

      if (partCacheRef.current[partId]?.loading) {
        return; // Already loading
      }

      partCacheRef.current[partId] = {
        geometry: null,
        material: null,
        loaded: false,
        loading: true,
      };

      try {
        const { geometry, material } = await loadLDrawPart(partId);
        partCacheRef.current[partId] = {
          geometry,
          material,
          loaded: true,
          loading: false,
        };

        loadedCount++;
        setLoadingProgress((loadedCount / totalParts) * 100);

        if (loadedCount === totalParts) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error(`Error loading part ${partId}:`, error);
        partCacheRef.current[partId].loading = false;
        loadedCount++;
        setLoadingProgress((loadedCount / totalParts) * 100);
        if (loadedCount === totalParts) {
          setIsLoading(false);
        }
      }
    });
  }, [uniquePartIds]);

  // Create and update InstancedMeshes when parts are loaded
  useEffect(() => {
    if (isLoading) return;

    uniquePartIds.forEach((partId) => {
      const cache = partCacheRef.current[partId];
      if (!cache?.loaded) return;

      let instancedMesh = instancedMeshesRef.current.get(partId);
      const bricks = bricksByPartId[partId] || [];

      if (!instancedMesh && cache.geometry && cache.material) {
        // Create new InstancedMesh
        instancedMesh = new THREE.InstancedMesh(
          cache.geometry,
          cache.material.clone(),
          bricks.length
        );
        instancedMeshesRef.current.set(partId, instancedMesh);
      }

      if (instancedMesh && bricks.length > 0) {
        // Update instance matrices
        const matrix = new THREE.Matrix4();
        bricks.forEach((brick, index) => {
          // Position (convert studs to mm: 1 stud = 8mm)
          const position = new THREE.Vector3(
            brick.position[0] * 8,
            brick.position[1] * 9.6, // LEGO brick height
            brick.position[2] * 8
          );

          // Rotation
          const euler = degreesToEuler(brick.rotation);
          const quaternion = new THREE.Quaternion().setFromEuler(euler);

          // Scale (always 1,1,1 for LEGO bricks)
          const scale = new THREE.Vector3(1, 1, 1);

          // Build transformation matrix
          matrix.compose(position, quaternion, scale);
          instancedMesh.setMatrixAt(index, matrix);
        });

        instancedMesh.instanceMatrix.needsUpdate = true;
      }
    });
  }, [isLoading, uniquePartIds, bricksByPartId]);

  return (
    <group>
      {/* Render all InstancedMeshes */}
      {uniquePartIds.map((partId) => {
        const instancedMesh = instancedMeshesRef.current.get(partId);
        if (!instancedMesh) return null;

        return (
          <InstancedMeshRenderer
            key={partId}
            instancedMesh={instancedMesh}
            partId={partId}
          />
        );
      })}

      {/* Scenery/Environment */}
      {showScenery && manifest.scenery_origin && (
        <Scenery
          origin={manifest.scenery_origin}
          roomId={manifest.room_id}
          wireframe={wireframeScenery}
        />
      )}

      {/* Default grid if no scenery */}
      {showScenery && !manifest.scenery_origin && (
        <gridHelper args={[1000, 100]} />
      )}

      {/* Loading indicator */}
      {isLoading && (
        <mesh position={[0, 10, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={0xff0000} />
        </mesh>
      )}
    </group>
  );
}

/**
 * InstancedMesh renderer component
 */
function InstancedMeshRenderer({
  instancedMesh,
  partId,
}: {
  instancedMesh: THREE.InstancedMesh;
  partId: string;
}) {
  return <primitive object={instancedMesh} castShadow receiveShadow />;
}

/**
 * Scenery component for room/environment rendering
 */
function Scenery({
  origin,
  roomId,
  wireframe = true,
}: {
  origin: [number, number, number];
  roomId?: string;
  wireframe?: boolean;
}) {
  // This would load a specific room mesh based on roomId
  // For now, render a simple wireframe box representing the room
  const roomSize = 200; // Default room size in mm

  return (
    <group position={[origin[0] * 8, origin[1] * 9.6, origin[2] * 8]}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[roomSize, roomSize]} />
        <meshStandardMaterial
          color={0xcccccc}
          wireframe={wireframe}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Walls (simplified) */}
      {wireframe && (
        <>
          {/* Back wall */}
          <lineSegments>
            <edgesGeometry
              args={[
                new THREE.BoxGeometry(roomSize, roomSize * 0.6, 1),
              ]}
            />
            <lineBasicMaterial color={0x888888} />
          </lineSegments>
        </>
      )}
    </group>
  );
}
