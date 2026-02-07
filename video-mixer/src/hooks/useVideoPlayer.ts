import { useRef, useEffect, useCallback, useState } from 'react';
import Hls from 'hls.js';
import { CachingLoader } from '../services/hls/CachingLoader';

interface UseVideoPlayerOptions {
  hlsUrl: string | null;
  muted?: boolean;
  loop?: boolean;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

export function useVideoPlayer({
  hlsUrl,
  onReady,
  onError,
}: UseVideoPlayerOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Create video element once
  useEffect(() => {
    const video = document.createElement('video');
    video.muted = true; // Always muted for autoplay
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('playsinline', ''); // iOS Safari
    video.setAttribute('webkit-playsinline', ''); // Older iOS
    video.crossOrigin = 'anonymous';
    video.preload = 'auto';
    video.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
    document.body.appendChild(video);
    videoRef.current = video;

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.pause();
      video.src = '';
      video.load();
      video.remove();
      videoRef.current = null;
    };
  }, []);

  // Load HLS stream when URL changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset state
    setIsReady(false);
    setIsPlaying(false);

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (!hlsUrl) {
      video.src = '';
      return;
    }

    console.log('Loading video:', hlsUrl);

    const handleCanPlay = () => {
      console.log('Video can play:', hlsUrl);
      setIsReady(true);
      onReady?.();
    };

    const handlePlaying = () => {
      console.log('Video playing:', hlsUrl);
      setIsPlaying(true);
    };

    const handleError = (e: Event) => {
      console.error('Video error:', e);
      onError?.(new Error('Video playback error'));
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);

    // Check for native HLS support (Safari/iOS)
    const canPlayHLS = video.canPlayType('application/vnd.apple.mpegurl');

    if (canPlayHLS) {
      // Use native HLS (Safari, iOS)
      console.log('Using native HLS');
      video.src = hlsUrl;
      video.load();
    } else if (Hls.isSupported()) {
      // Use hls.js
      console.log('Using hls.js');
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 600,
        maxMaxBufferLength: 600,
        fLoader: CachingLoader as any,
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed');
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        console.error('HLS error:', data);
        if (data.fatal) {
          onError?.(new Error(`HLS error: ${data.type}`));
        }
      });

      hlsRef.current = hls;
    } else {
      console.error('HLS not supported');
      onError?.(new Error('HLS not supported'));
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleError);
    };
  }, [hlsUrl]);

  const play = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    console.log('Attempting to play video');
    video.muted = true; // Ensure muted for autoplay policy

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Video play successful');
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error('Play failed:', err);
          // Try playing muted
          video.muted = true;
          video.play().catch(e => console.error('Muted play also failed:', e));
        });
    }
  }, []);

  const pause = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const getVideoElement = useCallback(() => {
    return videoRef.current;
  }, []);

  return {
    videoRef,
    isReady,
    isPlaying,
    play,
    pause,
    getVideoElement,
  };
}
