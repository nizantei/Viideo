import { MiniButton } from './MiniButton';
import { MiniFader } from './MiniFader';

export function MiniControls() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '20px',
        gap: '40px',
      }}
    >
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <MiniButton miniIndex={0} />
          <MiniFader miniIndex={0} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <MiniButton miniIndex={1} />
          <MiniFader miniIndex={1} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <MiniButton miniIndex={2} />
          <MiniFader miniIndex={2} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <MiniButton miniIndex={3} />
          <MiniFader miniIndex={3} />
        </div>
      </div>
    </div>
  );
}
