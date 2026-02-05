import { useMixer } from '../context/MixerContext';
import { BLEND_MODE_REGISTRY, BlendMode } from '../services/blendModes';
import styles from '../styles/BlendModeSelector.module.css';

export function BlendModeSelector() {
  const { state, dispatch } = useMixer();
  const { isOpen, targetMini } = state.blendModeSelector;

  if (!isOpen || targetMini === null) return null;

  const currentBlendMode = state.minis[targetMini].blendMode;

  const handleClose = () => {
    dispatch({ type: 'CLOSE_BLEND_MODE_SELECTOR' });
  };

  const handleSelectBlendMode = (blendMode: BlendMode) => {
    dispatch({ type: 'SET_MINI_BLEND_MODE', miniIndex: targetMini, blendMode });
    dispatch({ type: 'CLOSE_BLEND_MODE_SELECTOR' });
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Blend Mode - Mini {targetMini + 1}
          </h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ×
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.grid}>
            {BLEND_MODE_REGISTRY.map((metadata) => {
              const isActive = metadata.id === currentBlendMode;
              return (
                <button
                  key={metadata.id}
                  className={`${styles.blendModeButton} ${isActive ? styles.active : ''}`}
                  onClick={() => handleSelectBlendMode(metadata.id)}
                >
                  <span className={styles.blendModeName}>{metadata.displayName}</span>
                  <span className={styles.blendModeDescription}>{metadata.description}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
