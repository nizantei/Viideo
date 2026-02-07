import { useRef } from 'react';
import { useDrag } from '@use-gesture/react';
import { useMixer } from '../context/MixerContext';
import { useLayoutElement, useColor, useBorderRadius, useOpacity } from '../systems';

export function Crossfader() {
  const { state } = useMixer();
  const { style } = useLayoutElement('crossfader');
  const trackRef = useRef<HTMLDivElement>(null);

  // Config-driven styling
  const bgColor = useColor('backgroundVideo');
  const centerMarkColor = useColor('borderInactive');
  const fillColor = useColor('borderActive');
  const thumbColor = useColor('borderActive');
  const thumbBorder = useColor('background');
  const labelColor = useColor('textLabel');
  const borderRadius = useBorderRadius('small');
  const fillOpacity = useOpacity('fill');

  const bind = useDrag(
    ({ xy: [x] }) => {
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const relativeX = x - rect.left;
      const value = Math.min(Math.max(relativeX / rect.width, 0), 1);
      // Crossfader removed - groups are now fixed at 1.0
      void value;
    },
    { axis: 'x' }
  );

  // Prevent global gesture from activating on crossfader
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  // Only show if at least one mini has a video
  const hasVideo = state.minis.some(mini => mini.videoId !== null);

  if (!hasVideo) {
    return null;
  }

  const thumbPosition = `${state.crossfader * 100}%`;

  // Calculate fill widths from center
  // When crossfader < 0.5, fill left side
  // When crossfader > 0.5, fill right side
  const leftFillWidth = state.crossfader < 0.5
    ? `${(0.5 - state.crossfader) * 100}%`
    : '0%';
  const rightFillWidth = state.crossfader > 0.5
    ? `${(state.crossfader - 0.5) * 100}%`
    : '0%';

  return (
    <div style={style}>
      <div
        ref={trackRef}
        {...bind()}
        onTouchStart={handleTouchStart}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: bgColor,
          borderRadius,
          cursor: 'pointer',
          touchAction: 'none',
        }}
      >
        {/* Center mark */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: '2px',
            backgroundColor: centerMarkColor,
            transform: 'translateX(-50%)',
          }}
        />
        {/* Left fill */}
        <div
          style={{
            position: 'absolute',
            right: '50%',
            top: 0,
            bottom: 0,
            width: leftFillWidth,
            backgroundColor: fillColor,
            opacity: fillOpacity,
            borderRadius: `${borderRadius} 0 0 ${borderRadius}`,
          }}
        />
        {/* Right fill */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: rightFillWidth,
            backgroundColor: fillColor,
            opacity: fillOpacity,
            borderRadius: `0 ${borderRadius} ${borderRadius} 0`,
          }}
        />
        {/* Thumb */}
        <div
          style={{
            position: 'absolute',
            left: thumbPosition,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '20px',
            height: '20px',
            backgroundColor: thumbColor,
            borderRadius: '50%',
            border: `2px solid ${thumbBorder}`,
            pointerEvents: 'none',
          }}
        />
      </div>
      {/* Labels */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '10px',
          color: labelColor,
          marginTop: '4px',
          pointerEvents: 'none',
        }}
      >
        <span>L</span>
        <span>R</span>
      </div>
    </div>
  );
}
