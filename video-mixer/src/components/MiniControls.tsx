import { useMixer } from '../context/MixerContext';
import { MiniButton } from './MiniButton';
import { MiniFader } from './MiniFader';
import { Crossfader } from './Crossfader';

export function MiniControls() {
  const { state } = useMixer();

  // Hide all controls in full-screen mode
  if (state.isFullScreenMode) {
    return null;
  }

  return (
    <>
      {/* All elements position themselves from layout.json */}
      <MiniButton miniIndex={0} />
      <MiniButton miniIndex={1} />
      <MiniButton miniIndex={2} />
      <MiniButton miniIndex={3} />
      <MiniFader miniIndex={0} />
      <MiniFader miniIndex={1} />
      <MiniFader miniIndex={2} />
      <MiniFader miniIndex={3} />
      <Crossfader />
    </>
  );
}
