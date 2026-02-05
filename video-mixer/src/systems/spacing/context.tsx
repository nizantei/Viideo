/**
 * Spacing Context Provider
 * Loads spacing.json and provides spacing scale hooks
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { SpacingConfig, SpacingScale } from './types';
import { validateSpacingConfig } from './validator';

interface SpacingContextValue {
  config: SpacingConfig | null;
  loading: boolean;
  error: Error | null;
}

const SpacingContext = createContext<SpacingContextValue | null>(null);

export function SpacingProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SpacingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load spacing.json
  useEffect(() => {
    async function loadSpacing() {
      try {
        setLoading(true);
        const response = await fetch('/ui-config/spacing.json');

        if (!response.ok) {
          throw new Error(`Failed to load spacing.json: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        validateSpacingConfig(data);
        setConfig(data);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Failed to load spacing config:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSpacing();
  }, []);

  const value: SpacingContextValue = {
    config,
    loading,
    error,
  };

  // Show error message if config failed to load
  if (error) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: 'monospace',
          fontSize: '14px',
          zIndex: 9999,
        }}
      >
        <div>
          <h1 style={{ color: '#ff4444', marginBottom: '20px' }}>Spacing Config Error</h1>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{error.message}</pre>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#000',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        Loading spacing...
      </div>
    );
  }

  return <SpacingContext.Provider value={value}>{children}</SpacingContext.Provider>;
}

function useSpacingContext(): SpacingContextValue {
  const context = useContext(SpacingContext);
  if (!context) {
    throw new Error('useSpacingContext must be used within a SpacingProvider');
  }
  return context;
}

/**
 * Get the full spacing configuration
 */
export function useSpacing(): SpacingConfig {
  const { config } = useSpacingContext();
  if (!config) {
    throw new Error('Spacing config not loaded');
  }
  return config;
}

/**
 * Get a spacing value from the scale
 */
export function useSpace(size: keyof SpacingScale): number {
  const config = useSpacing();
  return config.scale[size];
}
