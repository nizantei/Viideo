import Hls from 'hls.js';
import type {
  LoaderContext,
  LoaderConfiguration,
  LoaderCallbacks,
  LoaderStats,
  Loader,
} from 'hls.js';

const CACHE_NAME = 'video-mixer-segments';

function createStats(): LoaderStats {
  return {
    aborted: false,
    loaded: 0,
    retry: 0,
    total: 0,
    chunkCount: 0,
    bwEstimate: 0,
    loading: { start: 0, first: 0, end: 0 },
    parsing: { start: 0, end: 0 },
    buffering: { start: 0, first: 0, end: 0 },
  };
}

/**
 * Custom hls.js fragment loader that caches segments via the Cache API.
 * On first load, delegates to XHR, intercepts the response, and stores it.
 * On subsequent loads, serves directly from cache.
 */
export class CachingLoader implements Loader<LoaderContext> {
  context: LoaderContext | null = null;
  stats: LoaderStats = createStats();
  private innerLoader: Loader<LoaderContext> | null = null;
  private aborted = false;

  constructor(config: any) {
    // Create an instance of the default loader
    const DefaultLoader = (Hls.DefaultConfig.loader as any);
    this.innerLoader = new DefaultLoader(config);
  }

  destroy(): void {
    this.innerLoader?.destroy();
    this.innerLoader = null;
  }

  abort(): void {
    this.aborted = true;
    this.innerLoader?.abort();
  }

  load(
    context: LoaderContext,
    config: LoaderConfiguration,
    callbacks: LoaderCallbacks<LoaderContext>,
  ): void {
    this.context = context;
    this.stats = createStats();
    this.stats.loading.start = performance.now();

    // Only cache segment data (arraybuffer responses), not manifests
    if (context.responseType !== 'arraybuffer') {
      this.innerLoader?.load(context, config, callbacks);
      return;
    }

    this.loadWithCache(context, config, callbacks);
  }

  private async loadWithCache(
    context: LoaderContext,
    config: LoaderConfiguration,
    callbacks: LoaderCallbacks<LoaderContext>,
  ): Promise<void> {
    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(context.url);

      if (cachedResponse && !this.aborted) {
        // Serve from cache
        const data = await cachedResponse.arrayBuffer();
        this.stats.loaded = data.byteLength;
        this.stats.total = data.byteLength;
        this.stats.loading.first = performance.now();
        this.stats.loading.end = performance.now();

        callbacks.onSuccess(
          { url: context.url, data },
          this.stats,
          context,
          null,
        );
        return;
      }
    } catch {
      // Cache API not available, fall through to network
    }

    if (this.aborted) return;

    // Load via default loader, intercept success to cache the response
    const originalOnSuccess = callbacks.onSuccess;
    this.innerLoader?.load(context, config, {
      ...callbacks,
      onSuccess: (response, stats, ctx, networkDetails) => {
        // Cache the response asynchronously
        if (response.data instanceof ArrayBuffer) {
          caches.open(CACHE_NAME).then((cache) => {
            const cacheResponse = new Response(response.data as ArrayBuffer, {
              headers: { 'Content-Type': 'video/mp2t' },
            });
            cache.put(ctx.url, cacheResponse).catch(() => {});
          }).catch(() => {});
        }

        this.stats = stats;
        originalOnSuccess(response, stats, ctx, networkDetails);
      },
    });
  }
}
