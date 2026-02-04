import { MiniButton } from './MiniButton';
import { MiniFader } from './MiniFader';
import { Crossfader } from './Crossfader';

export function MiniControls() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: '20px',
        pointerEvents: 'none',
      }}
    >
      {/* Left group - positioned at left edge */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', pointerEvents: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '8px', alignItems: 'center' }}>
          <MiniButton miniIndex={0} />
          <MiniFader miniIndex={0} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '8px', alignItems: 'center' }}>
          <MiniButton miniIndex={1} />
          <MiniFader miniIndex={1} />
        </div>
      </div>

      {/* Crossfader in the middle */}
      <div style={{ pointerEvents: 'auto', marginBottom: '10px', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
        <Crossfader />
      </div>

      {/* Right group - positioned at right edge */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', pointerEvents: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '8px', alignItems: 'center' }}>
          <MiniButton miniIndex={2} />
          <MiniFader miniIndex={2} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '8px', alignItems: 'center' }}>
          <MiniButton miniIndex={3} />
          <MiniFader miniIndex={3} />
        </div>
      </div>
    </div>
  );
}
