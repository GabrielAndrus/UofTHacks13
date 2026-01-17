#!/usr/bin/env python3
"""
Basic test script - Tests core functionality without external API dependencies
"""
import sys
import asyncio
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))


async def test_master_builder_basic():
    """Test MasterBuilder with simple voxel data"""
    print("="*70)
    print("BASIC TEST: MasterBuilder")
    print("="*70)
    
    from app.services.master_builder import MasterBuilder
    
    builder = MasterBuilder()
    
    # Simple 2x2 square
    voxels = [
        {"x": 0, "y": 0, "z": 0, "hex_color": "#FF0000"},
        {"x": 1, "y": 0, "z": 0, "hex_color": "#FF0000"},
        {"x": 0, "y": 1, "z": 0, "hex_color": "#FF0000"},
        {"x": 1, "y": 1, "z": 0, "hex_color": "#FF0000"},
    ]
    
    print(f"\nInput: {len(voxels)} voxels")
    manifest = await builder.process_voxels(voxels)
    
    print(f"✅ Output: {manifest['total_bricks']} bricks")
    print(f"   Layers: {list(manifest['layers'].keys())}")
    
    if manifest['bricks']:
        print(f"\nFirst brick:")
        brick = manifest['bricks'][0]
        print(f"   Part ID: {brick['part_id']}")
        print(f"   Position: {brick['position']}")
        print(f"   Color ID: {brick['color_id']}")
        print(f"   Verified: {brick.get('is_verified', False)}")
    
    assert manifest['total_bricks'] > 0, "Should generate at least one brick"
    print("\n✅ Basic MasterBuilder test passed!")
    return manifest


async def test_threejs_format():
    """Test Three.js format validation"""
    print("\n" + "="*70)
    print("BASIC TEST: Three.js Format")
    print("="*70)
    
    from app.models.schemas import ThreeJSMesh
    
    # Valid Three.js mesh
    mesh_data = {
        "vertices": [[0, 0, 0], [8, 0, 0], [8, 8, 0], [0, 8, 0]],
        "faces": [[0, 1, 2], [0, 2, 3]],
        "normals": [[0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]],
        "colors": ["#FF0000", "#00FF00", "#0000FF", "#FFFF00"]
    }
    
    try:
        mesh = ThreeJSMesh(**mesh_data)
        print(f"✅ Three.js mesh validated:")
        print(f"   Vertices: {len(mesh.vertices)}")
        print(f"   Faces: {len(mesh.faces)}")
        print(f"   Colors: {len(mesh.colors) if mesh.colors else 0}")
        print("\n✅ Three.js format test passed!")
        return mesh
    except Exception as e:
        print(f"❌ Validation failed: {e}")
        raise


def test_scene_delta_format():
    """Test Scene Delta format (without Backboard)"""
    print("\n" + "="*70)
    print("BASIC TEST: Scene Delta Format")
    print("="*70)
    
    # Sample Scene Delta
    delta = {
        "timestamp": 0,
        "action": "add_brick",
        "threejs_object_id": "brick_3001_0",
        "visible": True,
        "part_id": "3001",
        "color_id": 14,
        "position": [0, 0, 0],
        "dimensions": [4, 2, 1],
        "is_ai_filled": False
    }
    
    print(f"✅ Scene Delta format:")
    print(f"   Timestamp: {delta['timestamp']}")
    print(f"   Action: {delta['action']}")
    print(f"   Object ID: {delta['threejs_object_id']}")
    print(f"   Visible: {delta['visible']}")
    
    # Validate required fields
    required = ["timestamp", "action", "threejs_object_id"]
    assert all(k in delta for k in required), "Missing required fields"
    
    print("\n✅ Scene Delta format test passed!")
    return delta


if __name__ == "__main__":
    print("\n" + "="*70)
    print("BASIC TEST SUITE (No External APIs Required)")
    print("="*70)
    
    async def run_tests():
        try:
            await test_master_builder_basic()
            await test_threejs_format()
            test_scene_delta_format()
            
            print("\n" + "="*70)
            print("✅ ALL BASIC TESTS PASSED")
            print("="*70)
            print("\nNext: Test with server running")
            print("  python -m uvicorn app.main:app --reload")
            print("  python tests/test_api_endpoints.py")
            
        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)
    
    asyncio.run(run_tests())
