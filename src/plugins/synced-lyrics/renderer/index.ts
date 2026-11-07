import { createRenderer } from '@/utils';
import { waitForElement } from '@/utils/wait-for-element';

import { disposeReactiveRoot } from './reactive-root';
import { setConfig, setCurrentTime } from './renderer';
import { fetchLyrics } from './store';
import { selectors, tabStates } from './utils';

import type { SyncedLyricsPluginConfig } from '../types';
import type { SongInfo } from '@/providers/song-info';
import type { RendererContext } from '@/types/contexts';
import type { MusicPlayer } from '@/types/music-player';

let playerApi: MusicPlayer | null = null;

export const getPlayerApi = (): MusicPlayer | null => playerApi;

export const seekPlayer = (seconds: number): void => {
  playerApi?.seekTo(seconds);
};

export type NetFetchFn = (
  url: string,
  init?: RequestInit,
) => Promise<[number, string, Record<string, string>]>;

let internalNetFetch: NetFetchFn = () => Promise.resolve([0, '', {}]);

export const netFetch: NetFetchFn = (url, init) => internalNetFetch(url, init);

export const renderer = createRenderer<
  {
    observerCallback: MutationCallback;
    observer?: MutationObserver;
    videoDataChange: () => Promise<void>;
    updateTimestampInterval?: NodeJS.Timeout | string | number;
  },
  SyncedLyricsPluginConfig
>({
  onConfigChange(newConfig) {
    setConfig(newConfig);
  },

  observerCallback(mutations: MutationRecord[]) {
    for (const mutation of mutations) {
      const header = mutation.target as HTMLElement;

      switch (mutation.attributeName) {
        case 'disabled':
          header.removeAttribute('disabled');
          break;
        case 'aria-selected':
          tabStates[header.ariaSelected ?? 'false']();
          break;
      }
    }
  },

  async onPlayerApiReady(api: MusicPlayer) {
    playerApi = api;

    api.addEventListener('videodatachange', this.videoDataChange);

    api.addEventListener('onVideoProgress', (seconds) => {
      setCurrentTime(seconds * 1000);
    });
    api.addEventListener('onStateChange', () => {
      setCurrentTime((playerApi?.getCurrentTime() ?? 0) * 1000);
    });

    await this.videoDataChange();
  },
  async videoDataChange() {
    setCurrentTime((playerApi?.getCurrentTime() ?? 0) * 1000);

    // prettier-ignore
    this.observer ??= new MutationObserver(this.observerCallback);
    this.observer.disconnect();

    // Force the lyrics tab to be enabled at all times.
    const header = await waitForElement<HTMLElement>(selectors.head);
    header.removeAttribute('disabled');
    tabStates[header.ariaSelected ?? 'false']();

    this.observer.observe(header, { attributes: true });
    header.removeAttribute('disabled');
  },

  async start(ctx: RendererContext<SyncedLyricsPluginConfig>) {
    document.documentElement.toggleAttribute(
      'data-lyrics-performance',
      Boolean(window.mainConfig.get('options.performanceMode')),
    );

    internalNetFetch = ctx.ipc.invoke.bind(ctx.ipc, 'synced-lyrics:fetch');

    setConfig(await ctx.getConfig());

    ctx.ipc.on('peard:update-song-info', (info: SongInfo) => {
      fetchLyrics(info);
    });
  },

  stop() {
    document.documentElement.removeAttribute('data-lyrics-performance');
    disposeReactiveRoot();
  },
});
