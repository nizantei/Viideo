/**
 * Unified UI Config Provider
 * Composes all config systems into a single provider
 */

import React from 'react';
import { LayoutProvider } from './layout';
import { ThemeProvider } from './theme';
import { TypographyProvider } from './typography';
import { AnimationProvider } from './animations';
import { SpacingProvider } from './spacing';
import { ZoomProvider } from './zoom';
import { BlendConfigProvider } from './blendConfig';
import { PanelsProvider } from './panels';

/**
 * UIConfigProvider wraps all config systems
 * Use this at the root of your app to enable config-driven UI
 */
export function UIConfigProvider({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <ThemeProvider>
        <TypographyProvider>
          <AnimationProvider>
            <SpacingProvider>
              <ZoomProvider>
                <BlendConfigProvider>
                  <PanelsProvider>
                    {children}
                  </PanelsProvider>
                </BlendConfigProvider>
              </ZoomProvider>
            </SpacingProvider>
          </AnimationProvider>
        </TypographyProvider>
      </ThemeProvider>
    </LayoutProvider>
  );
}

// Re-export all systems
export * from './layout';
export * from './theme';
export * from './typography';
export * from './animations';
export * from './spacing';
export * from './zoom';
export * from './blendConfig';
export * from './panels';
