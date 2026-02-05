import { useEffect, useState } from 'react';
import { useMixer } from '../context/MixerContext';
import { getVideosByFolder, folders } from '../data/videos';
import { Video } from '../types';
import styles from '../styles/VideoGrid.module.css';

interface VideoGridProps {
  onSelect: (video: Video) => void;
}

export function VideoGrid({ onSelect }: VideoGridProps) {
  const { state } = useMixer();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const targetMini = state.library.targetMini;

  // Load videos when folder changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getVideosByFolder(state.library.selectedFolder).then((loadedVideos) => {
      if (!cancelled) {
        setVideos(loadedVideos);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [state.library.selectedFolder]);

  const getFolderName = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    return folder?.name || folderId;
  };

  if (loading) {
    return (
      <div className={styles.grid}>
        <div className={styles.emptyState}>Loading clips...</div>
      </div>
    );
  }

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
            targetMini !== null && targetMini < 2 ? styles.deckA : styles.deckB
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
