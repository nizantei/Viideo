import { useCallback } from 'react';
import { useGesture } from '@use-gesture/react';
import { useMixer } from '../context/MixerContext';
import { useZoomConfig } from '../systems/zoom';
import { MiniIndex } from '../types';

export function useGestures(miniIndex: MiniIndex) {
  const { state, dispatch } = useMixer();
  const zoomConfig = useZoomConfig();

  const { minZoom, maxZoom } = zoomConfig.video;
  const miniState = state.minis[miniIndex];

  const clampPan = useCallback((panX: number, panY: number, zoom: number) => {
    // The video mixer container: aspect-ratio 3:1, width = min(100vw, 100vh * 3)
    const containerW = Math.min(window.innerWidth, window.innerHeight * 3);
    const containerH = containerW / 3;

    // With object-fit:cover, the video fills the container at zoom=1.
    // At zoom Z, the scaled element is Z times larger than the container.
    // Max pan (in local/pre-scale coords) = container * (Z - 1) / (2 * Z)
    // This ensures the element edges never enter the visible container area.
    const maxPanX = containerW * (zoom - 1) / (2 * zoom);
    const maxPanY = containerH * (zoom - 1) / (2 * zoom);

    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, panX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, panY)),
    };
  }, []);

  const bind = useGesture(
    {
      onPinch: ({ offset: [scale] }) => {
        if (!state.editMode.active || state.editMode.targetMini !== miniIndex) return;
        const newZoom = Math.max(minZoom, Math.min(maxZoom, scale));
        dispatch({ type: 'SET_MINI_ZOOM', miniIndex, zoom: newZoom });
        // Re-clamp pan at new zoom level (zoom out may tighten limits)
        const clamped = clampPan(miniState.panX, miniState.panY, newZoom);
        dispatch({ type: 'SET_MINI_PAN', miniIndex, panX: clamped.x, panY: clamped.y });
      },
      onDrag: ({ delta: [dx, dy], pinching }) => {
        if (!state.editMode.active || state.editMode.targetMini !== miniIndex) return;
        if (pinching || miniState.zoom <= 1) return;
        // Divide by zoom so finger movement maps 1:1 to screen movement
        const newPanX = miniState.panX + dx / miniState.zoom;
        const newPanY = miniState.panY + dy / miniState.zoom;
        const clamped = clampPan(newPanX, newPanY, miniState.zoom);
        dispatch({ type: 'SET_MINI_PAN', miniIndex, panX: clamped.x, panY: clamped.y });
      },
    },
    {
      pinch: {
        scaleBounds: { min: minZoom, max: maxZoom },
        from: () => [miniState.zoom, 0],
      },
      drag: {
        filterTaps: true,
      },
    }
  );

  const resetZoom = useCallback(() => {
    dispatch({ type: 'RESET_MINI_TRANSFORMS', miniIndex });
  }, [dispatch, miniIndex]);

  return { bind, resetZoom };
}
