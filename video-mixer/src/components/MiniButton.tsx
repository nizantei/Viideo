import React, { useRef, useCallback } from 'react';
import { useMixer } from '../context/MixerContext';
import { MiniIndex } from '../types';

interface MiniButtonProps {
  miniIndex: MiniIndex;
}

export function MiniButton({ miniIndex }: MiniButtonProps) {
  const { state, dispatch } = useMixer();
  const longPressTimerRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef<number>(0);

  const miniState = state.minis[miniIndex];
  const isEditing = state.editMode.active && state.editMode.targetMini === miniIndex;
  const hasVideo = miniState.videoId !== null;

  const handleLongPress = useCallback(() => {
    if (state.editMode.active && state.editMode.targetMini === miniIndex) {
      dispatch({ type: 'EXIT_EDIT_MODE' });
    } else {
      dispatch({ type: 'ENTER_EDIT_MODE', miniIndex });
    }
  }, [miniIndex, dispatch, state.editMode]);

  const handleShortTap = useCallback(() => {
    if (state.editMode.active) {
      if (state.editMode.targetMini !== miniIndex) {
        dispatch({ type: 'SWITCH_EDIT_TARGET', miniIndex });
      }
    } else {
      dispatch({ type: 'OPEN_LIBRARY', targetMini: miniIndex });
    }
  }, [miniIndex, dispatch, state.editMode]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    touchStartTimeRef.current = Date.now();
    longPressTimerRef.current = window.setTimeout(() => {
      handleLongPress();
    }, 500);
  }, [handleLongPress]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const duration = Date.now() - touchStartTimeRef.current;
    if (duration < 500) {
      handleShortTap();
    }
  }, [handleShortTap]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    touchStartTimeRef.current = Date.now();
    longPressTimerRef.current = window.setTimeout(() => {
      handleLongPress();
    }, 500);
  }, [handleLongPress]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const duration = Date.now() - touchStartTimeRef.current;
    if (duration < 500) {
      handleShortTap();
    }
  }, [handleShortTap]);

  const borderWidth = isEditing ? '4px' : '2px';
  const borderColor = isEditing ? '#ff6b00' : hasVideo ? '#4a9eff' : '#555';

  return (
    <button
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{
        width: '60px',
        height: '60px',
        borderRadius: '8px',
        border: `${borderWidth} solid ${borderColor}`,
        backgroundColor: hasVideo ? '#1a1a1a' : '#0a0a0a',
        cursor: 'pointer',
        transition: 'border 0.2s',
        position: 'relative',
        overflow: 'hidden',
        touchAction: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          fontSize: '10px',
          fontWeight: 'bold',
          color: '#888',
        }}
      >
        {miniIndex + 1}
      </div>
      {miniState.isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#888',
          }}
        >
          ...
        </div>
      )}
    </button>
  );
}
