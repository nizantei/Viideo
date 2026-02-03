import { useMixer } from '../context/MixerContext';
import { MiniVideo } from './MiniVideo';
import { getMiniGroup } from '../utils/opacity';
import { videos } from '../data/videos';

export function VideoMixer() {
  const { state } = useMixer();

  const getVideoUrl = (videoId: string | null) => {
    if (!videoId) return undefined;
    const video = videos.find(v => v.id === videoId);
    return video?.hlsUrl;
  };

  return (
    <div
      className="videoMixer"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        aspectRatio: '3 / 1',
        maxWidth: '100vw',
        maxHeight: '100vh',
        backgroundColor: '#000',
        overflow: 'hidden',
      }}
    >
      {state.minis.map((miniState, index) => {
        const miniIndex = index as 0 | 1 | 2 | 3;
        const group = getMiniGroup(miniIndex);
        const groupOpacity = state.groups[group].opacity;
        const videoUrl = getVideoUrl(miniState.videoId);

        return (
          <MiniVideo
            key={miniIndex}
            miniIndex={miniIndex}
            miniState={miniState}
            groupOpacity={groupOpacity}
            videoUrl={videoUrl}
          />
        );
      })}
    </div>
  );
}
