import React, { useRef, useCallback } from 'react';
import { useMixer } from '../context/MixerContext';
import { useLayoutElement, useColor, useBorderRadius, useTransition } from '../systems';
import { MiniIndex } from '../types';

interface MiniButtonProps {
  miniIndex: MiniIndex;
}

export function MiniButton({ miniIndex }: MiniButtonProps) {
  const { state, dispatch } = useMixer();
  const { style } = useLayoutElement(`mini${miniIndex + 1}`);
  const longPressTimerRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef<number>(0);

  // Config-driven styling
  const borderRadius = useBorderRadius('medium');
  const borderColorActive = useColor('borderActive');
  const borderColorInactive = useColor('borderInactive');
  const borderColorEdit = useColor('borderEdit');
  const bgColor = useColor('background');
  const bgColorVideo = useColor('backgroundVideo');
  const textColor = useColor('textLabel');
  const transition = useTransition('normal', ['border']);

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
    // Always open library on short tap, regardless of edit mode
    dispatch({ type: 'OPEN_LIBRARY', targetMini: miniIndex });
  }, [miniIndex, dispatch]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    touchStartTimeRef.current = Date.now();
    longPressTimerRef.current = window.setTimeout(() => {
      handleLongPress();
    }, 500);
  }, [handleLongPress]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent synthetic click event
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
    e.preventDefault(); // Prevent any unwanted click propagation
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
  const borderColor = isEditing ? borderColorEdit : hasVideo ? borderColorActive : borderColorInactive;

  return (
    <button
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{
        ...style,
        borderRadius,
        border: `${borderWidth} solid ${borderColor}`,
        backgroundColor: hasVideo ? bgColorVideo : bgColor,
        cursor: 'pointer',
        transition,
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
          color: textColor,
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
            fontSize: '10px',
            color: '#888',
          }}
        >
          loading
        </div>
      )}
    </button>
  );
}
