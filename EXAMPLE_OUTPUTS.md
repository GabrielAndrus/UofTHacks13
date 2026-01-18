# Example Outputs: LEGO Model Detection & Piece Extraction

## Real-World Examples

### Example 1: Wooden Chair

#### Input
```
Video: wooden_chair_360.mp4
Object: Wooden office chair with brown leather seat
```

#### Gemini Analysis (First Call)
```javascript
// Three.js Code Generated:
const group = new THREE.Group()
const frameGeo = new THREE.BoxGeometry(1.2, 0.8, 1.2)
const frameMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 })
const frameMesh = new THREE.Mesh(frameGeo, frameMat)
group.add(frameMesh)

const seatGeo = new THREE.BoxGeometry(1, 0.3, 1)
const seatMat = new THREE.MeshStandardMaterial({ color: 0xD2691E })
const seatMesh = new THREE.Mesh(seatGeo, seatMat)
seatMesh.position.y = 0.5
group.add(seatMesh)

const backGeo = new THREE.BoxGeometry(1, 1.2, 0.2)
const backMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 })
const backMesh = new THREE.Mesh(backGeo, backMat)
backMesh.position.z = -0.5
group.add(backMesh)

group
```

#### Gemini Analysis (Second Call - NEW)
```json
{
  "modelName": "Office Chair",
  "modelType": "Furniture",
  "description": "A traditional office chair with wooden frame and leather seat. Features four-leg base, ergonomic backrest, and swivel mechanism.",
  "extractedPieces": [
    {
      "part_id": "3001",
      "name": "Brick 2×4",
      "quantity": 30,
      "color_id": 6,
      "color_name": "Brown",
      "reasoning": "Main frame structure and legs"
    },
    {
      "part_id": "3023",
      "name": "Plate 1×2",
      "quantity": 20,
      "color_id": 6,
      "color_name": "Brown",
      "reasoning": "Support beams between frame sections"
    },
    {
      "part_id": "3020",
      "name": "Plate 2×4",
      "quantity": 16,
      "color_id": 1,
      "color_name": "Dark Red",
      "reasoning": "Seat cushion surface"
    },
    {
      "part_id": "3040",
      "name": "Slope 45°",
      "quantity": 12,
      "color_id": 6,
      "color_name": "Brown",
      "reasoning": "Angled backrest support"
    },
    {
      "part_id": "3005",
      "name": "Brick 1×1",
      "quantity": 8,
      "color_id": 0,
      "color_name": "Black",
      "reasoning": "Swivel base connectors"
    }
  ]
}
```

#### Modal Display
```
╔════════════════════════════════╗
║   LEGO MODEL DETAILS           ║
║   Office Chair                 ║
║   Furniture                    ║
╠════════════════════════════════╣
║ 📝 Description                 ║
║ A traditional office chair...  ║
║                                ║
║ Stats: 86 pieces, 5 types     ║
║        3 colors used          ║
║                                ║
║ 🧱 Pieces Used:                ║
║ [🟫] 30× Brick 2×4 [3001]     ║
║      Main frame & legs         ║
║                                ║
║ [🟫] 20× Plate 1×2 [3023]     ║
║      Support beams             ║
║                                ║
║ [🔴] 16× Plate 2×4 [3020]     ║
║      Seat cushion surface      ║
║                                ║
║ [🟫] 12× Slope 45° [3040]     ║
║      Angled backrest           ║
║                                ║
║ [⬛] 8× Brick 1×1 [3005]      ║
║      Swivel connectors         ║
╚════════════════════════════════╝
```

#### Generated Instructions (excerpt)
```
BUILD GUIDE: Office Chair

MATERIALS NEEDED:
- 30× Brown Brick 2×4 (Part 3001)
- 20× Brown Plate 1×2 (Part 3023)
- 16× Dark Red Plate 2×4 (Part 3020)
- 12× Brown Slope 45° (Part 3040)
- 8× Black Brick 1×1 (Part 3005)

ASSEMBLY:
Step 1: Base and Legs
Use 12 Brown Bricks 2×4 to create the four-leg base
Connect with 8 Brown Plates 1×2 for stability

Step 2: Seat
Stack 8 Dark Red Plates 2×4 on top of legs
Secure with remaining Brown Plates 1×2

Step 3: Backrest
Arrange 12 Brown Slopes 45° at angled position
Use 4 Black Bricks 1×1 as connectors to seat

Step 4: Details
Add remaining pieces for swivel base simulation
Your LEGO chair is complete!
```

---

### Example 2: Coffee Mug

#### Input
```
Video: ceramic_mug_360.mp4
Object: White ceramic coffee mug with brown interior
```

