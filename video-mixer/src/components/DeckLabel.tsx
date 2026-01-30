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
  const animationFrame = useRef<number | null>(null);
  const isLongPressing = useRef(false);

  const deckClass = deck === 'A' ? styles.deckA : styles.deckB;
  const activeClass = isActive ? styles.active : styles.inactive;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  const moveCrossfader = () => {
    if (!isLongPressing.current) return;

    const currentValue = state.crossfader;
    const targetValue = deck === 'A' ? 0 : 1;
    const step = 0.015; // Speed of movement

    let newValue: number;
    if (deck === 'A') {
      newValue = Math.max(targetValue, currentValue - step);
    } else {
      newValue = Math.min(targetValue, currentValue + step);
    }

    dispatch({ type: 'SET_CROSSFADER', value: newValue });

    // Continue animation if still pressing and not at target
    if (isLongPressing.current && newValue !== targetValue) {
      animationFrame.current = requestAnimationFrame(moveCrossfader);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();

    // Start long press timer
    longPressTimer.current = window.setTimeout(() => {
      isLongPressing.current = true;
      moveCrossfader();
    }, 500); // 500ms threshold for long press
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }

    // If it was a short tap (not long press), open library
    if (!isLongPressing.current) {
      if (!state.isInteractionEnabled) {
        dispatch({ type: 'ENABLE_INTERACTION' });
      }
      dispatch({ type: 'OPEN_LIBRARY', targetDeck: deck });
    }

    isLongPressing.current = false;
  };

  const handleMouseDown = () => {
    longPressTimer.current = window.setTimeout(() => {
      isLongPressing.current = true;
      moveCrossfader();
    }, 500);
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }

    if (!isLongPressing.current) {
      if (!state.isInteractionEnabled) {
        dispatch({ type: 'ENABLE_INTERACTION' });
      }
      dispatch({ type: 'OPEN_LIBRARY', targetDeck: deck });
    }

    isLongPressing.current = false;
  };

  const handleMouseLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }

    isLongPressing.current = false;
  };

  return (
    <button
      className={`${styles.label} ${deckClass} ${activeClass}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {deck}
    </button>
  );
}
