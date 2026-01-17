"""
Test script for Three.js Bedroom Model
Extracts mesh data from the Three.js scene and converts it to LEGO bricks.
"""

import asyncio
import json
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.master_builder import MasterBuilder


def extract_bedroom_meshes():
    """
    Extract mesh data from the Three.js bedroom scene.
    Returns a list of meshes with vertices, faces, and colors.
    
    Note: The Three.js scene uses arbitrary units. We'll scale to reasonable
    LEGO dimensions. A typical LEGO minifigure is ~4cm tall, so we'll scale
    the scene so objects are in a reasonable range.
    """
    meshes = []
    
    # Scale factor: The scene uses units where a bed is ~5 units wide
    # We want the bed to be ~40 studs (32cm) wide, so scale = 8 studs per unit
    # Resolution: 8mm = 1 LEGO stud
    scale = 8.0  # Scale to LEGO stud units (1 Three.js unit = 8 studs = 64mm)
    
    # Floor (Wood) - 20x20 units, at y=0
    floor_vertices = [
        [-10*scale, 0, -10*scale], [10*scale, 0, -10*scale],
        [10*scale, 0, 10*scale], [-10*scale, 0, 10*scale]
    ]
    floor_faces = [[0, 1, 2], [0, 2, 3]]
    meshes.append({
        'vertices': floor_vertices,
        'faces': floor_faces,
        'color': '#c4a484'  # Light wood
    })
    
    # Bed Base - 5x0.8x7 units, centered at (0, 0.4, 2)
    bed_base_vertices = []
    bed_size = [5*scale, 0.8*scale, 7*scale]
    bed_pos = [0, 0.4*scale, 2*scale]
    for dx in [-0.5, 0.5]:
        for dy in [0, 1]:
            for dz in [-0.5, 0.5]:
                bed_base_vertices.append([
                    bed_pos[0] + dx * bed_size[0],
                    bed_pos[1] + dy * bed_size[1],
                    bed_pos[2] + dz * bed_size[2]
                ])
    # Create box faces
    bed_faces = [
        [0, 1, 2], [1, 3, 2],  # bottom
        [4, 5, 6], [5, 7, 6],  # top
        [0, 1, 4], [1, 5, 4],  # front
        [2, 3, 6], [3, 7, 6],  # back
        [0, 2, 4], [2, 6, 4],  # left
        [1, 3, 5], [3, 7, 5]   # right
    ]
    meshes.append({
        'vertices': bed_base_vertices,
        'faces': bed_faces,
        'color': '#333333'  # Dark gray
    })
    
    # Mattress - 5.2x0.6x6.8 units, at (0, 1.1, 2.1)
    mattress_vertices = []
    mattress_size = [5.2*scale, 0.6*scale, 6.8*scale]
    mattress_pos = [0, 1.1*scale, 2.1*scale]
    for dx in [-0.5, 0.5]:
        for dy in [0, 1]:
            for dz in [-0.5, 0.5]:
                mattress_vertices.append([
                    mattress_pos[0] + dx * mattress_size[0],
                    mattress_pos[1] + dy * mattress_size[1],
                    mattress_pos[2] + dz * mattress_size[2]
                ])
    meshes.append({
        'vertices': mattress_vertices,
        'faces': bed_faces,  # Same face structure
        'color': '#ffffff'  # White
    })
    
    # Pillows - 1.8x0.4x1.2 units
    pillow_size = [1.8*scale, 0.4*scale, 1.2*scale]
    pillow_positions = [
        [-1.2*scale, 1.5*scale, -0.5*scale],
        [1.2*scale, 1.5*scale, -0.5*scale]
    ]
    for pillow_pos in pillow_positions:
        pillow_vertices = []
        for dx in [-0.5, 0.5]:
            for dy in [0, 1]:
                for dz in [-0.5, 0.5]:
                    pillow_vertices.append([
                        pillow_pos[0] + dx * pillow_size[0],
                        pillow_pos[1] + dy * pillow_size[1],
                        pillow_pos[2] + dz * pillow_size[2]
                    ])
        meshes.append({
            'vertices': pillow_vertices,
            'faces': bed_faces,
            'color': '#ffffff'  # White
        })
    
    # Wardrobe - 4x9x1 units, at (-8, 4.5, -3)
    wardrobe_vertices = []
    wardrobe_size = [4*scale, 9*scale, 1*scale]
    wardrobe_pos = [-8*scale, 4.5*scale, -3*scale]
    for dx in [-0.5, 0.5]:
        for dy in [-0.5, 0.5]:
            for dz in [-0.5, 0.5]:
                wardrobe_vertices.append([
                    wardrobe_pos[0] + dx * wardrobe_size[0],
                    wardrobe_pos[1] + dy * wardrobe_size[1],
                    wardrobe_pos[2] + dz * wardrobe_size[2]
                ])
    meshes.append({
        'vertices': wardrobe_vertices,
        'faces': bed_faces,
        'color': '#ffffff'  # White
    })
    
    # Painting - 4x2.5 plane at (0, 5, -4.7)
    painting_vertices = [
        [-2*scale, 3.75*scale, -4.7*scale], [2*scale, 3.75*scale, -4.7*scale],
        [2*scale, 6.25*scale, -4.7*scale], [-2*scale, 6.25*scale, -4.7*scale]
    ]
    meshes.append({
        'vertices': painting_vertices,
        'faces': [[0, 1, 2], [0, 2, 3]],
        'color': '#d27d7d'  # Pink/Terracotta
    })
    
    return meshes


