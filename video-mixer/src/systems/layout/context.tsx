/**
 * Layout Context Provider
 * Loads layout.json, tracks viewport dimensions, provides hooks
 */

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { LayoutConfig, LayoutElement, ViewportDimensions, PixelRect } from './types';
import { validateLayoutConfig } from './validator';
import {
  calculateSafeAreaPixels,
  calculateElementStyle,
  calculateElementRect,
  calculateHitSlopPixels,
} from './converter';

interface LayoutContextValue {
  config: LayoutConfig | null;
  viewport: ViewportDimensions;
  loading: boolean;
  error: Error | null;
  getElement: (id: string) => LayoutElement | undefined;
  getElementStyle: (id: string) => React.CSSProperties;
  getElementRect: (id: string) => PixelRect | undefined;
  getElementHitSlop: (id: string) => { top: number; right: number; bottom: number; left: number } | undefined;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<LayoutConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [viewport, setViewport] = useState<ViewportDimensions>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Load layout.json
  useEffect(() => {
    async function loadLayout() {
      try {
        setLoading(true);
        const response = await fetch('/ui-config/layout.json');

        if (!response.ok) {
          throw new Error(`Failed to load layout.json: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        validateLayoutConfig(data);
        setConfig(data);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Failed to load layout config:', error);
      } finally {
        setLoading(false);
      }
    }

    loadLayout();
  }, []);

  // Track viewport resize
  useEffect(() => {
    function handleResize() {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate safe area pixels (memoized)
  const safeAreaPx = useMemo(() => {
    if (!config) return undefined;
    return calculateSafeAreaPixels(config.safeArea, viewport);
  }, [config, viewport]);

  // Get element by ID
  const getElement = useCallback(
    (id: string): LayoutElement | undefined => {
      return config?.elements.find((el) => el.id === id);
    },
    [config]
  );

  // Get element style
  const getElementStyle = useCallback(
    (id: string): React.CSSProperties => {
      const element = getElement(id);
      if (!element) {
        console.warn(`Layout element not found: "${id}"`);
        return { display: 'none' };
      }

      return calculateElementStyle(element, viewport, safeAreaPx);
    },
    [getElement, viewport, safeAreaPx]
  );

  // Get element rect
  const getElementRect = useCallback(
    (id: string): PixelRect | undefined => {
      const element = getElement(id);
      if (!element) {
        return undefined;
      }

      return calculateElementRect(element, viewport, safeAreaPx);
    },
    [getElement, viewport, safeAreaPx]
  );

  // Get element hit slop
  const getElementHitSlop = useCallback(
    (id: string): { top: number; right: number; bottom: number; left: number } | undefined => {
      const element = getElement(id);
      if (!element) {
        return undefined;
      }

      return calculateHitSlopPixels(element, viewport);
    },
    [getElement, viewport]
  );

  const value: LayoutContextValue = {
    config,
    viewport,
    loading,
    error,
    getElement,
    getElementStyle,
    getElementRect,
    getElementHitSlop,
  };

  // Show error message if config failed to load
  if (error) {
    return (
      <div style={{
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
      }}>
        <div>
          <h1 style={{ color: '#ff4444', marginBottom: '20px' }}>Layout Config Error</h1>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{error.message}</pre>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div style={{
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
      }}>
        Loading layout...
      </div>
    );
  }

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout(): LayoutContextValue {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}

export function useLayoutElement(id: string): {
  element: LayoutElement | undefined;
  style: React.CSSProperties;
  rect: PixelRect | undefined;
  hitSlop: { top: number; right: number; bottom: number; left: number } | undefined;
} {
  const { getElement, getElementStyle, getElementRect, getElementHitSlop } = useLayout();

  return useMemo(
    () => ({
      element: getElement(id),
      style: getElementStyle(id),
      rect: getElementRect(id),
      hitSlop: getElementHitSlop(id),
    }),
    [id, getElement, getElementStyle, getElementRect, getElementHitSlop]
  );
}
