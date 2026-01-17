# Quick Start Testing Guide

## Fastest Way to Test

### 1. Basic Tests (No Server Required)

```bash
cd backend
source .venv/bin/activate  # or your venv
python tests/test_basic.py
```

**Tests:**
- ✅ MasterBuilder with simple voxels
- ✅ Three.js format validation
- ✅ Scene Delta format

### 2. Start the Server

```bash
# Terminal 1
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### 3. Test API Endpoints

#### Option A: Use FastAPI Docs (Easiest)
1. Open browser: http://localhost:8000/docs
2. Click on any endpoint
3. Click "Try it out"
4. Fill in the request body
5. Click "Execute"

#### Option B: Use curl

**Test Root:**
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
      {"x": 1, "y": 0, "z": 0, "hex_color": "#FF0000"}
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
      "is_verified": false
    }
  ],
  "layers": {"0": 1},
  "inventory": [...]
}
```

### 4. Test Full Pipeline (If APIs Configured)

**Prerequisites:**
- `TWELVE_LABS_API_KEY` in `.env`
- `REBRICKABLE_API_KEY` in `.env` (optional)
- `BACKBOARD_API_KEY` in `.env` (optional)

```bash
# Run full pipeline tests
python tests/test_threejs_pipeline.py
```

## Common Test Scenarios

### Scenario 1: Simple Cube
```python
voxels = [
    {"x": x, "y": y, "z": z, "hex_color": "#FF0000"}
    for x in range(4)
    for y in range(4)
    for z in range(4)
]
# Should generate multiple bricks
```

### Scenario 2: Single Layer
```python
voxels = [
    {"x": x, "y": y, "z": 0, "hex_color": "#00FF00"}
    for x in range(8)
    for y in range(4)
]
# Should use 2x4 bricks (optimal)
```

### Scenario 3: Mixed Colors
```python
voxels = [
    {"x": x, "y": y, "z": 0, "hex_color": "#FF0000" if x < 4 else "#0000FF"}
    for x in range(8)
    for y in range(2)
]
# Should generate bricks with different colors
```

## Troubleshooting

### "Module not found"
```bash
pip install -r requirements.txt
```

### "Server not running"
```bash
python -m uvicorn app.main:app --reload
```

### "429 Too Many Requests" (Rebrickable)
- Wait a few minutes
- Or test without Rebrickable API (uses fallback)

### "Backboard not available"
- Install: `pip install backboard`
- Or tests will skip Backboard features

## What to Check

✅ **Basic Functionality:**
- MasterBuilder processes voxels
- Generates bricks with positions
- Returns valid manifest

✅ **API Endpoints:**
- `/` returns welcome message
- `/master-builder/process` accepts voxels
- `/threejs/voxelize` accepts mesh data

✅ **Three.js Format:**
- Vertices are [x, y, z] arrays
- Faces are [i, j, k] index arrays
- Colors are hex strings

✅ **Scene Deltas:**
- Deltas have required fields
- Timestamps are sequential
- Object IDs are unique

## Next Steps After Testing

1. ✅ Verify basic tests pass
2. ✅ Start server and test endpoints
3. ✅ Test with real Three.js mesh data
4. ✅ Integrate with frontend
5. ✅ Test full pipeline with video upload
