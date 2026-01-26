import { useMixer } from '../context/MixerContext';
import { FolderList } from './FolderList';
import { VideoGrid } from './VideoGrid';
import { Video } from '../types';
import styles from '../styles/LibraryOverlay.module.css';

export function LibraryOverlay() {
  const { state, dispatch } = useMixer();
  const { isOpen, targetDeck } = state.library;

  const handleClose = () => {
    dispatch({ type: 'CLOSE_LIBRARY' });
  };

  const handleSelectVideo = (video: Video) => {
    if (!targetDeck) return;

    dispatch({ type: 'SET_DECK_VIDEO', deck: targetDeck, videoId: video.id });
    dispatch({ type: 'SET_DECK_LOADING', deck: targetDeck, isLoading: true });

    // Auto-move crossfader towards the loaded deck
    if (targetDeck === 'A' && !state.deckB.videoId) {
      dispatch({ type: 'SET_CROSSFADER', value: 0 });
    } else if (targetDeck === 'B' && !state.deckA.videoId) {
      dispatch({ type: 'SET_CROSSFADER', value: 1 });
    }

    dispatch({ type: 'CLOSE_LIBRARY' });
  };

  const titleClass = targetDeck === 'A' ? styles.titleDeckA : styles.titleDeckB;

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={`${styles.title} ${titleClass}`}>
            Load to Deck {targetDeck}
          </h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ×
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.sidebar}>
            <FolderList />
          </div>
          <div className={styles.main}>
            <VideoGrid onSelect={handleSelectVideo} />
          </div>
        </div>
      </div>
    </div>
  );
}
