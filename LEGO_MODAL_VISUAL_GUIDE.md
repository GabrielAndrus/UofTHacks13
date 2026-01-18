# LEGO Model Details Modal - Visual Guide

## Modal Layout

```
╔═══════════════════════════════════════════════════════════════╗
║                  LEGO MODEL DETAILS                ✕          ║
║ Office Chair                                                   ║
║ Furniture                                                      ║
╠═══════════════════════════════════════════════════════════════╣
║                                                                ║
║  📝 Description                                                ║
║  ───────────────────────────────────────────────────────────  ║
║  A modern office chair with spinning base, ergonomic seat,    ║
║  and adjustable backrest. Perfect for home or office setup.   ║
║                                                                ║
║  ┌──────────────────┬──────────────────┬──────────────────┐   ║
║  │ 45 TOTAL PIECES  │ 6 PIECE TYPES    │ 3 COLORS USED    │   ║
║  └──────────────────┴──────────────────┴──────────────────┘   ║
║                                                                ║
║  🧱 Pieces Used                                               ║
║  ───────────────────────────────────────────────────────────  ║
║                                                                ║
║  ┌────────────────────────────────────────────────────────┐   ║
║  │ [🟫] 20× Brick 2×4              Main walls    [3001]  │   ║
║  └────────────────────────────────────────────────────────┘   ║
║                                                                ║
║  ┌────────────────────────────────────────────────────────┐   ║
║  │ [⬜] 12× Plate 1×2              Seat surface  [3023]  │   ║
║  └────────────────────────────────────────────────────────┘   ║
║                                                                ║
║  ┌────────────────────────────────────────────────────────┐   ║
║  │ [🟩]  8× Slope 45°              Angled back   [3040]  │   ║
║  └────────────────────────────────────────────────────────┘   ║
║                                                                ║
║  ┌────────────────────────────────────────────────────────┐   ║
║  │ [⬜]  3× Brick 1×1              Connectors    [3005]  │   ║
║  └────────────────────────────────────────────────────────┘   ║
║                                                                ║
║  ┌────────────────────────────────────────────────────────┐   ║
║  │ [⬛]  2× Plate 2×4              Base          [3020]  │   ║
║  └────────────────────────────────────────────────────────┘   ║
║                                                                ║
║  💡 PRO TIP                                                    ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ Use these specific pieces to recreate this LEGO model.  │ ║
║  │ The pieces are optimized based on the 3D geometry...    │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │                    CLOSE                                │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## Color Display Guide

### LEGO Color Mapping

The modal shows actual LEGO colors with hex values:

```
Color ID → Hex Value → Display
──────────────────────────────
0        → #1B1B1B   → ⬛ Black
1        → #0055BF   → 🟦 Blue
2        → #237841   → 🟩 Green
4        → #C91A09   → 🟥 Red
5        → #C870A0   → 🟪 Dark Pink
6        → #583927   → 🟫 Brown
7        → #9BA19D   → ⬜ Light Gray
8        → #6D6E5C   → ⬛ Dark Gray
9        → #4FA3D1   → 🟦 Light Blue
14       → #F2CD37   → 🟨 Yellow
15       → #FFFFFF   → ⬜ White
19       → #E4CD9E   → 🟨 Tan
25       → #FE8A18   → 🟧 Orange
28       → #958A73   → 🟫 Dark Tan
```

### Color Swatch Size
- **Width**: 40 pixels
- **Height**: 32 pixels
- **Border**: 1px rgba(0,0,0,0.2)
- **Border Radius**: 8px

---

## Piece Information Display

### Each Piece Card Shows:

```
┌─────────────────────────────────────────┐
│ [Color Swatch] Piece Info    [Part ID]  │
│                                          │
│ • Piece Name × Quantity                 │
│ • Color Name (if available)             │
│ • Reasoning (why this piece)            │
└─────────────────────────────────────────┘
```

### Detailed Example:

```
┌─────────────────────────────────────────┐
│ [🟫] Brick 2×4 × 20           [3001]    │
│                                          │
│ • Brown                                 │
│ • Main structural walls                 │
└─────────────────────────────────────────┘
```

### Fields Explained:

1. **Color Swatch**
   - Visual representation of actual LEGO color
   - Click/hover: No special action (display only)

2. **Piece Name × Quantity**
   - **Name**: Official LEGO piece name
   - **Quantity**: Number needed (bold, larger)
   - Example: "Brick 2×4 × 20"

3. **Color Information**
   - Shows actual LEGO color name
   - Example: "Brown", "Dark Pink", "Light Blue"

4. **Reasoning**
   - Why this piece is important
   - Examples:
     - "Main walls"
     - "Seat surface"
     - "Angled backrest"
     - "Connectors"
     - "Base platform"

5. **Part ID**
   - Official LEGO part number
   - Format: 4 digits (e.g., "3001")
   - Used for: Bricklink lookups, official documentation

---

## Statistics Section

### Three Key Metrics:

```
┌────────────┬────────────┬────────────┐
│ TOTAL      │ PIECE      │ COLORS     │
│ PIECES     │ TYPES      │ USED       │
│────────────┼────────────┼────────────│
│     45     │      6     │      3     │
└────────────┴────────────┴────────────┘
```

### Calculation:
- **Total Pieces**: Sum of all quantities
  - 20 + 12 + 8 + 3 + 2 = 45
- **Piece Types**: Number of different pieces
  - Brick 2×4, Plate 1×2, Slope 45°, Brick 1×1, Plate 2×4 = 5 types
  - (Shown as 6 if includes baseplate or other)
- **Colors Used**: Count of unique colors
  - Brown, White, Green = 3 colors

---

## Styling Details

### Colors
- **Header**: Linear gradient from #DC2626 to #C41C3B (Red)
- **Background**: #FFFFFF (White)
- **Stats**: Light backgrounds (#3B82F6 blue, #16A34A green, #A855F7 purple)
- **Cards**: #F3F4F6 light gray on hover

### Typography
- **Header**: 
  - Label: 0.75rem, font-bold, opacity-90
  - Title: 1.875rem (30px), font-black
- **Subtitle**: 0.875rem, opacity-90
- **Section Headers**: 1.125rem, font-black, text-gray-900
- **Piece Names**: 0.875rem, font-bold, text-gray-900
- **Details**: 0.75rem, text-gray-500

### Spacing
- **Header Padding**: 24px
- **Content Padding**: 24px
- **Gap Between Pieces**: 8px
- **Section Margin**: 24px

### Effects
- **Header**: Sticky positioning (stays at top)
- **Piece List**: Max height 384px with scroll
- **Hover**: Cards lighten with smooth transition
- **Modal Entry**: Scale animation (0.95 → 1)
- **Modal Exit**: Smooth fade and scale out

### Responsive
- **Max Width**: 896px (2xl)
- **Max Height**: 90vh (viewport)
- **Padding**: 16px on mobile (p-4)
- **Overflow**: Scrollable on mobile

---

## Example Data: Different Objects

### Example 1: House
```
Model Name: Modern House
Type: Building
Pieces: 120

