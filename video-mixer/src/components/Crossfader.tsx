import { useRef } from 'react';
import { useDrag } from '@use-gesture/react';
import { useMixer } from '../context/MixerContext';
import styles from '../styles/Crossfader.module.css';

export function Crossfader() {
  const { state, dispatch } = useMixer();
  const trackRef = useRef<HTMLDivElement>(null);

  const bind = useDrag(
    ({ xy: [x] }) => {
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const relativeX = x - rect.left;
      const value = Math.min(Math.max(relativeX / rect.width, 0), 1);
      dispatch({ type: 'SET_CROSSFADER', value });
    },
    { axis: 'x' }
  );

  // Only show if at least one deck has a video
  const hasVideo = state.deckA.videoId || state.deckB.videoId;

  if (!hasVideo) {
    return null;
  }

  const thumbPosition = `${state.crossfader * 100}%`;

  // Calculate fill widths from center
  // When crossfader < 0.5, fill left side
  // When crossfader > 0.5, fill right side
  const leftFillWidth = state.crossfader < 0.5
    ? `${(0.5 - state.crossfader) * 100}%`
    : '0%';
  const rightFillWidth = state.crossfader > 0.5
    ? `${(state.crossfader - 0.5) * 100}%`
    : '0%';

  return (
    <div className={styles.container}>
      <div ref={trackRef} className={styles.track} {...bind()}>
        <div className={styles.centerMark} />
        <div
          className={styles.fillLeft}
          style={{ width: leftFillWidth }}
        />
        <div
          className={styles.fillRight}
          style={{ width: rightFillWidth }}
        />
        <div
          className={styles.thumb}
          style={{ left: thumbPosition }}
        />
      </div>
      <div className={styles.labels}>
        <span className={styles.labelA}>A</span>
        <span className={styles.labelB}>B</span>
      </div>
    </div>
  );
}
