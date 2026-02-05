import { useMixer } from '../context/MixerContext';
import { getBlendModeMetadata } from '../services/blendModes';

export function BlendModeIndicator() {
  const { state, dispatch } = useMixer();
  const { active, targetMini } = state.editMode;

  if (!active || targetMini === null || state.isFullScreenMode) return null;

  const blendMode = state.minis[targetMini].blendMode;
  const metadata = getBlendModeMetadata(blendMode);

  const handleClick = () => {
    dispatch({ type: 'OPEN_BLEND_MODE_SELECTOR', miniIndex: targetMini });
  };

  return (
    <button
      onClick={handleClick}
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        padding: '8px 16px',
        backgroundColor: '#333',
        color: '#fff',
        border: '2px solid #ff6b00',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        zIndex: 100,
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#444';
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#333';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {metadata.displayName}
    </button>
  );
}
