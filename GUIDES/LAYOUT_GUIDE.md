# Layout System Quick Reference

## Files

- **`public/layout.json`** - Active layout (edit this to change UI)
- **`public/layout.example.json`** - Annotated example with comments

## Coordinate System

All values use **normalized coordinates** (0..1 range):

- **x**: `0` = left edge, `0.5` = center, `1` = right edge
- **y**: `0` = top edge, `0.5` = center, `1` = bottom edge
- **w**: Width as fraction of viewport (e.g., `0.30` = 30% width)
- **h**: Height as fraction of viewport (e.g., `0.10` = 10% height)

## Element Structure

```json
{
  "id": "mini1",
  "rect": {
    "x": 0.020,  // Horizontal position
    "y": 0.906,  // Vertical position
    "w": 0.031,  // Width
    "h": 0.094   // Height
  },
  "anchor": "bottom-left",
  "useSafeArea": true,
  "zIndex": 10,
  "hitSlop": {  // Optional: expand touch area
    "top": 0,
    "right": 0.015,
    "bottom": 0,
    "left": 0.015
  }
}
```

## Anchor Points

The anchor determines which point of the element is placed at x,y:

| Anchor | Behavior |
|--------|----------|
| `top-left` | Element's top-left corner at x,y |
| `top-center` | Element's top-center at x,y |
| `top-right` | Element's top-right corner at x,y |
| `center-left` | Element's center-left at x,y |
| `center` | Element's center at x,y |
| `center-right` | Element's center-right at x,y |
| `bottom-left` | Element's bottom-left corner at x,y |
| `bottom-center` | Element's bottom-center at x,y (extends upward) |
| `bottom-right` | Element's bottom-right corner at x,y |

## Element IDs (Required)

| ID | Description |
|----|-------------|
| `mini1` | Mini button 1 (left) |
| `mini2` | Mini button 2 |
| `mini3` | Mini button 3 |
| `mini4` | Mini button 4 (right) |
| `vfader1` | Vertical fader 1 (above mini1) |
| `vfader2` | Vertical fader 2 (above mini2) |
| `vfader3` | Vertical fader 3 (above mini3) |
| `vfader4` | Vertical fader 4 (above mini4) |
| `crossfader` | Horizontal crossfader |
| `tapToLoad` | "Tap to Load" overlay |

## Hot-Reload Workflow

1. Edit `public/layout.json`
2. Save file
3. Refresh browser (http://localhost:5178)
4. Changes appear instantly

## Common Experiments

### Make crossfader wider
```json
"crossfader": {
  "rect": { "x": 0.5, "y": 0.950, "w": 0.40, "h": 0.020 }
}
```

### Make mini buttons larger
```json
"mini1": {
  "rect": { "x": 0.020, "y": 0.906, "w": 0.040, "h": 0.120 }
}
```

### Make faders taller
```json
"vfader1": {
  "rect": { "x": 0.036, "y": 0.672, "w": 0.001, "h": 0.300 }
}
```

### Increase fader touch area
```json
"vfader1": {
  "hitSlop": { "top": 0, "right": 0.025, "bottom": 0, "left": 0.025 }
}
```

### Move elements closer together
Decrease the gap between x positions:
```json
"mini1": { "rect": { "x": 0.020, ... } }
"mini2": { "rect": { "x": 0.060, ... } }  // Was 0.070
```

### Center "Tap to Load" at top
```json
"tapToLoad": {
  "rect": { "x": 0.5, "y": 0.1, "w": 0.15, "h": 0.10 },
  "anchor": "top-center"
}
```

## Safe Area

The `safeArea` protects from device notches/bezels:

```json
"safeArea": {
  "top": 0.02,     // 2% from top
  "right": 0.02,   // 2% from right
  "bottom": 0.02,  // 2% from bottom
  "left": 0.02     // 2% from left
}
```

When `useSafeArea: true`, the element is positioned within the safe area.

## Tips

- **Start small**: Change one value at a time
- **Use anchor: "center"** for centering elements
- **Use anchor: "bottom-center"** for elements that should extend upward (faders)
- **Increase hitSlop** if touch targets feel too small
- **Use zIndex** to control layering (higher = on top)
- **Check layout.example.json** for annotated examples

## Validation

If you make an error, you'll see a red error screen with details:
- Values must be 0..1
- No duplicate IDs
- All required fields must exist

## Viewport Math (for reference)

On a 1920×640 viewport:
- `w: 0.031` = ~60px
- `h: 0.094` = ~60px
- `w: 0.30` = ~576px
- `h: 0.234` = ~150px

The system automatically scales to any viewport size.
