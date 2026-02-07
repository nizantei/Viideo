import { useMixer } from '../context/MixerContext';
import { BLEND_MODE_REGISTRY, BlendMode } from '../services/blendModes';
import { usePanelsConfig } from '../systems/panels';
import styles from '../styles/BlendModeSelector.module.css';

export function BlendModeSelector() {
  const { state, dispatch } = useMixer();
  const panelsConfig = usePanelsConfig();
  const { isOpen, targetMini } = state.blendModeSelector;

  if (!isOpen || targetMini === null) return null;

  const currentBlendMode = state.minis[targetMini].blendMode;

  const handleClose = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: 'CLOSE_BLEND_MODE_SELECTOR' });
  };

  const handleSelectBlendMode = (blendMode: BlendMode) => {
    dispatch({ type: 'SET_MINI_BLEND_MODE', miniIndex: targetMini, blendMode });
  };

  const panelStyle = {
    '--blend-panel-width': `${panelsConfig.blendModeSelector.panelWidthPercent}%`,
    '--panel-bg': panelsConfig.panelBackground,
  } as React.CSSProperties;

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
      style={panelStyle}
    >
      {/* Tap left area to close */}
      <div className={styles.closeTap} onTouchEnd={handleClose} onClick={handleClose} />

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
        <div className={styles.panelScroll}>
          {BLEND_MODE_REGISTRY.map((metadata) => {
            const isActive = metadata.id === currentBlendMode;
            return (
              <button
                key={metadata.id}
                className={`${styles.blendModeItem} ${isActive ? styles.active : ''}`}
                onClick={() => handleSelectBlendMode(metadata.id)}
              >
                <div className={styles.blendModeInfo}>
                  <span className={styles.blendModeName}>{metadata.displayName}</span>
                  <span className={styles.blendModeDescription}>{metadata.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
