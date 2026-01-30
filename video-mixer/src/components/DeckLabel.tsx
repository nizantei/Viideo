import { useRef, useEffect } from 'react';
import { useMixer } from '../context/MixerContext';
import styles from '../styles/DeckLabel.module.css';

interface DeckLabelProps {
  deck: 'A' | 'B';
}

export function DeckLabel({ deck }: DeckLabelProps) {
  const { state, dispatch } = useMixer();
  const deckState = deck === 'A' ? state.deckA : state.deckB;
  const isActive = deckState.videoId !== null;
  const longPressTimer = useRef<number | null>(null);
  const isLongPressingRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);

  // Ref to store latest crossfader value (fixes stale closure)
  const crossfaderRef = useRef(state.crossfader);

  // Verification system to confirm animation actually moves slider
  const verifyAnimationWorking = useRef({
    startValue: 0,
    startTime: 0,
    frameCount: 0,
    working: false
  });

  const deckClass = deck === 'A' ? styles.deckA : styles.deckB;
  const activeClass = isActive ? styles.active : styles.inactive;

  // Update crossfaderRef on every render
  useEffect(() => {
    crossfaderRef.current = state.crossfader;
  }, [state.crossfader]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      isLongPressingRef.current = false;
    };
  }, []);

  const startLongPress = () => {
    isLongPressingRef.current = true;

    // Initialize verification
    verifyAnimationWorking.current = {
      startValue: crossfaderRef.current,
      startTime: Date.now(),
      frameCount: 0,
      working: false
    };

    const animate = () => {
      if (!isLongPressingRef.current) {
        // Check if animation actually worked
        const verify = verifyAnimationWorking.current;
        const valueMoved = Math.abs(crossfaderRef.current - verify.startValue);
        const timeElapsed = Date.now() - verify.startTime;

        if (verify.frameCount > 10 && valueMoved < 0.01) {
          console.error('❌ ANIMATION FAILED: Slider did not move', {
            frames: verify.frameCount,
            timeMs: timeElapsed,
            expectedMove: verify.frameCount * 0.005,
            actualMove: valueMoved
          });
        } else if (valueMoved > 0) {
          console.log('✅ Animation verified:', {
            frames: verify.frameCount,
            moved: valueMoved,
            timeMs: timeElapsed
          });
        }

        animationFrameRef.current = null;
        return;
      }

      // Read from REF instead of captured state
      const currentValue = crossfaderRef.current;
      const targetValue = deck === 'A' ? 0 : 1;
      const step = 0.005;

      let newValue: number;
      if (deck === 'A') {
        newValue = Math.max(targetValue, currentValue - step);
      } else {
        newValue = Math.min(targetValue, currentValue + step);
      }

      dispatch({ type: 'SET_CROSSFADER', value: newValue });

      verifyAnimationWorking.current.frameCount++;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const stopLongPress = () => {
    const wasLongPressing = isLongPressingRef.current;
    isLongPressingRef.current = false;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    return wasLongPressing;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();

    // Record start time for duration calculation
    touchStartTime.current = Date.now();

    // Clear any existing timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    // Start long press timer
    longPressTimer.current = window.setTimeout(() => {
      startLongPress();
    }, 500);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();

    // Calculate actual touch duration
    const touchDuration = Date.now() - touchStartTime.current;

    // Clear timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Stop any animation
    stopLongPress();

    // Use actual duration to determine if it was a short tap
    // Use 400ms threshold to be more lenient than the 500ms timer
    if (touchDuration < 400) {
      if (!state.isInteractionEnabled) {
        dispatch({ type: 'ENABLE_INTERACTION' });
      }
      dispatch({ type: 'OPEN_LIBRARY', targetDeck: deck });
    }
  };

  const handleMouseDown = () => {
    // Record start time for duration calculation
    touchStartTime.current = Date.now();

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    longPressTimer.current = window.setTimeout(() => {
      startLongPress();
    }, 500);
  };

  const handleMouseUp = () => {
    // Calculate actual duration
    const touchDuration = Date.now() - touchStartTime.current;

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Stop any animation
    stopLongPress();

    // Use actual duration to determine if it was a short click
    if (touchDuration < 400) {
      if (!state.isInteractionEnabled) {
        dispatch({ type: 'ENABLE_INTERACTION' });
      }
      dispatch({ type: 'OPEN_LIBRARY', targetDeck: deck });
    }
  };

  const handleMouseLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    stopLongPress();
  };

  return (
    <button
      className={`${styles.label} ${deckClass} ${activeClass}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {deck}
    </button>
  );
}
