import { useRef, useEffect, useCallback } from 'react';
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
  const animationFrameRef = useRef<number | null>(null);
  const isLongPressingRef = useRef(false);

  const deckClass = deck === 'A' ? styles.deckA : styles.deckB;
  const activeClass = isActive ? styles.active : styles.inactive;

  // Animation function - NOT using useCallback to avoid closure issues
  // The function needs to always read the latest state value
  const animate = () => {
    if (!isLongPressingRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const currentValue = state.crossfader;
    const targetValue = deck === 'A' ? 0 : 1;
    const step = 0.005; // Half speed again (was 0.01, now 0.005)

    let newValue: number;
    if (deck === 'A') {
      newValue = Math.max(targetValue, currentValue - step);
    } else {
      newValue = Math.min(targetValue, currentValue + step);
    }

    dispatch({ type: 'SET_CROSSFADER', value: newValue });

    // Always continue animation while pressing
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      isLongPressingRef.current = false;
    };
  }, []);

  const startLongPress = () => {
    isLongPressingRef.current = true;
    // Start animation loop
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const stopLongPress = useCallback(() => {
    const wasLongPressing = isLongPressingRef.current;
    isLongPressingRef.current = false;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    return wasLongPressing;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Clear any existing timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    // Start long press timer
    longPressTimer.current = window.setTimeout(() => {
      startLongPress();
    }, 500);
  }, [startLongPress]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();

    // Clear timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Check if it was a long press
    const wasLongPress = stopLongPress();

    // If it was a short tap, open library
    if (!wasLongPress) {
      if (!state.isInteractionEnabled) {
        dispatch({ type: 'ENABLE_INTERACTION' });
      }
      dispatch({ type: 'OPEN_LIBRARY', targetDeck: deck });
    }
  }, [stopLongPress, state.isInteractionEnabled, dispatch, deck]);

  const handleMouseDown = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    longPressTimer.current = window.setTimeout(() => {
      startLongPress();
    }, 500);
  }, [startLongPress]);

  const handleMouseUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    const wasLongPress = stopLongPress();

    if (!wasLongPress) {
      if (!state.isInteractionEnabled) {
        dispatch({ type: 'ENABLE_INTERACTION' });
      }
      dispatch({ type: 'OPEN_LIBRARY', targetDeck: deck });
    }
  }, [stopLongPress, state.isInteractionEnabled, dispatch, deck]);

  const handleMouseLeave = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    stopLongPress();
  }, [stopLongPress]);

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
