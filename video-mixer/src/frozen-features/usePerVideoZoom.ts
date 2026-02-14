/**
 * FROZEN FEATURE: Per-video zoom/pan in edit mode
 *
 * This feature allowed pinch-to-zoom and drag-to-pan on individual video layers
 * while in edit mode. It was frozen (not deleted) to allow easy unfreezing later.
 *
 * TO UNFREEZE:
 * 1. In useGestures.ts, restore the onPinch handler body below (replace the early return).
 * 2. In useGestures.ts, restore the onDrag handler body below (currently only has swipe detection).
 * 3. The reducer actions SET_MINI_ZOOM, SET_MINI_PAN, and RESET_MINI_TRANSFORMS still exist
 *    and work — no changes needed in MixerContext.tsx or types/index.ts.
 * 4. The clampPan helper below should be moved back into useGestures.ts.
 */

import { useCallback } from 'react';
import { useMixer } from '../context/MixerContext';
import { MiniIndex } from '../types';

// useZoomConfig import would be: import { useZoomConfig } from '../systems/zoom';

/**
 * Clamps pan values so the video edges never enter the visible container area.
 *
 * With object-fit:cover, the video fills the container at zoom=1.
 * At zoom Z, the scaled element is Z times larger than the container.
 * Max pan (in local/pre-scale coords) = container * (Z - 1) / (2 * Z)
 */
export function clampPan(panX: number, panY: number, zoom: number) {
  const containerW = Math.min(window.innerWidth, window.innerHeight * 3);
  const containerH = containerW / 3;

  const maxPanX = containerW * (zoom - 1) / (2 * zoom);
  const maxPanY = containerH * (zoom - 1) / (2 * zoom);

  return {
    x: Math.max(-maxPanX, Math.min(maxPanX, panX)),
    y: Math.max(-maxPanY, Math.min(maxPanY, panY)),
  };
}

/**
 * The frozen pinch handler — was inside useGesture({ onPinch: ... })
 *
 * Usage:
 *   onPinch: ({ offset: [scale] }) => {
 *     if (!state.editMode.active || state.editMode.targetMini !== miniIndex) return;
 *     const newZoom = Math.max(minZoom, Math.min(maxZoom, scale));
 *     dispatch({ type: 'SET_MINI_ZOOM', miniIndex, zoom: newZoom });
 *     const clamped = clampPan(miniState.panX, miniState.panY, newZoom);
 *     dispatch({ type: 'SET_MINI_PAN', miniIndex, panX: clamped.x, panY: clamped.y });
 *   }
 */

/**
 * The frozen drag handler — was inside useGesture({ onDrag: ... })
 *
 * Usage:
 *   onDrag: ({ delta: [dx, dy], pinching }) => {
 *     if (!state.editMode.active || state.editMode.targetMini !== miniIndex) return;
 *     if (pinching || miniState.zoom <= 1) return;
 *     const newPanX = miniState.panX + dx / miniState.zoom;
 *     const newPanY = miniState.panY + dy / miniState.zoom;
 *     const clamped = clampPan(newPanX, newPanY, miniState.zoom);
 *     dispatch({ type: 'SET_MINI_PAN', miniIndex, panX: clamped.x, panY: clamped.y });
 *   }
 */

/**
 * Frozen hook — not called anywhere. Kept for reference.
 */
export function usePerVideoZoom(_miniIndex: MiniIndex) {
  const { dispatch: _dispatch } = useMixer();

  const resetZoom = useCallback(() => {
    _dispatch({ type: 'RESET_MINI_TRANSFORMS', miniIndex: _miniIndex });
  }, [_dispatch, _miniIndex]);

  return { resetZoom };
}
