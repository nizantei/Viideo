import { useRef, useState, useCallback } from 'react';
import { useMixer } from '../context/MixerContext';
import { useBlendConfig } from '../systems/blendConfig';
import { MixSnapshot } from '../types';
import styles from '../styles/SettingsPanel.module.css';

export function SettingsPanel() {
  const { state, dispatch } = useMixer();
  const blendConfig = useBlendConfig();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMsg, setStatusMsg] = useState('');

  // --- All hooks must be ABOVE any conditional return ---

  const handleClose = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: 'CLOSE_SETTINGS' });
  }, [dispatch]);

  const handleExport = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const snapshot: MixSnapshot = {
      version: 1,
      minis: state.minis.map((m) => ({
        videoId: m.videoId,
        thumbnailUrl: m.thumbnailUrl,
        opacity: m.opacity,
        zoom: m.zoom,
        panX: m.panX,
        panY: m.panY,
        blendMode: m.blendMode,
        swinging: { ...m.swinging },
      })),
      canvasZoom: state.canvasZoom,
      canvasPanX: state.canvasPanX,
      canvasPanY: state.canvasPanY,
    };

    const json = JSON.stringify(snapshot, null, 2);
    const fileName = `viideo-mix-${new Date().toISOString().slice(0, 10)}.json`;

    // Try Web Share API first (works best on mobile, stays in-app)
    if (navigator.share && navigator.canShare) {
      const file = new File([json], fileName, { type: 'application/json' });
      const shareData = { files: [file] };
      if (navigator.canShare(shareData)) {
        navigator.share(shareData).catch(() => {});
        setStatusMsg('Mix exported!');
        setTimeout(() => setStatusMsg(''), 2000);
        return;
      }
    }

    // Fallback: data URI download (no blob URL — blob URLs can navigate away on some browsers)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);
    const a = document.createElement('a');
    a.href = dataUri;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setStatusMsg('Mix exported!');
    setTimeout(() => setStatusMsg(''), 2000);
  }, [state.minis, state.canvasZoom, state.canvasPanX, state.canvasPanY]);

  const handleImportClick = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const snapshot = JSON.parse(ev.target?.result as string) as MixSnapshot;
        if (!snapshot.minis || !Array.isArray(snapshot.minis) || snapshot.minis.length !== 4) {
          setStatusMsg('Invalid mix file');
          setTimeout(() => setStatusMsg(''), 3000);
          return;
        }
        dispatch({ type: 'LOAD_MIX_STATE', snapshot });
        setStatusMsg('Mix loaded!');
        setTimeout(() => setStatusMsg(''), 2000);
      } catch {
        setStatusMsg('Error reading file');
        setTimeout(() => setStatusMsg(''), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [dispatch]);

  // --- Now safe to do conditional render ---
  if (!state.settings.isOpen) return null;

  const stopBubble = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`${styles.overlay} ${styles.open}`}
      onTouchStart={stopBubble}
      onClick={stopBubble}
    >
      {/* Tap outside panel to close */}
      <div
        className={styles.closeTap}
        onTouchEnd={handleClose}
        onClick={handleClose}
      />

      {/* Panel */}
      <div className={styles.panel} onTouchStart={stopBubble}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Settings</span>
          <button
            className={styles.closeButton}
            onTouchEnd={handleClose}
            onClick={handleClose}
          >
            ×
          </button>
        </div>
        <div className={styles.panelScroll}>

          {/* --- Blend Protection Section --- */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Blend Protection</div>
            <div className={styles.row}>
              <span className={styles.label}>Enabled</span>
              <span className={styles.value}>
                {blendConfig.protection.enabled ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Min Blend</span>
              <span className={styles.value}>{blendConfig.protection.minBlendStrength.toFixed(2)}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Ramp Power</span>
              <span className={styles.value}>{blendConfig.protection.rampPower.toFixed(2)}</span>
            </div>
            <div style={{ fontSize: '9px', color: '#666', marginTop: 4 }}>
              Edit blend-modes.json to change
            </div>
          </div>

          <div className={styles.divider} />

          {/* --- Current Mix Info --- */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Current Mix</div>
            {state.minis.map((m, i) => (
              <div key={i} className={styles.row}>
                <span className={styles.label}>Mini {i + 1}</span>
                <span className={styles.value} style={{ width: 'auto' }}>
                  {m.videoId ? `${m.blendMode} @ ${Math.round(m.opacity * 100)}%` : 'empty'}
                </span>
              </div>
            ))}
            {state.canvasZoom > 1 && (
              <div className={styles.row}>
                <span className={styles.label}>Canvas Zoom</span>
                <span className={styles.value}>{state.canvasZoom.toFixed(1)}x</span>
              </div>
            )}
          </div>

          <div className={styles.divider} />

          {/* --- Import/Export --- */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Import / Export Mix</div>
            <button
              className={styles.exportButton}
              onTouchEnd={handleExport}
              onClick={handleExport}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export Mix
            </button>
            <button
              className={styles.importButton}
              onTouchEnd={handleImportClick}
              onClick={handleImportClick}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Import Mix
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className={styles.hiddenInput}
              onChange={handleFileChange}
            />
            {statusMsg && <div className={styles.statusMessage}>{statusMsg}</div>}
          </div>

        </div>
      </div>
    </div>
  );
}
