/**
 * Universal LEGO Renderer - FIXED VERSION
 * 
 * Fixes:
 * 1. Properly loads LDraw parts instead of fallback boxes
 * 2. Applies colors to each instance using InstancedMesh.setColorAt()
 * 3. Better error handling for missing parts
 * 4. Improved LDraw loader configuration
 * 5. Fixed loading state and primitive rendering
 */

'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { LDrawLoader } from 'three/examples/jsm/loaders/LDrawLoader.js';

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
    geometry: THREE.BufferGeometry;
    boundingBox: THREE.Box3;
    loaded: boolean;
    loading: boolean;
    error?: string;
  };
}

interface LegoUniverseProps {
  manifest: LegoManifest;
  showScenery?: boolean;
  wireframeScenery?: boolean;
}

// Official Three.js LDraw library CDN - multiple fallbacks
const LDrawBaseURLs = [
  'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/ldraw/officialLibrary/',
  'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/models/ldraw/officialLibrary/',
  'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/ldraw/officialLibrary/',
];

// Scale factor to align LDraw meshes with your coordinate system
const LDrawScale = 0.05;

/**
 * Convert rotation degrees to Three.js Euler rotation
 */
function degreesToEuler(degrees: number): THREE.Euler {
  const radians = (degrees * Math.PI) / 180;
  return new THREE.Euler(0, radians, 0, 'XYZ');
}

/**
 * Get LEGO color from Rebrickable color ID
 * Expanded color palette with more accurate LEGO colors
 */
function getColorFromId(colorId: number): THREE.Color {
  const colorMap: Record<number, number> = {
    0: 0x05131D,    // Black
    1: 0x0055BF,    // Blue
    2: 0x237841,    // Green
    3: 0x008F9B,    // Dark Turquoise
    4: 0xC91A09,    // Red
    5: 0xC870A0,    // Dark Pink
    6: 0x583927,    // Brown
    7: 0x9BA19D,    // Light Gray
    8: 0x6D6E5C,    // Dark Gray
    9: 0xB4D2E3,    // Light Blue
    10: 0x4B9F4A,   // Bright Green
    11: 0x55A5AF,   // Light Turquoise
    12: 0xF2705E,   // Salmon
    13: 0xFC97AC,   // Pink
    14: 0xF2CD37,   // Yellow
    15: 0xFFFFFF,   // White
    17: 0x9ACA3C,   // Light Lime
    18: 0xBBABB2,   // Light Nougat
    19: 0xE4CD9E,   // Tan
    20: 0xC4281C,   // Light Violet
    21: 0xF9EF69,   // Glow In Dark Opaque
    22: 0x81007B,   // Purple
    23: 0x2032B0,   // Dark Blue-Violet
    25: 0xFE8A18,   // Orange
    26: 0x923978,   // Magenta
    27: 0xBDDCD8,   // Lime
    28: 0x958A73,   // Dark Tan
    29: 0xE4ADC8,   // Bright Pink
    30: 0xAC78BA,   // Medium Lavender
    31: 0xDF6695,   // Medium Pink
    33: 0x0A3463,   // Trans-Dark Blue
    34: 0xA0A5A9,   // Trans-Light Blue
    35: 0xC1DFF0,   // Trans-Very Light Blue
    36: 0xD67572,   // Trans-Red
    40: 0xE8DFC6,   // Trans-Black (very dark clear)
    41: 0xF5CD2F,   // Trans-Yellow
    42: 0x635F52,   // Trans-Neon Orange
    43: 0xBB805A,   // Trans-Neon Green
    1089: 0xE4CD9E, // Reddish Brown (Rebrickable specific)
  };
  
  const hexColor = colorMap[colorId];
  if (!hexColor) {
    console.warn(`Unknown color ID: ${colorId}, using default gray`);
    return new THREE.Color(0x888888);
  }
  return new THREE.Color(hexColor);
}

/**
 * Load LDraw part geometry with proper configuration and error handling
 */
