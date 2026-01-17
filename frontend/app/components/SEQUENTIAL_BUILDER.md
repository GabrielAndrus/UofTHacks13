# Sequential Builder Component

## Overview

The `SequentialBuilder` component animates LEGO brick placement layer by layer, creating a visual "build animation" where bricks drop in from above with bounce effects.

## Features

✅ **Layer-Based Building**: Groups bricks by Y coordinate to create logical build layers  
✅ **Drop-In Animations**: Bricks fall from Y+10 to target position with bounce effect  
✅ **Sequential Timing**: Processes one layer every 500ms (configurable)  
✅ **Status HUD**: Real-time progress display showing current layer and brick count  
✅ **Backboard Sync**: Fetches Scene Deltas from Backboard API (with fallback)  
✅ **Smooth Animations**: Uses easing functions for natural bounce effects  

## Usage

```tsx
import { SequentialBuilder } from './components/SequentialBuilder';
import { Canvas } from '@react-three/fiber';

<Canvas>
  <SequentialBuilder
    manifest={bedroomManifest}
    threadId="bedroom_build_001"
    buildName="Bedroom"
    layerDelay={500}
    dropHeight={10}
    showHUD={true}
  />
</Canvas>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `manifest` | `LegoManifest` | **required** | The LEGO manifest with bricks array |
| `threadId` | `string` | `'placeholder_thread_001'` | Backboard thread ID for Scene Deltas |
| `buildName` | `string` | `'Bedroom'` | Name displayed in Status HUD |
| `layerDelay` | `number` | `500` | Milliseconds between layers |
| `dropHeight` | `number` | `10` | Height above target to drop from (in studs) |
| `showHUD` | `boolean` | `true` | Show/hide the status overlay |

## How It Works

### 1. Layer Grouping

On component mount, bricks are grouped by their Y coordinate:

```typescript
const buildLayers = [
  { y: 0, bricks: [...] },  // Floor layer
  { y: 1, bricks: [...] },  // First layer
  { y: 2, bricks: [...] },  // Second layer
  // ...
];
```

Layers are sorted from bottom to top (lowest Y to highest Y).

### 2. Sequential Processing

The component processes one layer at a time:

1. **Start Animation**: All bricks in the current layer begin dropping
2. **Wait**: Timer waits `layerDelay` milliseconds
3. **Next Layer**: Move to the next layer and repeat

### 3. Drop-In Animation

Each brick animates from `startY = targetY + dropHeight` to `targetY`:

- Uses `easeOutBounce` easing function for natural bounce
- Animation speed: `delta * 2` (adjustable)
- Progress tracked from 0 to 1

### 4. Status HUD

Displays:
- **Build Name**: "Building: Bedroom"
- **Current Step**: "Step: 3 / 15"
- **Brick Count**: "Bricks: 45 / 148"
- **Progress Bar**: Visual progress indicator

### 5. Backboard Integration

Fetches Scene Deltas from:
```
GET /backboard/{thread_id}/deltas
```

If the API is unavailable, falls back to using the manifest directly.

## Animation Details

### Bounce Easing

Uses `easeOutBounce` function for realistic physics:

```typescript
function easeOutBounce(t: number): number {
  // Creates a bounce effect at the end of animation
  // Returns value between 0 and 1
}
```

### Coordinate System

- **Position**: Measured in LEGO studs (1 stud = 8mm)
- **Height**: LEGO brick height = 9.6mm per layer
- **Drop Height**: Default 10 studs above target

## Example Files

- `SequentialBuilder.tsx` - Main component
- `SequentialBuilderExample.tsx` - Usage example
- `bedroom_lego_manifest.json` - Sample manifest (in `/public`)

## Integration with LegoUniverse

The `SequentialBuilder` wraps the `LegoUniverse` component and:

1. Filters the manifest to show only visible bricks
2. Updates brick positions during animation
3. Passes the filtered manifest to `LegoUniverse` for rendering

## Performance

- Uses React Three Fiber's `useFrame` for efficient animation updates
- Only renders visible bricks (not yet placed bricks are hidden)
- InstancedMesh rendering for optimal GPU performance

## Future Enhancements

- [ ] Chapter-based building (using Gemini for logical grouping)
- [ ] Pause/Resume controls
- [ ] Speed adjustment slider
- [ ] Camera auto-follow for current layer
- [ ] Sound effects for brick placement
- [ ] Particle effects on impact
