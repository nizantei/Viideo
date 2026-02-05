/**
 * Theme Context Provider
 * Loads theme.json and provides color/gradient/effect hooks
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { ThemeConfig, ColorPalette, BorderRadius, Opacity } from './types';
import { validateThemeConfig } from './validator';

interface ThemeContextValue {
  config: ThemeConfig | null;
  loading: boolean;
  error: Error | null;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ThemeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load theme.json
  useEffect(() => {
    async function loadTheme() {
      try {
        setLoading(true);
        const response = await fetch('/ui-config/theme.json');

        if (!response.ok) {
          throw new Error(`Failed to load theme.json: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        validateThemeConfig(data);
        setConfig(data);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Failed to load theme config:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTheme();
  }, []);

  const value: ThemeContextValue = {
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
          <h1 style={{ color: '#ff4444', marginBottom: '20px' }}>Theme Config Error</h1>
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
        Loading theme...
      </div>
    );
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Get the full theme configuration
 */
export function useTheme(): ThemeConfig {
  const { config } = useThemeContext();
  if (!config) {
    throw new Error('Theme config not loaded');
  }
  return config;
}

/**
 * Get a specific color from the palette
 */
export function useColor(name: keyof ColorPalette): string {
  const theme = useTheme();
  return theme.colors[name];
}

/**
 * Get all colors as an object
 */
export function useColors(): ColorPalette {
  const theme = useTheme();
  return theme.colors;
}

/**
 * Get a gradient as a CSS string
 */
export function useGradient(name: string): string {
  const theme = useTheme();
  const gradient = theme.gradients[name];

  if (!gradient) {
    console.warn(`Gradient "${name}" not found in theme config`);
    return 'transparent';
  }

  return useMemo(() => {
    if (gradient.type === 'linear') {
      const angle = gradient.angle ?? 0;
      const stops = gradient.stops.map((stop) => `${stop.color} ${stop.position}%`).join(', ');
      return `linear-gradient(${angle}deg, ${stops})`;
    } else {
      const stops = gradient.stops.map((stop) => `${stop.color} ${stop.position}%`).join(', ');
      return `radial-gradient(${stops})`;
    }
  }, [gradient]);
}

/**
 * Get a border radius value
 */
export function useBorderRadius(size: keyof BorderRadius): string | number {
  const theme = useTheme();
  return theme.effects.borderRadius[size];
}

/**
 * Get a blur value
 */
export function useBlur(size: 'small' | 'medium'): number {
  const theme = useTheme();
  return theme.effects.blur[size];
}

/**
 * Get a shadow value
 */
export function useShadow(name: 'button'): string {
  const theme = useTheme();
  return theme.effects.shadow[name];
}

/**
 * Get an opacity value
 */
export function useOpacity(name: keyof Opacity): number {
  const theme = useTheme();
  return theme.effects.opacity[name];
}

/**
 * Get a border width value
 */
export function useBorder(size: 'thin' | 'normal' | 'thick'): number {
  const theme = useTheme();
  return theme.borders[size];
}