async function loadLDrawPart(partId: string): Promise<{ 
  geometry: THREE.BufferGeometry; 
  boundingBox: THREE.Box3;
}> {
  const loader = new LDrawLoader();
  
  // Try each base URL until one works
  for (let i = 0; i < LDrawBaseURLs.length; i++) {
    const baseURL = LDrawBaseURLs[i];
    loader.setPartsLibraryPath(baseURL);
    
    const partUrl = `${baseURL}parts/${partId}.dat`;
    
    try {
      const result = await new Promise<{ geometry: THREE.BufferGeometry; boundingBox: THREE.Box3 }>((resolve, reject) => {
        loader.load(
          partUrl,
          (group) => {
            const geometries: THREE.BufferGeometry[] = [];
            const boundingBox = new THREE.Box3();

            // Traverse and collect all geometries
            group.traverse((child: any) => {
              if (child.isMesh && child.geometry) {
                const geometry = child.geometry.clone();
                geometry.scale(LDrawScale, LDrawScale, LDrawScale);
                geometries.push(geometry);
                
                geometry.computeBoundingBox();
                if (geometry.boundingBox) {
                  boundingBox.union(geometry.boundingBox);
                }
              }
            });

            if (geometries.length === 0) {
              reject(new Error(`No meshes found in part ${partId}`));
              return;
            }

            // Merge geometries
            let mergedGeometry: THREE.BufferGeometry;
            if (geometries.length === 1) {
              mergedGeometry = geometries[0];
            } else {
              // Use BufferGeometryUtils if available
              const BufferGeometryUtils = (THREE as any).BufferGeometryUtils;
              if (BufferGeometryUtils?.mergeGeometries) {
                mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries, false);
              } else {
                // Fallback to first geometry
                console.warn('BufferGeometryUtils not available, using first geometry only');
                mergedGeometry = geometries[0];
              }
            }

            // Center the geometry at origin (bottom-center)
            mergedGeometry.computeBoundingBox();
            const box = mergedGeometry.boundingBox!;
            const centerX = (box.min.x + box.max.x) / 2;
            const centerZ = (box.min.z + box.max.z) / 2;
            const bottomY = box.min.y;
            
            mergedGeometry.translate(-centerX, -bottomY, -centerZ);
            mergedGeometry.computeBoundingBox();

            resolve({
              geometry: mergedGeometry,
              boundingBox: mergedGeometry.boundingBox!.clone(),
            });
          },
          (progress) => {
            // Optional: track loading progress
            console.log(`Loading ${partId}: ${(progress.loaded / progress.total * 100).toFixed(0)}%`);
          },
          (error) => {
            reject(error);
          }
        );
      });
      
      // If we got here, loading succeeded
      console.log(`Successfully loaded ${partId} from ${baseURL}`);
      return result;
      
    } catch (error) {
      console.warn(`Failed to load ${partId} from ${baseURL}, trying next URL...`);
      if (i === LDrawBaseURLs.length - 1) {
        // Last URL failed, throw error to use fallback
        throw error;
      }
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw new Error(`Failed to load ${partId} from all URLs`);
}

/**
 * Create fallback geometry for missing parts
 */
function createFallbackGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  geometry.translate(0, 0.5, 0); // Pivot at bottom-center
  return geometry;
}

