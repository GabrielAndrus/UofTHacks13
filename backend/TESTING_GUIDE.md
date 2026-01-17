# Testing Guide

Complete guide for testing the Three.js Pipeline integration.

## Prerequisites

1. **Environment Setup**:
   ```bash
   cd backend
   source .venv/bin/activate  # or your virtual environment
   pip install -r requirements.txt
   ```

2. **Environment Variables** (`.env` file):
   ```bash
   TWELVE_LABS_API_KEY=your_key
   REBRICKABLE_API_KEY=your_key
   BACKBOARD_API_KEY=your_key
   PART_SEARCH_MODE=simple  # or "hard" for Backboard AI search
   ```

3. **Start the FastAPI Server**:
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## Test Categories

### 1. Unit Tests (Python)

#### Test Three.js Pipeline Components
```bash
python tests/test_threejs_pipeline.py
```

**Tests:**
- ✅ Scene Delta recording
- ✅ Interactive instructions generation
- ✅ Three.js mesh format validation
- ✅ Voxel conversion
- ✅ Full pipeline simulation

#### Test Master Builder
```bash
python tests/test_master_builder.py
```

**Tests:**
- ✅ Greedy fitting algorithm
- ✅ Laminar interlocking
- ✅ Mixed colors
- ✅ Priority sorting

#### Test Rebrickable Integration
```bash
python tests/test_rebrickable_integration.py
```

**Tests:**
- ✅ Color mapping
- ✅ Part availability verification
- ✅ Full pipeline with verification
- ✅ Fallback logic

### 2. API Endpoint Tests

#### Start Server First
```bash
# Terminal 1
python -m uvicorn app.main:app --reload
```

#### Run API Tests
```bash
# Terminal 2
python tests/test_api_endpoints.py
```

**Tests:**
- ✅ `GET /` - Root endpoint
- ✅ `POST /master-builder/process` - Voxel processing
- ✅ `POST /threejs/voxelize` - Mesh voxelization
- ✅ `GET /backboard/{thread_id}/instructions` - Interactive instructions

### 3. Manual API Testing

#### Using curl

**Test Root Endpoint:**
```bash
curl http://localhost:8000/
```

**Test Master Builder:**
```bash
curl -X POST "http://localhost:8000/master-builder/process" \
  -H "Content-Type: application/json" \
  -d '{
    "voxels": [
      {"x": 0, "y": 0, "z": 0, "hex_color": "#FF0000"},
      {"x": 1, "y": 0, "z": 0, "hex_color": "#FF0000"},
      {"x": 2, "y": 0, "z": 0, "hex_color": "#FF0000"}
    ]
  }'
```

**Test Three.js Voxelize:**
```bash
curl -X POST "http://localhost:8000/threejs/voxelize" \
  -H "Content-Type: application/json" \
  -d '{
    "vertices": [[0, 0, 0], [8, 0, 0], [8, 8, 0], [0, 8, 0]],
    "faces": [[0, 1, 2], [0, 2, 3]]
  }'
```

**Test Backboard Instructions:**
```bash
# First, create a session and add objects, then:
curl "http://localhost:8000/backboard/{thread_id}/instructions"
```

#### Using FastAPI Docs

1. Start server: `python -m uvicorn app.main:app --reload`
2. Open browser: `http://localhost:8000/docs`
3. Test endpoints interactively

### 4. Frontend Testing

#### Test Voxelizer

Create a test file `frontend/test_voxelizer.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <script type="importmap">
    {
        "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
        }
    }
    </script>
</head>
<body>
    <script type="module">
        import * as THREE from 'three';
        import { voxelizeMesh, threejsJsonToMesh } from './lib/voxelizer.ts';
        
        // Test data
        const threejsData = {
            vertices: [[0, 0, 0], [8, 0, 0], [8, 8, 0], [0, 8, 0]],
            faces: [[0, 1, 2], [0, 2, 3]],
            colors: ["#FF0000"]
        };
        
        // Convert to mesh
        const mesh = threejsJsonToMesh(threejsData);
        console.log('✅ Mesh created:', mesh);
        
        // Voxelize
        const voxelGrid = voxelizeMesh(mesh, 8.0);
        console.log('✅ Voxel grid:', voxelGrid);
        console.log(`   Voxels: ${voxelGrid.voxels.length}`);
    </script>
</body>
</html>
```

#### Test Timeline Scrubber

