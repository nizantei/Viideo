import { useMixer } from '../context/MixerContext';
import styles from '../styles/TapToLoad.module.css';

export function TapToLoad() {
  const { state, dispatch } = useMixer();

  // Only show if NO videos are loaded and library is closed
  const loadedCount = state.minis.filter(mini => mini.videoId !== null).length;
  if (loadedCount > 0 || state.library.isOpen) {
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
    <div className={styles.container}>
      <button className={styles.button} onClick={handleTap}>
        TAP TO LOAD
      </button>
    </div>
  );
}
