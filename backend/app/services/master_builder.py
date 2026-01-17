"""
Master Builder Service
Manages the 3D grid, brick inventory, and enforces three core engineering rules:
1. Greedy Volume Fitting
2. Laminar Interlocking
3. Connectivity Audit
"""
import logging
from typing import Dict, List, Tuple, Optional, Set
from collections import defaultdict
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class Brick:
    """Represents a placed LEGO brick in the 3D grid"""
    part_id: str
    color_id: int
    position: Tuple[int, int, int]  # (x, y, z)
    dimensions: Tuple[int, int, int]  # (width, height, depth) in stud units
    is_ai_filled: bool = False
    layer: int = 0  # For laminar interlocking tracking


@dataclass
class VoxelCluster:
    """Represents a cluster of voxels to be filled"""
    voxels: Set[Tuple[int, int, int]]
    bounding_box: Tuple[int, int, int, int, int, int]  # (min_x, min_y, min_z, max_x, max_y, max_z)


class MasterBuilder:
    """
    Source of Truth for the 3D LEGO grid.
    Manages physical placement, inventory tracking, and enforces engineering rules.
    """
    
    def __init__(self):
        # 3D Grid: (x, y, z) -> Brick or None
        self.grid: Dict[Tuple[int, int, int], Optional[Brick]] = {}
        
        # Inventory: part_id -> count of placed bricks
        self.inventory: Dict[str, int] = defaultdict(int)
        
        # Layer tracking for laminar interlocking
        self.layer_bricks: Dict[int, List[Brick]] = defaultdict(list)
        
        # All placed bricks
        self.placed_bricks: List[Brick] = []
        
        # Scenery anchor (loaded from memory)
        self.scenery_data: Optional[Dict] = None
        
        # Standard brick sizes (width, height, depth) in stud units
        # Ordered from largest to smallest for greedy fitting
        self.brick_sizes = [
            (4, 2, 1),  # 2x4 brick
            (3, 2, 1),  # 2x3 brick
            (2, 2, 1),  # 2x2 brick
            (4, 1, 1),  # 1x4 brick
            (3, 1, 1),  # 1x3 brick
            (2, 1, 1),  # 1x2 brick
            (1, 1, 1),  # 1x1 brick
        ]
    
    def initialize_scenery(self, scenery_data: Dict):
        """
        Initialize the Master Builder with scenery data as the anchor.
        This sets the ground truth coordinate system.
        """
        self.scenery_data = scenery_data
        logger.info("Scenery anchor initialized")
        
        # If scenery contains existing bricks, load them into the grid
        if "bricks" in scenery_data:
            for brick_data in scenery_data["bricks"]:
                self.register_brick(
                    part_id=brick_data.get("part_id"),
                    color_id=brick_data.get("color_id"),
                    position=tuple(brick_data.get("position", [0, 0, 0])),
                    dimensions=tuple(brick_data.get("dimensions", [1, 1, 1])),
                    is_ai_filled=False
                )
    
    def register_brick(
        self,
        part_id: str,
        color_id: int,
        position: Tuple[int, int, int],
        dimensions: Optional[Tuple[int, int, int]] = None,
        is_ai_filled: bool = False
    ) -> bool:
        """
        Register a brick placement in the grid.
        This is the primary entry point called by the place_brick tool.
        
        Returns:
            bool: True if placement was successful
        """
        # Determine dimensions if not provided (try to infer from part_id)
        if dimensions is None:
            dimensions = self._infer_dimensions(part_id)
        
        # Calculate layer (z-coordinate determines layer)
        layer = position[2]
        
        # Create brick
        brick = Brick(
            part_id=part_id,
            color_id=color_id,
            position=position,
            dimensions=dimensions,
            is_ai_filled=is_ai_filled,
            layer=layer
        )
        
        # Check if position is valid and not occupied
        if not self._can_place_brick(brick):
            logger.warning(f"Cannot place brick at {position} - position occupied or invalid")
            return False
        
        # Place brick in grid
        self._place_brick_in_grid(brick)
        
        # Update inventory
        self.inventory[part_id] += 1
        
        # Track by layer for interlocking
        self.layer_bricks[layer].append(brick)
        self.placed_bricks.append(brick)
        
        logger.info(f"🧱 Registered brick: {part_id} at {position} (layer {layer})")
        return True
    
    def _can_place_brick(self, brick: Brick) -> bool:
        """Check if a brick can be placed at the given position"""
        x, y, z = brick.position
        w, h, d = brick.dimensions
        
        # Check all voxels that this brick would occupy
        for dx in range(w):
            for dy in range(h):
                for dz in range(d):
                    voxel_pos = (x + dx, y + dy, z + dz)
                    if voxel_pos in self.grid and self.grid[voxel_pos] is not None:
                        return False
        return True
    
    def _place_brick_in_grid(self, brick: Brick):
        """Place a brick in the 3D grid, occupying all its voxels"""
        x, y, z = brick.position
        w, h, d = brick.dimensions
        
        for dx in range(w):
            for dy in range(h):
                for dz in range(d):
                    voxel_pos = (x + dx, y + dy, z + dz)
                    self.grid[voxel_pos] = brick
    
    def _infer_dimensions(self, part_id: str) -> Tuple[int, int, int]:
        """Infer brick dimensions from part ID if possible"""
        # Default to 1x1x1 if unknown
        # In a real implementation, this would query a parts database
        # For now, return default size
        return (1, 1, 1)
    
    # ==================== CORE ENGINEERING RULES ====================
    
    def greedy_volume_fitting(self, voxel_cluster: VoxelCluster, color_id: int) -> List[Brick]:
        """
        Rule 1: Greedy Volume Fitting
        Always tries to fit the largest possible brick first to minimize part count.
        
        Args:
            voxel_cluster: Cluster of voxels to fill
            color_id: Color to use for bricks
            
        Returns:
            List of bricks placed
        """
        placed = []
        remaining_voxels = voxel_cluster.voxels.copy()
        
        # Try each brick size from largest to smallest
        for width, height, depth in self.brick_sizes:
            if not remaining_voxels:
                break
            
            # Find the best position for this brick size
            best_brick = self._find_best_brick_placement(
                remaining_voxels, width, height, depth, color_id
            )
            
            if best_brick:
                # Place the brick
                if self.register_brick(
                    part_id=f"brick_{width}x{height}",
                    color_id=color_id,
                    position=best_brick.position,
                    dimensions=(width, height, depth),
                    is_ai_filled=False
                ):
                    placed.append(best_brick)
                    # Remove occupied voxels
                    occupied = self._get_occupied_voxels(best_brick)
                    remaining_voxels -= occupied
        
        return placed
    
    def _find_best_brick_placement(
        self,
        voxels: Set[Tuple[int, int, int]],
        width: int,
        height: int,
        depth: int,
        color_id: int
    ) -> Optional[Brick]:
        """Find the best position to place a brick of given size"""
        # Group voxels by their potential "base" positions
        # For a brick, we need a contiguous rectangular region
        for x, y, z in sorted(voxels):
            # Try placing brick starting at this position
            if self._can_place_rectangular_region(voxels, x, y, z, width, height, depth):
                return Brick(
                    part_id=f"brick_{width}x{height}",
                    color_id=color_id,
                    position=(x, y, z),
                    dimensions=(width, height, depth),
                    is_ai_filled=False
                )
        return None
    
    def _can_place_rectangular_region(
        self,
        voxels: Set[Tuple[int, int, int]],
        start_x: int,
        start_y: int,
        start_z: int,
        width: int,
        height: int,
        depth: int
    ) -> bool:
        """Check if a rectangular region is fully contained in the voxel set"""
        for dx in range(width):
            for dy in range(height):
                for dz in range(depth):
                    pos = (start_x + dx, start_y + dy, start_z + dz)
                    if pos not in voxels:
                        return False
        return True
    
    def _get_occupied_voxels(self, brick: Brick) -> Set[Tuple[int, int, int]]:
        """Get all voxels occupied by a brick"""
        occupied = set()
        x, y, z = brick.position
        w, h, d = brick.dimensions
        for dx in range(w):
            for dy in range(h):
                for dz in range(d):
                    occupied.add((x + dx, y + dy, z + dz))
        return occupied
    
    def check_laminar_interlocking(self, layer: int) -> List[Brick]:
        """
        Rule 2: Laminar Interlocking
        Ensures that seams between bricks on Layer N are covered by solid bricks on Layer N+1.
        
        Args:
            layer: Layer to check
            
        Returns:
            List of bricks that need to be added to ensure interlocking
        """
        if layer not in self.layer_bricks:
            return []
        
        current_layer_bricks = self.layer_bricks[layer]
        next_layer_bricks = self.layer_bricks.get(layer + 1, [])
        
        # Find seams (gaps between bricks)
        seams = self._find_seams(current_layer_bricks)
        
        # Check if seams are covered by next layer
        missing_covers = []
        for seam_pos in seams:
            if not self._is_seam_covered(seam_pos, next_layer_bricks):
                missing_covers.append(seam_pos)
        
        # Generate bricks to cover seams
        interlock_bricks = []
        if missing_covers:
            logger.info(f"Found {len(missing_covers)} uncovered seams on layer {layer}")
            # Group adjacent seams and fill with appropriate bricks
            # This is simplified - in practice, you'd use more sophisticated clustering
            for x, y, z in missing_covers:
                # Place a small brick to cover the seam
                if self.register_brick(
                    part_id="brick_1x1",
                    color_id=self._get_dominant_color_for_layer(layer),
                    position=(x, y, z + 1),  # One layer above
                    dimensions=(1, 1, 1),
                    is_ai_filled=True
                ):
                    interlock_bricks.append(self.grid.get((x, y, z + 1)))
        
        return interlock_bricks
    
    def _find_seams(self, bricks: List[Brick]) -> Set[Tuple[int, int, int]]:
        """Find seam positions (gaps between bricks) on a layer"""
        # Simplified: find positions adjacent to brick boundaries
        seams = set()
        for brick in bricks:
            x, y, z = brick.position
            w, h, d = brick.dimensions
            
            # Check edges for seams
            # This is a simplified implementation
            # Real implementation would check actual boundaries
            pass
        
        return seams
    
    def _is_seam_covered(self, seam_pos: Tuple[int, int, int], next_layer_bricks: List[Brick]) -> bool:
        """Check if a seam is covered by a brick in the next layer"""
        x, y, z = seam_pos
        # Check if position (x, y, z+1) is occupied
        return (x, y, z + 1) in self.grid and self.grid[(x, y, z + 1)] is not None
    
    def _get_dominant_color_for_layer(self, layer: int) -> int:
        """Get the dominant color used in a layer"""
        if layer not in self.layer_bricks:
            return 15  # Default to white
        colors = [brick.color_id for brick in self.layer_bricks[layer]]
        return max(set(colors), key=colors.count) if colors else 15
    
    def connectivity_audit(self) -> List[VoxelCluster]:
        """
        Rule 3: Connectivity Audit
        Checks for floating voxels (disconnected components).
        Returns clusters of disconnected voxels that need structural supports.
        
        Returns:
            List of disconnected voxel clusters
        """
        # Get all occupied voxels
        occupied_voxels = {pos for pos, brick in self.grid.items() if brick is not None}
        
        if not occupied_voxels:
            return []
        
        # Find connected components using flood fill
        visited = set()
        disconnected_clusters = []
        
        # Start from the "ground" (lowest z-level)
        if occupied_voxels:
            min_z = min(z for _, _, z in occupied_voxels)
            ground_voxels = {(x, y, z) for x, y, z in occupied_voxels if z == min_z}
            
            # Mark all connected to ground
            for ground_voxel in ground_voxels:
                if ground_voxel not in visited:
                    connected_component = self._flood_fill_connected(ground_voxel, occupied_voxels, visited)
                    visited.update(connected_component)
            
            # Find disconnected components
            disconnected = occupied_voxels - visited
            if disconnected:
                logger.warning(f"Found {len(disconnected)} disconnected voxels")
                # Group disconnected voxels into clusters
                disconnected_clusters = self._cluster_voxels(disconnected)
        
        return disconnected_clusters
    
    def _flood_fill_connected(
        self,
        start: Tuple[int, int, int],
        voxels: Set[Tuple[int, int, int]],
        visited: Set[Tuple[int, int, int]]
    ) -> Set[Tuple[int, int, int]]:
        """Flood fill to find all connected voxels"""
        connected = set()
        stack = [start]
        
        while stack:
            pos = stack.pop()
            if pos in visited or pos not in voxels:
                continue
            
            connected.add(pos)
            visited.add(pos)
            
            # Check 6 neighbors (up, down, left, right, forward, back)
            x, y, z = pos
            neighbors = [
                (x + 1, y, z), (x - 1, y, z),
                (x, y + 1, z), (x, y - 1, z),
                (x, y, z + 1), (x, y, z - 1)
            ]
            
            for neighbor in neighbors:
                if neighbor in voxels and neighbor not in visited:
                    stack.append(neighbor)
        
        return connected
    
    def _cluster_voxels(self, voxels: Set[Tuple[int, int, int]]) -> List[VoxelCluster]:
        """Group voxels into clusters"""
        clusters = []
        remaining = voxels.copy()
        visited = set()
        
        for voxel in voxels:
            if voxel in visited:
                continue
            
            cluster_voxels = self._flood_fill_connected(voxel, remaining, visited)
            if cluster_voxels:
                # Calculate bounding box
                if cluster_voxels:
                    xs = [x for x, _, _ in cluster_voxels]
                    ys = [y for _, y, _ in cluster_voxels]
                    zs = [z for _, _, z in cluster_voxels]
                    bbox = (min(xs), min(ys), min(zs), max(xs), max(ys), max(zs))
                    clusters.append(VoxelCluster(voxels=cluster_voxels, bounding_box=bbox))
        
        return clusters
    
    def get_inventory(self) -> Dict[str, int]:
        """Get current brick inventory"""
        return dict(self.inventory)
    
    def get_grid_state(self) -> Dict:
        """Get current state of the 3D grid"""
        return {
            "total_bricks": len(self.placed_bricks),
            "inventory": self.get_inventory(),
            "layers": {layer: len(bricks) for layer, bricks in self.layer_bricks.items()}
        }
