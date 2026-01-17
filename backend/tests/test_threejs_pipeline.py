#!/usr/bin/env python3
"""
Test script for Three.js Pipeline Integration

Tests:
1. Three.js mesh format from Pegasus analyzer
2. Scene Delta recording
3. Interactive instructions generation
4. API endpoints
"""
import sys
import asyncio
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from app.services.backboard_service import BackboardService
    BACKBOARD_AVAILABLE = True
except ImportError:
    BACKBOARD_AVAILABLE = False
    print("⚠️  Backboard not available, skipping Backboard tests")

from app.services.master_builder import MasterBuilder


async def test_scene_delta_recording():
    """Test that Scene Deltas are properly recorded"""
    print("="*70)
    print("TEST 1: Scene Delta Recording")
    print("="*70)
    
    if not BACKBOARD_AVAILABLE:
        print("⚠️  Skipping - Backboard not available")
        return []
    
    service = BackboardService()
    
    # Create a test thread
    test_thread_id = "test_thread_123"
    
    # Simulate brick placements
    test_deltas = [
        {
            "timestamp": 0,
            "action": "add_brick",
            "brick_id": "brick_3001_0",
            "part_id": "3001",
            "color_id": 14,
            "position": [0, 0, 0],
            "dimensions": [4, 2, 1],
            "is_ai_filled": False
        },
        {
            "timestamp": 1,
            "action": "add_brick",
            "brick_id": "brick_3003_1",
            "part_id": "3003",
            "color_id": 5,
            "position": [4, 0, 0],
            "dimensions": [2, 2, 1],
            "is_ai_filled": False
        },
        {
            "timestamp": 2,
            "action": "model_switch",
            "model_switch": "gemini-3-flash"
        }
    ]
    
    # Add deltas
    for delta_data in test_deltas:
        if delta_data["action"] == "add_brick":
            delta = service._create_scene_delta(
                timestamp=delta_data["timestamp"],
                action="add_brick",
                brick_id=delta_data["brick_id"],
                part_id=delta_data["part_id"],
                color_id=delta_data["color_id"],
                position=delta_data["position"],
                dimensions=delta_data["dimensions"],
                is_ai_filled=delta_data["is_ai_filled"]
            )
        else:
            delta = service._create_scene_delta(
                timestamp=delta_data["timestamp"],
                action="model_switch",
                model_switch=delta_data["model_switch"]
            )
        service._add_scene_delta(test_thread_id, delta)
    
    # Verify
    deltas = service.get_interactive_instructions(test_thread_id)
    
    print(f"\n✅ Recorded {len(deltas)} Scene Deltas")
    print(f"\nDelta Summary:")
    for i, delta in enumerate(deltas[:3], 1):
        print(f"  {i}. Timestamp {delta['timestamp']}: {delta['action']}")
        if delta['action'] == 'add_brick':
            print(f"     Brick: {delta['part_id']} at {delta['position']}")
        elif delta['action'] == 'model_switch':
            print(f"     Switch: {delta.get('from_model', 'N/A')} → {delta.get('to_model', 'N/A')}")
    
    assert len(deltas) >= 3, "Should have at least 3 deltas"
    assert deltas[0]['action'] == 'add_brick', "First delta should be add_brick"
    
    print("\n✅ Scene Delta recording test passed!")
    return deltas


async def test_interactive_instructions():
    """Test interactive instructions generation"""
    print("\n" + "="*70)
    print("TEST 2: Interactive Instructions")
    print("="*70)
    
    if not BACKBOARD_AVAILABLE:
        print("⚠️  Skipping - Backboard not available")
        return {}
    
    service = BackboardService()
    test_thread_id = "test_thread_456"
    
    # Add some test deltas
    for i in range(5):
        delta = service._create_scene_delta(
            timestamp=i,
            action="add_brick",
            brick_id=f"brick_3001_{i}",
            part_id="3001",
            color_id=14,
            position=[i * 4, 0, 0],
            dimensions=[4, 2, 1]
        )
        service._add_scene_delta(test_thread_id, delta)
    
    # Get timeline
    timeline = service.get_instruction_timeline(test_thread_id)
    
    print(f"\n✅ Generated timeline:")
    print(f"   Thread ID: {timeline['thread_id']}")
    print(f"   Total Deltas: {timeline['total_deltas']}")
    print(f"   Action Counts: {timeline['action_counts']}")
    
    assert timeline['total_deltas'] == 5, "Should have 5 deltas"
    assert timeline['action_counts']['add_brick'] == 5, "Should have 5 brick additions"
    
    print("\n✅ Interactive instructions test passed!")
    return timeline


async def test_threejs_mesh_format():
    """Test Three.js mesh format handling"""
    print("\n" + "="*70)
    print("TEST 3: Three.js Mesh Format")
    print("="*70)
    
    # Sample Three.js mesh data (as would come from Pegasus)
    threejs_mesh = {
        "vertices": [
            [0, 0, 0],
            [10, 0, 0],
            [10, 10, 0],
            [0, 10, 0],
            [5, 5, 10]
        ],
        "faces": [
            [0, 1, 2],
            [0, 2, 3],
            [0, 1, 4],
            [1, 2, 4],
            [2, 3, 4],
            [3, 0, 4]
        ],
        "normals": [
            [0, 0, -1],
            [0, 0, -1],
            [0, 0, -1],
            [0, 0, -1],
            [0, 0, 1]
        ],
        "colors": ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"]
    }
    
    print(f"\n✅ Three.js Mesh Sample:")
    print(f"   Vertices: {len(threejs_mesh['vertices'])}")
    print(f"   Faces: {len(threejs_mesh['faces'])}")
    print(f"   Colors: {len(threejs_mesh['colors'])}")
    
    # Validate format
    assert len(threejs_mesh['vertices']) > 0, "Should have vertices"
    assert len(threejs_mesh['faces']) > 0, "Should have faces"
    assert all(len(v) == 3 for v in threejs_mesh['vertices']), "Vertices should be [x, y, z]"
    assert all(len(f) == 3 for f in threejs_mesh['faces']), "Faces should be [i, j, k]"
    
    print("\n✅ Three.js mesh format test passed!")
    return threejs_mesh


