import { useCallback, useRef, useEffect } from 'react';
import { useGesture } from '@use-gesture/react';
import { useMixer } from '../context/MixerContext';
import { MiniIndex } from '../types';

// Per-video zoom/pan is FROZEN — see src/frozen-features/usePerVideoZoom.ts

/** All gesture tuning knobs — adjust these to taste */
const GESTURE_CONFIG = {
  // Long-press: hold this long (ms) without moving to enter drag mode
  longPressDelay: 200,
  // Long-press: max finger drift (px) allowed during the hold period
  longPressTolerance: 10,
  // Drag sensitivity: 1.0 = full screen drag moves 0→100%.
  //   Higher = more sensitive (less finger movement needed).
  //   e.g. 2.0 means half a screen width covers the full range.
  dragSensitivity: 2.0,
  // Swipe: minimum velocity (px/ms) to count as a swipe
  swipeMinVelocity: 0.5,
  // Swipe: minimum distance (px) to count as a swipe
  swipeMinDistance: 30,
};

export function useGestures(miniIndex: MiniIndex, containerRef: React.RefObject<HTMLDivElement | null>) {
  const { state, dispatch } = useMixer();
  const miniState = state.minis[miniIndex];
  const isEditTarget = state.editMode.active && state.editMode.targetMini === miniIndex;

  // Refs for long-press / drag state
  const isDraggingRef = useRef(false);
  const longPressTimerRef = useRef<number>(0);
  const startPosRef = useRef({ x: 0, y: 0 });

  // Snapshot swinging.enabled into a ref so the native listener closure stays current
  const swingingEnabledRef = useRef(miniState.swinging.enabled);
  swingingEnabledRef.current = miniState.swinging.enabled;

  // --- Long-press detection via native pointer events ---
  // Must use native listeners because @use-gesture's onDragStart only fires
  // on first MOVEMENT, not on touch-down. We need the timer to start on touch-down.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isEditTarget) return;

    const handlePointerDown = (e: PointerEvent) => {
      startPosRef.current = { x: e.clientX, y: e.clientY };
      isDraggingRef.current = false;

      longPressTimerRef.current = window.setTimeout(() => {
        isDraggingRef.current = true;
        // Cancel swinging so position becomes manual
        if (swingingEnabledRef.current) {
          dispatch({
            type: 'UPDATE_MINI_SWINGING',
            miniIndex,
            swinging: { enabled: false },
          });
        }
      }, GESTURE_CONFIG.longPressDelay);
    };

    const handlePointerMove = (e: PointerEvent) => {
      // If finger moves too much before timer fires, cancel long-press
      if (!isDraggingRef.current) {
        const dx = e.clientX - startPosRef.current.x;
        const dy = e.clientY - startPosRef.current.y;
        if (Math.abs(dx) > GESTURE_CONFIG.longPressTolerance || Math.abs(dy) > GESTURE_CONFIG.longPressTolerance) {
          clearTimeout(longPressTimerRef.current);
        }
      }
    };

    const handlePointerUp = () => {
      clearTimeout(longPressTimerRef.current);
    };

    el.addEventListener('pointerdown', handlePointerDown);
    el.addEventListener('pointermove', handlePointerMove);
    el.addEventListener('pointerup', handlePointerUp);
    el.addEventListener('pointercancel', handlePointerUp);

    return () => {
      el.removeEventListener('pointerdown', handlePointerDown);
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerup', handlePointerUp);
      el.removeEventListener('pointercancel', handlePointerUp);
      clearTimeout(longPressTimerRef.current);
    };
  }, [isEditTarget, containerRef, miniIndex, dispatch]);

  // --- Gesture handler for drag (position adjustment) and swipe (toggle swing) ---
  const bind = useGesture(
    {
      onPinch: () => {
        // FROZEN: per-video pinch-to-zoom disabled
        return;
      },
      onDrag: ({ delta: [dx], last, velocity: [vx], movement: [mx, my] }) => {
        if (!isEditTarget) return;

        // Drag mode: long-press was detected, adjust object-position
        if (isDraggingRef.current && !last) {
          const containerWidth = Math.min(window.innerWidth, window.innerHeight * 3);
          const deltaPosition = -dx / containerWidth * GESTURE_CONFIG.dragSensitivity;
          const newPosition = Math.max(0, Math.min(1, miniState.swinging.position + deltaPosition));
          dispatch({
            type: 'UPDATE_MINI_SWINGING',
            miniIndex,
            swinging: { position: newPosition },
          });
          return;
        }

        if (last) {
          clearTimeout(longPressTimerRef.current);

          if (isDraggingRef.current) {
            // Was dragging — position already set, clean up
            isDraggingRef.current = false;
            return;
          }

          // Not a drag → check for swipe to toggle swing
          isDraggingRef.current = false;
          const isQuickEnough = vx > GESTURE_CONFIG.swipeMinVelocity;
          const isFarEnough = Math.abs(mx) > GESTURE_CONFIG.swipeMinDistance;
          const isHorizontal = Math.abs(mx) > Math.abs(my);

          if (isQuickEnough && isFarEnough && isHorizontal) {
            dispatch({
              type: 'UPDATE_MINI_SWINGING',
              miniIndex,
              swinging: { enabled: !miniState.swinging.enabled },
            });
          }
        }
      },
    },
    {
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
