# Technology Summary: Building Blocks (Reality-to-Brick Pipeline)

Overview of all technologies used in this build, including Backboard, algorithms, Gemini, Twelve Labs, and Solana.

---

## 1. Backboard Integration

### What It Is
**Backboard** is used as a stateful AI/memory layer that orchestrates LEGO build logic, tools, and (optionally) multi-model routing. The Backboard SDK is loaded from an optional/custom source (`BACKBOARD_API_KEY`); the app runs without it if unavailable.

### Where It’s Used

- **`backend/app/services/backboard_service.py`**
  - **BackboardClient** (when SDK is installed): creates a “LEGO Master Builder” assistant with `memory="Auto"` and tools: `place_brick`, `finalize_assembly_step`.
  - **Stateful threads**: `start_session(scenery_data)` creates a thread, injects scenery JSON as system “SCENERY ANCHOR,” and initializes `MasterBuilder` with that scenery.
  - **Object integration**: `add_object_to_world(thread_id, object_data, use_high_thinking)` uses Backboard to run:
    - **Architectural phase** (high-thinking): gap-filling, structural checks, `place_brick` tool calls.
    - **Bulk phase** (faster): greedy volume fitting via `place_brick`.
  - **Scene deltas**: every `place_brick` and `finalize_assembly_step` is recorded as a scene delta for interactive instructions.
  - **Tool execution**: `_handle_tool_calls` runs the requested actions and calls `MasterBuilder.register_brick`; results are sent back via `submit_tool_outputs`.
  - **Twelve Labs**: `object_data` is intended to come from Twelve Labs analysis (see below).

- **`backend/app/services/backboard_lego_memory.py`**
  - **BackboardLegoMemory**: in-memory, Backboard-style store for LEGO builds.
  - **BuildMemoryEntry**: `build_id`, `project_name`, `user_id`, `voxel_data`, `manifest`, `piece_summary`, `components`, `room_type`, `metadata`.
  - **Methods**: `save_build`, `get_build`, `get_similar_builds` (signature-based), `get_user_preferences`, `save_component`, etc.
  - Used by `threejs_pipeline` and `lego_build_endpoint` to persist builds and similarities.

- **`frontend/lib/legoManualGenerator.ts`**
  - **BackboardMemory** (in-memory, client-side): `saveBuild`, `getBuild`, `getAllBuilds`, `saveComponent`, `getComponent`.
  - **processManifestWithBackboard()**: runs `countPieces`, `generateInstructionManual`, builds a `LegoMemoryEntry`, then `backboard.saveBuild(entry)`.

- **`backend/app/api/threejs_pipeline.py`**
  - Pipeline: **Three.js → Voxelizer → Greedy (Master Builder) → LEGO manifest → Backboard memory**.
  - `threejs_to_backboard`: voxelize → `_master_builder.process_voxels_sync` → `_backboard_memory.save_build` → `get_similar_builds` for recommendations.
  - `get_sample_dorm_room_voxels` / `process_sample_dorm_room`: sample dorm room flows into the same pipeline and Backboard.

- **`backend/app/api/lego_build_endpoint.py`**
  - Wires `BackboardLegoMemory` and `MasterBuilder` into LEGO build and pipeline endpoints.

---

## 2. Algorithm Calculations

### 2.1 Greedy Piece Counting (Frontend) — `legoManualGenerator.ts`

- **countPieces(manifest)**
  - **Baseplate (greedy choice)**: from brick extents `(min/max x,y)`, `requiredSize = max(|Δx|, |Δy|) + 8`; choose smallest baseplate that fits:
    - `≤16` → 16×16 (628), `≤32` → 32×32 (3811), `>32` → 48×48 (10701). Always Dark Tan, count 1, added first in breakdown.
  - **Brick counts**: `(part_id, color_id)` → quantity; aggregate `by_category` (Bricks, Tiles, Slopes, Plates) and `by_color`.
  - **Breakdown**: baseplate first, then others sorted by quantity desc; `PIECE_PRICES` and `PART_NAMES`/`COLOR_NAMES` for labels and `estimated_cost`.

