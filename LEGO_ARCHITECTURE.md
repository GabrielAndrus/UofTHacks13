# Architecture: LEGO Model Analysis Integration

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE                          │
│  - Video Upload                                             │
│  - 3D Preview                                               │
│  - Model Details Modal                                      │
│  - Instructions Display                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  MAIN COMPONENT                             │
│  app/page.tsx                                               │
│  ├─ State: objects, modelAnalysis, showModelDetails         │
│ │  ├─ processObjectVideo()                                  │
│ │  └─ Render ModelDetailsDisplay component                  │
└────────┬──────────────────────┬──────────────────────────────┘
         │                      │
         ▼                      ▼
┌─────────────────────┐  ┌───────────────────────┐
│ VIDEO → 3D PIPELINE │  │ MODEL DETAILS MODAL   │
│                     │  │                       │
│ videoToThreeJS.ts   │  │ ModelDetailsDisplay   │
│                     │  │ .tsx                  │
│ ├─ convertVideoTo   │  │ ├─ Shows pieces      │
│ │  3DObject()       │  │ ├─ Shows colors      │
│ │  ├─ Generate code │  │ ├─ Shows reasoning   │
│ │  └─ Analyze model │  │ └─ Styled display    │
│ │     ◄─ AI Call 1  │  │                       │
│ │     ◄─ AI Call 2  │  │ Receives:             │
│ │                   │  │ - modelAnalysis      │
│ ├─ executeAndAdd    │  │ - onClose handler    │
│ │  Object()         │  │                       │
│ └─ Returns result   │  │ Emits:                │
│    + analysis       │  │ - Close event        │
└──────────┬──────────┘  └───────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│           GEMINI AI INTEGRATION (2 Calls)                   │
│                                                              │
│  Call 1: Generate 3D Code                                   │
│  ├─ Input: Video → Audio → Objects                          │
│  ├─ Prompt: "Create Three.js code for [objectName]"        │
│  └─ Output: JavaScript code string                          │
│                                                              │
│  Call 2: Analyze & Extract LEGO Pieces                      │
│  ├─ Input: Three.js code + object name                      │
│  ├─ Prompt: "Identify model and extract LEGO pieces"        │
│  └─ Output: ModelAnalysis JSON                              │
│      ├─ modelName                                           │
│      ├─ modelType                                           │
│      ├─ description                                         │
│      └─ extractedPieces[]                                   │
│          ├─ part_id                                         │
│          ├─ name                                            │
│          ├─ quantity                                        │
│          ├─ color_id                                        │
│          ├─ color_name                                      │
│          └─ reasoning                                       │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│          LEGO INSTRUCTION GENERATION                        │
│                                                              │
│  geminiLegoConverter.ts::convertToLegoDesign()             │
│  ├─ If modelAnalysis provided:                             │
│  │  ├─ Use model-specific prompt                           │
│  │  ├─ Include extracted pieces + colors                   │
│  │  └─ Generate detailed instructions                      │
│  └─ If not (environment):                                  │
│     ├─ Use generic prompt                                  │
│     └─ Generate general instructions                       │
│                                                              │
│  Output: Detailed building instructions                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
INPUT LAYER
│
├─ Video File
│  └─ File object with video data
│
└─ Object Name
   └─ Derived from filename

        │
        ▼

PROCESSING LAYER 1: Three.js Code Generation
│
├─ convertVideoTo3DObject()
│  ├─ Calls Gemini (Prompt 1)
│  ├─ Receives JavaScript code
│  ├─ Cleans markdown/formatting
│  └─ Returns code string
│
└─ analyzeThreeJSForLegoPieces() [NEW]
   ├─ Takes same 3D code
   ├─ Calls Gemini (Prompt 2)
   ├─ Receives JSON
   ├─ Parses model details
   └─ Extracts piece info

        │
        ▼

PROCESSING LAYER 2: 3D Object Creation
│
├─ executeAndAddObject()
│  ├─ Imports THREE library
│  ├─ Executes Three.js code
│  ├─ Creates 3D object/group
│  ├─ Adds to scene
│  └─ Returns object + analysis
│
└─ Store in objects array
   ├─ Object ID
   ├─ Name
   ├─ 3D Mesh
   └─ ModelAnalysis [NEW]

        │
        ▼

