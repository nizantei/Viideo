import { useMixer } from '../context/MixerContext';
import { FolderList } from './FolderList';
import { VideoGrid } from './VideoGrid';
import { Video } from '../types';
import styles from '../styles/LibraryOverlay.module.css';

export function LibraryOverlay() {
  const { state, dispatch } = useMixer();
  const { isOpen, targetMini } = state.library;

  const handleClose = () => {
    dispatch({ type: 'CLOSE_LIBRARY' });
  };

  const handleSelectVideo = (video: Video) => {
    if (targetMini === null) return;

    dispatch({ type: 'SET_MINI_VIDEO', miniIndex: targetMini, videoId: video.id });
    dispatch({ type: 'SET_MINI_LOADING', miniIndex: targetMini, isLoading: true });
    dispatch({ type: 'CLOSE_LIBRARY' });
  };

  const titleClass = targetMini !== null && targetMini < 2 ? styles.titleDeckA : styles.titleDeckB;

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={`${styles.title} ${titleClass}`}>
            Load to Mini {targetMini !== null ? targetMini + 1 : ''}
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
