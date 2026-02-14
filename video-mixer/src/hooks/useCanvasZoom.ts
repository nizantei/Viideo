import { useRef, useCallback } from 'react';
import { useGesture } from '@use-gesture/react';
import { useMixer } from '../context/MixerContext';
import { useZoomConfig } from '../systems/zoom';

/**
 * Compute the max canvas zoom so the top/bottom borders of the 3:1 canvas
 * exactly touch the screen edges. Beyond this, zooming would waste space.
 *
 * Canvas dimensions: width = min(vw, vh*3), height = width / 3.
 * At zoom Z, rendered height = canvasHeight * Z.
 * Max Z = vh / canvasHeight.
 */
function getScreenFillMaxZoom(): number {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const canvasWidth = Math.min(vw, vh * 3);
  const canvasHeight = canvasWidth / 3;
  if (canvasHeight <= 0) return 1;
  return vh / canvasHeight;
}

export function useCanvasZoom() {
  const { state, dispatch } = useMixer();
  const zoomConfig = useZoomConfig();
  const initialZoomRef = useRef(1);
  const initialPanRef = useRef({ x: 0, y: 0 });

  const { minZoom, maxZoom: configMaxZoom } = zoomConfig.canvas;

  const clampPan = useCallback((panX: number, panY: number, zoom: number) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxPanX = (zoom - 1) * vw / 2;
    const maxPanY = (zoom - 1) * vh / 2;
    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, panX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, panY)),
    };
  }, []);

  const bind = useGesture(
    {
      onPinchStart: () => {
        initialZoomRef.current = state.canvasZoom;
      },
      onPinch: ({ offset: [scale] }) => {
        if (state.editMode.active) return;
        // Dynamic max: lesser of config max and screen-fill max
        const effectiveMax = Math.min(configMaxZoom, getScreenFillMaxZoom());
        const newZoom = Math.max(minZoom, Math.min(effectiveMax, scale));
        dispatch({ type: 'SET_CANVAS_ZOOM', zoom: newZoom });
        const clamped = clampPan(state.canvasPanX, state.canvasPanY, newZoom);
        dispatch({ type: 'SET_CANVAS_PAN', panX: clamped.x, panY: clamped.y });
      },
      onDragStart: () => {
        initialPanRef.current = { x: state.canvasPanX, y: state.canvasPanY };
      },
      onDrag: ({ delta: [dx, dy], pinching }) => {
        if (state.editMode.active || pinching || state.canvasZoom <= 1) return;
        const newPanX = state.canvasPanX + dx;
        const newPanY = state.canvasPanY + dy;
        const clamped = clampPan(newPanX, newPanY, state.canvasZoom);
        dispatch({ type: 'SET_CANVAS_PAN', panX: clamped.x, panY: clamped.y });
      },
    },
    {
      pinch: {
        scaleBounds: () => {
          const effectiveMax = Math.min(configMaxZoom, getScreenFillMaxZoom());
          return { min: minZoom, max: effectiveMax };
        },
        from: () => [state.canvasZoom, 0],
      },
      drag: {
        filterTaps: true,
      },
    }
  );

  return { bind };
}