def simple_mesh_to_voxels(meshes, resolution=8.0):
    """
    Simple voxelization: fill bounding boxes of meshes with voxels.
    For rectangular meshes (boxes), this works well.
    """
    all_voxels = []
    voxel_set = set()
    
    for mesh in meshes:
        mesh_color = mesh['color']
        vertices = mesh['vertices']
        
        if not vertices:
            continue
        
        # Get bounding box
        mesh_min_x = min(v[0] for v in vertices)
        mesh_max_x = max(v[0] for v in vertices)
        mesh_min_y = min(v[1] for v in vertices)
        mesh_max_y = max(v[1] for v in vertices)
        mesh_min_z = min(v[2] for v in vertices)
        mesh_max_z = max(v[2] for v in vertices)
        
        # Convert bounds to stud coordinates
        min_stud_x = int(mesh_min_x / resolution)
        max_stud_x = int(mesh_max_x / resolution) + 1
        min_stud_y = int(mesh_min_y / resolution)
        max_stud_y = int(mesh_max_y / resolution) + 1
        min_stud_z = int(mesh_min_z / resolution)
        max_stud_z = int(mesh_max_z / resolution) + 1
        
        # Fill the bounding box with voxels
        for stud_x in range(min_stud_x, max_stud_x):
            for stud_y in range(min_stud_y, max_stud_y):
                for stud_z in range(min_stud_z, max_stud_z):
                    voxel_key = (stud_x, stud_y, stud_z)
                    if voxel_key not in voxel_set:
                        voxel_set.add(voxel_key)
                        all_voxels.append({
                            'x': stud_x,
                            'y': stud_y,
                            'z': stud_z,
                            'hex_color': mesh_color
                        })
    
    return all_voxels


async def test_bedroom_to_lego():
    """
    Main test: Convert bedroom model to LEGO bricks.
    """
    print("=" * 70)
    print("Testing Three.js Bedroom Model → LEGO Bricks")
    print("=" * 70)
    
    # Step 1: Extract meshes from Three.js scene
    print("\n📦 Step 1: Extracting meshes from Three.js scene...")
    meshes = extract_bedroom_meshes()
    print(f"   ✅ Extracted {len(meshes)} mesh objects")
    for i, mesh in enumerate(meshes):
        print(f"      - Mesh {i+1}: {len(mesh['vertices'])} vertices, color {mesh['color']}")
    
    # Step 2: Convert meshes to voxels
    print("\n🔲 Step 2: Converting meshes to voxel grid...")
    resolution = 8.0  # 8mm = 1 LEGO stud
    voxels = simple_mesh_to_voxels(meshes, resolution)
    print(f"   ✅ Generated {len(voxels)} voxels")
    
    if len(voxels) == 0:
        print("   ⚠️  No voxels generated! Check mesh extraction.")
        return
    
    # Show voxel distribution
    colors = {}
    for voxel in voxels:
        color = voxel['hex_color']
        colors[color] = colors.get(color, 0) + 1
    print(f"   📊 Color distribution:")
    for color, count in sorted(colors.items(), key=lambda x: -x[1]):
        print(f"      - {color}: {count} voxels")
    
    # Step 3: Process with MasterBuilder
    print("\n🧱 Step 3: Processing with MasterBuilder...")
    builder = MasterBuilder()
    
    try:
        manifest = await builder.process_voxels(voxels)
        
        print(f"\n✅ MasterBuilder completed!")
        print(f"   📋 Total bricks: {len(manifest.get('bricks', []))}")
        
        # Show brick breakdown
        brick_counts = {}
        for brick in manifest.get('bricks', []):
            part_id = brick.get('part_id', 'unknown')
            brick_counts[part_id] = brick_counts.get(part_id, 0) + 1
        
        print(f"\n   🧱 Brick breakdown:")
        for part_id, count in sorted(brick_counts.items(), key=lambda x: -x[1]):
            print(f"      - {part_id}: {count} pieces")
        
        # Show verified status
        verified_count = sum(1 for b in manifest.get('bricks', []) if b.get('is_verified', False))
        total_count = len(manifest.get('bricks', []))
        print(f"\n   ✓ Verification: {verified_count}/{total_count} bricks verified")
        
        # Save manifest to file
        output_file = Path(__file__).parent / 'bedroom_lego_manifest.json'
        with open(output_file, 'w') as f:
            json.dump(manifest, f, indent=2)
        print(f"\n   💾 Manifest saved to: {output_file}")
        
        print("\n" + "=" * 70)
        print("✅ TEST COMPLETE!")
        print("=" * 70)
        
        return manifest
        
    except Exception as e:
        print(f"\n❌ Error processing voxels: {e}")
        import traceback
        traceback.print_exc()
        return None


if __name__ == "__main__":
    # Set TEST_MODE if not set
    if not os.getenv("TEST_MODE"):
        os.environ["TEST_MODE"] = "true"
    
    asyncio.run(test_bedroom_to_lego())
