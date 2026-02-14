import { useEffect, useRef } from 'react';
import { useMixer } from '../context/MixerContext';
import { MiniIndex } from '../types';

/**
 * Drives swing animation for all 4 minis using a single rAF loop.
 *
 * Cosine wave oscillation:
 *   phase += deltaTime_s * (2 * PI / swingDuration)
 *   position = 0.5 - 0.5 * cos(phase)
 *
 * position ranges 0 -> 1:
 *   0 = left edge of video at left edge of canvas
 *   1 = right edge of video at right edge of canvas
 *   Cosine naturally decelerates to zero velocity at both edges.
 *
 * Stops the rAF loop when no minis are swinging (performance).
 */
export function useSwingAnimation() {
  const { state, dispatch } = useMixer();
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  // Per-mini phase accumulator (persists across frames)
  const phasesRef = useRef<number[]>([0, 0, 0, 0]);

  // Snapshot the values we need so the rAF loop doesn't depend on stale state
  const swingDuration = state.settings.swingDuration;
  const swingDurationRef = useRef(swingDuration);
  swingDurationRef.current = swingDuration;

  // Track which minis are swinging
  const swingingFlags = state.minis.map((m) => m.swinging.enabled && !m.swinging.isPaused);
  const anySwinging = swingingFlags.some(Boolean);
  const swingingFlagsRef = useRef(swingingFlags);
  swingingFlagsRef.current = swingingFlags;

  useEffect(() => {
    if (!anySwinging) {
      lastTimeRef.current = 0;
      return;
    }

    const tick = (now: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = now;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const dt = (now - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = now;

      const dur = swingDurationRef.current;
      const angularVel = (2 * Math.PI) / dur;

      for (let i = 0; i < 4; i++) {
        if (!swingingFlagsRef.current[i]) continue;
        phasesRef.current[i] += dt * angularVel;
        const position = 0.5 - 0.5 * Math.cos(phasesRef.current[i]);
        dispatch({
          type: 'UPDATE_MINI_SWINGING',
          miniIndex: i as MiniIndex,
          swinging: { position },
        });
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
    };
  }, [anySwinging, dispatch]);
}