DISPLAY LAYER
│
├─ 3D Scene
│  └─ Shows 3D model in environment
│
└─ Model Details Modal [NEW]
   ├─ ModelDetailsDisplay component
   ├─ Displays analysis data
   └─ Shows pieces with colors

        │
        ▼

INSTRUCTION LAYER
│
└─ convertToLegoDesign()
   ├─ Uses modelAnalysis if available
   ├─ Passes extracted pieces to Gemini
   └─ Returns specific instructions

        │
        ▼

OUTPUT
│
├─ 3D Model visible in scene
├─ Modal with piece details
└─ Specific building instructions
```

---

## Component Structure

```
app/page.tsx (Main Page)
│
├─ State Management
│  ├─ objects: Array<{id, name, mesh, modelAnalysis?}>
│  ├─ selectedModelAnalysis: ModelAnalysis | null
│  ├─ showModelDetails: boolean
│  └─ ... other states
│
├─ Effects
│  ├─ useEffect: Auto-generate LEGO design on mount
│  └─ useEffect: Initialize Three.js renderer
│
├─ Event Handlers
│  └─ processObjectVideo()
│     ├─ Call convertVideoTo3DObject()
│     ├─ Receive VideoToLegoResult with analysis
│     ├─ Execute Three.js code
│     ├─ Store object + analysis
│     ├─ Show modal
│     └─ Log details
│
└─ Render
   ├─ Header
   ├─ Main 3D Environment
   ├─ InstructionBook modal
   ├─ Lego Design modal
   └─ ModelDetailsDisplay modal [NEW]
      └─ Props: {modelAnalysis, onClose}

ModelDetailsDisplay.tsx (New Component)
│
├─ Props
│  ├─ modelAnalysis: ModelAnalysis
│  └─ onClose: () => void
│
├─ Computed Values
│  ├─ totalPieces: sum of quantities
│  ├─ uniquePieces: length of array
│  └─ Color mapping for display
│
└─ Render
   ├─ Header (Model name, type)
   ├─ Statistics (pieces, types, colors)
   ├─ Pieces Table
   │  └─ For each piece:
   │     ├─ Color swatch
   │     ├─ Piece name & quantity
   │     ├─ Color name
   │     ├─ Reasoning
   │     └─ Part ID
   ├─ Pro tips box
   └─ Close button
```

---

## Interface Definitions

### VideoToLegoResult
```typescript
interface VideoToLegoResult {
  threeJSCode: string;      // Generated JavaScript
  modelAnalysis?: {          // NEW: Model identification
    modelName: string;       // e.g., "Office Chair"
    modelType: string;       // e.g., "Furniture"
    description: string;     // Full description
    extractedPieces: Array<{
      part_id: string;       // e.g., "3001"
      name: string;          // e.g., "Brick 2×4"
      quantity: number;      // e.g., 25
      color_id?: number;     // e.g., 0 (Black)
      color_name?: string;   // e.g., "Black"
      reasoning: string;     // e.g., "Main walls"
    }>;
  };
}
```

### ModelAnalysis (used in state)
```typescript
interface ModelAnalysis {
  modelName: string;
  modelType: string;
  description: string;
  extractedPieces: Array<{
    part_id: string;
    name: string;
    quantity: number;
    color_id?: number;
    color_name?: string;
    reasoning: string;
  }>;
}
```

### threeJSToLegoPieces Types
```typescript
interface ThreeJSModelAnalysis {
  modelName: string;
  modelType: string;
  estimatedSetNumber?: string;
  description: string;
  legoSetComparison?: {
    officialSetNumber?: string;
    officialName?: string;
    yearReleased?: number;
  };
  extractedPieces: Array<{
    part_id: string;
    name: string;
    quantity: number;
    color_id?: number;
    color_name?: string;
    reasoning: string;
  }>;
  structuralAnalysis: {
    baseSize: { width: number; depth: number };
    height: number;
    estimatedTotalPieces: number;
    buildComplexity: 'Simple' | 'Intermediate' | 'Advanced' | 'Expert';
  };
  keyFeatures: string[];
}
```

---

## AI Prompt Structure

### Prompt 1: Generate 3D Code
```
CREATE THREE.JS CODE FOR [objectName]

