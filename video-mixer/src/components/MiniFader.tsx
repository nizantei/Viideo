import { useRef, useCallback } from 'react';
import { useMixer } from '../context/MixerContext';
import { useLayoutElement, useColor } from '../systems';
import { MiniIndex } from '../types';

interface MiniFaderProps {
  miniIndex: MiniIndex;
}

export function MiniFader({ miniIndex }: MiniFaderProps) {
  const { state, dispatch } = useMixer();
  const { style, hitSlop } = useLayoutElement(`vfader${miniIndex + 1}`);
  const faderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Config-driven styling
  const bgColor = useColor('borderInactive');
  const handleColor = useColor('textLabel');

  const miniState = state.minis[miniIndex];

  const handleMove = useCallback((clientY: number) => {
    if (!faderRef.current) return;

    const rect = faderRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const percentage = 1 - Math.max(0, Math.min(1, relativeY / rect.height));

    dispatch({
      type: 'SET_MINI_OPACITY',
      miniIndex,
      opacity: percentage,
    });
  }, [miniIndex, dispatch]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    isDraggingRef.current = true;
    handleMove(e.touches[0].clientY);
  }, [handleMove]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    // No need for preventDefault since touch-action: none is set in CSS
    handleMove(e.touches[0].clientY);
  }, [handleMove]);

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    isDraggingRef.current = true;
    handleMove(e.clientY);

    const handleMouseMove = (me: MouseEvent) => {
      if (isDraggingRef.current) {
        handleMove(me.clientY);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [handleMove]);

  const opacityPercent = Math.round(miniState.opacity * 100);

  // Calculate handle padding from hitSlop
  const handlePaddingPx = hitSlop ? `${Math.max(hitSlop.left, hitSlop.right)}px` : '20px';

  return (
    <div
      ref={faderRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      style={{
        ...style,
        backgroundColor: bgColor,
        cursor: 'pointer',
        touchAction: 'none',
      }}
    >
      {/* Handle with larger touch area */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: `${opacityPercent}%`,
          transform: 'translate(-50%, 50%)',
          padding: handlePaddingPx,
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            width: '30px',
            height: '6px',
            backgroundColor: handleColor,
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
}
