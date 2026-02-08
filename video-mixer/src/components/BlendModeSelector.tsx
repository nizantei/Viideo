import { useRef, useEffect } from 'react';
import { useMixer } from '../context/MixerContext';
import { BLEND_MODE_REGISTRY, BlendMode } from '../services/blendModes';
import { usePanelsConfig } from '../systems/panels';
import styles from '../styles/BlendModeSelector.module.css';

export function BlendModeSelector() {
  const { state, dispatch } = useMixer();
  const panelsConfig = usePanelsConfig();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isOpen, targetMini } = state.blendModeSelector;

  const currentBlendMode = targetMini !== null ? state.minis[targetMini].blendMode : BlendMode.NORMAL;

  // Scroll to center the active blend mode when panel opens or target changes
  useEffect(() => {
    if (!isOpen || targetMini === null || !scrollRef.current) return;
    const activeEl = scrollRef.current.querySelector(`.${styles.active}`) as HTMLElement | null;
    if (activeEl) {
      const container = scrollRef.current;
      const scrollTop = activeEl.offsetTop - container.clientHeight / 2 + activeEl.clientHeight / 2;
      container.scrollTop = Math.max(0, scrollTop);
    }
  }, [isOpen, targetMini, currentBlendMode]);

  if (!isOpen || targetMini === null) return null;

  const handleClose = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: 'CLOSE_BLEND_MODE_SELECTOR' });
  };

  const handleSelectBlendMode = (blendMode: BlendMode) => {
    dispatch({ type: 'SET_MINI_BLEND_MODE', miniIndex: targetMini, blendMode });
  };

  const panelStyle = {
    '--panel-bg': panelsConfig.panelBackground,
  } as React.CSSProperties;

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
      style={panelStyle}
    >
      {/* Right side panel */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>
            Blend - Mini {targetMini + 1}
          </span>
          <button className={styles.closeButton} onTouchEnd={handleClose} onClick={handleClose}>
            ×
          </button>
        </div>
        <div ref={scrollRef} className={styles.panelScroll}>
          {BLEND_MODE_REGISTRY.map((metadata) => {
            const isActive = metadata.id === currentBlendMode;
            return (
              <button
                key={metadata.id}
                className={`${styles.blendModeItem} ${isActive ? styles.active : ''}`}
                onClick={() => handleSelectBlendMode(metadata.id)}
              >
                <span className={styles.blendModeName}>{metadata.displayName}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
