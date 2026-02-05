/**
 * Animation Context Provider
 * Loads animations.json and provides transition/transform hooks
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AnimationConfig, Transitions } from './types';
import { validateAnimationConfig } from './validator';

interface AnimationContextValue {
  config: AnimationConfig | null;
  loading: boolean;
  error: Error | null;
}

const AnimationContext = createContext<AnimationContextValue | null>(null);

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AnimationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load animations.json
  useEffect(() => {
    async function loadAnimations() {
      try {
        setLoading(true);
        const response = await fetch('/ui-config/animations.json');

        if (!response.ok) {
          throw new Error(`Failed to load animations.json: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        validateAnimationConfig(data);
        setConfig(data);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Failed to load animation config:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAnimations();
  }, []);

  const value: AnimationContextValue = {
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
          <h1 style={{ color: '#ff4444', marginBottom: '20px' }}>Animation Config Error</h1>
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
        Loading animations...
      </div>
    );
  }

  return <AnimationContext.Provider value={value}>{children}</AnimationContext.Provider>;
}

function useAnimationContext(): AnimationContextValue {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimationContext must be used within an AnimationProvider');
  }
  return context;
}

/**
 * Get the full animation configuration
 */
export function useAnimation(): AnimationConfig {
  const { config } = useAnimationContext();
  if (!config) {
    throw new Error('Animation config not loaded');
  }
  return config;
}

/**
 * Get a transition as a CSS transition string
 */
export function useTransition(name: keyof Transitions, properties: string[] = ['all']): string {
  const config = useAnimation();
  const transition = config.transitions[name];

  const transitionStrings = properties.map(
    (prop) => `${prop} ${transition.duration}ms ${transition.easing}`
  );

  return transitionStrings.join(', ');
}

/**
 * Get a transform value
 */
export function useTransform(name: keyof AnimationConfig['transforms']): string {
  const config = useAnimation();
  return config.transforms[name];
}

/**
 * Get gesture configuration
 */
export function useGestureConfig() {
  const config = useAnimation();
  return config.gestures;
}
