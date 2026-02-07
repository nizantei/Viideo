import React, { createContext, useContext, useEffect, useState } from 'react';
import type { BlendModesConfig } from './types';

interface BlendConfigContextValue {
  config: BlendModesConfig;
}

const defaultConfig: BlendModesConfig = {
  protection: {
    enabled: true,
    minBlendStrength: 0.85,
    rampPower: 0.4,
    darkSensitiveModes: ['MULTIPLY', 'COLOR_BURN', 'HARD_MIX', 'OVERLAY', 'SOFT_LIGHT'],
  },
  modes: {},
};

const BlendConfigContext = createContext<BlendConfigContextValue | null>(null);

export function BlendConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<BlendModesConfig>(defaultConfig);

  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch('/ui-config/blend-modes.json');
        if (!response.ok) return;
        const data = await response.json();
        // Merge with defaults
        setConfig({
          protection: { ...defaultConfig.protection, ...data.protection },
          modes: { ...defaultConfig.modes, ...data.modes },
        });
      } catch {
        console.warn('Failed to load blend-modes.json, using defaults');
      }
    }
    loadConfig();
  }, []);

  return (
    <BlendConfigContext.Provider value={{ config }}>
      {children}
    </BlendConfigContext.Provider>
  );
}

export function useBlendConfig(): BlendModesConfig {
  const context = useContext(BlendConfigContext);
  if (!context) {
    return defaultConfig;
  }
  return context.config;
}