🧱 Pieces:
- 40× Brick 2×4 (Black) - Walls
- 30× Plate 2×4 (Brown) - Roof
- 20× Brick 1×2 (Red) - Accents
- 15× Tile 1×1 (White) - Windows
- 10× Slope 45° (Gray) - Roof angles
- 5× Brick 2×2 (Brown) - Chimney
```

### Example 2: Coffee Mug
```
Model Name: Coffee Mug
Type: Decoration
Pieces: 25

🧱 Pieces:
- 12× Brick 2×2 (Brown) - Cylinder body
- 8× Plate 1×2 (White) - Handle rings
- 3× Brick 1×1 (White) - Handle details
- 2× Tile 1×1 (Black) - Label/decoration
```

### Example 3: Bookshelf
```
Model Name: Tall Bookshelf
Type: Furniture
Pieces: 80

🧱 Pieces:
- 20× Brick 2×4 (Brown) - Frame
- 15× Plate 2×8 (Tan) - Shelves
- 12× Brick 1×2 (Brown) - Supports
- 10× Brick 1×1 (Dark Brown) - Corners
- 8× Slope 45° (Brown) - Top decoration
- 6× Tile 1×4 (White) - Back panel
- 5× Plate 1×1 (Black) - Details
```

---

## Interactive Features

### Hover States
- **Piece Cards**: Light background, subtle shadow increase
- **Close Button**: Opacity change
- **Color Swatches**: Subtle border highlight

### Scroll Behavior
- **Piece List**: Scrollable (max 384px height)
- **Modal**: Scrollable overall (max 90vh)
- **Header**: Sticky (stays at top while scrolling)
- **Footer**: Always visible

### Animations
- **Modal Entry**: Fade in + scale (0.95 → 1.0)
- **Piece Cards**: Appear sequentially (rendered immediately)
- **Backdrop**: Fade in with 50% black

---

## Accessibility Features

- **Close Button**: Clear X symbol
- **Text Contrast**: High contrast on all text
- **Color Swatches**: Bordered for visibility
- **Part IDs**: Monospace font for clarity
- **Semantic HTML**: Proper heading levels
- **Touch Friendly**: Large button sizes (44px+)
- **Keyboard**: Tab through elements properly

---

## Example User Interaction

### Scenario: User adds "wooden_chair.mp4"

1. **Upload** → System processes video
2. **3D Object appears** in scene (spinning chair visible)
3. **Modal appears** with model details:
   ```
   🏗️ Model: Office Chair
   📊 Type: Furniture
   
   Stats: 42 pieces, 5 types, 3 colors
   
   🧱 Pieces shown with:
   - Brown swatches for wood-colored pieces
   - White swatches for seat
   - Gray swatches for metal base
   ```
4. **User inspects** pieces (reads names, quantities, reasoning)
5. **User closes** modal → Goes to building instructions
6. **Instructions** use exactly these pieces:
   - "Place 20× Brown Brick 2×4 for frame"
   - "Add 12× White Plate 2×4 for seat"
   - etc.

---

## Console Output Example

When modal is displayed:

```javascript
// Console logs from component mounting
[VideoTo3JS] Successfully generated 3D object code
[ThreeJSAnalysis] Model analysis: {
  modelName: "Office Chair",
  modelType: "Furniture",
  description: "A modern office chair with spinning base...",
  extractedPieces: [
    {
      part_id: "3001",
      name: "Brick 2×4",
      quantity: 20,
      color_id: 6,
      color_name: "Brown",
      reasoning: "Main frame structure"
    },
    // ... more pieces
  ]
}
✅ Successfully added object: wooden_chair

// React renders the modal
<ModelDetailsDisplay modelAnalysis={modelAnalysis} onClose={...} />

// Modal is interactive and user can:
// 1. Scroll through pieces
// 2. View colors and part IDs
// 3. Click close to dismiss
```

This comprehensive modal system transforms raw 3D geometry into actionable LEGO building information! 🧱
