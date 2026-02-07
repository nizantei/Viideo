import { useEffect, useRef } from 'react';
import { useMixer } from '../context/MixerContext';
import { useGestureConfig } from '../systems/animations/context';

/**
 * Global Crossfader Gesture Hook
 *
 * Enables controlling the crossfader via long press + drag anywhere on screen.
 * - Touch and hold for ~500ms to activate
 * - Drag right/down to increase crossfader (0→1)
 * - Drag left/up to decrease crossfader (1→0)
 * - Dampened response for gentle control
 * - Does not interfere with existing controls (they use stopPropagation)
 */
export function useGlobalCrossfaderGesture() {
  const { state, dispatch } = useMixer();
  const gestureConfig = useGestureConfig();

  const isActiveRef = useRef(false);
  const longPressTimerRef = useRef<number | null>(null);
  const initialTouchRef = useRef<{ x: number; y: number } | null>(null);
  const initialCrossfaderRef = useRef<number>(0);
  const lastUpdateTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Only handle first touch
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];
      initialTouchRef.current = { x: touch.clientX, y: touch.clientY };

      // Start long press timer
      longPressTimerRef.current = window.setTimeout(() => {
        // Activate gesture mode
        isActiveRef.current = true;
        initialCrossfaderRef.current = state.crossfader;

        // Optional: Haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, gestureConfig.longPressDelay);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];

      // Check if still detecting long press
      if (longPressTimerRef.current !== null && initialTouchRef.current) {
        const deltaX = Math.abs(touch.clientX - initialTouchRef.current.x);
        const deltaY = Math.abs(touch.clientY - initialTouchRef.current.y);

        // Cancel long press if moved too much
        if (deltaX > gestureConfig.longPressThreshold || deltaY > gestureConfig.longPressThreshold) {
          window.clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        return;
      }

      // Handle gesture if active
      if (isActiveRef.current && initialTouchRef.current) {
        // Throttle updates to 60fps max
        const now = Date.now();
        if (now - lastUpdateTimeRef.current < 16) return;
        lastUpdateTimeRef.current = now;

        // Calculate delta from initial position
        const deltaX = touch.clientX - initialTouchRef.current.x;
        const deltaY = touch.clientY - initialTouchRef.current.y;

        // Combine X and Y movement (right/down = positive, left/up = negative)
        const combinedDelta = deltaX - deltaY;

        // Apply dampening and normalize by viewport width
        const viewportWidth = window.innerWidth;
        const normalizedDelta = combinedDelta / gestureConfig.dampeningFactor / viewportWidth;

        // Calculate new crossfader value
        const newValue = initialCrossfaderRef.current + normalizedDelta;
        const clampedValue = Math.max(0, Math.min(1, newValue));

        // Dispatch update
        // Crossfader removed - this hook is deprecated
        void clampedValue;
      }
    };

    const handleTouchEnd = () => {
      // Clear long press timer if still pending
      if (longPressTimerRef.current !== null) {
        window.clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      // Deactivate gesture mode
      isActiveRef.current = false;
      initialTouchRef.current = null;
    };

    const handleTouchCancel = handleTouchEnd;

    // Attach listeners to document (won't receive events from controls that use stopPropagation)
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      // Cleanup
      if (longPressTimerRef.current !== null) {
        window.clearTimeout(longPressTimerRef.current);
      }
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [state.crossfader, gestureConfig, dispatch]);
}
