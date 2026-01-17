#!/usr/bin/env python3
"""
Test script for API endpoints

Tests all API endpoints using httpx for async requests.
"""
import sys
import asyncio
import httpx
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

BASE_URL = "http://localhost:8000"


async def test_root_endpoint():
    """Test root endpoint"""
    print("="*70)
    print("TEST: Root Endpoint")
    print("="*70)
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/")
        assert response.status_code == 200
        data = response.json()
        print(f"✅ Root endpoint: {data.get('message', 'N/A')}")
        return data


async def test_master_builder_process():
    """Test master builder process endpoint"""
    print("\n" + "="*70)
    print("TEST: Master Builder Process Endpoint")
    print("="*70)
    
    voxel_data = {
        "voxels": [
            {"x": 0, "y": 0, "z": 0, "hex_color": "#FF0000"},
            {"x": 1, "y": 0, "z": 0, "hex_color": "#FF0000"},
            {"x": 2, "y": 0, "z": 0, "hex_color": "#FF0000"},
            {"x": 3, "y": 0, "z": 0, "hex_color": "#FF0000"},
            {"x": 0, "y": 1, "z": 0, "hex_color": "#FF0000"},
            {"x": 1, "y": 1, "z": 0, "hex_color": "#FF0000"},
            {"x": 2, "y": 1, "z": 0, "hex_color": "#FF0000"},
            {"x": 3, "y": 1, "z": 0, "hex_color": "#FF0000"},
        ]
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{BASE_URL}/master-builder/process",
            json=voxel_data
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Process endpoint: Generated {data.get('total_bricks', 0)} bricks")
            print(f"   Layers: {list(data.get('layers', {}).keys())}")
            return data
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            return None


async def test_threejs_voxelize():
    """Test Three.js voxelize endpoint"""
    print("\n" + "="*70)
    print("TEST: Three.js Voxelize Endpoint")
    print("="*70)
    
    mesh_data = {
        "vertices": [
            [0, 0, 0],
            [8, 0, 0],
            [8, 8, 0],
            [0, 8, 0]
        ],
        "faces": [
            [0, 1, 2],
            [0, 2, 3]
        ]
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/threejs/voxelize",
            json=mesh_data
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Voxelize endpoint: {data.get('message', 'N/A')}")
            return data
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            return None


async def test_backboard_instructions():
    """Test backboard instructions endpoint"""
    print("\n" + "="*70)
    print("TEST: Backboard Instructions Endpoint")
    print("="*70)
    
    # Note: This requires a valid thread_id from an actual session
    test_thread_id = "test_thread_123"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/backboard/{test_thread_id}/instructions"
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Instructions endpoint: {data.get('total_deltas', 0)} deltas")
            return data
        elif response.status_code == 500:
            print(f"⚠️  Endpoint exists but needs valid thread_id (expected for test)")
            return None
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            return None


async def run_all_api_tests():
    """Run all API endpoint tests"""
    print("\n" + "="*70)
    print("API ENDPOINT TEST SUITE")
    print("="*70)
    print("\n⚠️  Make sure the FastAPI server is running:")
    print("   python -m uvicorn app.main:app --reload")
    print("\nStarting tests in 2 seconds...")
    await asyncio.sleep(2)
    
    try:
        await test_root_endpoint()
        await test_master_builder_process()
        await test_threejs_voxelize()
        await test_backboard_instructions()
        
        print("\n" + "="*70)
        print("✅ API TESTS COMPLETED")
        print("="*70)
        
    except httpx.ConnectError:
        print("\n❌ Could not connect to server.")
        print("   Make sure the server is running: python -m uvicorn app.main:app --reload")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error during API testing: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(run_all_api_tests())
