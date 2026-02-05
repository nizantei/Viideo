import React from 'react';
import { useMixer } from '../context/MixerContext';
import { useLayoutElement, useColor, useBorderRadius } from '../systems';

export function FullScreenButton() {
  const { state, dispatch } = useMixer();
  const { style } = useLayoutElement('fullScreenButton');

  // Config-driven styling
  const borderRadius = useBorderRadius('round');
  const bgColor = '#666666'; // Grey color
  const iconColor = useColor('textPrimary');

  // Hide button in full-screen mode
  if (state.isFullScreenMode) {
    return null;
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent synthetic click event
    dispatch({ type: 'TOGGLE_FULLSCREEN_MODE' });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_FULLSCREEN_MODE' });
  };

  return (
    <button
      style={{
        ...style,
        backgroundColor: bgColor,
        border: 'none',
        borderRadius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        touchAction: 'manipulation',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      <svg
        width="60%"
        height="60%"
        viewBox="0 0 24 24"
        fill="none"
        stroke={iconColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
      </svg>
    </button>
  );
}