#### Gemini Analysis Output
```json
{
  "modelName": "Coffee Mug",
  "modelType": "Household Item",
  "description": "A classic ceramic coffee mug with cylindrical body, handle, and decorative rim.",
  "extractedPieces": [
    {
      "part_id": "3941",
      "name": "Brick Round 2×2",
      "quantity": 12,
      "color_id": 15,
      "color_name": "White",
      "reasoning": "Main cylindrical body"
    },
    {
      "part_id": "3062",
      "name": "Brick Round 1×1",
      "quantity": 8,
      "color_id": 15,
      "color_name": "White",
      "reasoning": "Top rim"
    },
    {
      "part_id": "3794",
      "name": "Plate 1×2 with Stud",
      "quantity": 6,
      "color_id": 8,
      "color_name": "Dark Gray",
      "reasoning": "Handle structure"
    },
    {
      "part_id": "3024",
      "name": "Plate 1×1",
      "quantity": 4,
      "color_id": 6,
      "color_name": "Brown",
      "reasoning": "Interior bottom detail"
    }
  ]
}
```

#### Modal Display
```
LEGO MODEL DETAILS
Coffee Mug
Household Item

Stats: 30 pieces, 4 types, 4 colors

🧱 Pieces:
[⬜] 12× Brick Round 2×2 [3941] - Main body
[⬜] 8× Brick Round 1×1 [3062] - Top rim
[⬛] 6× Plate 1×2 with Stud [3794] - Handle
[🟫] 4× Plate 1×1 [3024] - Interior
```

---

### Example 3: Small Bookshelf

#### Input
```
Video: bookshelf_360.mp4
Object: Wooden bookshelf with 5 shelves and support frame
```

#### Gemini Analysis Output
```json
{
  "modelName": "Tall Bookshelf",
  "modelType": "Furniture",
  "description": "A tall wooden bookshelf with 5 adjustable shelves, sturdy frame, and decorative top molding.",
  "extractedPieces": [
    {
      "part_id": "3001",
      "name": "Brick 2×4",
      "quantity": 40,
      "color_id": 6,
      "color_name": "Brown",
      "reasoning": "Frame vertical supports"
    },
    {
      "part_id": "3795",
      "name": "Plate 2×6",
      "quantity": 25,
      "color_id": 19,
      "color_name": "Tan",
      "reasoning": "Horizontal shelves"
    },
    {
      "part_id": "3020",
      "name": "Plate 2×4",
      "quantity": 15,
      "color_id": 6,
      "color_name": "Brown",
      "reasoning": "Shelf supports"
    },
    {
      "part_id": "3002",
      "name": "Brick 2×3",
      "quantity": 12,
      "color_id": 6,
      "color_name": "Brown",
      "reasoning": "Side panels"
    },
    {
      "part_id": "3037",
      "name": "Slope 45° 2×4",
      "quantity": 8,
      "color_id": 6,
      "color_name": "Brown",
      "reasoning": "Decorative top molding"
    }
  ]
}
```

#### Modal Display Statistics
```
Total Pieces: 100
Piece Types: 5
Colors Used: 3
Build Complexity: Intermediate

Key pieces:
- 40 Brown Bricks 2×4 (frame)
- 25 Tan Plates 2×6 (shelves)
- 15 Brown Plates 2×4 (supports)
- 12 Brown Bricks 2×3 (sides)
- 8 Brown Slopes 45° (molding)
```

---

## Console Output Examples

### Example: Successful Detection
```javascript
[VideoTo3JS] Successfully generated 3D object code
[ThreeJSAnalysis] Model analysis: {
  modelName: "Office Chair",
  modelType: "Furniture",
  description: "A traditional office chair...",
  extractedPieces: [
    {
      part_id: "3001",
      name: "Brick 2×4",
      quantity: 30,
      color_id: 6,
      color_name: "Brown",
      reasoning: "Main frame structure..."
    },
    // ... 4 more pieces
  ]
}
🏗️ Model: Office Chair
📊 Type: Furniture
📝 Description: A traditional office chair with wooden...
🧱 Pieces to use: (5 items)
✅ Successfully added object: wooden_chair
```

### Example: API Quota Hit
```javascript
[VideoTo3JS] Successfully generated 3D object code
[ThreeJSAnalysis] Error: API quota exceeded
Using default analysis for model: wooden_chair_360
🏗️ Model: wooden_chair_360 (detected)
📊 Type: Generic Object
📝 Description: 3D scanned object from video
🧱 Pieces to use: (default suggestions)
✅ Successfully added object with default analysis
```

