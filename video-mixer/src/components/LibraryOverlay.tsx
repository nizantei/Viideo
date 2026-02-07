import { useEffect, useState } from 'react';
import { useMixer } from '../context/MixerContext';
import { FolderList } from './FolderList';
import { getVideosByFolder, folders } from '../data/videos';
import { Video } from '../types';
import { usePanelsConfig } from '../systems/panels';
import styles from '../styles/LibraryOverlay.module.css';

export function LibraryOverlay() {
  const { state, dispatch } = useMixer();
  const panelsConfig = usePanelsConfig();
  const { isOpen, targetMini } = state.library;
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    getVideosByFolder(state.library.selectedFolder).then((loadedVideos) => {
      if (!cancelled) {
        setVideos(loadedVideos);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [state.library.selectedFolder, isOpen]);

  const handleClose = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: 'CLOSE_LIBRARY' });
  };

  const handleSelectVideo = (video: Video) => {
    if (targetMini === null) return;
    dispatch({ type: 'SET_MINI_VIDEO', miniIndex: targetMini, videoId: video.id, thumbnailUrl: video.thumbnailUrl });
    dispatch({ type: 'SET_MINI_LOADING', miniIndex: targetMini, isLoading: true });
    dispatch({ type: 'CLOSE_LIBRARY' });
  };

  const handleClearChannel = () => {
    if (targetMini === null) return;
    dispatch({ type: 'CLEAR_MINI_VIDEO', miniIndex: targetMini });
    dispatch({ type: 'CLOSE_LIBRARY' });
  };

  const getFolderName = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    return folder?.name || folderId;
  };

  const hasVideo = targetMini !== null && state.minis[targetMini].videoId !== null;
  const titleClass = targetMini !== null && targetMini < 2 ? styles.titleDeckA : styles.titleDeckB;

  const panelStyle = {
    '--folder-panel-width': `${panelsConfig.library.folderPanelWidthPercent}%`,
    '--video-panel-width': `${panelsConfig.library.videoPanelWidthPercent}%`,
    '--panel-bg': panelsConfig.panelBackground,
  } as React.CSSProperties;

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
      style={panelStyle}
    >
      {/* Center tap area to close */}
      <div className={styles.centerTap} onTouchEnd={handleClose} onClick={handleClose} />

      {/* Left panel - Folders */}
      <div className={styles.folderPanel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Folders</span>
        </div>
        <div className={styles.panelScroll}>
          <FolderList />
        </div>
      </div>

      {/* Right panel - Videos */}
      <div className={styles.videoPanel}>
        <div className={styles.panelHeader}>
          <span className={`${styles.panelTitle} ${titleClass}`}>
            Mini {targetMini !== null ? targetMini + 1 : ''}
          </span>
          <button className={styles.closeButton} onTouchEnd={handleClose} onClick={handleClose}>
            ×
          </button>
        </div>
        {hasVideo && (
          <button className={styles.clearButton} onClick={handleClearChannel}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            Clear Channel
          </button>
        )}
        <div className={styles.panelScroll}>
          {loading ? (
            <div className={styles.emptyState}>Loading...</div>
          ) : videos.length === 0 ? (
            <div className={styles.emptyState}>No videos in this folder</div>
          ) : (
            videos.map((video) => (
              <div
                key={video.id}
                className={styles.videoItem}
                onClick={() => handleSelectVideo(video)}
              >
                <img
                  className={styles.videoThumb}
                  src={video.thumbnailUrl}
                  alt={video.title}
                  loading="lazy"
                />
                <div className={styles.videoInfo}>
                  <div className={styles.videoTitle}>{video.title}</div>
                  <div className={styles.videoFolder}>{getFolderName(video.folder)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
