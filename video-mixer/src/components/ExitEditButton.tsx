import { useMixer } from '../context/MixerContext';
import { useLayoutElement, useColor } from '../systems';

export function ExitEditButton() {
  const { state, dispatch } = useMixer();
  const { style } = useLayoutElement('exitEditButton');

  const borderColorEdit = useColor('borderEdit');

  if (!state.editMode.active) return null;

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: 'EXIT_EDIT_MODE' });
  };

  return (
    <button
      onTouchEnd={handleTap}
      onClick={handleTap}
      style={{
        ...style,
        background: borderColorEdit,
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'manipulation',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}