### Example: Complex Geometry
```javascript
[VideoTo3JS] Successfully generated 3D object code (2.1 KB)
Geometries parsed:
- BoxGeometry: 15 instances
- SphereGeometry: 3 instances
- CylinderGeometry: 2 instances
- SlopeGeometry: 8 instances

[ThreeJSAnalysis] Analysis complete
🏗️ Model: Victorian House (estimated)
📊 Type: Building
🧱 Extracted pieces: 47 types, 589 total pieces
✅ Complex model successfully processed
```

---

## Piece Mapping Examples

### Geometry to LEGO Mapping
```
Input Geometry          → Output LEGO Pieces
─────────────────────────────────────────────
BoxGeometry (1,2,1)    → Brick 2×4 or Plate 2×4
SphereGeometry         → Brick Round 2×2
CylinderGeometry       → Brick Round or Slope
Slope Shape            → Slope 45°
Complex Curves         → Multiple tiles + plates
```

### Color Mapping Example
```
3D Color (RGB)  → LEGO Color ID → LEGO Color Name
───────────────────────────────────────────────
#8B4513        → 6             → Brown
#D2691E        → 6             → Brown (slightly lighter)
#FFFFFF        → 15            → White
#000000        → 0             → Black
#0055BF        → 1             → Blue
#C91A09        → 4             → Red
```

---

## Statistics Calculation Examples

### Chair Example
```
Calculation:
- Total Pieces = 30 + 20 + 16 + 12 + 8 = 86 pieces
- Unique Types = 5 (Brick 2×4, Plate 1×2, Plate 2×4, Slope 45°, Brick 1×1)
- Colors = Brown (#6), Brown (#6), Red (#1), Brown (#6), Black (#0)
- Unique Colors = 3 (Brown, Red, Black)

Display:
┌──────────┬──────────┬──────────┐
│    86    │     5    │     3    │
│ PIECES   │  TYPES   │ COLORS   │
└──────────┴──────────┴──────────┘
```

### Mug Example
```
Calculation:
- Total Pieces = 12 + 8 + 6 + 4 = 30 pieces
- Unique Types = 4
- Colors = White, White, Gray, Brown = 3 unique

Display:
┌──────────┬──────────┬──────────┐
│    30    │     4    │     3    │
│ PIECES   │  TYPES   │ COLORS   │
└──────────┴──────────┴──────────┘
```

---

## Error Scenario Examples

### Scenario: Very Complex Object
```
Input: Complex architectural model (castle)
Result: 
- Detection: "Castle Tower"
- Pieces: 200+
- Status: ✅ Successfully analyzed
- Modal: Scrolls through pieces
- Warning: "This is a complex model - 5+ hours build time"
```

### Scenario: Abstract Object
```
Input: Abstract modern art sculpture
Result:
- Detection: "Modern Sculpture"
- Pieces: Estimated 75
- Status: ⚠️ Using best estimate analysis
- Modal: Shows pieces with reasoning
- Note: "This is an artistic interpretation"
```

### Scenario: Organic Shape
```
Input: Organic shape (plant, animal)
Result:
- Detection: "Decorative Plant Pot"
- Pieces: 45
- Status: ✅ Successfully analyzed
- Recommendation: Use curved pieces heavily
- Slopes: 20, Tiles: 15, Bricks: 10
```

---

## Real LEGO Set Integration Example

When user's scanned object matches real set:

```json
{
  "modelName": "Classic Train Set Car",
  "modelType": "Vehicle",
  "description": "A vintage LEGO train car matching set 7897",
  "legoSetComparison": {
    "officialSetNumber": "7897",
    "officialName": "Holiday Train",
    "yearReleased": 2006
  },
  "extractedPieces": [
    // pieces from actual set 7897
  ]
}
```

Modal would show:
```
Matches: LEGO Set #7897 - Holiday Train (2006)
This is very close to an official set!
You could also build the original for comparison.
```

---

## Building Instructions Generated

From extracted pieces, system generates:

```
BUILDING INSTRUCTIONS: Office Chair

PAGE 1: MATERIALS
┌─────────────────────┐
│ 30× Brick 2×4       │
│ 20× Plate 1×2       │
│ 16× Plate 2×4       │
│ 12× Slope 45°       │
│ 8× Brick 1×1        │
└─────────────────────┘

PAGE 2-5: STEP BY STEP
Step 1: Build the legs (use Brown 2×4)
Step 2: Create seat platform (use Plates)
Step 3: Add backrest (use Slopes)
Step 4: Finishing touches (use 1×1 bricks)

PAGE 6: COMPLETE MODEL
[Full assembly view]

TIME ESTIMATE: 45-60 minutes
DIFFICULTY: Intermediate
```

---

This comprehensive example system shows how the LEGO detection and extraction system works in practice! 🧱
