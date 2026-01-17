# Master Builder Architecture Specification

## Core Architectural Strategy

The system uses **Backboard.io** as a persistent state manager and **Gemini 3 Pro** as a spatial architect. The build follows a **"Scenery-First"** pattern where the scenery acts as an immutable 3D anchor in the thread's memory.

## Memory Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BACKBOARD THREAD MEMORY                   │
│                  (Persistent State Manager)                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Memory="Auto"
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────────┐                  ┌──────────────────┐
│  SCENERY ANCHOR  │                  │ OBJECT INTEGRATION│
│  (Ground Truth)  │                  │  (Per Addition)   │
│                  │                  │                   │
│ - world_metadata │                  │ - voxel_cloud     │
│ - scenery_layers │                  │ - structural_meta │
└──────────────────┘                  └──────────────────┘
        │                                       │
        │                                       │
        └───────────────┬───────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │   MASTER BUILDER      │
            │  (Source of Truth)    │
            │                       │
            │ - 3D Grid State       │
            │ - Brick Inventory     │
            │ - Layer Tracking      │
            └───────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │   MASTER MANIFEST     │
            │   (Final Output)      │
            │                       │
            │ - Assembly Steps      │
            │ - Complete Inventory  │
            │ - Engineering Stats   │
            └───────────────────────┘
```

## Data Contracts

### 1. Scenery Anchor (Ground Truth)

**Loaded during**: `start_session(scenery_data: SceneryAnchor)`

**Purpose**: Establishes the immutable coordinate system and style context.

**Structure**:
```python
SceneryAnchor(
    world_metadata: WorldMetadata,  # Coordinate system, origin, theme
    scenery_layers: List[SceneryLayer]  # All scenery bricks by layer
)
```

**Memory Behavior**: 
- Stored as system message in Backboard thread
- Persists across all object additions
- Acts as "ground truth" for coordinate alignment

### 2. Object Integration

**Injected via**: `add_object_to_world(thread_id, object_data: ObjectIntegration)`

**Purpose**: Provides voxel data and structural metadata for a new object.

**Structure**:
```python
ObjectIntegration(
    object_id: str,
    voxel_cloud: VoxelCloud,  # 3D point cloud
    structural_metadata: StructuralMetadata  # Dimensions, complexity, missing surfaces
)
```

**Memory Behavior**:
- Added as user message in thread
- Gemini 3 Pro queries thread memory to access scenery anchor
- Context is maintained for style consistency

### 3. Master Manifest (Final Output)

**Generated after**: All objects integrated

**Purpose**: Unified assembly guide combining scenery and objects.

**Structure**:
```python
MasterManifest(
    assembly_steps: List[AssemblyStep],  # Step-by-step instructions
    inventory: List[InventoryItem],      # Complete parts list
    interlock_bricks_added: int,         # Engineering rule stats
    ai_filled_bricks: int,
    connectivity_supports_added: int
)
```

## Master Builder Rules (Laws of Physics)

The MasterBuilder service enforces three core engineering rules:

### Rule 1: Greedy Volume Fitting
- **Principle**: Prioritize largest possible bricks to minimize inventory
- **Implementation**: Try brick sizes 2x4 → 2x3 → 2x2 → 1x4 → ... → 1x1
- **Applied During**: Bulk Phase (Phase 2)

### Rule 2: Laminar Interlocking
- **Principle**: Stagger seams between layers for physical structural integrity
- **Implementation**: Ensure seams on Layer N are covered by solid bricks on Layer N+1
- **Applied After**: Each layer completion
- **Result**: Adds covering bricks automatically

### Rule 3: Connectivity Audit
- **Principle**: Use flood-fill to find "floating" voxels disconnected from scenery
- **Implementation**: 
  1. Mark all voxels connected to ground (flood-fill from base layer)
  2. Identify disconnected clusters
  3. Trigger Gemini 3 Pro to generate "AI-filled" support pillars
- **Applied After**: Object placement
- **Result**: AI-generated support structures anchored to scenery

## Two-Phase Build Execution

All object additions follow this sequence within the Backboard Thread:

### Phase 1: Architectural (High Thinking)
- **Model**: Gemini 3 Pro
- **Purpose**: Analyze object vs. scenery memory to design support structures
- **Activities**:
  1. Query thread memory for scenery anchor
  2. Compare object voxel_cloud with scenery layers
  3. Identify missing_surfaces from structural_metadata
  4. Design support pillars for floating parts
  5. Strategic `place_brick` calls for structural integrity

**Memory Access**: Reads scenery anchor and style context from thread memory

### Phase 2: Bulk (Low Thinking)
- **Model**: Gemini 3 Flash
- **Purpose**: Execute high-volume brick placements for solid interiors
- **Activities**:
  1. Apply Greedy Volume Fitting algorithm
  2. Fill remaining voxels with largest bricks first
  3. Rapid `place_brick` tool calls for all solid areas
  4. Minimize part count

**Memory Access**: Continues from Phase 1 context

## Tool Integration

### place_brick Tool
```python
{
    "name": "place_brick",
    "parameters": {
        "part_id": str,
        "color_id": int,
        "position": [x, y, z],
        "dimensions": [w, h, d],  # optional
        "is_ai_filled": bool      # true for AI-generated supports/gaps
    }
}
```

**Flow**: 
1. AI calls tool → BackboardService receives tool call
2. BackboardService calls `master_builder.register_brick()`
3. Master Builder updates 3D grid state
4. Tool output returned to thread

## Style Consistency

The system maintains style consistency through:

1. **Scenery Anchor**: Defines initial color_palette and style_theme
2. **Thread Memory**: AI queries memory to recall style context
3. **Inherited Context**: New objects inherit scenery's color/theme preferences
4. **AI Decision**: Gemini 3 Pro uses style context when selecting colors for AI-filled bricks

## Implementation Notes

- **DO NOT CODE FUNCTIONAL LOGIC**: This is a structural specification
- Data contracts defined in `app/models/data_contracts.py`
- Master Builder rules are design principles, not implementation details
- Two-phase execution is orchestrated by BackboardService
- All state mutations go through Master Builder (Source of Truth)
