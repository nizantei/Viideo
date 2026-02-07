import React, { createContext, useContext, useEffect, useState } from 'react';
import type { PanelsConfig } from './types';

const defaultConfig: PanelsConfig = {
  library: {
    folderPanelWidthPercent: 18,
    videoPanelWidthPercent: 22,
  },
  blendModeSelector: {
    panelWidthPercent: 20,
  },
  panelBackground: 'rgba(0, 0, 0, 0.85)',
};

const PanelsConfigContext = createContext<PanelsConfig | null>(null);

export function PanelsProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<PanelsConfig>(defaultConfig);

  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch('/ui-config/panels.json');
        if (!response.ok) return;
        const data = await response.json();
        setConfig({
          library: { ...defaultConfig.library, ...data.library },
          blendModeSelector: { ...defaultConfig.blendModeSelector, ...data.blendModeSelector },
          panelBackground: data.panelBackground ?? defaultConfig.panelBackground,
        });
      } catch {
        console.warn('Failed to load panels.json, using defaults');
      }
    }
    loadConfig();
  }, []);

  return (
    <PanelsConfigContext.Provider value={config}>
      {children}
    </PanelsConfigContext.Provider>
  );
}

export function usePanelsConfig(): PanelsConfig {
  const context = useContext(PanelsConfigContext);
  return context ?? defaultConfig;
}