- **calculateBaseplate(manifest)**
  - Same extent logic; returns `part_id`, `size`, `name`, `size_studs`, `price` for the chosen baseplate.

### 2.2 Greedy Instruction Generation (Frontend) — `legoManualGenerator.ts`

- **generateInstructionManual(manifest, projectName)**
  - **Baseplate as Step 1**: `layer_z = -1`, single “place baseplate” step with fixed copy.
  - **Layers**: group bricks by `position[2]`, sort layers ascending.
  - **Per layer**: `piece_counts` from bricks, `bricks_in_step` with `PART_NAMES`/`COLOR_NAMES`; sort by `(x,y)`; instruction text varies for first / middle / final layer.
  - **Difficulty**: from `total_bricks` (Easy → Medium → Hard → Expert).
  - **Time**: `max(5, round(total_bricks * 3 / 60) + 1)` minutes.

### 2.3 Greedy Fitting & Master Builder (Backend) — `master_builder.py`

- **Greedy volume fitting**
  - Tries largest bricks first (e.g. 2×4, 1×6, 2×2) to reduce part count; 40+ brick types (bricks, plates, tiles, slopes), sorted by area/volume.
- **Laminar interlocking**: stagger bricks on even vs odd layers.
- **Staggered joints**: avoid vertical seams across layers.
- **Curviness / slopes**: uses Rebrickable and `part_discovery.analyze_voxel_shape` for slopes/angles (e.g. 3040, 3038, 3297).
- **Backboard memory**: optional lookup of sub-assemblies by cluster signature before placing.
- **Color verification**: Rebrickable to check part+color; fallback to next smaller size if unavailable.
- **Components**: `lego_objects_database`, `part_discovery`, `vector_lego_database` for known objects, shapes, and substitutions.

### 2.4 Three.js → Voxels (Backend) — `threejs_voxelizer.py`

- **VoxelGrid**: `resolution` (e.g. 0.1 m); `add_box`, `add_sphere`, `add_cylinder`, `add_plane` to fill a 3D grid from geometry.
- **convert_threejs_to_voxels(scene_input, resolution)**: maps `BoxGeometry`, `SphereGeometry`, `CylinderGeometry`, `PlaneGeometry` to voxels `(x,y,z, hex_color)`.
- **get_sample_dorm_room_voxels()**: hardcoded dorm room → voxel list for the pipeline.

---

## 3. Gemini Usage

**Model:** `gemini-pro` (via `@google/generative-ai` / `google-generativeai`).  
**API key:** `NEXT_PUBLIC_GEMINI_API_KEY` (frontend), `GEMINI_API_KEY` or similar (backend if used).

### Frontend

| File | Purpose |
|------|---------|
| **`geminiLegoConverter.ts`** | LEGO piece suggestions from 3D/model context: `LEGO_PIECE_DATABASE`, `convertToLegoDesign(pieceCount, breakdown, projectName, apiKey, modelAnalysis)` → text LEGO design; `generateModelInterpretations`, `suggestPiecesForShape` (with `getPieceInfo`, `findSimilarPieces`). |
| **`geminiLegoInstructions.ts`** | LEGO-style instructions: `generateLegoInstructions(manual, pieceCount, projectName, apiKey)` → `EnhancedManual` (cover tagline, difficulty, completion, `building_tips`, per-step `LegoStyleStep` with `visual_instruction`, `placement_guide`, `tip`, `brick_callouts`, `arrows`); `getEnhancedInstructions`, `enhanceStepWithGemini` with caching. |
| **`videoToThreeJS.ts`** | From object name → **Three.js code** (LEGO-style `BoxGeometry` + `CylinderGeometry` studs, LEGO colors, 2×2×2 space); `analyzeThreeJSForLegoPieces(threeJSCode, objectName, apiKey)` → `modelAnalysis` with `modelName`, `modelType`, `description`, `extractedPieces`. |
| **`threeJSToLegoPieces.ts`** | `analyzeThreeJSForLegoPieces(threeJSCode, objectName, apiKey)` → `ThreeJSModelAnalysis` (modelType, `legoSetComparison`, `extractedPieces`, `structuralAnalysis`, `keyFeatures`). |
| **`legoPDFGenerator.ts`** | `enhanceWithGemini(step, apiKey)` to turn a build step into 1–2 sentence LEGO-style instruction for PDF. |
| **`InstructionBook.tsx`** | Uses `getEnhancedInstructions` and `downloadLegoPDF` (which can call `enhanceWithGemini`). |
| **`page.tsx`** | `convertToLegoDesign` for the LEGO design modal; `convertVideoTo3DObject` + `analyzeThreeJSForLegoPieces` for object-from-video. |

