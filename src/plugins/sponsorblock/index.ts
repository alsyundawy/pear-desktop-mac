import is from 'electron-is';

import { t } from '@/i18n';
import { type MenuTemplate } from '@/menu';
import { createPlugin } from '@/utils';

import { buildSegmentsGradient, markerAt } from './markers';
import { sortSegments } from './segments';
import style from './style.css?inline';

import type { Segment, SegmentMarker, SkipSegment } from './types';
import type { GetPlayerResponse } from '@/types/get-player-response';

export type SponsorBlockCategory =
  | 'sponsor'
  | 'intro'
  | 'outro'
  | 'interaction'
  | 'selfpromo'
  | 'music_offtopic'
  | 'preview'
  | 'filler';

export type SponsorBlockPluginConfig = {
  enabled: boolean;
  apiURL: string;
  categories: SponsorBlockCategory[];
  showSegmentsOnProgressBar: boolean;
};

let currentSegments: Segment[] = [];
let segmentMarkers: SegmentMarker[] = [];
let showMarkers = false;

const SEGMENTS_BAR_ID = 'pear-sponsorblock-bar';
/** Where the playhead sits on the track, as the marker mask's cut-out. */
const PLAYHEAD_PROPERTY = '--pear-sponsorblock-playhead';
/**
 * Where the markers go: the `tp-yt-paper-progress` track of YTM's classic seek
 * slider, or the new-UI miniplayer's full-width progress line.
 */
const SEGMENTS_BAR_CONTAINERS = [
  '#progress-bar>#sliderContainer>div>#sliderBar>#progressContainer',
  '.ytMusicMiniPlayerProgressBarWrapper',
];

/** Paints the segments' colours over the seek track, or clears them. */
const renderMarkers = (video: HTMLVideoElement | null) => {
  const duration = video?.duration ?? 0;
  const gradient = showMarkers
    ? buildSegmentsGradient(segmentMarkers, duration)
    : '';

  const existing = document.querySelector<HTMLElement>(`#${SEGMENTS_BAR_ID}`);
  if (!gradient) {
    existing?.remove();
    return;
  }

  const playhead =
    video && Number.isFinite(duration) && duration > 0
      ? `${(video.currentTime / duration) * 100}%`
      : '0%';

  if (existing) {
    existing.style.backgroundImage = gradient;
    existing.style.setProperty(PLAYHEAD_PROPERTY, playhead);
    return;
  }

  // YTM builds its player bar after the plugins start, so this can no-op
  // until a later hook finds the track.
  const container = document.querySelector<HTMLElement>(
    SEGMENTS_BAR_CONTAINERS.join(', '),
  );
  if (!container) {
    return;
  }

  const bar = document.createElement('div');
  bar.id = SEGMENTS_BAR_ID;
  bar.style.backgroundImage = gradient;
  bar.style.setProperty(PLAYHEAD_PROPERTY, playhead);
  container.append(bar);
  trackHover(container);
};

/** Moves the marker cut-out with the playhead, re-adding the bar if YTM
 * rebuilt its seek track. */
const syncMarkers = (video: HTMLVideoElement) => {
  const bar = document.querySelector<HTMLElement>(`#${SEGMENTS_BAR_ID}`);
  if (!bar) {
    renderMarkers(video);
    return;
  }
  if (Number.isFinite(video.duration) && video.duration > 0) {
    bar.style.setProperty(
      PLAYHEAD_PROPERTY,
      `${(video.currentTime / video.duration) * 100}%`,
    );
  }
};

/** YTM's own hover timestamp above the seek bar, on either player bar. */
const HOVER_TIME_SELECTOR = '#hover-time-info, .ytMusicMiniPlayerHoverTimeInfo';
const HOVER_LABEL_ID = 'pear-sponsorblock-hover';

let markerVideo: HTMLVideoElement | null = null;
let stopHoverTracking: (() => void) | undefined;

/** The segment currently under the pointer, and where the pointer is. */
let hovered: { category: string; pointerX: number; trackTop: number } | null =
  null;

