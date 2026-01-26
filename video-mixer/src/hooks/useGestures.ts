import { useCallback, useRef } from 'react';
import { useGesture } from '@use-gesture/react';
import { useMixer } from '../context/MixerContext';

interface UseGesturesOptions {
  containerRef: React.RefObject<HTMLElement>;
}

export function useGestures({ containerRef }: UseGesturesOptions) {
  const { state, dispatch } = useMixer();
  const initialZoomRef = useRef(1);

  const bind = useGesture(
    {
      onPinch: ({ offset: [scale], memo }) => {
        if (!memo) {
          initialZoomRef.current = state.zoom;
        }

        const newZoom = Math.min(Math.max(scale, 1), 4);
        dispatch({ type: 'SET_ZOOM', value: newZoom });

        // Reset pan if zoom returns to 1
        if (newZoom <= 1.01) {
          dispatch({ type: 'SET_PAN_X', value: 0 });
        }

        return memo || true;
      },
      onDrag: ({ delta: [dx], pinching }) => {
        if (pinching) return;
        if (state.zoom <= 1.01) return;

        const container = containerRef.current;
        if (!container) return;

        const containerWidth = container.clientWidth;
        const sensitivity = 2 / containerWidth;
        const newPan = state.panX + dx * sensitivity;

        // Clamp pan based on zoom level
        const maxPan = 1 - 1 / state.zoom;
        const clampedPan = Math.min(Math.max(newPan, -maxPan), maxPan);

        dispatch({ type: 'SET_PAN_X', value: clampedPan });
      },
    },
    {
      target: containerRef,
      pinch: {
        scaleBounds: { min: 1, max: 4 },
        rubberband: true,
      },
      drag: {
        filterTaps: true,
      },
    }
  );

  const resetZoom = useCallback(() => {
    dispatch({ type: 'SET_ZOOM', value: 1 });
    dispatch({ type: 'SET_PAN_X', value: 0 });
  }, [dispatch]);

  return { bind, resetZoom };
}

// Crossfader gesture hook
export function useCrossfaderGesture(trackRef: React.RefObject<HTMLElement>) {
  const { state, dispatch } = useMixer();
  const isDraggingRef = useRef(false);
  const holdTimerRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  const updateCrossfader = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const x = clientX - rect.left;
    const value = Math.min(Math.max(x / rect.width, 0), 1);
    dispatch({ type: 'SET_CROSSFADER', value });
  }, [trackRef, dispatch]);

  const startHoldAnimation = useCallback((targetValue: number) => {
    const animate = () => {
      const currentValue = state.crossfader;
      const diff = targetValue - currentValue;

      if (Math.abs(diff) < 0.01) {
        dispatch({ type: 'SET_CROSSFADER', value: targetValue });
        return;
      }

      const step = diff * 0.1;
      dispatch({ type: 'SET_CROSSFADER', value: currentValue + step });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [state.crossfader, dispatch]);

  const stopHoldAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const bind = useGesture(
    {
      onDragStart: () => {
        isDraggingRef.current = true;
        stopHoldAnimation();
      },
      onDrag: ({ xy: [x] }) => {
        if (isDraggingRef.current) {
          updateCrossfader(x);
        }
      },
      onDragEnd: () => {
        isDraggingRef.current = false;
      },
      onPointerDown: ({ event }) => {
        // Start hold timer for tap-and-hold behavior
        const clientX = (event as PointerEvent).clientX;
        const track = trackRef.current;
        if (!track) return;

        const rect = track.getBoundingClientRect();
        const x = clientX - rect.left;
        const clickValue = x / rect.width;

        // Determine target: left side goes to 0, right side goes to 1
        const targetValue = clickValue < 0.5 ? 0 : 1;

        holdTimerRef.current = window.setTimeout(() => {
          if (!isDraggingRef.current) {
            startHoldAnimation(targetValue);
          }
        }, 300);
      },
      onPointerUp: () => {
        stopHoldAnimation();
      },
    },
    {
      target: trackRef,
      drag: {
        axis: 'x',
        filterTaps: true,
      },
    }
  );

  return { bind };
}
