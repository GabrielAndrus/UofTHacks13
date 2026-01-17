# Universal LEGO Renderer

A generic React Three Fiber component that renders any LEGO manifest following the `bricks[]` schema using the LDraw library.

## Features

- **Dynamic Cataloging**: Automatically scans the manifest and extracts unique `part_id`s
- **LDraw Integration**: Loads LEGO part geometries from LDraw `.dat` files
- **InstancedMesh Factory**: Uses Three.js InstancedMesh for optimal performance with thousands of bricks
- **Batch Transformations**: Efficiently applies position, rotation, and color to all brick instances
- **Adaptive Scenery**: Supports optional room/environment meshes with wireframe rendering
- **Color Mapping**: Maps Rebrickable color IDs to LEGO colors

## Installation

The component requires the following dependencies (already installed):

```bash
npm install @react-three/fiber @react-three/drei three
```

## Usage

### Basic Example

```tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { LegoUniverse, LegoManifest } from './components/LegoUniverse';

const manifest: LegoManifest = {
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

function App() {
  return (
    <Canvas camera={{ position: [0, 50, 100], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <OrbitControls />
      <LegoUniverse manifest={manifest} />
    </Canvas>
  );
}
```

### With Scenery

```tsx
const manifestWithScenery: LegoManifest = {
  manifest_version: '1.0',
  total_bricks: 148,
  bricks: [...],
  scenery_origin: [0, 0, 0],
  room_id: 'bedroom_01',
};

<LegoUniverse 
  manifest={manifestWithScenery} 
  showScenery={true}
  wireframeScenery={true}
/>
```

## Component API

### `LegoUniverse` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `manifest` | `LegoManifest` | **required** | The LEGO manifest containing bricks array |
| `showScenery` | `boolean` | `true` | Whether to render scenery/environment |
| `wireframeScenery` | `boolean` | `true` | Render scenery as wireframe |

### `LegoManifest` Interface

```typescript
interface LegoManifest {
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
```

### `LegoBrick` Interface

```typescript
interface LegoBrick {
  part_id: string;        // LDraw part ID (e.g., "3004")
  position: [number, number, number];  // Position in studs
  rotation: number;       // Rotation in degrees (0, 90, 180, 270)
  color_id: number;       // Rebrickable color ID
  is_verified?: boolean;  // Whether part was verified
}
```

## How It Works

1. **Part Discovery**: Scans the manifest to find all unique `part_id`s
2. **Geometry Loading**: Loads each unique part's `.dat` file from LDraw library
3. **Caching**: Caches loaded geometries to avoid redundant network requests
4. **Instancing**: Creates one `InstancedMesh` per part type
5. **Transformation**: Applies position, rotation, and color to each instance
6. **Rendering**: Renders all instances efficiently in a single pass

## Coordinate System

- **Position**: Measured in LEGO studs (1 stud = 8mm)
- **Height**: LEGO brick height = 9.6mm per layer
- **Rotation**: Degrees around Y-axis (0°, 90°, 180°, 270°)

## LDraw Library

The component uses the LDraw parts library from CDN:

```
https://cdn.jsdelivr.net/npm/ldraw-parts@1.6.4/parts/
```

To use a local LDraw library, update the `LDrawBaseURL` constant in `LegoUniverse.tsx`.

## Performance

- Uses `InstancedMesh` for optimal rendering of many identical parts
- Loads each unique part geometry only once
- Batches transformations for efficient GPU rendering
- Supports thousands of bricks with smooth performance

## Color Support

The component includes a simplified color mapping for common LEGO colors. For full color support, you may want to:

1. Use a complete Rebrickable color database
2. Implement per-instance vertex colors
3. Create separate InstancedMeshes per color (if needed)

## Example Files

- `LegoUniverse.tsx` - Main component
- `LegoUniverseExample.tsx` - Usage example with Canvas setup

## Future Enhancements

- Full per-instance color support
- Progressive loading with visual feedback
- Chapter-based rendering (using Gemini for build organization)
- Interactive brick selection and highlighting
- Export to LDraw format
