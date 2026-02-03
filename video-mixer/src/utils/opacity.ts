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
