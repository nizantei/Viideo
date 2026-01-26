import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useMixer } from '../context/MixerContext';
import { useVideoPlayer } from '../hooks/useVideoPlayer';
import { getVideoById } from '../data/videos';
import styles from '../styles/VideoCanvas.module.css';

export interface VideoCanvasRef {
  play: () => void;
  pause: () => void;
  isPlaying: boolean;
}

export const VideoCanvas = forwardRef<VideoCanvasRef>(function VideoCanvas(_, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, dispatch } = useMixer();

  // Get video URLs from state
  const videoA = state.deckA.videoId ? getVideoById(state.deckA.videoId) : null;
  const videoB = state.deckB.videoId ? getVideoById(state.deckB.videoId) : null;

  // Video players using actual video elements
  const playerA = useVideoPlayer({
    hlsUrl: videoA?.hlsUrl || null,
    onReady: () => {
      console.log('Player A ready');
      dispatch({ type: 'SET_DECK_LOADING', deck: 'A', isLoading: false });
      dispatch({ type: 'SET_DECK_PLAYING', deck: 'A', isPlaying: true });
    },
    onError: (err) => {
      console.error('Player A error:', err);
    },
  });

  const playerB = useVideoPlayer({
    hlsUrl: videoB?.hlsUrl || null,
    onReady: () => {
      console.log('Player B ready');
      dispatch({ type: 'SET_DECK_LOADING', deck: 'B', isLoading: false });
      dispatch({ type: 'SET_DECK_PLAYING', deck: 'B', isPlaying: true });
    },
    onError: (err) => {
      console.error('Player B error:', err);
    },
  });

  // Expose play/pause methods
  useImperativeHandle(ref, () => ({
    play: () => {
      console.log('Play called');
      playerA.play();
      playerB.play();
    },
    pause: () => {
      console.log('Pause called');
      playerA.pause();
      playerB.pause();
    },
    isPlaying: playerA.isPlaying || playerB.isPlaying,
  }), [playerA, playerB]);

  // Auto-play when interaction is enabled or video becomes ready
  useEffect(() => {
    if (state.isInteractionEnabled) {
      if (playerA.isReady) {
        console.log('Auto-playing A');
        playerA.play();
      }
      if (playerB.isReady) {
        console.log('Auto-playing B');
        playerB.play();
      }
    }
  }, [state.isInteractionEnabled, playerA.isReady, playerB.isReady]);

  // Get the actual video elements and move them into our container
  useEffect(() => {
    const vA = playerA.getVideoElement();
    const vB = playerB.getVideoElement();

    if (vA && containerRef.current) {
      // Style the video element to be visible
      vA.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        z-index: 1;
        opacity: ${1 - state.crossfader};
      `;
      if (vA.parentElement !== containerRef.current) {
        containerRef.current.appendChild(vA);
      }
    }

    if (vB && containerRef.current) {
      vB.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        z-index: 2;
        opacity: ${state.crossfader};
      `;
      if (vB.parentElement !== containerRef.current) {
        containerRef.current.appendChild(vB);
      }
    }
  }, [playerA, playerB, state.crossfader]);

  // Update opacity based on crossfader
  useEffect(() => {
    const vA = playerA.getVideoElement();
    const vB = playerB.getVideoElement();

    if (vA) {
      vA.style.opacity = String(1 - state.crossfader);
    }
    if (vB) {
      vB.style.opacity = String(state.crossfader);
    }
  }, [state.crossfader, playerA, playerB]);

  return (
    <div ref={containerRef} className={styles.container} />
  );
});
