import { useMixer } from '../context/MixerContext';
import { getVideosByFolder, folders } from '../data/videos';
import { Video } from '../types';
import styles from '../styles/VideoGrid.module.css';

interface VideoGridProps {
  onSelect: (video: Video) => void;
}

export function VideoGrid({ onSelect }: VideoGridProps) {
  const { state } = useMixer();
  const videos = getVideosByFolder(state.library.selectedFolder);
  const targetDeck = state.library.targetDeck;

  const getFolderName = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    return folder?.name || folderId;
  };

  if (videos.length === 0) {
    return (
      <div className={styles.grid}>
        <div className={styles.emptyState}>No videos in this folder</div>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {videos.map((video) => (
        <div
          key={video.id}
          className={`${styles.card} ${
            targetDeck === 'A' ? styles.deckA : styles.deckB
          }`}
          onClick={() => onSelect(video)}
        >
          <img
            className={styles.thumbnail}
            src={video.thumbnailUrl}
            alt={video.title}
            loading="lazy"
          />
          <div className={styles.info}>
            <div className={styles.videoTitle}>{video.title}</div>
            <div className={styles.videoFolder}>{getFolderName(video.folder)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
