"""
Data Contracts for Master Builder and Backboard Integration

This module defines the JSON data structures that flow through the system:
1. Scenery Anchor - Ground Truth loaded during start_session
2. Object Integration - Injected via add_object_to_world
3. Master Manifest - Final output combining scenery and objects
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Tuple


# ==================== SCENERY ANCHOR (Ground Truth) ====================

class WorldMetadata(BaseModel):
    """Metadata about the world/scenery coordinate system"""
    world_name: str
    coordinate_system: str = "stud_grid"  # "stud_grid" or "millimeter"
    base_plate_size: Optional[Tuple[int, int]] = None  # (width, height) in studs
    origin: Tuple[int, int, int] = (0, 0, 0)  # Ground truth origin (x, y, z)
    style_theme: Optional[str] = None  # e.g., "cyberpunk", "medieval", "modern"
    color_palette: Optional[List[int]] = None  # List of color_ids used in scenery


class SceneryLayer(BaseModel):
    """A single layer of scenery bricks"""
    layer_z: int  # Z-coordinate (height) of this layer
    bricks: List[Dict[str, Any]]  # List of brick placements
    # Each brick dict contains: part_id, color_id, position, dimensions


class SceneryAnchor(BaseModel):
    """
    Scenery Anchor: The immutable 3D anchor loaded during start_session.
    This is the "Ground Truth" coordinate system stored in Backboard thread memory.
    
    Used in: start_session(scenery_data: SceneryAnchor)
    """
    world_metadata: WorldMetadata
    scenery_layers: List[SceneryLayer]
    
    class Config:
        json_schema_extra = {
            "example": {
                "world_metadata": {
                    "world_name": "cyberpunk-city",
                    "coordinate_system": "stud_grid",
                    "base_plate_size": [48, 48],
                    "origin": [0, 0, 0],
                    "style_theme": "cyberpunk",
                    "color_palette": [1, 7, 8, 15]
                },
                "scenery_layers": [
                    {
                        "layer_z": 0,
                        "bricks": [
                            {
                                "part_id": "brick_2x4",
                                "color_id": 7,
                                "position": [0, 0, 0],
                                "dimensions": [4, 2, 1]
                            }
                        ]
                    }
                ]
            }
        }


# ==================== OBJECT INTEGRATION ====================

class VoxelCloud(BaseModel):
    """3D point cloud representing object voxels"""
    voxels: List[Tuple[int, int, int]]  # List of (x, y, z) positions
    bounding_box: Tuple[int, int, int, int, int, int]  # (min_x, min_y, min_z, max_x, max_y, max_z)
    dominant_colors: List[str]  # Hex color strings from TwelveLabs analysis


class MissingSurface(BaseModel):
    """Represents a missing surface that needs AI-filled bricks"""
    surface_type: str  # e.g., "base", "side", "top", "structural_support"
    voxel_region: List[Tuple[int, int, int]]  # Voxels that form this missing surface
    critical_for_stability: bool = False


class StructuralMetadata(BaseModel):
    """Structural analysis metadata for object integration"""
    dimensions_mm: Dict[str, float]  # {"height": 120.5, "width": 80.2, "depth": 60.0}
    complexity_flags: Dict[str, bool]  # {"is_airy": True, "has_curves": False, "has_floating_parts": True}
    missing_surfaces: List[MissingSurface] = []
    connectivity_issues: List[str] = []  # Descriptions of structural connectivity problems
    suggested_supports: Optional[List[Dict[str, Any]]] = None  # AI-suggested support pillar locations


class ObjectIntegration(BaseModel):
    """
    Object Integration: Data structure injected via add_object_to_world.
    Contains the voxel cloud from TwelveLabs analysis and structural metadata.
    
    Used in: add_object_to_world(thread_id, object_data: ObjectIntegration)
    """
    object_id: str
    object_name: Optional[str] = None
    voxel_cloud: VoxelCloud
    structural_metadata: StructuralMetadata
    source_analysis: Optional[Dict[str, Any]] = None  # Original TwelveLabs analysis data
    
    class Config:
        json_schema_extra = {
            "example": {
                "object_id": "obj_house_001",
                "object_name": "Cyberpunk House",
                "voxel_cloud": {
                    "voxels": [(10, 10, 5), (11, 10, 5), (10, 11, 5), ...],
                    "bounding_box": (10, 10, 5, 20, 20, 15),
                    "dominant_colors": ["#1A1A1A", "#4B9F4A"]
                },
                "structural_metadata": {
                    "dimensions_mm": {"height": 120.0, "width": 100.0, "depth": 80.0},
                    "complexity_flags": {"is_airy": True, "has_curves": False, "has_floating_parts": False},
                    "missing_surfaces": [
                        {
                            "surface_type": "base",
                            "voxel_region": [(10, 10, 5), (11, 10, 5)],
                            "critical_for_stability": True
                        }
                    ],
                    "connectivity_issues": [],
                    "suggested_supports": None
                }
            }
        }


# ==================== MASTER MANIFEST (Final Output) ====================

class AssemblyStep(BaseModel):
    """A single step in the assembly instructions"""
    step_number: int
    description: str
    brick_placements: List[Dict[str, Any]]  # List of bricks placed in this step
    # Each placement: {part_id, color_id, position, dimensions, is_ai_filled}
    layer_z: Optional[int] = None  # Z-layer this step builds
    step_type: str = "standard"  # "standard", "structural_support", "gap_filling", "interlocking"


class InventoryItem(BaseModel):
    """Inventory item for the final manifest"""
    part_id: str
    quantity: int
    color_id: Optional[int] = None  # If None, color varies
    usage_breakdown: Optional[Dict[str, int]] = None  # {"standard": 50, "ai_filled": 5, "interlock": 2}


class MasterManifest(BaseModel):
    """
    Master Manifest: Final output combining scenery and objects into a unified assembly guide.
    
    This is the complete build specification that can be exported for instructions or inventory.
    """
    manifest_version: str = "1.0"
    world_name: str
    total_bricks: int
    total_steps: int
    
    # Assembly sequence
    assembly_steps: List[AssemblyStep]
    
    # Complete inventory
    inventory: List[InventoryItem]
    
    # Engineering rule summaries
    interlock_bricks_added: int = 0  # Bricks added for laminar interlocking
    ai_filled_bricks: int = 0  # Bricks generated by AI for gaps/supports
    connectivity_supports_added: int = 0  # Support pillars added for floating parts
    
    # Grid state
    layers: Dict[int, int]  # layer_z -> brick_count
    bounding_box: Tuple[int, int, int, int, int, int]  # Overall bounding box
    
    class Config:
        json_schema_extra = {
            "example": {
                "manifest_version": "1.0",
                "world_name": "cyberpunk-city",
                "total_bricks": 1523,
                "total_steps": 45,
                "assembly_steps": [
                    {
                        "step_number": 1,
                        "description": "Build base layer of scenery",
                        "brick_placements": [...],
                        "layer_z": 0,
                        "step_type": "standard"
                    }
                ],
                "inventory": [
                    {
                        "part_id": "brick_2x4",
                        "quantity": 250,
                        "color_id": 7,
                        "usage_breakdown": {"standard": 240, "interlock": 10}
                    }
                ],
                "interlock_bricks_added": 45,
                "ai_filled_bricks": 23,
                "connectivity_supports_added": 8,
                "layers": {0: 500, 1: 450, 2: 573},
                "bounding_box": (0, 0, 0, 48, 48, 20)
            }
        }


# ==================== MEMORY FLOW TYPES ====================

class ThreadMemoryState(BaseModel):
    """
    Represents the state stored in Backboard thread memory.
    This is what gets persisted across object additions.
    """
    scenery_anchor: SceneryAnchor
    integrated_objects: List[str]  # List of object_ids that have been added
    current_grid_state: Dict[str, Any]  # Snapshot of Master Builder grid state
    style_context: Dict[str, Any]  # Cached style information (colors, themes)
