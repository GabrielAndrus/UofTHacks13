# How to Test the Program

## Quick Start (Fastest Way)

### 1. Basic Tests (No Server, No APIs Required)

```bash
cd backend
source .venv/bin/activate
TEST_MODE=true python tests/test_basic.py
```

**What it tests:**
- ✅ MasterBuilder processes voxels → generates bricks
- ✅ Three.js mesh format validation
- ✅ Scene Delta format

**Expected output:**
```
✅ ALL BASIC TESTS PASSED
```

### 2. Start the Server

```bash
# Terminal 1
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload
```

**You should see:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### 3. Test API Endpoints

#### Option A: FastAPI Interactive Docs (Recommended)

1. Open browser: **http://localhost:8000/docs**
2. You'll see all available endpoints
3. Click on any endpoint → "Try it out"
4. Fill in the request body
5. Click "Execute"

#### Option B: Using curl

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
      {"x": 2, "y": 0, "z": 0, "hex_color": "#FF0000"},
      {"x": 3, "y": 0, "z": 0, "hex_color": "#FF0000"}
    ]
  }'
```

**Expected Response:**
```json
{
  "manifest_version": "1.0",
  "total_bricks": 1,
  "bricks": [
    {
      "part_id": "3001",
      "position": [0, 0, 0],
      "rotation": 0,
      "color_id": 5,
      "is_verified": true
    }
  ],
  "layers": {"0": 1},
  "inventory": [...]
}
```

#### Option C: Run Test Script

```bash
# Terminal 2 (while server is running)
python tests/test_api_endpoints.py
```

## Test Files Available

### 1. `tests/test_basic.py`
**Purpose:** Core functionality without external dependencies  
**Run:** `TEST_MODE=true python tests/test_basic.py`  
**Tests:**
- MasterBuilder voxel processing
- Three.js format validation
- Scene Delta format

### 2. `tests/test_threejs_pipeline.py`
**Purpose:** Full Three.js pipeline integration  
**Run:** `python tests/test_threejs_pipeline.py`  
**Tests:**
- Scene Delta recording
- Interactive instructions
- Full pipeline simulation

### 3. `tests/test_api_endpoints.py`
**Purpose:** API endpoint testing  
**Run:** `python tests/test_api_endpoints.py` (requires server running)  
**Tests:**
- All HTTP endpoints
- Request/response validation

### 4. `tests/test_master_builder.py`
**Purpose:** MasterBuilder algorithm tests  
**Run:** `python tests/test_master_builder.py`  
**Tests:**
- Greedy fitting
- Laminar interlocking
- Mixed colors

## Testing Scenarios

### Scenario 1: Simple 2x2 Square
```python
voxels = [
    {"x": 0, "y": 0, "z": 0, "hex_color": "#FF0000"},
    {"x": 1, "y": 0, "z": 0, "hex_color": "#FF0000"},
    {"x": 0, "y": 1, "z": 0, "hex_color": "#FF0000"},
    {"x": 1, "y": 1, "z": 0, "hex_color": "#FF0000"},
]
# Expected: 1 brick (2x2)
```

### Scenario 2: 8x4 Rectangle
```python
voxels = [
    {"x": x, "y": y, "z": 0, "hex_color": "#00FF00"}
    for x in range(8)
    for y in range(4)
]
# Expected: 4 bricks (2x4 each)
```

### Scenario 3: Multi-Layer Cube
```python
voxels = [
    {"x": x, "y": y, "z": z, "hex_color": "#0000FF"}
    for x in range(4)
    for y in range(4)
    for z in range(4)
]
# Expected: Multiple bricks across layers
```

## Environment Variables for Testing

### Test Mode (Skip API Verification)
```bash
export TEST_MODE=true
```
**Use when:** Testing without API keys or hitting rate limits

### Search Mode
```bash
export PART_SEARCH_MODE=simple  # or "hard"
```
**Use when:** Testing part discovery

### API Keys (Optional for Basic Tests)
```bash
export REBRICKABLE_API_KEY=your_key
export BACKBOARD_API_KEY=your_key
export TWELVE_LABS_API_KEY=your_key
```

## Common Issues & Solutions

### Issue: "No bricks generated"
**Solution:** Set `TEST_MODE=true` to skip part verification

### Issue: "429 Too Many Requests"
**Solution:** 
- Wait a few minutes
- Or set `TEST_MODE=true` to skip API calls

### Issue: "Module not found"
**Solution:**
```bash
pip install -r requirements.txt
```

### Issue: "Server not running"
**Solution:**
```bash
python -m uvicorn app.main:app --reload
```

### Issue: "Backboard not available"
**Solution:**
- Install: `pip install backboard`
- Or tests will skip Backboard features (OK for basic testing)

## Full Pipeline Test (End-to-End)

### 1. Upload Video (if you have Twelve Labs setup)
```bash
curl -X POST "http://localhost:8000/upload_video" \
  -F "video=@/path/to/video.mp4"
```

### 2. Analyze Object
```python
from app.services.twelve_labs import TwelveLabsService

service = TwelveLabsService()
analysis = service.analyze_object(video_id="your_video_id")

# Check Three.js mesh
if analysis.threejs_mesh:
    print(f"Vertices: {len(analysis.threejs_mesh.vertices)}")
    print(f"Faces: {len(analysis.threejs_mesh.faces)}")
```

### 3. Frontend: Voxelize Mesh
```typescript
import { voxelizeMesh, threejsJsonToMesh } from '@/lib/voxelizer';

const mesh = threejsJsonToMesh(analysis.threejs_mesh);
const voxelGrid = voxelizeMesh(mesh, 8.0);
```

### 4. Backend: Process Voxels
```bash
curl -X POST "http://localhost:8000/master-builder/process" \
  -H "Content-Type: application/json" \
  -d @voxels.json
```

### 5. Get Interactive Instructions
```bash
curl "http://localhost:8000/backboard/{thread_id}/instructions"
```

## Quick Test Checklist

- [ ] Run `test_basic.py` - All tests pass
- [ ] Start server - Server runs on port 8000
- [ ] Test `/` endpoint - Returns welcome message
- [ ] Test `/master-builder/process` - Generates bricks
- [ ] Test `/threejs/voxelize` - Accepts mesh data
- [ ] Test `/backboard/{thread_id}/instructions` - Returns timeline

## Next Steps

1. ✅ Basic tests pass
2. ✅ Server runs and endpoints work
3. ✅ Test with real Three.js mesh data
4. ✅ Integrate with frontend
5. ✅ Test full pipeline with video upload

## Help

- **Full Guide:** See `TESTING_GUIDE.md`
- **Quick Start:** See `QUICK_START.md`
- **API Docs:** http://localhost:8000/docs (when server is running)
