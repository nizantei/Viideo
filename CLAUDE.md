# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VIIDEO is a browser-based live video mixer app built with React + TypeScript + Vite. It composites up to 4 HLS video streams via WebGL onto a single canvas, with DJ-style controls (crossfader, per-channel faders, blend modes). Designed primarily for mobile landscape use.

## Commands

All commands run from the `video-mixer/` subdirectory:

```bash
cd video-mixer
npm run dev          # Start dev server (Vite, --host, port 5173)
npm run build        # TypeScript check + Vite production build
npm run preview      # Preview production build
```

There are no tests or linting configured.

## Architecture

### Directory Layout (inside `video-mixer/src/`)

- **`main.tsx`** - Entry point. Wraps app in `MixerProvider` (state) and `UIConfigProvider` (layout/theme/animations).
- **`context/MixerContext.tsx`** - Central state via `useReducer`. All mixer state lives here: 4 mini states, crossfader, edit mode, library, blend mode selector, fullscreen.
- **`types/index.ts`** - All TypeScript interfaces and the `MixerAction` discriminated union.
- **`components/`** - React components (App, VideoMixer, MiniButton, MiniVideo, MiniFader, Crossfader, LibraryOverlay, BlendModeSelector, etc.)
- **`services/webgl/`** - `WebGLMixer` class renders all 4 video layers to a single canvas via fragment shaders with blend modes.
- **`services/blendModes/`** - Blend mode enum, metadata registry, and GLSL shader functions. To add a blend mode: add to enum in `types.ts`, add metadata in `registry.ts`, add CSS mapping in `utils/blendModeMapping.ts`.
- **`hooks/`** - Custom hooks: `useVideoPlayer` (HLS playback via hls.js), `useWebGLMixer` (render loop at 60fps), `useGestures`, `useGlobalCrossfaderGesture`, `useLandscapeLock`.
- **`systems/`** - Config-driven UI systems loaded from JSON files in `public/ui-config/`. Each system (layout, theme, typography, animations, spacing) has its own context, types, and validator. Composed via `UIConfigProvider`.
- **`utils/`** - Pure functions: opacity calculations, blend mode CSS mapping, transform helpers.
- **`data/videos.ts`** - Loads clip metadata from `public/clips.json` at runtime (Cloudflare Stream HLS URLs).
- **`styles/`** - CSS Modules (`.module.css`) per component plus `global.css`.

### Key Patterns

**State management**: Single `useReducer` in `MixerContext` with discriminated union actions (e.g., `SET_MINI_VIDEO`, `SET_CROSSFADER`, `ENTER_EDIT_MODE`). Access via `useMixer()` hook.

**4-mini architecture**: The mixer has exactly 4 "minis" (video channels), indexed 0-3. Minis 0-1 belong to the "left" group, minis 2-3 to the "right" group. The crossfader controls group opacities.

**Rendering pipeline**: Hidden `<video>` elements load HLS streams -> `useWebGLMixer` copies video frames as textures -> `WebGLMixer` composites all 4 with blend modes in a single draw call via fragment shader.

**Config-driven layout**: UI element positions are defined in `public/ui-config/layout.json` using normalized 0-1 coordinates with anchor points and safe area insets. Components use `useLayoutElement(id)` to get pixel positions. Edit `layout.json` and refresh to reposition UI.

**Video clips**: Loaded dynamically from `public/clips.json` (Cloudflare Stream). Add clips by editing that JSON file. Videos are organized in folders by aspect ratio (`ratio-3-1`, `ratio-4-1`).

### Design Files

Reference designs are in `DESIGN/` at the repo root (JPG/PNG mockups).