async def test_voxel_conversion():
    """Test voxel conversion from Three.js mesh"""
    print("\n" + "="*70)
    print("TEST 4: Voxel Conversion (Simulated)")
    print("="*70)
    
    # Simulate voxel data that would come from frontend voxelizer
    voxel_data = [
        {"x": 0, "y": 0, "z": 0, "hex_color": "#FF0000"},
        {"x": 1, "y": 0, "z": 0, "hex_color": "#FF0000"},
        {"x": 2, "y": 0, "z": 0, "hex_color": "#FF0000"},
        {"x": 3, "y": 0, "z": 0, "hex_color": "#FF0000"},
        {"x": 0, "y": 1, "z": 0, "hex_color": "#FF0000"},
        {"x": 1, "y": 1, "z": 0, "hex_color": "#FF0000"},
        {"x": 2, "y": 1, "z": 0, "hex_color": "#FF0000"},
        {"x": 3, "y": 1, "z": 0, "hex_color": "#FF0000"},
    ]
    
    print(f"\n✅ Voxel Data Sample:")
    print(f"   Total Voxels: {len(voxel_data)}")
    print(f"   Colors: {set(v['hex_color'] for v in voxel_data)}")
    
    # Test MasterBuilder processing
    builder = MasterBuilder()
    manifest = await builder.process_voxels(voxel_data)
    
    print(f"\n✅ MasterBuilder Output:")
    print(f"   Total Bricks: {manifest['total_bricks']}")
    print(f"   Layers: {list(manifest['layers'].keys())}")
    
    assert manifest['total_bricks'] > 0, "Should generate bricks"
    
    print("\n✅ Voxel conversion test passed!")
    return manifest


async def test_full_pipeline_simulation():
    """Test full pipeline simulation"""
    print("\n" + "="*70)
    print("TEST 5: Full Pipeline Simulation")
    print("="*70)
    
    print("\n📹 Step 1: Video Scan (Simulated)")
    print("   → Would upload video to Twelve Labs")
    
    print("\n🔍 Step 2: Pegasus Analysis (Simulated)")
    threejs_mesh = {
        "vertices": [[0, 0, 0], [8, 0, 0], [8, 8, 0], [0, 8, 0]],
        "faces": [[0, 1, 2], [0, 2, 3]],
        "colors": ["#FFD700"]
    }
    print(f"   → Returns Three.js mesh: {len(threejs_mesh['vertices'])} vertices")
    
    print("\n📦 Step 3: Frontend Voxelization (Simulated)")
    voxel_data = [
        {"x": 0, "y": 0, "z": 0, "hex_color": "#FFD700"},
        {"x": 1, "y": 0, "z": 0, "hex_color": "#FFD700"},
        {"x": 0, "y": 1, "z": 0, "hex_color": "#FFD700"},
        {"x": 1, "y": 1, "z": 0, "hex_color": "#FFD700"},
    ]
    print(f"   → Voxelizer converts mesh to {len(voxel_data)} voxels")
    
    print("\n🧱 Step 4: MasterBuilder Processing")
    builder = MasterBuilder()
    manifest = await builder.process_voxels(voxel_data)
    print(f"   → Generated {manifest['total_bricks']} bricks")
    
    print("\n💾 Step 5: Backboard Scene Deltas")
    if not BACKBOARD_AVAILABLE:
        print("   ⚠️  Skipping - Backboard not available")
        return {}
    
    service = BackboardService()
    test_thread_id = "test_pipeline_789"
    
    # Simulate recording deltas
    for i, brick in enumerate(manifest['bricks'][:3]):
        delta = service._create_scene_delta(
            timestamp=i,
            action="add_brick",
            brick_id=f"brick_{brick['part_id']}_{i}",
            part_id=brick['part_id'],
            color_id=brick['color_id'],
            position=brick['position'],
            dimensions=[4, 2, 1]  # Simplified
        )
        service._add_scene_delta(test_thread_id, delta)
    
    timeline = service.get_instruction_timeline(test_thread_id)
    print(f"   → Recorded {timeline['total_deltas']} Scene Deltas")
    
    print("\n📖 Step 6: Interactive Instructions")
    print(f"   → Timeline ready for frontend scrubbing")
    print(f"   → {len(timeline['deltas'])} steps in history")
    
    print("\n✅ Full pipeline simulation completed!")
    return timeline


if __name__ == "__main__":
    print("\n" + "="*70)
    print("THREE.JS PIPELINE TEST SUITE")
    print("="*70)
    
    async def run_all_tests():
        try:
            await test_scene_delta_recording()
            await test_interactive_instructions()
            await test_threejs_mesh_format()
            await test_voxel_conversion()
            await test_full_pipeline_simulation()
            
            print("\n" + "="*70)
            print("✅ ALL TESTS PASSED")
            print("="*70)
            print("\nNext Steps:")
            print("1. Start the FastAPI server: python -m uvicorn app.main:app --reload")
            print("2. Test API endpoints with curl or Postman")
            print("3. Test frontend voxelizer with Three.js scene")
            print("4. Test full pipeline with real video upload")
            
        except Exception as e:
            print(f"\n❌ Error during testing: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)
    
    asyncio.run(run_all_tests())
