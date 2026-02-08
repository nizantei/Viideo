import { useRef, useState, useCallback } from 'react';
import { useMixer } from '../context/MixerContext';
import { useLayoutElement } from '../systems';
import { MiniIndex } from '../types';

interface MiniFaderProps {
  miniIndex: MiniIndex;
}

export function MiniFader({ miniIndex }: MiniFaderProps) {
  const { state, dispatch } = useMixer();
  const { style, panelStyle, rect, panelRect } = useLayoutElement(`vfader${miniIndex + 1}`);
  const faderRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);
  const startYRef = useRef(0);
  const startOpacityRef = useRef(0);
  const lastYRef = useRef(0);
  const lastDirectionRef = useRef<'up' | 'down' | null>(null);

  const [isTouching, setIsTouching] = useState(false);
  const [fingerY, setFingerY] = useState(0);
  const [isAtMax, setIsAtMax] = useState(false);
  const [frozenLabelTop, setFrozenLabelTop] = useState(0);

  const miniState = state.minis[miniIndex];
  const opacityPercent = Math.round(miniState.opacity * 100);
  const isAnyPanelOpen = state.blendModeSelector.isOpen || state.library.isOpen;
  const isPanelOpen = state.library.isOpen; // only library blocks fader input

  // Original fader height in pixels (for drag sensitivity)
  const faderHeight = rect?.h ?? 200;

  const computeOpacity = useCallback((clientY: number) => {
    // Detect direction change
    const direction: 'up' | 'down' = clientY < lastYRef.current ? 'up' : 'down';
    const prevDirection = lastDirectionRef.current;
    const currentOpacity = state.minis[miniIndex].opacity;

    // Re-anchor when direction changes at limits
    if (prevDirection && direction !== prevDirection) {
      if ((currentOpacity >= 1 && direction === 'down') ||
          (currentOpacity <= 0 && direction === 'up')) {
        startYRef.current = clientY;
        startOpacityRef.current = currentOpacity;
      }
    }

    lastYRef.current = clientY;
    lastDirectionRef.current = direction;

    // Use original fader height for drag sensitivity
    const deltaY = startYRef.current - clientY;
    const deltaOpacity = deltaY / faderHeight;
    const newOpacity = Math.max(0, Math.min(1, startOpacityRef.current + deltaOpacity));

    // Track max state for frozen label
    const wasAtMax = currentOpacity >= 1;
    const nowAtMax = newOpacity >= 1;

    if (nowAtMax && !wasAtMax && faderRef.current) {
      const fRect = faderRef.current.getBoundingClientRect();
      setFrozenLabelTop(clientY - fRect.top - 93);
      setIsAtMax(true);
    } else if (!nowAtMax && wasAtMax) {
      setIsAtMax(false);
    }

    dispatch({
      type: 'SET_MINI_OPACITY',
      miniIndex,
      opacity: newOpacity,
    });
  }, [miniIndex, dispatch, state.minis, faderHeight]);

  // --- Touch handlers ---
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isPanelOpen) return;
    e.stopPropagation();
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    startYRef.current = touch.clientY;
    startOpacityRef.current = state.minis[miniIndex].opacity;
    lastYRef.current = touch.clientY;
    lastDirectionRef.current = null;
    setIsTouching(true);
    setFingerY(touch.clientY);
    setIsAtMax(state.minis[miniIndex].opacity >= 1);
    if (state.minis[miniIndex].opacity >= 1 && faderRef.current) {
      const fRect = faderRef.current.getBoundingClientRect();
      setFrozenLabelTop(touch.clientY - fRect.top - 93);
    }
  }, [miniIndex, state.minis, isPanelOpen]);

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
        setIsAtMax(false);
        lastDirectionRef.current = null;
        return;
      }
    }
  }, []);

  // --- Mouse handlers (desktop) ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isPanelOpen) return;
    e.stopPropagation();
    startYRef.current = e.clientY;
    startOpacityRef.current = state.minis[miniIndex].opacity;
    lastYRef.current = e.clientY;
    lastDirectionRef.current = null;
    setIsTouching(true);
    setFingerY(e.clientY);
    setIsAtMax(state.minis[miniIndex].opacity >= 1);
    if (state.minis[miniIndex].opacity >= 1 && faderRef.current) {
      const fRect = faderRef.current.getBoundingClientRect();
      setFrozenLabelTop(e.clientY - fRect.top - 93);
    }

    const handleMouseMove = (me: MouseEvent) => {
      computeOpacity(me.clientY);
      setFingerY(me.clientY);
    };

    const handleMouseUp = () => {
      setIsTouching(false);
      setIsAtMax(false);
      lastDirectionRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [miniIndex, state.minis, computeOpacity, isPanelOpen]);

  // Calculate label position relative to the inner fader container
  // -93px offset = original -55 plus ~38px extra (~1cm higher)
  const faderRect = faderRef.current?.getBoundingClientRect();
  const normalLabelTop = faderRect ? fingerY - faderRect.top - 93 : 0;
  const labelTop = isAtMax ? frozenLabelTop : normalLabelTop;

  // Use panel positions when any side panel is open
  const activeStyle = isAnyPanelOpen && panelStyle ? panelStyle : style;
  const activeRect = isAnyPanelOpen && panelRect ? panelRect : rect;

  // Compute extended touch area: keep same left/width/bottom but extend top to 0
  const origTop = activeRect ? activeRect.y : 0;
  const origHeight = activeRect ? activeRect.h : 0;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: activeStyle?.left,
        top: 0,
        width: activeStyle?.width,
        height: `${origTop + origHeight}px`,
        zIndex: activeStyle?.zIndex,
        cursor: 'pointer',
        touchAction: 'none',
        overflow: 'visible',
        transition: 'left 0.3s ease',
      }}
    >
      {/* Visual fader area - positioned at original layout location within touch capture */}
      <div
        ref={faderRef}
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: '100%',
          height: `${origHeight}px`,
        }}
      >
        {/* Thin vertical track line - rises from bottom up to the handle */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 0,
            height: `${opacityPercent}%`,
            width: '2px',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(160, 160, 160, 0.7)',
            boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.8)',
            borderRadius: '1px',
            transition: isTouching ? 'none' : 'opacity 0.2s ease-out',
            opacity: isTouching ? 1 : 0,
            pointerEvents: 'none',
          }}
        />

        {/* Horizontal handle line - half width, centered */}
        <div
          style={{
            position: 'absolute',
            left: '25%',
            width: '50%',
            top: `${100 - opacityPercent}%`,
            height: '2px',
            backgroundColor: 'rgba(160, 160, 160, 0.9)',
            boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.8)',
            borderRadius: '1px',
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
              color: isAtMax ? '#ff6b00' : '#fff',
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
    </div>
  );
}
