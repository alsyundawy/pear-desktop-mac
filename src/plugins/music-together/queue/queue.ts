import { getMusicQueueRenderer } from './song';
import { mapQueueItem } from './utils';

import { t } from '@/i18n';

import { getDefaultProfile, type Profile, type VideoData } from '../types';

import type { ConnectionEventUnion } from '@/plugins/music-together/connection';
import type { QueueItem } from '@/types/datahost-get-state';
import type { QueueElement, Store } from '@/types/queue';

const getHeaderPayload = (() => {
  let payload: {
    items?: QueueItem[];
    title: {
      runs: {
        text: string;
      }[];
    };
    subtitle: {
      runs: {
        text: string;
      }[];
    };
    buttons: {
      chipCloudChipRenderer: {
        style: {
          styleType: string;
        };
        text: {
          runs: {
            text: string;
          }[];
        };
        navigationEndpoint: {
          saveQueueToPlaylistCommand: unknown;
        };
        icon: {
          iconType: string;
        };
        accessibilityData: {
          accessibilityData: {
            label: string;
          };
        };
        isSelected: boolean;
        uniqueId: string;
      };
    }[];
  } | null = null;

  return () => {
    payload ??= {
        title: {
          runs: [
            {
              text: t('plugins.music-together.internal.track-source'),
            },
          ],
        },
        subtitle: {
          runs: [
            {
              text: t('plugins.music-together.name'),
            },
          ],
        },
        buttons: [
          {
            chipCloudChipRenderer: {
              style: {
                styleType: 'STYLE_TRANSPARENT',
              },
              text: {
                runs: [
                  {
                    text: t('plugins.music-together.internal.save'),
                  },
                ],
              },
              navigationEndpoint: {
                saveQueueToPlaylistCommand: {},
              },
              icon: {
                iconType: 'ADD_TO_PLAYLIST',
              },
              accessibilityData: {
                accessibilityData: {
                  label: t('plugins.music-together.internal.save'),
                },
              },
              isSelected: false,
              uniqueId: t('plugins.music-together.internal.save'),
            },
          },
        ],
      };

    return payload;
  };
})();

export type QueueOptions = {
  videoList?: VideoData[];
  owner?: Profile;
  queue?: QueueElement;
  getProfile: (id: string) => Profile | undefined;
};
export type QueueEventListener = (event: ConnectionEventUnion) => void;

export class Queue {
  private readonly queue: QueueElement;

  private originalDispatch?: (obj: {
    type: string;
    payload?: { items?: QueueItem[] };
  }) => void;

  private internalDispatch = false;
  private ignoreFlag = false;
  private listeners: QueueEventListener[] = [];

  private owner: Profile | null;
  private readonly getProfile: (id: string) => Profile | undefined;

  constructor(options: QueueOptions) {
    this.getProfile = options.getProfile;
    this.queue =
      options.queue ?? document.querySelector<QueueElement>('#queue')!;
    this.owner = options.owner ?? null;
    this._videoList = options.videoList ?? [];
  }

  private _videoList: VideoData[] = [];

  /* utils */
  get videoList() {
    return this._videoList;
  }

  get selectedIndex() {
    return (
      mapQueueItem(
        (it) => it?.selected,
        this.queue.queue.store.store.getState().queue.items,
      ).findIndex(Boolean) ?? 0
    );
  }

  get rawItems() {
    return this.queue?.queue.store.store.getState().queue.items;
  }

  get flatItems() {
    return mapQueueItem((it) => it, this.rawItems);
  }

  setOwner(owner: Profile) {
    this.owner = owner;
  }

  /* public */
  async setVideoList(videoList: VideoData[], sync = true) {
    this._videoList = videoList;

    if (sync) await this.syncVideo();
  }

  async addVideos(videos: VideoData[], index?: number) {
    const response = await getMusicQueueRenderer(
      videos.map((it) => it.videoId),
    );
    if (!response) return false;

    const items = response.queueDatas.map((it) => it?.content).filter(Boolean);
    if (!items) return false;

    this.internalDispatch = true;
    this._videoList = this._videoList.map(
      (it) =>
        ({
          videoId: it.videoId,
          ownerId: it.ownerId ?? this.owner!.id,
        }) satisfies VideoData,
    );

    const state = this.queue.queue.store.store.getState();

    this.queue?.dispatch({
      type: 'ADD_ITEMS',
      payload: {
        nextQueueItemId: state.queue.nextQueueItemId,
        index:
          index ??
          (state.queue.items.length ? state.queue.items.length - 1 : null) ??
          0,
        items,
        shuffleEnabled: false,
        shouldAssignIds: true,
      },
    });

    const insertedItem = this._videoList[index ?? this._videoList.length];
    if (
      !insertedItem ||
      (insertedItem.videoId !== videos[0].videoId &&
        insertedItem.ownerId !== videos[0].ownerId)
    ) {
      this._videoList.splice(
        index ?? this._videoList.length,
        0,
        ...videos.map((it) => ({
          ...it,
          ownerId: it.ownerId ?? this.owner?.id,
        })),
      );
    }

    this.internalDispatch = false;
    setTimeout(() => {
      this.initQueue();
      this.syncQueueOwner();
    }, 0);

    return true;
  }