/** Sits the label just above YTM's timestamp (or above the track). */
const positionHoverLabel = () => {
  const label = document.querySelector<HTMLElement>(`#${HOVER_LABEL_ID}`);
  if (!hovered || !label || label.style.display === 'none') {
    return;
  }

  const tooltipElement =
    document.querySelector<HTMLElement>(HOVER_TIME_SELECTOR);
  const tooltip = tooltipElement?.getBoundingClientRect();
  const hasTooltip = !!tooltip && tooltip.width > 0 && tooltip.height > 0;
  if (hasTooltip && tooltipElement) {
    label.style.backgroundColor =
      getComputedStyle(tooltipElement).backgroundColor;
  }
  const centerX = hasTooltip ? tooltip.x + tooltip.width / 2 : hovered.pointerX;
  const top = hasTooltip
    ? tooltip.y - label.offsetHeight - 6
    : hovered.trackTop - label.offsetHeight - 6;
  label.style.transform = `translate(${Math.round(centerX)}px, ${Math.round(top)}px) translateX(-50%)`;
};

const hideHoverLabel = () => {
  hovered = null;
  const label = document.querySelector<HTMLElement>(`#${HOVER_LABEL_ID}`);
  if (label) {
    label.style.display = 'none';
  }
};

/** Names the segment under the pointer, right above YTM's timestamp. */
const showHoverLabel = (
  category: string,
  pointerX: number,
  trackTop: number,
) => {
  hovered = { category, pointerX, trackTop };

  let label = document.querySelector<HTMLElement>(`#${HOVER_LABEL_ID}`);
  if (!label) {
    label = document.createElement('div');
    label.id = HOVER_LABEL_ID;
    document.body.append(label);
  }

  const text = t(`plugins.sponsorblock.menu.categories.${category}`, {
    defaultValue: category,
  });
  if (label.textContent !== text) {
    label.textContent = text;
  }
  label.style.display = 'block';

  positionHoverLabel();
  requestAnimationFrame(positionHoverLabel);
  setTimeout(positionHoverLabel, 60);
};

/** Follows the pointer along the seek bar to label the segment under it. */
const trackHover = (container: HTMLElement) => {
  stopHoverTracking?.();

  const host =
    container.closest<HTMLElement>('#progress-bar') ??
    container.querySelector<HTMLElement>('input') ??
    container;

  const onMove = (event: MouseEvent) => {
    const duration = markerVideo?.duration ?? 0;
    const rect = container.getBoundingClientRect();
    if (
      !showMarkers ||
      segmentMarkers.length === 0 ||
      !Number.isFinite(duration) ||
      duration <= 0 ||
      rect.width <= 0
    ) {
      hideHoverLabel();
      return;
    }

    const time = ((event.clientX - rect.left) / rect.width) * duration;
    const marker = markerAt(segmentMarkers, time);
    if (!marker) {
      hideHoverLabel();
      return;
    }

    showHoverLabel(marker.category, event.clientX, rect.top);
  };

  const onLeave = () => hideHoverLabel();

  host.addEventListener('mousemove', onMove);
  host.addEventListener('mouseleave', onLeave);
  stopHoverTracking = () => {
    host.removeEventListener('mousemove', onMove);
    host.removeEventListener('mouseleave', onLeave);
    stopHoverTracking = undefined;
    hideHoverLabel();
  };
};

/** Jumps `video` past the segment it is inside, if any. */
const applySegments = (video: HTMLVideoElement) => {
  const currentTime = video.currentTime;

  // Binary search the sorted segments.
  let lo = 0;
  let hi = currentSegments.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (currentTime < currentSegments[mid][0]) {
      hi = mid - 1;
    } else if (currentTime >= currentSegments[mid][1]) {
      lo = mid + 1;
    } else {
      found = mid;
      break;
    }
  }

  if (found !== -1) {
    video.currentTime = currentSegments[found][1];
    if (window.electronIs?.dev?.() ?? false) {
      console.log('SponsorBlock: skipping segment', currentSegments[found]);
    }
  }
};

let activeVideo: HTMLVideoElement | null = null;

const timeUpdateListener = (e: Event): void => {
  if (!(e.target instanceof HTMLVideoElement)) return;
  applySegments(e.target);
  syncMarkers(e.target);
};

const durationChangeListener = (e: Event): void => {
  if (e.target instanceof HTMLVideoElement) {
    renderMarkers(e.target);
  }
};

const resetSegments = (): void => {
  currentSegments = [];
  segmentMarkers = [];
  document.querySelector(`#${SEGMENTS_BAR_ID}`)?.remove();
  hideHoverLabel();
};

