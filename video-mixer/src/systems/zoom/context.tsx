import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ZoomConfig } from './types';
import { validateZoomConfig } from './validator';

interface ZoomContextValue {
  config: ZoomConfig | null;
  loading: boolean;
  error: Error | null;
}

const defaultConfig: ZoomConfig = {
  canvas: { minZoom: 1.0, maxZoom: 3.0, speed: 1.0 },
  video: { minZoom: 1.0, maxZoom: 5.0, speed: 1.0 },
};

const ZoomContext = createContext<ZoomContextValue | null>(null);

export function ZoomProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ZoomConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadZoom() {
      try {
        setLoading(true);
        const response = await fetch('/ui-config/zoom.json');

        if (!response.ok) {
          // Use defaults if file not found
          setConfig(defaultConfig);
          setError(null);
          return;
        }

        const data = await response.json();
        validateZoomConfig(data);
        setConfig(data);
        setError(null);
      } catch (err) {
        // Fall back to defaults on error
        console.warn('Failed to load zoom config, using defaults:', err);
        setConfig(defaultConfig);
        setError(null);
      } finally {
        setLoading(false);
      }
    }

    loadZoom();
  }, []);

  const value: ZoomContextValue = { config, loading, error };

  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#000', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'sans-serif',
      }}>
        Loading zoom...
      </div>
    );
  }

  return <ZoomContext.Provider value={value}>{children}</ZoomContext.Provider>;
}

function useZoomContext(): ZoomContextValue {
  const context = useContext(ZoomContext);
  if (!context) {
    throw new Error('useZoomContext must be used within a ZoomProvider');
  }
  return context;
}

export function useZoomConfig(): ZoomConfig {
  const { config } = useZoomContext();
  return config ?? defaultConfig;
}