  removeVideo(index: number) {
    this.internalDispatch = true;
    this._videoList.splice(index, 1);
    this.queue?.dispatch({
      type: 'REMOVE_ITEM',
      payload: index,
    });
    this.internalDispatch = false;
    setTimeout(() => {
      this.initQueue();
      this.syncQueueOwner();
    }, 0);
  }

  setIndex(index: number) {
    this.internalDispatch = true;
    this.queue?.dispatch({
      type: 'SET_INDEX',
      payload: index,
    });
    this.internalDispatch = false;
  }

  moveItem(fromIndex: number, toIndex: number) {
    this.internalDispatch = true;
    const data = this._videoList.splice(fromIndex, 1)[0];
    this._videoList.splice(toIndex, 0, data);
    this.queue?.dispatch({
      type: 'MOVE_ITEM',
      payload: {
        fromIndex,
        toIndex,
      },
    });
    this.internalDispatch = false;
    setTimeout(() => {
      this.initQueue();
      this.syncQueueOwner();
    }, 0);
  }

  clear() {
    this.internalDispatch = true;
    this._videoList = [];
    this.queue?.dispatch({
      type: 'CLEAR',
    });
    this.internalDispatch = false;
  }

  on(listener: QueueEventListener) {
    if (!this.listeners.includes(listener)) {
      this.listeners.push(listener);
    }
  }

  off(listener: QueueEventListener) {
    this.listeners = this.listeners.filter((it) => it !== listener);
  }

  rollbackInjection() {
    if (!this.queue) {
      console.error('Queue is not initialized!');
      return;
    }

    if (this.originalDispatch)
      this.queue.queue.store.store.dispatch = this
        .originalDispatch as Store['dispatch'];
  }

  private handleClearEvent() {
    this.ignoreFlag = true;
    this.broadcast({
      type: 'CLEAR_QUEUE',
      payload: null,
    });
  }

  private handleAddItemsEvent(event: { type: string; payload?: unknown }) {
    if (!this.owner) return;
    const items = (event.payload as { items?: QueueItem[] } | undefined)?.items;
    if (!items) return;

    if (this.ignoreFlag) {
      this.ignoreFlag = false;
      const videoList = mapQueueItem<VideoData>(
        (it) => ({
          videoId: it!.videoId,
          ownerId: this.owner!.id,
        }),
        items,
      );
      const index = this._videoList.length;

      if (videoList.length > 0) {
        this._videoList = videoList.map((it) => ({
          ...it,
          ownerId: it.ownerId ?? this.owner?.id,
        }));
        this.broadcast({
          type: 'ADD_SONGS',
          payload: {
            videoList,
          },
          after: [
            {
              type: 'SET_INDEX',
              payload: {
                index,
              },
            },
          ],
        });
      }
    } else if (items.length === 1) {
      const videoList = mapQueueItem<VideoData>(
        (it) => ({
          videoId: it!.videoId,
          ownerId: this.owner!.id,
        }),
        items,
      );
      const hasIndex = Boolean(
        event.payload && Object.hasOwn(event.payload, 'index'),
      );
      const targetIndex = hasIndex
        ? (event.payload as { index: number }).index
        : this._videoList.length;

      this._videoList.splice(
        targetIndex,
        0,
        ...videoList.map((it) => ({
          ...it,
          ownerId: it.ownerId ?? this.owner?.id,
        })),
      );
      this.broadcast({
        type: 'ADD_SONGS',
        payload: {
          index: hasIndex
            ? (event.payload as { index: number }).index
            : undefined,
          videoList,
        },
      });
    }
  }

  private handleCustomEvent(event: {
    type: string;
    payload?: unknown;
  }): boolean {
    if (event.type === 'CLEAR') {
      this.handleClearEvent();
      return true;
    }
    if (event.type === 'ADD_ITEMS') {
      this.handleAddItemsEvent(event);
      return true;
    }
    if (event.type === 'MOVE_ITEM') {
      const movePayload = event.payload as {
        fromIndex: number;
        toIndex: number;
      };
      this.broadcast({
        type: 'MOVE_SONG',
        payload: {
          fromIndex: movePayload.fromIndex,
          toIndex: movePayload.toIndex,
        },
      });
      return true;
    }
    if (event.type === 'REMOVE_ITEM') {
      this.broadcast({
        type: 'REMOVE_SONG',
        payload: {
          index: event.payload as number,
        },
      });
      return true;
    }
    if (event.type === 'SET_INDEX') {
      this.broadcast({
        type: 'SYNC_PROGRESS',
        payload: {
          index: event.payload as number,
        },
      });
      return true;
    }

    if (event.type === 'SET_HEADER') event.payload = getHeaderPayload();
    if (event.type === 'ADD_STEERING_CHIPS') {
      event.type = 'CLEAR_STEERING_CHIPS';
      event.payload = undefined;
    }
    if (
      event.type === 'SET_PLAYER_UI_STATE' &&
      (event.payload as string) === 'INACTIVE' &&
      this.videoList.length > 0
    ) {
      return true;
    }
    return (
      event.type === 'HAS_SHOWN_AUTOPLAY' || event.type === 'ADD_AUTOMIX_ITEMS'
    );
  }