### Backend

- **`backboard_service.py`**: When Backboard is used, it can route to `gemini-3-pro` (architectural) and `gemini-3-flash` (bulk) via Backboard’s `add_message(..., model_name=..., tools=...)` and `submit_tool_outputs`. The actual Gemini calls go through the Backboard SDK, not `google-generativeai` directly in this file.
- **`master_builder.py`**: Comment references using Gemini to classify cluster/component type (e.g. Desk, Bed) for substitution; exact call site is in the discovery/substitution logic.
- **`backboard_service.py`** (optional): Uses Backboard’s model routing; Backboard in turn may use Gemini-based models.

---

## 4. Twelve Labs

**Library:** `twelvelabs` (and `httpx`).  
**Env:** `TWL_API_KEY` / `TWELVE_LABS_API_KEY`, `TWL_INDEX_ID`.

### `backend/app/services/twelve_labs.py` — **TwelveLabsAPI**

- **Upload**: `upload_video(video_path)` → `tasks` (index_id + video_file); returns `task_id`, `video_id`.
- **Polling**: `wait_for_task(task_id)`, `wait_for_video_ready(video_id)` with `_verify_semantic_readiness` (Pegasus `analyze`).
- **Analyze**: `analyze(video_id, prompt, ...)` → `/v1.3/analyze`; retries on `video_not_ready`; errors on `index_not_supported_for_generate`.
- **Scene/3D prompts**:
  - `get_object_description(video_id)`: long prompt for 3D reconstruction (room layout, objects, materials, lighting, spatial relationships, textures).
  - `identify_room_parts(video_id)`: list of walls/areas (e.g. north wall, floor, ceiling).
  - Additional helpers for Marengo/Pegasus-style analysis.
- **Data contracts**: `data_contracts.py` / `schemas.py` reference Twelve Labs (e.g. `dominant_colors`, `source_analysis`, Pegasus-style output).

### Integration with Backboard / Pipeline

- **BackboardService.add_object_to_world(..., object_data)**: `object_data` is meant to come from **Twelve Labs** (e.g. object/scene analysis). Backboard runs Architectural + Bulk phases and tool execution on that object.
- End-to-end: **Video → Twelve Labs (upload, index, analyze) → scene/object descriptions → Backboard + Master Builder** to produce LEGO placements and instructions.

---

## 5. Solana

**Frontend:** `@solana/web3.js`, `@solana/wallet-adapter-*`, `@solana/wallet-adapter-wallets`.  
**Backend:** `solana`, `solders`, `pynacl`, `base58`.

### Frontend

- **`SolanaWalletProvider.tsx`**: `ConnectionProvider`, `WalletProvider` (Phantom, Solflare), `WalletModalProvider`; RPC from `NEXT_PUBLIC_SOLANA_RPC_URL` or `clusterApiUrl` (e.g. devnet).
- **`useWallet`, `useConnection`, `useWalletModal`**: connect, send tx, open modal.
- **`bbCoin.ts`**: `buildBbCoinMetadata` (compact: `t: "BB"`, `n`, `i`, `p`, `s`, `c`, `b`, `ts`); `buildMemoTransaction(metadata)` → `Transaction` with one **Memo** instruction (`MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`).
- **`page.tsx`**: “Save to BB Coin” builds a memo from `projectName`, `buildId`, `pieceCount`, `manualData.total_steps`, `breakdown`; `sendTransaction(transaction, connection)`; BB Coins popup (login first, then sample/hardcoded coins); sticky coin FAB bottom-left.

