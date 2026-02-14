import React, { useRef, useCallback } from 'react';
import { useMixer } from '../context/MixerContext';
import { useLayoutElement, useColor } from '../systems';
import { MiniIndex } from '../types';

interface MiniButtonProps {
  miniIndex: MiniIndex;
}

export function MiniButton({ miniIndex }: MiniButtonProps) {
  const { state, dispatch } = useMixer();
  const { style, panelStyle } = useLayoutElement(`mini${miniIndex + 1}`);
  const isPanelOpen = state.blendModeSelector.isOpen || state.library.isOpen;
  const activeStyle = isPanelOpen && panelStyle ? panelStyle : style;
  const longPressTimerRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);
  const isTouchActiveRef = useRef(false);

  // Config-driven styling
  const borderColorInactive = useColor('borderInactive');
  const borderColorEdit = useColor('borderEdit');
  const bgColor = useColor('background');
  const bgColorVideo = useColor('backgroundVideo');
  const textColor = useColor('textLabel');

  const miniState = state.minis[miniIndex];
  const isEditing = state.editMode.active && state.editMode.targetMini === miniIndex;
  const hasVideo = miniState.videoId !== null;

  // --- Opacity fill border calculations ---
  // Single vertical side: right side for minis 0-1, left side for minis 2-3
  // Bottom = 0%, top = 100%
  const isLeftGroup = miniIndex <= 1;

  const BORDER_W = 2; // px
  const EDIT_BORDER_W = 3; // px
  const blueColor = '#4a9eff';

  const handleLongPress = useCallback(() => {
    longPressTriggeredRef.current = true;
    longPressTimerRef.current = null;
    if (state.editMode.active && state.editMode.targetMini === miniIndex) {
      dispatch({ type: 'EXIT_EDIT_MODE' });
    } else {
      dispatch({ type: 'ENTER_EDIT_MODE', miniIndex });
    }
  }, [miniIndex, dispatch, state.editMode]);

  const handleShortTap = useCallback(() => {
    dispatch({ type: 'OPEN_LIBRARY', targetMini: miniIndex });
  }, [miniIndex, dispatch]);

  // --- Touch handlers ---
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    isTouchActiveRef.current = true;
    longPressTriggeredRef.current = false;
    longPressTimerRef.current = window.setTimeout(() => {
      handleLongPress();
    }, 500);
  }, [handleLongPress]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (!longPressTriggeredRef.current) {
      handleShortTap();
    }
    setTimeout(() => { isTouchActiveRef.current = false; }, 300);
  }, [handleShortTap]);

  const handleTouchCancel = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressTriggeredRef.current = false;
    setTimeout(() => { isTouchActiveRef.current = false; }, 300);
  }, []);

  // --- Mouse handlers (desktop only, blocked during touch) ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isTouchActiveRef.current) return;
    e.stopPropagation();
    longPressTriggeredRef.current = false;
    longPressTimerRef.current = window.setTimeout(() => {
      handleLongPress();
    }, 500);
  }, [handleLongPress]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isTouchActiveRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (!longPressTriggeredRef.current) {
      handleShortTap();
    }
  }, [handleShortTap]);

  return (
    <button
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        ...activeStyle,
        borderRadius: 0,
        border: 'none',
        transition: 'left 0.3s ease',
        padding: 0,
        backgroundColor: hasVideo ? bgColorVideo : bgColor,
        cursor: 'pointer',
        overflow: 'hidden',
        touchAction: 'manipulation',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        boxShadow: isEditing ? `0 0 0 ${EDIT_BORDER_W}px ${borderColorEdit}` : undefined,
      }}
    >
      {/* Thumbnail */}
      {hasVideo && !miniState.isLoading && miniState.thumbnailUrl && (
        <img
          src={miniState.thumbnailUrl}
          alt=""
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
            pointerEvents: 'none',
            WebkitTouchCallout: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        />
      )}

      {/* Number label */}
      <div
        style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          fontSize: '10px',
          fontWeight: 'bold',
          color: textColor,
          zIndex: 5,
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
            zIndex: 1,
          }}
        >
          loading
        </div>
      )}

      {/* Grey base border (all 4 sides, always visible) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: `${BORDER_W}px solid ${borderColorInactive}`,
          borderRadius: 0,
          pointerEvents: 'none',
          zIndex: 6,
        }}
      />

      {/* Blue opacity fill — single vertical side: right for minis 1-2, left for minis 3-4 */}
      {miniState.opacity > 0 && (
        <div
          style={{
            position: 'absolute',
            [isLeftGroup ? 'right' : 'left']: 0,
            bottom: 0,
            width: `${BORDER_W}px`,
            height: `${miniState.opacity * 100}%`,
            background: blueColor,
            pointerEvents: 'none',
            zIndex: 7,
          }}
        />
      )}

    </button>
  );
}