  injection() {
    if (!this.queue) {
      console.error('Queue is not initialized!');
      return;
    }

    this.originalDispatch = this.queue.queue.store.store.dispatch;
    this.queue.queue.store.store.dispatch = (event) => {
      if (!this.queue || !this.owner) {
        console.error('Queue is not initialized!');
        return;
      }

      if (!this.internalDispatch && this.handleCustomEvent(event)) {
        return;
      }

      const fakeContext = {
        ...this.queue,
        queue: {
          ...this.queue.queue,
          store: {
            ...this.queue.queue.store,
            dispatch: this.originalDispatch,
          },
        },
      };
      this.originalDispatch?.call(
        fakeContext,
        event as {
          type: string;
          payload?: { items?: QueueItem[] };
        },
      );
    };
  }

  /* sync */
  initQueue() {
    if (!this.queue) return;

    this.internalDispatch = true;
    this.queue.dispatch({
      type: 'HAS_SHOWN_AUTOPLAY',
      payload: false,
    });
    this.queue.dispatch({
      type: 'SET_HEADER',
      payload: getHeaderPayload(),
    });
    this.queue.dispatch({
      type: 'CLEAR_STEERING_CHIPS',
    });
    this.internalDispatch = false;
  }

  async syncVideo() {
    const response = await getMusicQueueRenderer(
      this._videoList.map((it) => it.videoId),
    );
    if (!response) return false;

    const items = response.queueDatas.map((it) => it.content);

    this.internalDispatch = true;
    this.queue?.dispatch({
      type: 'UPDATE_ITEMS',
      payload: {
        items: items,
        nextQueueItemId:
          this.queue.queue.store.store.getState().queue.nextQueueItemId,
        shouldAssignIds: true,
        currentIndex: -1,
      },
    });
    this.internalDispatch = false;
    setTimeout(() => {
      this.initQueue();
      this.syncQueueOwner();
    }, 0);

    return true;
  }

  syncQueueOwner() {
    const allQueue = document.querySelectorAll('#queue');

    allQueue.forEach((queue) => {
      const list = Array.from(
        queue?.querySelectorAll<HTMLElement>(
          '#contents > ytmusic-player-queue-item,#contents > ytmusic-playlist-panel-video-wrapper-renderer > #primary-renderer > ytmusic-player-queue-item',
        ) ?? [],
      );

      list.forEach((item, index: number | undefined) => {
        if (typeof index !== 'number') return;

        const id = this._videoList[index]?.ownerId;
        let data = this.getProfile(id);

        const profile =
          item.querySelector<HTMLImageElement>('.music-together-owner') ??
          document.createElement('img');
        profile.classList.add('music-together-owner');
        profile.dataset.id = id;
        profile.dataset.index = index.toString();

        const name =
          item.querySelector<HTMLElement>('.music-together-name') ??
          document.createElement('div');
        name.classList.add('music-together-name');
        name.textContent =
          data?.name ?? t('plugins.music-together.internal.unknown-user');

        if (!data?.name && !data?.handleId) {
          data = getDefaultProfile(data?.id ?? '');
        }

        if (data) {
          profile.dataset.thumbnail = data.thumbnail ?? '';
          profile.dataset.name = data.name ?? '';
          profile.dataset.handleId = data.handleId ?? '';
          profile.dataset.id = data.id ?? '';

          profile.src = data.thumbnail ?? '';
          profile.title = data.name ?? '';
          profile.alt = data.handleId ?? '';
        }

        if (!profile.isConnected) item.append(profile);
        if (!name.isConnected) item.append(name);
      });
    });
  }

  removeQueueOwner() {
    const allQueue = document.querySelectorAll('#queue');

    allQueue.forEach((queue) => {
      const list = Array.from(
        queue?.querySelectorAll<HTMLElement>('ytmusic-player-queue-item') ?? [],
      );

      list.forEach((item) => {
        const profile = item.querySelector<HTMLImageElement>(
          '.music-together-owner',
        );
        const name = item.querySelector<HTMLElement>('.music-together-name');
        profile?.remove();
        name?.remove();
      });
    });
  }

  /* private */
  private broadcast(event: ConnectionEventUnion) {
    this.listeners.forEach((listener) => listener(event));
  }
}