```typescript
// frontend/test_timeline.ts
async function testTimelineScrubber() {
  const threadId = "your_thread_id";
  
  // Fetch timeline
  const response = await fetch(`http://localhost:8000/backboard/${threadId}/instructions`);
  const timeline = await response.json();
  
  console.log('Timeline:', timeline);
  
  // Scrub to timestamp 5
  const deltasUpTo5 = timeline.deltas.filter(d => d.timestamp <= 5);
  console.log(`Deltas up to timestamp 5: ${deltasUpTo5.length}`);
  
  // Apply deltas
  deltasUpTo5.forEach(delta => {
    if (delta.action === "add_brick") {
      console.log(`Show brick: ${delta.threejs_object_id}`);
    }
  });
}
```

### 5. End-to-End Testing

#### Full Pipeline Test

1. **Upload Video** (if you have Twelve Labs setup):
   ```bash
   curl -X POST "http://localhost:8000/upload_video" \
     -F "video=@/path/to/video.mp4"
   ```

2. **Analyze Object**:
   ```python
   from app.services.twelve_labs import TwelveLabsService
   
   service = TwelveLabsService()
   analysis = service.analyze_object(video_id="your_video_id")
   
   # Check Three.js mesh
   if analysis.threejs_mesh:
       print(f"Vertices: {len(analysis.threejs_mesh.vertices)}")
       print(f"Faces: {len(analysis.threejs_mesh.faces)}")
   ```

3. **Frontend: Voxelize Mesh**:
   ```typescript
   // Use voxelizer.ts to convert mesh to voxels
   const mesh = threejsJsonToMesh(analysis.threejs_mesh);
   const voxelGrid = voxelizeMesh(mesh, 8.0);
   ```

4. **Backend: Process Voxels**:
   ```bash
   curl -X POST "http://localhost:8000/master-builder/process" \
     -H "Content-Type: application/json" \
     -d @voxels.json
   ```

5. **Backend: Get Instructions**:
   ```bash
   curl "http://localhost:8000/backboard/{thread_id}/instructions"
   ```

6. **Frontend: Display Timeline**:
   - Use timeline data to show/hide Three.js objects
   - Implement scrubber UI

## Test Checklist

### Backend Tests
- [ ] Run `test_threejs_pipeline.py` - All tests pass
- [ ] Run `test_master_builder.py` - All tests pass
- [ ] Run `test_rebrickable_integration.py` - All tests pass
- [ ] Start server and test API endpoints
- [ ] Verify Scene Deltas are recorded
- [ ] Verify interactive instructions are generated

### Frontend Tests
- [ ] Test `voxelizer.ts` with sample mesh
- [ ] Test Three.js mesh conversion
- [ ] Test voxelization with different resolutions
- [ ] Test timeline scrubbing with sample deltas

### Integration Tests
- [ ] Full pipeline: Video → Mesh → Voxels → Bricks → Deltas
- [ ] Verify Three.js objects can be shown/hidden
- [ ] Test model switch tracking
- [ ] Test step markers

## Debugging

### Check Logs
```bash
# Backend logs will show:
# - Scene Delta creation
# - Brick placements
# - Model switches
# - API requests
```

### Common Issues

1. **"REBRICKABLE_API_KEY not set"**
   - Add to `.env` file
   - Restart server

2. **"Could not connect to server"**
   - Make sure server is running: `python -m uvicorn app.main:app --reload`
   - Check port 8000 is available

3. **"No parts discovered"**
   - Check `PART_SEARCH_MODE` in `.env`
   - Verify Rebrickable API key is valid
   - Check network connectivity

4. **"Scene Deltas empty"**
   - Make sure you're using the correct `thread_id`
   - Verify bricks were actually placed
   - Check `_handle_tool_calls` is being called

## Performance Testing

### Large Voxel Sets
```python
# Test with large voxel set
large_voxels = [
    {"x": x, "y": y, "z": z, "hex_color": "#FF0000"}
    for x in range(20)
    for y in range(20)
    for z in range(10)
]

# Should complete in reasonable time (< 30 seconds)
```

### Timeline Size
```python
# Test with many deltas
for i in range(1000):
    # Add delta
    # Should handle efficiently
```

## Next Steps

1. ✅ Run all unit tests
2. ✅ Test API endpoints
3. ✅ Test frontend voxelizer
4. ✅ Test full pipeline with real data
5. ✅ Implement timeline scrubber UI
6. ✅ Test with real video uploads
