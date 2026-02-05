import { useMixer } from '../context/MixerContext';
import { useLayoutElement, useGradient, useBorderRadius, useShadow, useFont } from '../systems';

export function TapToLoad() {
  const { state, dispatch } = useMixer();
  const { style } = useLayoutElement('tapToLoad');

  // Config-driven styling
  const gradient = useGradient('tapToLoad');
  const borderRadius = useBorderRadius('large');
  const shadow = useShadow('button');
  const font = useFont('xl', 'bold');

  // Only show if NO videos are loaded and library is closed and not in full-screen mode
  const loadedCount = state.minis.filter(mini => mini.videoId !== null).length;
  if (loadedCount > 0 || state.library.isOpen || state.isFullScreenMode) {
    return null;
  }

  const handleTap = () => {
    // Enable interaction on first tap (for autoplay)
    if (!state.isInteractionEnabled) {
      dispatch({ type: 'ENABLE_INTERACTION' });
    }

    // Find first empty mini
    const targetMini = state.minis.findIndex(mini => mini.videoId === null);
    if (targetMini !== -1) {
      dispatch({ type: 'OPEN_LIBRARY', targetMini: targetMini as 0 | 1 | 2 | 3 });
    }
  };

  return (
    <div style={style}>
      <button
        onClick={handleTap}
        style={{
          width: '100%',
          height: '100%',
          padding: '16px 32px',
          ...font,
          color: 'white',
          background: gradient,
          border: 'none',
          borderRadius,
          cursor: 'pointer',
          touchAction: 'manipulation',
          boxShadow: shadow,
        }}
      >
        TAP TO LOAD
      </button>
    </div>
  );
}
