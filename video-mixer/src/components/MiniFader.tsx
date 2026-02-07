import { useRef, useState, useCallback } from 'react';
import { useMixer } from '../context/MixerContext';
import { useLayoutElement } from '../systems';
import { MiniIndex } from '../types';

interface MiniFaderProps {
  miniIndex: MiniIndex;
}

export function MiniFader({ miniIndex }: MiniFaderProps) {
  const { state, dispatch } = useMixer();
  const { style } = useLayoutElement(`vfader${miniIndex + 1}`);
  const faderRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);
  const startYRef = useRef(0);
  const startOpacityRef = useRef(0);

  const [isTouching, setIsTouching] = useState(false);
  const [fingerY, setFingerY] = useState(0);

  const miniState = state.minis[miniIndex];
  const opacityPercent = Math.round(miniState.opacity * 100);

  const computeOpacity = useCallback((clientY: number) => {
    if (!faderRef.current) return;
    const rect = faderRef.current.getBoundingClientRect();
    // How many pixels the finger moved (positive = moved up = increase opacity)
    const deltaY = startYRef.current - clientY;
    const deltaOpacity = deltaY / rect.height;
    const newOpacity = Math.max(0, Math.min(1, startOpacityRef.current + deltaOpacity));

    dispatch({
      type: 'SET_MINI_OPACITY',
      miniIndex,
      opacity: newOpacity,
    });
  }, [miniIndex, dispatch]);

  // --- Touch handlers ---
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    startYRef.current = touch.clientY;
    startOpacityRef.current = state.minis[miniIndex].opacity;
    setIsTouching(true);
    setFingerY(touch.clientY);
  }, [miniIndex, state.minis]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === touchIdRef.current) {
        const touch = e.touches[i];
        computeOpacity(touch.clientY);
        setFingerY(touch.clientY);
        return;
      }
    }
  }, [computeOpacity]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setIsTouching(false);
        return;
      }
    }
  }, []);

  // --- Mouse handlers (desktop) ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    startYRef.current = e.clientY;
    startOpacityRef.current = state.minis[miniIndex].opacity;
    setIsTouching(true);
    setFingerY(e.clientY);

    const handleMouseMove = (me: MouseEvent) => {
      computeOpacity(me.clientY);
      setFingerY(me.clientY);
    };

    const handleMouseUp = () => {
      setIsTouching(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [miniIndex, state.minis, computeOpacity]);

  // Calculate label position relative to the fader container
  const faderRect = faderRef.current?.getBoundingClientRect();
  const labelTop = faderRect ? fingerY - faderRect.top - 55 : 0;

  return (
    <div
      ref={faderRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      style={{
        ...style,
        cursor: 'pointer',
        touchAction: 'none',
        overflow: 'visible',
      }}
    >
      {/* Fill bar - visible only when touching */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: `${opacityPercent}%`,
          backgroundColor: 'rgba(255, 255, 255, 0.35)',
          borderRadius: '2px',
          transition: isTouching ? 'none' : 'opacity 0.2s ease-out',
          opacity: isTouching ? 1 : 0,
          pointerEvents: 'none',
        }}
      />

      {/* Percentage label above finger */}
      {isTouching && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: `${labelTop}px`,
            transform: 'translateX(-50%)',
            fontSize: '20px',
            fontWeight: 700,
            color: '#fff',
            WebkitTextStroke: '2px #000',
            paintOrder: 'stroke fill',
            textAlign: 'center',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            zIndex: 20,
          }}
        >
          {opacityPercent}%
        </div>
      )}
    </div>
  );
}
