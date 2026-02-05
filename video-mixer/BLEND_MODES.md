# Blend Modes Documentation

## Overview

The video mixer app includes a comprehensive blend mode system that allows each of the 4 mini video players to be composited using different blend modes. This creates visual effects similar to those found in professional video editing software like Adobe Premiere or After Effects.

## What are Blend Modes?

Blend modes determine how video layers combine with each other. Instead of simply stacking videos on top of each other, blend modes perform mathematical operations on the pixel colors to create different visual effects.

For example:
- **Multiply** darkens the image by multiplying color values
- **Screen** lightens the image by inverting, multiplying, and inverting again
- **Overlay** combines multiply and screen for increased contrast

## User Interface

### Accessing Blend Modes

1. **Long-press** any mini button to enter edit mode
2. The current blend mode name appears in the **top right corner** (e.g., "Normal")
3. **Tap the blend mode name** to open the blend mode selector
4. Choose a blend mode from the grid
5. The effect applies immediately and the selector closes

### Edit Mode Indicator

When a mini is in edit mode (orange outline), the blend mode indicator shows:
- Current blend mode name
- Orange border matching edit mode theme
- Positioned in top right corner for easy access

### Blend Mode Selector

The selector displays all available blend modes in a scrollable grid:
- **Grey buttons**: Inactive blend modes
- **Orange button**: Currently active blend mode
- Each button shows the blend mode name and a brief description
- Click any mode to apply it instantly

## Available Blend Modes

### Component Modes
- **Normal**: No blending - standard layering (default)

### Lighten Modes
- **Screen**: Lightens by inverting colors, multiplying, then inverting back
- **Add**: Adds color values together for a brighter result
- **Color Dodge**: Brightens by decreasing contrast between colors

### Darken Modes
- **Multiply**: Darkens by multiplying color values
- **Color Burn**: Darkens by increasing contrast between colors

### Contrast Modes
- **Overlay**: Combines multiply and screen based on base color
- **Soft Light**: Softer version of overlay with gentler contrast
- **Hard Mix**: Creates posterized result with limited colors

### Inversion Modes
- **Difference**: Subtracts darker color from lighter color
- **Exclusion**: Similar to difference but with lower contrast

## Technical Implementation

### Architecture

The blend mode system is built with three main layers:

```
┌─────────────────────────────────────┐
│     UI Layer (Components)           │
│  - BlendModeIndicator               │
│  - BlendModeSelector                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     State Management                │
│  - MixerContext (Redux-style)       │
│  - Actions: SET_MINI_BLEND_MODE     │
│  - State: miniState.blendMode       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Service Layer                   │
│  - BlendMode enum                   │
│  - Metadata registry                │
│  - CSS mapping utility              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Rendering Layer                 │
│  - CSS mix-blend-mode property      │
│  - Applied to video container div   │
└─────────────────────────────────────┘
```

### File Structure

```
src/
├── services/
│   └── blendModes/
│       ├── types.ts              # BlendMode enum
│       ├── registry.ts           # Metadata for all blend modes
│       ├── shaderFunctions.ts    # GLSL implementations (for WebGL)
│       └── index.ts              # Public API exports
├── components/
│   ├── BlendModeIndicator.tsx    # Top-right indicator in edit mode
│   └── BlendModeSelector.tsx     # Modal selector with grid
├── styles/
│   └── BlendModeSelector.module.css
├── utils/
│   └── blendModeMapping.ts       # Maps enum to CSS values
├── context/
│   └── MixerContext.tsx          # State management
└── types/
    └── index.ts                  # TypeScript types
```

### How It Works

#### 1. State Management

Each mini has its own blend mode stored in state:

```typescript
interface MiniState {
  videoId: string | null;
  opacity: number;
  blendMode: BlendMode;  // Current blend mode
  // ... other properties
}
```

#### 2. Blend Mode Selection

When user selects a blend mode:

```typescript
// Action dispatched
dispatch({
  type: 'SET_MINI_BLEND_MODE',
  miniIndex: 0,
  blendMode: BlendMode.SCREEN
});

// Reducer updates state
case 'SET_MINI_BLEND_MODE':
  minis[action.miniIndex].blendMode = action.blendMode;
```

#### 3. Rendering

The blend mode is applied via CSS `mix-blend-mode`:

```typescript
// In MiniVideo component
const mixBlendMode = blendModeToCSSMixBlendMode(miniState.blendMode);

<div style={{ mixBlendMode }}>
  <video ... />
</div>
```

