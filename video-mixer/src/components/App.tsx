import { useRef, useState, useCallback, useEffect } from 'react';
import { useMixer } from '../context/MixerContext';
import { useLandscapeLock } from '../hooks/useLandscapeLock';
import { VideoCanvas, VideoCanvasRef } from './VideoCanvas';
import { DeckLabel } from './DeckLabel';
import { TapToLoad } from './TapToLoad';
import { Crossfader } from './Crossfader';
import { LibraryOverlay } from './LibraryOverlay';
import { PlayButton } from './PlayButton';
import { FullscreenButton } from './FullscreenButton';
import styles from '../styles/App.module.css';

export default function App() {
  const { state, dispatch } = useMixer();
  const { isLandscape } = useLandscapeLock();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoCanvasRef = useRef<VideoCanvasRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play when videos are loaded and interaction is enabled
  useEffect(() => {
    if (state.isInteractionEnabled && videoCanvasRef.current) {
      videoCanvasRef.current.play();
      setIsPlaying(true);
    }
  }, [state.isInteractionEnabled, state.deckA.videoId, state.deckB.videoId]);

  const handlePlayPause = useCallback(() => {
    if (!state.isInteractionEnabled) {
      dispatch({ type: 'ENABLE_INTERACTION' });
    }

    if (videoCanvasRef.current) {
      if (isPlaying) {
        videoCanvasRef.current.pause();
        setIsPlaying(false);
      } else {
        videoCanvasRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [isPlaying, state.isInteractionEnabled, dispatch]);

  // Handle tap on video area
  const handleVideoAreaTap = useCallback(() => {
    if (!state.isInteractionEnabled) {
      dispatch({ type: 'ENABLE_INTERACTION' });
      // Auto-play on first interaction
      if (videoCanvasRef.current) {
        videoCanvasRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [state.isInteractionEnabled, dispatch]);

  const hasVideos = state.deckA.videoId || state.deckB.videoId;

  // Show rotate device overlay on portrait
  if (!isLandscape) {
    return (
      <div className={styles.rotateOverlay}>
        <div className={styles.rotateIcon}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="2" width="16" height="20" rx="2" />
          </svg>
        </div>
        <p className={styles.rotateText}>Please rotate your device to landscape</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={styles.container}
      onClick={handleVideoAreaTap}
    >
      {/* Video canvas (WebGL) */}
      <div className={styles.canvas}>
        <VideoCanvas ref={videoCanvasRef} />
      </div>

      {/* UI Controls overlay */}
      <div className={styles.controls}>
        <DeckLabel deck="A" />
        <DeckLabel deck="B" />
        <TapToLoad />
        <Crossfader />
        <FullscreenButton />
        {hasVideos && (
          <PlayButton isPlaying={isPlaying} onToggle={handlePlayPause} />
        )}
      </div>

      {/* Library modal */}
      <LibraryOverlay />
    </div>
  );
}