Requirements:
- Return ONLY raw JavaScript (no markdown)
- Create THREE.Group()
- Add geometries and materials
- Realistic colors and proportions
- Fit within 2×2×2 units
- Return the group

Output: JavaScript code string
```

### Prompt 2: Analyze & Extract LEGO Pieces
```
ANALYZE THREE.JS CODE FOR [objectName]

Identify:
1. Specific LEGO model name
2. Model type/category
3. Description
4. Pieces needed (with part IDs)
5. Colors and quantities
6. Build complexity

Output: JSON with structure:
{
  modelName: string
  modelType: string
  description: string
  extractedPieces: Array
}
```

### Prompt 3: Generate Specific Instructions (modified)
```
CONVERT TO LEGO - [modelName]

Using EXACTLY these pieces:
- [piece_1] × [qty] ([color])
- [piece_2] × [qty] ([color])
- ...

Create step-by-step instructions showing:
1. How to use each piece
2. Where to place colors
3. Assembly sequence
4. Structural techniques

Output: Detailed instructions
```

---

## Data Transformation Pipeline

```
Video File
   │
   ├─ (First Gemini Call)
   │
   ▼
Three.js Code String
   │
   ├─ (Second Gemini Call - NEW)
   │
   ▼
ModelAnalysis JSON
   │
   ├─ Extract pieces, colors, reasoning
   │
   ▼
Enriched Object (in state)
{
  id: string
  name: string
  mesh: THREE.Group
  modelAnalysis: ModelAnalysis  [NEW]
}
   │
   ├─ Display in Modal [NEW]
   │
   ▼
Display to User + Pass to LEGO Instructions
   │
   ├─ (Third Gemini Call - enhanced)
   │
   ▼
Specific LEGO Building Instructions
```

---

## Error Handling Flow

```
convertVideoTo3DObject()
├─ API Key validation
│  └─ Throw if missing
├─ Gemini Call 1
│  ├─ Success → Continue
│  └─ Error
│     ├─ 429/Quota → Specific message
│     ├─ 403/Auth → Specific message
│     └─ Other → Generic message
├─ Gemini Call 2
│  ├─ Success → Return with analysis
│  └─ Error
│     └─ Return default analysis
└─ Cleanup & return result

executeAndAddObject()
├─ Import THREE
├─ Execute code
│  ├─ Success → Add to scene
│  └─ Error → Log & throw
└─ Return object + analysis

Fallbacks:
├─ Analysis fails → Default analysis provided
├─ Code execution fails → Alert user
└─ Scene unavailable → Clear error message
```

---

## Performance Considerations

### Optimization Points
1. **Sequential Gemini Calls**: First generate code, then analyze
2. **Caching**: Model analysis stored with object for reuse
3. **No Polling**: Modal shows immediately with data
4. **Efficient Parsing**: Direct JSON extraction from Gemini response

### Scaling
- Supports unlimited objects (each gets analysis)
- Analysis stored locally (no re-computation)
- Gemini rate limits respected
- Graceful degradation on API errors

---

## Testing Scenarios

### Scenario 1: Chair Video
```
Input: chair.mp4
│
├─ Generate code: ✓
├─ Identify: "Office Chair" ✓
├─ Extract pieces: [20 brown 2×4, 12 white 1×2, ...]  ✓
├─ Show modal: ✓
└─ Create instructions: ✓
```

### Scenario 2: API Failure
```
Input: video.mp4
│
├─ Generate code: ✓
├─ Identify fails: ✗
├─ Use default analysis: ✓
├─ Show basic modal: ✓
└─ Log error: ✓
```

### Scenario 3: Complex Object
```
Input: building.mp4
│
├─ Generate detailed code: ✓
├─ Extract 50+ pieces: ✓
├─ Show comprehensive modal: ✓
└─ Create detailed instructions: ✓
```
