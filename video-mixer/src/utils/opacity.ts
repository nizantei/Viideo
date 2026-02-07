import { MiniState, GroupState, MiniIndex } from '../types';

export function calculateFinalOpacity(
  miniState: MiniState,
  groupState: GroupState
): number {
  return miniState.opacity * groupState.opacity;
}

export function calculateGroupOpacity(
  crossfader: number,
  group: 'left' | 'right'
): number {
  return group === 'left' ? 1 - crossfader : crossfader;
}

export function getMiniGroup(miniIndex: MiniIndex): 'left' | 'right' {
  return miniIndex < 2 ? 'left' : 'right';
}

export function getMiniZIndex(miniIndex: MiniIndex): number {
  return miniIndex + 1;
}

/**
 * Calculate the max effective opacity of any loaded layer below the target index.
 * Used to determine if blend modes would be blending against black.
 */
export function calculateBelowContentAlpha(
  minis: readonly MiniState[],
  targetIndex: number,
  groups: { left: GroupState; right: GroupState }
): number {
  let maxAlpha = 0;
  for (let i = 0; i < targetIndex; i++) {
    const mini = minis[i];
    if (mini.videoId !== null && !mini.isLoading) {
      const group = getMiniGroup(i as MiniIndex);
      const finalOpacity = calculateFinalOpacity(mini, groups[group]);
      if (finalOpacity > maxAlpha) {
        maxAlpha = finalOpacity;
      }
    }
  }
  return maxAlpha;
}
