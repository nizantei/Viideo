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
  const intervalRef = useRef<number | null>(null);

  const deckClass = deck === 'A' ? styles.deckA : styles.deckB;
  const activeClass = isActive ? styles.active : styles.inactive;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startLongPress = () => {
    console.log('Starting long press for deck', deck);
    isLongPressingRef.current = true;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Use setInterval for consistent animation
    intervalRef.current = window.setInterval(() => {
      if (!isLongPressingRef.current) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      const currentValue = state.crossfader;
      const targetValue = deck === 'A' ? 0 : 1;
      const step = 0.005;

      let newValue: number;
      if (deck === 'A') {
        newValue = Math.max(targetValue, currentValue - step);
      } else {
        newValue = Math.min(targetValue, currentValue + step);
      }

      console.log('Animating:', currentValue, '->', newValue);
      dispatch({ type: 'SET_CROSSFADER', value: newValue });
    }, 16); // ~60fps
  };

  const stopLongPress = () => {
    console.log('Stopping long press, was pressing:', isLongPressingRef.current);
    const wasLongPressing = isLongPressingRef.current;
    isLongPressingRef.current = false;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return wasLongPressing;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Touch start on deck', deck);

    // Clear any existing timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    // Start long press timer
    longPressTimer.current = window.setTimeout(() => {
      console.log('Long press timer fired for deck', deck);
      startLongPress();
    }, 500);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    console.log('Touch end on deck', deck);

    // Clear timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Check if it was a long press
    const wasLongPress = stopLongPress();

    // If it was a short tap, open library
    if (!wasLongPress) {
      console.log('Short tap detected, opening library for deck', deck);
      if (!state.isInteractionEnabled) {
        dispatch({ type: 'ENABLE_INTERACTION' });
      }
      dispatch({ type: 'OPEN_LIBRARY', targetDeck: deck });
    }
  };

  const handleMouseDown = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    longPressTimer.current = window.setTimeout(() => {
      startLongPress();
    }, 500);
  };

  const handleMouseUp = () => {
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