#### 4. CSS Mapping

The utility function maps our enum to CSS values:

```typescript
function blendModeToCSSMixBlendMode(blendMode: BlendMode): string {
  switch (blendMode) {
    case BlendMode.SCREEN: return 'screen';
    case BlendMode.MULTIPLY: return 'multiply';
    // ... etc
  }
}
```

### CSS vs WebGL Rendering

**Current Implementation**: CSS-based
- Uses CSS `mix-blend-mode` property
- Applied to video container divs
- Excellent browser support
- Hardware accelerated
- Works with existing rendering pipeline

**Future Enhancement**: WebGL-based
- Fragment shader with custom blend functions
- More control over blend algorithms
- Consistent across all platforms
- Can implement exact Photoshop-style blending
- WebGL infrastructure is already in place (`src/services/webgl/`)

### Data Flow

```
User taps blend mode
       ↓
Dispatch action
       ↓
Reducer updates miniState.blendMode
       ↓
Component re-renders
       ↓
CSS mix-blend-mode applied to video container
       ↓
Browser composites video with new blend mode
```

## Adding New Blend Modes

To add a new blend mode, follow these 3 steps:

### Step 1: Add to Enum

Edit `src/services/blendModes/types.ts`:

```typescript
export enum BlendMode {
  // ... existing modes
  VIVID_LIGHT = 'vividLight',  // New mode
}
```

### Step 2: Add to Registry

Edit `src/services/blendModes/registry.ts`:

```typescript
export const BLEND_MODE_REGISTRY: BlendModeMetadata[] = [
  // ... existing modes
  {
    id: BlendMode.VIVID_LIGHT,
    displayName: 'Vivid Light',
    description: 'Burns or dodges colors based on blend value',
    category: 'contrast',
  },
];
```

### Step 3: Add CSS Mapping

Edit `src/utils/blendModeMapping.ts`:

```typescript
export function blendModeToCSSMixBlendMode(blendMode: BlendMode): string {
  switch (blendMode) {
    // ... existing cases
    case BlendMode.VIVID_LIGHT:
      return 'hard-light'; // Use closest CSS equivalent
  }
}
```

**That's it!** The UI will automatically:
- Show the new blend mode in the selector
- Apply it when selected
- Persist it in state

## Persistence

Blend modes persist per mini:
- Stays active after exiting edit mode
- Independent for each of the 4 minis
- Each mini can have a different blend mode simultaneously

## Performance Considerations

- **CSS mix-blend-mode** is hardware accelerated by modern browsers
- No performance impact on video playback
- Compositing happens on GPU
- All 4 minis can use different blend modes with no FPS drop

## Browser Compatibility

CSS `mix-blend-mode` is supported in:
- ✅ Chrome/Edge 41+
- ✅ Firefox 32+
- ✅ Safari 8+
- ✅ iOS Safari 8+
- ✅ Android Browser 5+

## Troubleshooting

### Blend mode has no visible effect

**Possible causes:**
1. Both videos are the same - blend effects are most visible with contrasting content
2. Video opacity is too low - blend modes work with the accumulated opacity
3. Mini is at the bottom layer (Mini 0) - blend modes affect how the layer combines with what's below it

**Solutions:**
- Try different video combinations
- Ensure mini opacity is above 50%
- Test with minis that have content below them

### Blend mode resets to Normal

This shouldn't happen. If it does:
1. Check browser console for errors
2. Verify state is persisting in React DevTools
3. Ensure reducer case for `SET_MINI_BLEND_MODE` is working

## Future Enhancements

Potential future improvements:

1. **WebGL Integration**
   - Switch from CSS to fragment shader blending
   - Exact Photoshop-style algorithms
   - Additional blend modes not available in CSS

2. **Blend Mode Preview**
   - Real-time preview in selector buttons
   - Thumbnail showing blend effect

3. **Blend Mode Presets**
   - Save favorite blend mode combinations
   - Quick recall presets

4. **Blend Mode Opacity**
   - Adjust blend intensity (0-100%)
   - Fade between normal and full blend effect

## Summary

The blend mode system provides a professional-grade compositing feature with:
- ✅ 11 industry-standard blend modes
- ✅ Simple, intuitive UI
- ✅ Per-mini independence
- ✅ State persistence
- ✅ High performance
- ✅ Easy extensibility

Users can create complex visual effects by combining different blend modes across the 4 mini players, opening up creative possibilities for live video mixing.
