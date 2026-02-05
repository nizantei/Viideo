/**
 * Typography Context Provider
 * Loads typography.json and provides font/text hooks
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { TypographyConfig, FontSize, FontWeight } from './types';
import { validateTypographyConfig } from './validator';

interface TypographyContextValue {
  config: TypographyConfig | null;
  loading: boolean;
  error: Error | null;
}

const TypographyContext = createContext<TypographyContextValue | null>(null);

export function TypographyProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<TypographyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load typography.json
  useEffect(() => {
    async function loadTypography() {
      try {
        setLoading(true);
        const response = await fetch('/ui-config/typography.json');

        if (!response.ok) {
          throw new Error(`Failed to load typography.json: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        validateTypographyConfig(data);
        setConfig(data);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Failed to load typography config:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTypography();
  }, []);

  const value: TypographyContextValue = {
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
          <h1 style={{ color: '#ff4444', marginBottom: '20px' }}>Typography Config Error</h1>
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
        Loading typography...
      </div>
    );
  }

  return <TypographyContext.Provider value={value}>{children}</TypographyContext.Provider>;
}

function useTypographyContext(): TypographyContextValue {
  const context = useContext(TypographyContext);
  if (!context) {
    throw new Error('useTypographyContext must be used within a TypographyProvider');
  }
  return context;
}

/**
 * Get the full typography configuration
 */
export function useTypography(): TypographyConfig {
  const { config } = useTypographyContext();
  if (!config) {
    throw new Error('Typography config not loaded');
  }
  return config;
}

/**
 * Get font styles for a given size and optional weight
 */
export function useFont(
  size: keyof FontSize,
  weight?: keyof FontWeight
): React.CSSProperties {
  const config = useTypography();

  return {
    fontSize: `${config.fontSize[size]}px`,
    fontWeight: weight ? config.fontWeight[weight] : config.fontWeight.normal,
    fontFamily: config.fontFamily.primary,
  };
}

/**
 * Get just the font size
 */
export function useFontSize(size: keyof FontSize): number {
  const config = useTypography();
  return config.fontSize[size];
}

/**
 * Get just the font weight
 */
export function useFontWeight(weight: keyof FontWeight): number {
  const config = useTypography();
  return config.fontWeight[weight];
}

/**
 * Get line height
 */
export function useLineHeight(height: keyof TypographyConfig['lineHeight']): number {
  const config = useTypography();
  return config.lineHeight[height];
}

/**
 * Get letter spacing
 */
export function useLetterSpacing(spacing: keyof TypographyConfig['letterSpacing']): string {
  const config = useTypography();
  return config.letterSpacing[spacing];
}
