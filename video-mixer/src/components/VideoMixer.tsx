import { useState, useEffect } from 'react';
import { useMixer } from '../context/MixerContext';
import { MiniVideo } from './MiniVideo';
import { getMiniGroup } from '../utils/opacity';
import { getVideos } from '../data/videos';
import { Video } from '../types';

export function VideoMixer() {
  const { state } = useMixer();
  const [videosMap, setVideosMap] = useState<Map<string, Video>>(new Map());

  // Load all videos once and create a lookup map
  useEffect(() => {
    getVideos().then((videos) => {
      const map = new Map(videos.map(v => [v.id, v]));
      setVideosMap(map);
    });
  }, []);

  const getVideoUrl = (videoId: string | null) => {
    if (!videoId) return undefined;
    const video = videosMap.get(videoId);
    return video?.hlsUrl;
  };

  return (
    <div
      className="videoMixer"
      style={{
        position: 'relative',
        aspectRatio: '3 / 1',
        width: '100vw',
        maxWidth: 'calc(100vh * 3)',
        height: 'auto',
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