export default createPlugin({
  name: () => t('plugins.sponsorblock.name'),
  description: () => t('plugins.sponsorblock.description'),
  restartNeeded: false,
  stylesheets: [style],
  config: {
    enabled: false,
    apiURL: 'https://sponsor.ajay.app',
    categories: [
      'sponsor',
      'intro',
      'outro',
      'interaction',
      'selfpromo',
      'music_offtopic',
      'preview',
      'filler',
    ],
    showSegmentsOnProgressBar: false,
  } as SponsorBlockPluginConfig,
  menu: async ({ getConfig, setConfig }): Promise<MenuTemplate> => {
    const config = await getConfig();

    const categoryList: SponsorBlockCategory[] = [
      'sponsor',
      'intro',
      'outro',
      'interaction',
      'selfpromo',
      'music_offtopic',
      'preview',
      'filler',
    ];

    return [
      {
        label: t('plugins.sponsorblock.menu.show-segments', {
          defaultValue: 'Show segments on the progress bar',
        }),
        type: 'checkbox',
        checked: config.showSegmentsOnProgressBar === true,
        click(item) {
          setConfig({ showSegmentsOnProgressBar: item.checked });
        },
      },
      {
        label: t('plugins.sponsorblock.menu.categories.label'),
        submenu: categoryList.map((category) => ({
          label: t(`plugins.sponsorblock.menu.categories.${category}`),
          type: 'checkbox',
          checked: config.categories.includes(category),
          click(item) {
            const current = new Set(config.categories);
            if (item.checked) {
              current.add(category);
            } else {
              current.delete(category);
            }
            setConfig({ categories: Array.from(current) });
          },
        })),
      },
    ];
  },
  async backend({ getConfig, ipc }) {
    let abortController: AbortController | undefined;

    const fetchSegments = async (
      apiURL: string,
      categories: string[],
      videoId: string,
      signal: AbortSignal,
    ) => {
      if (!videoId || categories.length === 0) {
        return [];
      }

      const sponsorBlockURL = `${apiURL}/api/skipSegments?videoID=${encodeURIComponent(
        videoId,
      )}&categories=${encodeURIComponent(JSON.stringify(categories))}`;
      try {
        const resp = await fetch(sponsorBlockURL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          redirect: 'follow',
          signal,
        });
        if (resp.status !== 200) {
          return [];
        }

        const submissions = (await resp.json()) as SkipSegment[];
        return submissions.map(({ segment, category }) => ({
          segment,
          category,
        }));
      } catch (error) {
        if (!signal.aborted && is.dev()) {
          console.log('error on sponsorblock request:', error);
        }

        return [];
      }
    };

    const config = await getConfig();

    ipc.on('peard:video-src-changed', async (data: GetPlayerResponse) => {
      const videoId = data?.videoDetails?.videoId;
      if (!videoId) {
        ipc.send('sponsorblock-skip', []);
        return;
      }

      abortController?.abort();
      const controller = new AbortController();
      abortController = controller;

      const markers = await fetchSegments(
        config.apiURL,
        config.categories,
        videoId,
        controller.signal,
      );
      if (controller.signal.aborted) {
        return;
      }
      ipc.send('sponsorblock-skip', markers);
    });
  },
  renderer: {
    async start({ ipc, getConfig }) {
      showMarkers = (await getConfig()).showSegmentsOnProgressBar === true;

      ipc.on('sponsorblock-skip', (markers: SegmentMarker[]) => {
        segmentMarkers = markers;
        currentSegments = sortSegments(markers.map((marker) => marker.segment));

        const video = document.querySelector<HTMLVideoElement>('video');
        if (video) {
          applySegments(video);
        }
        renderMarkers(video);
      });
    },
    onPlayerApiReady(playerApi, { ipc }) {
      const video = document.querySelector<HTMLVideoElement>('video');
      if (!video) return;

      activeVideo = video;
      markerVideo = video;
      video.addEventListener('timeupdate', timeUpdateListener);
      video.addEventListener('durationchange', durationChangeListener);
      video.addEventListener('emptied', resetSegments);

      ipc.send('peard:video-src-changed', playerApi.getPlayerResponse());
      applySegments(video);
      renderMarkers(video);
    },
    onConfigChange(config: SponsorBlockPluginConfig) {
      showMarkers = config.showSegmentsOnProgressBar === true;
      renderMarkers(document.querySelector<HTMLVideoElement>('video'));
    },
    stop({ ipc }) {
      ipc.removeAllListeners('sponsorblock-skip');
      resetSegments();
      stopHoverTracking?.();
      document.querySelector(`#${HOVER_LABEL_ID}`)?.remove();

      if (activeVideo) {
        activeVideo.removeEventListener('timeupdate', timeUpdateListener);
        activeVideo.removeEventListener('durationchange', durationChangeListener);
        activeVideo.removeEventListener('emptied', resetSegments);
        activeVideo = null;
      }
      markerVideo = null;
    },
  },
});