export function LegoUniverse({ 
  manifest, 
  showScenery = true, 
  wireframeScenery = true 
}: LegoUniverseProps) {
  const partCacheRef = useRef<PartCache>({});
  const groupRef = useRef<THREE.Group>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [instancedMeshes, setInstancedMeshes] = useState<Map<string, THREE.InstancedMesh>>(new Map());

  // Extract unique part IDs
  const uniquePartIds = useMemo(() => {
    const partIds = new Set<string>();
    manifest.bricks.forEach((brick) => {
      partIds.add(brick.part_id);
    });
    return Array.from(partIds);
  }, [manifest]);

  // Group bricks by part_id
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

    const loadPromises = uniquePartIds.map(async (partId) => {
      if (partCacheRef.current[partId]?.loaded) {
        return;
      }

      if (partCacheRef.current[partId]?.loading) {
        return;
      }

      partCacheRef.current[partId] = {
        geometry: null!,
        boundingBox: new THREE.Box3(),
        loaded: false,
        loading: true,
      };

      try {
        const { geometry, boundingBox } = await loadLDrawPart(partId);
        partCacheRef.current[partId] = {
          geometry,
          boundingBox,
          loaded: true,
          loading: false,
        };
      } catch (error) {
        console.error(`Error loading part ${partId}, using fallback:`, error);
        
        // Use fallback geometry
        const fallbackGeometry = createFallbackGeometry();
        partCacheRef.current[partId] = {
          geometry: fallbackGeometry,
          boundingBox: new THREE.Box3().setFromObject(new THREE.Mesh(fallbackGeometry)),
          loaded: true,
          loading: false,
          error: String(error),
        };
      }

      loadedCount++;
      setLoadingProgress((loadedCount / totalParts) * 100);
    });

    Promise.all(loadPromises).then(() => {
      setIsLoading(false);
    });
  }, [uniquePartIds]);

  // Create InstancedMeshes when loading is complete
  useEffect(() => {
    if (isLoading) return;

    const newInstancedMeshes = new Map<string, THREE.InstancedMesh>();

    uniquePartIds.forEach((partId) => {
      const cache = partCacheRef.current[partId];
      if (!cache?.loaded || !cache.geometry) return;

      const bricks = bricksByPartId[partId] || [];
      if (bricks.length === 0) return;

      // Create material that supports per-instance coloring
      const material = new THREE.MeshStandardMaterial({
        vertexColors: false, // We'll use setColorAt instead
        roughness: 0.7,
        metalness: 0.1,
      });

      // Create InstancedMesh
      const instancedMesh = new THREE.InstancedMesh(
        cache.geometry,
        material,
        bricks.length
      );

      // Set up matrices and colors for each instance
      const matrix = new THREE.Matrix4();
      const color = new THREE.Color();

      bricks.forEach((brick, index) => {
        // Set position
        const position = new THREE.Vector3(
          brick.position[0],
          brick.position[1],
          brick.position[2]
        );

        // Set rotation
        const euler = degreesToEuler(brick.rotation);
        const quaternion = new THREE.Quaternion().setFromEuler(euler);

        // Set scale
        const scale = new THREE.Vector3(1, 1, 1);

        // Create transformation matrix
        matrix.compose(position, quaternion, scale);
        instancedMesh.setMatrixAt(index, matrix);

        // Set color for this instance
        color.copy(getColorFromId(brick.color_id));
        instancedMesh.setColorAt(index, color);
      });

      instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) {
        instancedMesh.instanceColor.needsUpdate = true;
      }

      instancedMesh.castShadow = true;
      instancedMesh.receiveShadow = true;

      newInstancedMeshes.set(partId, instancedMesh);
    });

    setInstancedMeshes(newInstancedMeshes);
  }, [isLoading, uniquePartIds, bricksByPartId]);

  // Early return for loading state or empty manifest
  if (isLoading || instancedMeshes.size === 0) {
    return (
      <group>
        {/* Optional: loading indicator */}
        {manifest.bricks.length > 0 && (
          <mesh position={[0, 10, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={0xff0000} />
          </mesh>
        )}
      </group>
    );
  }

  return (
    <group ref={groupRef}>
      {/* Render all InstancedMeshes - with null check */}
      {Array.from(instancedMeshes.entries())
        .filter(([_, mesh]) => mesh && mesh.geometry)
        .map(([partId, mesh]) => (
          <primitive key={partId} object={mesh} />
        ))}

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
        <gridHelper args={[100, 100]} />
      )}
    </group>
  );
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
  const roomSize = 200;

  return (
    <group position={[origin[0], origin[1], origin[2]]}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[roomSize, roomSize]} />
        <meshStandardMaterial
          color={0x333333}
          wireframe={wireframe}
          transparent
          opacity={wireframe ? 0.2 : 0.8}
        />
      </mesh>

      {/* Grid helper */}
      <gridHelper args={[roomSize, 50, 0x444444, 0x222222]} position={[0, 0.01, 0]} />
    </group>
  );
}
