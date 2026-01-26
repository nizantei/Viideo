import { useMixer } from '../context/MixerContext';
import styles from '../styles/TapToLoad.module.css';

export function TapToLoad() {
  const { state, dispatch } = useMixer();

  // Don't show if both decks have videos or library is open
  if ((state.deckA.videoId && state.deckB.videoId) || state.library.isOpen) {
    return null;
  }

  const handleTap = () => {
    // Enable interaction on first tap (for autoplay)
    if (!state.isInteractionEnabled) {
      dispatch({ type: 'ENABLE_INTERACTION' });
    }

    // Determine which deck to load
    const targetDeck: 'A' | 'B' = state.deckA.videoId ? 'B' : 'A';
    dispatch({ type: 'OPEN_LIBRARY', targetDeck });
  };

  const getMessage = () => {
    if (!state.deckA.videoId && !state.deckB.videoId) {
      return 'Tap to load your first video';
    }
    if (state.deckA.videoId && !state.deckB.videoId) {
      return 'Load a second video to mix';
    }
    return 'Tap to load';
  };

  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={handleTap}>
        TAP TO LOAD
      </button>
      <p className={styles.hint}>{getMessage()}</p>
    </div>
  );
}