### Backend — `solana_bb_coin.py` (service + API)

- **`build_lego_metadata_json`**: project, build_id, total_pieces, step_count, breakdown (top 20), `estimated_cost`, `ts`; compact keys for size.
- **`build_memo_payload`**: JSON string; truncate to `MAX_MEMO_BYTES` (~600) if needed.
- **`verify_wallet_signature(message, signature_b58, public_key_b58)`**: `base58` decode, `pynacl` `VerifyKey` for Ed25519 detached verify.
- **`get_bb_coin_info`**: `memoProgramId`, `bbCoinMint` (from `BB_COIN_MINT_ADDRESS`).

### API — `app/api/solana_bb_coin.py`

- **POST /api/solana/verify-wallet**: `{ message, signature, publicKey }` → `{ verified }` (for wallet login).
- **POST /api/solana/bb-coin/memo-payload**: `{ projectName, buildId, pieceCount, stepCount }` → `{ memoPayload, metadata }` (for building the memo).
- **GET /api/solana/bb-coin/info**: `{ memoProgramId, bbCoinMint }`.

### BB Coin Idea

- **BB Coin** = minted token concept; actual on-chain use here is a **Memo** instruction that stores LEGO set metadata (project, pieces, steps, cost, etc.) in the transaction. Optional `BB_COIN_MINT_ADDRESS` for future SPL use.

---

## 6. Other Technologies

- **React / Next.js 16** (App Router), **TypeScript**, **Tailwind**, **Framer Motion**.
- **Three.js** (+ `@react-three/fiber`, `@react-three/drei`): dorm room, LEGO builder from manifest (`legoThreeJSBuilder`), object-from-video scene.
- **jsPDF**, **html2canvas**: LEGO-style PDF instructions.
- **Rebrickable** (backend): part/color checks and part discovery.
- **FastAPI**, **Pydantic**, **uvicorn**, **httpx**, **aiofiles**.
- **NumPy, OpenCV, SciPy, Pillow**: image/voxel processing where used.

---

## 7. Data Flow (High Level)

1. **Video (optional)**: Upload → Twelve Labs (index + analyze) → scene/object descriptions.
2. **3D source**: Three.js scene or sample dorm room → **threejs_voxelizer** → voxel grid.
3. **LEGO manifest**: **Master Builder** greedy fitting (and, if used, Backboard tool calls) → brick list.
4. **Frontend path**: JSON manifest (e.g. `bedroom_lego_manifest.json`) → **legoManualGenerator** (`countPieces`, `generateInstructionManual`, `processManifestWithBackboard`) → `LegoMemoryEntry`; optional **Gemini** for instructions, PDF, design, and video→Three.js.
5. **Persistence**: **BackboardLegoMemory** (backend), **BackboardMemory** (frontend), and pipeline endpoints.
6. **Solana**: Wallet connect → “Save to BB Coin” → Memo tx with LEGO metadata; login via **verify-wallet** and Ed25519 verify.

---

## 8. Environment / Config (Relevant)

- **Backboard:** `BACKBOARD_API_KEY` (optional); Backboard SDK from custom/private source.
- **Gemini:** `NEXT_PUBLIC_GEMINI_API_KEY` (frontend), backend keys if used.
- **Twelve Labs:** `TWL_API_KEY` / `TWELVE_LABS_API_KEY`, `TWL_INDEX_ID`.
- **Solana:** `NEXT_PUBLIC_SOLANA_RPC_URL`, `NEXT_PUBLIC_SOLANA_NETWORK`; `BB_COIN_MINT_ADDRESS` (optional).
