import React, { useRef, useCallback } from 'react';
import { useMixer } from '../context/MixerContext';
import { MiniIndex } from '../types';

interface MiniFaderProps {
  miniIndex: MiniIndex;
}

export function MiniFader({ miniIndex }: MiniFaderProps) {
  const { state, dispatch } = useMixer();
  const faderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

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
    e.preventDefault();
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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        touchAction: 'none',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          color: '#888',
          fontWeight: 500,
        }}
      >
        {opacityPercent}%
      </div>
      <div
        ref={faderRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        style={{
          width: '40px',
          height: '120px',
          backgroundColor: '#2a2a2a',
          borderRadius: '20px',
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${opacityPercent}%`,
            backgroundColor: '#4a9eff',
            borderRadius: '20px',
            transition: isDraggingRef.current ? 'none' : 'height 0.1s',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: `${opacityPercent}%`,
            transform: 'translate(-50%, 50%)',
            width: '50px',
            height: '8px',
            backgroundColor: '#888',
            borderRadius: '4px',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
}
