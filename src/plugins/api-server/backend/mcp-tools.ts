/**
 * The MCP tools: one per operation, with their own names, descriptions and
 * schemas. They call the same operations the API surface calls, so the two
 * surfaces can differ in shape without copying work; each tool only maps the
 * outcome to text.
 */
import { z } from '@hono/zod-openapi';

import type { SongInfo } from '@/providers/song-info';
import type { RepeatMode, VolumeState } from '@/types/datahost-get-state';

export type Outcome<T = undefined> =
  | { ok: true; value: T }
  | { ok: false; status?: number; error: string };

export type McpToolResult = {
  content: { type: 'text'; text: string }[];
  isError?: boolean;
};

export type McpTool = {
  name: string;
  description: string;
  input: z.ZodType;
  readOnly?: boolean;
  run: (args: Record<string, unknown>) => Promise<McpToolResult>;
};

export const PlayVideoSchema = z.object({
  videoId: z.string().describe('YouTube video id'),
});

export const DownloadVideoSchema = z.object({
  videoId: z
    .string()
    .optional()
    .describe('YouTube video id (defaults to current)'),
});

export const SearchSchema = z.object({
  query: z.string().describe('Search query'),
  params: z.string().optional(),
  continuation: z.string().optional(),
  raw: z.boolean().optional(),
});

export const BrowseRequestSchema = z.object({
  browseId: z.string().optional(),
  continuation: z.string().optional(),
  raw: z.boolean().optional(),
});

export const LyricsQuerySchema = z.object({
  videoId: z.string().optional(),
});

export const LyricsTranslationRequestSchema = z.object({
  language: z.string().describe('Target language code (e.g. "en", "es", "ja")'),
  videoId: z.string().optional(),
});

export const SetPlaybackSpeedSchema = z.object({
  speed: z.number().min(0.25).max(2).describe('Playback speed (1.0 = normal)'),
});

export const SeekSchema = z.object({
  seconds: z.number().describe('Target position or offset in seconds'),
});

export const SetShuffleSchema = z.object({
  enabled: z.boolean().describe('Whether shuffle should be enabled'),
});

export const SetRepeatSchema = z.object({
  mode: z.enum(['NONE', 'ALL', 'ONE']).describe('Repeat mode'),
});

export const SetVolumeSchema = z.object({
  volume: z.number().min(0).max(100).describe('Volume level from 0 to 100'),
});

export const SetMuteSchema = z.object({
  muted: z.boolean().describe('Whether the player should be muted'),
});

export const SetLikeStateSchema = z.object({
  state: z.enum(['LIKE', 'DISLIKE', 'INDIFFERENT']).describe('Like state'),
});

export const QueueIndexParamSchema = z.object({
  index: z.number().int().min(0).describe('Zero-based queue item index'),
});

export const MoveInQueueSchema = z.object({
  toIndex: z.number().int().min(0).describe('Destination zero-based index'),
});

export const AddToQueueSchema = z.object({
  videoIds: z.array(z.string()).optional(),
  playlistIds: z.array(z.string()).optional(),
  insertPosition: z
    .enum(['INSERT_AFTER_CURRENT_VIDEO', 'INSERT_AT_END'])
    .optional(),
});

export const SetQueueIndexSchema = z.object({
  index: z.number().int().min(0).describe('Zero-based queue index to jump to'),
});

export const ConfigSchema = z
  .record(z.string(), z.unknown())
  .describe('Partial config object');

export const FeatureFlagOverridesSchema = z
  .record(z.string(), z.unknown())
  .describe('Map of feature flag names to their overridden values');

export const FeatureFlagDeleteSchema = z.object({
  flags: z.array(z.string()).describe('List of feature flag names to revert'),
});

export type Operations = {
  video: () => Promise<Outcome<unknown>>;
  nextVideo: () => void;
  previousVideo: () => void;
  playVideo: (videoId: string) => void;
  downloadVideo: (videoId?: string) => Promise<Outcome<unknown>>;
  search: (args: unknown) => Promise<Outcome<unknown>>;
  browse: (args: unknown) => Promise<Outcome<unknown>>;
  lyrics: (videoId?: string) => Promise<Outcome<unknown>>;
  lyricsTranslations: (videoId?: string) => Promise<Outcome<unknown>>;
  translateLyrics: (args: unknown) => Promise<Outcome<unknown>>;
  playing: () => boolean;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  playbackSpeed: () => number;
  setPlaybackSpeed: (speed: number) => void;
  playbackPosition: (percentage?: boolean) => Promise<Outcome<unknown>>;
  seekTo: (seconds: number) => void;
  seekBy: (seconds: number) => void;
  shuffleState: () => boolean;
  shuffle: () => void;
  setShuffle: (enabled: boolean) => void;
  repeatMode: () => string;
  setRepeat: (mode: string) => void;
  switchRepeat: () => void;
  volume: () => number;
  setVolume: (volume: number) => void;
  muteState: () => boolean;
  setMute: (muted: boolean) => void;
  toggleMute: () => void;
  likeState: () => string;
  setLikeState: (state: string) => void;
  like: () => void;
  dislike: () => void;
  unlike: () => void;
  queue: (raw?: boolean) => Promise<Outcome<unknown>>;
  addToQueue: (
    videoIds?: string[],
    playlistIds?: string[],
    insertPosition?: string,
  ) => void;
  moveInQueue: (index: number, toIndex: number) => void;
  removeFromQueue: (index: number) => void;
  setQueueIndex: (index: number) => void;
  autoplay: (raw?: boolean, continuation?: string) => Promise<Outcome<unknown>>;
  clearQueue: () => void;
  getConfig: () => unknown;
  patchConfig: (patch: Record<string, unknown>) => void;
  appMeta: () => Promise<unknown>;
  featureFlags: () => Promise<unknown>;
  patchFeatureFlags: (patch: Record<string, unknown>) => Promise<void>;
  deleteFeatureFlags: (flags: string[]) => Promise<void>;
};

const ok = (data?: unknown): McpToolResult => ({
  content: [
    {
      type: 'text',
      text:
        data === undefined
          ? 'Success'
          : typeof data === 'string'
            ? data
            : JSON.stringify(data),
    },
  ],
});

const fail = (message: string): McpToolResult => ({
  isError: true,
  content: [{ type: 'text', text: message }],
});

const fromOutcome = <T>(result: Outcome<T>, empty: string): McpToolResult => {
  if (!result.ok) {
    return fail(result.error);
  }

  return ok(result.value === undefined ? empty : result.value);
};

const NO_ARGS = z.object({});

const tool = <S extends z.ZodType = typeof NO_ARGS>(
  name: string,
  description: string,
  run: (args: z.infer<S>) => McpToolResult | Promise<McpToolResult>,
  { input, readOnly }: { input?: S; readOnly?: boolean } = {},
): McpTool => ({
  name,
  description,
  input: input ?? NO_ARGS,
  readOnly,
  run: async (args) => run(args as z.infer<S>),
});

const raw = z
  .boolean()
  .optional()
  .describe("Include each item's raw YouTube Music renderer");

const percentage = z
  .boolean()
  .optional()
  .describe('Report a 0..1 fraction of the song instead of seconds');

const continuation = z
  .string()
  .optional()
  .describe('Fetch the next page from this token');

const queueIndex = z.object({ index: QueueIndexParamSchema.shape.index });
const moveInQueue = z.object({
  index: QueueIndexParamSchema.shape.index,
  toIndex: MoveInQueueSchema.shape.toIndex,
});

/** Builds the 49-tool list from operations. */
export const createMcpTools = (operations: Operations): McpTool[] => [
  // Video
  tool(
    'video',
    'Get the current track info.',
    async () => fromOutcome(await operations.video(), 'No track is playing'),
    { readOnly: true },
  ),
  tool('next_video', 'Play the next track.', () => {
    operations.nextVideo();
    return ok();
  }),
  tool('previous_video', 'Play the previous track.', () => {
    operations.previousVideo();
    return ok();
  }),
  tool(
    'play_video',
    'Play this video now, replacing the queue.',
    ({ videoId }) => {
      operations.playVideo(videoId);
      return ok();
    },
    { input: PlayVideoSchema },
  ),
  tool(
    'download_video',
    'Download a video, or the current track, with the downloader plugin.',
    async ({ videoId }) =>
      fromOutcome(await operations.downloadVideo(videoId), 'Success'),
    { input: DownloadVideoSchema },
  ),
  tool(
    'search',
    'Search YouTube Music.',
    async (args) => fromOutcome(await operations.search(args), 'No results'),
    { input: SearchSchema },
  ),
  tool(
    'browse',
    'Browse a YouTube Music page by browse id or continuation token.',
    async (args) => fromOutcome(await operations.browse(args), 'No results'),
    { input: BrowseRequestSchema, readOnly: true },
  ),
  tool(
    'lyrics',
    "Get the current track's lyrics from every provider.",
    async ({ videoId }) =>
      fromOutcome(await operations.lyrics(videoId), 'No lyrics available'),
    { input: LyricsQuerySchema, readOnly: true },
  ),
  tool(
    'lyrics_translations',
    "Get the cached translations of the current track's lyrics.",
    async ({ videoId }) =>
      fromOutcome(await operations.lyricsTranslations(videoId), 'No entries'),
    { input: LyricsQuerySchema, readOnly: true },
  ),
  tool(
    'translate_lyrics',
    'Translate the lyrics into a language and cache the result.',
    async (args) =>
      fromOutcome(await operations.translateLyrics(args), 'Success'),
    { input: LyricsTranslationRequestSchema },
  ),

  // Playback
  tool(
    'playing',
    'Check whether playback is running.',
    () => ok({ playing: operations.playing() }),
    { readOnly: true },
  ),
  tool('play', 'Start playback.', () => {
    operations.play();
    return ok();
  }),
  tool('pause', 'Pause playback.', () => {
    operations.pause();
    return ok();
  }),
  tool('toggle_play', 'Toggle between play and pause.', () => {
    operations.togglePlay();
    return ok();
  }),
  tool(
    'playback_speed',
    'Get the playback speed.',
    () => ok({ speed: operations.playbackSpeed() }),
    { readOnly: true },
  ),
  tool(
    'set_playback_speed',
    'Set the playback speed, where 1 is normal.',
    ({ speed }) => {
      operations.setPlaybackSpeed(speed);
      return ok();
    },
    { input: SetPlaybackSpeedSchema },
  ),
  tool(
    'playback_position',
    'Get the playback position in seconds, or a 0..1 fraction.',
    async ({ percentage: asFraction }) =>
      fromOutcome(
        await operations.playbackPosition(asFraction ?? false),
        'No position info',
      ),
    { input: z.object({ percentage }), readOnly: true },
  ),
  tool(
    'seek_to',
    'Seek to a time in seconds.',
    ({ seconds }) => {
      operations.seekTo(seconds);
      return ok();
    },
    { input: SeekSchema },
  ),
  tool(
    'seek_by',
    'Seek forward or backward by a number of seconds.',
    ({ seconds }) => {
      operations.seekBy(seconds);
      return ok();
    },
    { input: SeekSchema },
  ),
  tool(
    'shuffle_state',
    'Check whether shuffle is on.',
    () => ok({ shuffle: operations.shuffleState() }),
    { readOnly: true },
  ),
  tool('shuffle', 'Shuffle the queue.', () => {
    operations.shuffle();
    return ok();
  }),
  tool(
    'set_shuffle',
    'Turn shuffle on or off.',
    ({ enabled }) => {
      operations.setShuffle(enabled);
      return ok();
    },
    { input: SetShuffleSchema },
  ),
  tool(
    'repeat_mode',
    'Get the repeat mode.',
    () => ok({ mode: operations.repeatMode() }),
    { readOnly: true },
  ),
  tool(
    'set_repeat',
    'Set the repeat mode.',
    ({ mode }) => {
      operations.setRepeat(mode);
      return ok();
    },
    { input: SetRepeatSchema },
  ),
  tool('switch_repeat', 'Cycle to the next repeat mode.', () => {
    operations.switchRepeat();
    return ok();
  }),

  // Volume
  tool('volume', 'Get the volume.', () => ok({ volume: operations.volume() }), {
    readOnly: true,
  }),
  tool(
    'set_volume',
    'Set the volume, 0-100.',
    ({ volume }) => {
      operations.setVolume(volume);
      return ok();
    },
    { input: SetVolumeSchema },
  ),
  tool(
    'mute_state',
    'Check whether the player is muted.',
    () => ok({ muted: operations.muteState() }),
    { readOnly: true },
  ),
  tool(
    'set_mute',
    'Mute or unmute the player.',
    ({ muted }) => {
      operations.setMute(muted);
      return ok();
    },
    { input: SetMuteSchema },
  ),
  tool('unmute', 'Unmute the player.', () => {
    operations.setMute(false);
    return ok();
  }),
  tool('toggle_mute', 'Toggle mute.', () => {
    operations.toggleMute();
    return ok();
  }),

  // Rating
  tool(
    'like_state',
    'Get the like state of the current track.',
    () => ok({ state: operations.likeState() }),
    { readOnly: true },
  ),
  tool(
    'set_like_state',
    'Set the like state of the current track.',
    ({ state }) => {
      operations.setLikeState(state);
      return ok();
    },
    { input: SetLikeStateSchema },
  ),
  tool('like', 'Like the current track.', () => {
    operations.like();
    return ok();
  }),
  tool('dislike', 'Dislike the current track.', () => {
    operations.dislike();
    return ok();
  }),
  tool('unlike', 'Clear the like state of the current track.', () => {
    operations.unlike();
    return ok();
  }),

  // Queue
  tool(
    'queue',
    'Get the queue.',
    async ({ raw: includeRaw }) =>
      fromOutcome(await operations.queue(includeRaw ?? false), 'No queue info'),
    { input: z.object({ raw }), readOnly: true },
  ),
  tool(
    'add_to_queue',
    'Add videos or playlists to the queue.',
    ({ videoIds, playlistIds, insertPosition }) => {
      operations.addToQueue(
        videoIds ?? [],
        playlistIds ?? [],
        insertPosition ?? 'INSERT_AFTER_CURRENT_VIDEO',
      );
      return ok();
    },
    { input: AddToQueueSchema },
  ),
  tool(
    'move_in_queue',
    'Move a queue item to another position.',
    ({ index, toIndex }) => {
      operations.moveInQueue(index, toIndex);
      return ok();
    },
    { input: moveInQueue },
  ),
  tool(
    'remove_from_queue',
    'Remove a queue item.',
    ({ index }) => {
      operations.removeFromQueue(index);
      return ok();
    },
    { input: queueIndex },
  ),
  tool(
    'set_queue_index',
    'Jump to a queue position.',
    ({ index }) => {
      operations.setQueueIndex(index);
      return ok();
    },
    { input: SetQueueIndexSchema },
  ),
  tool(
    'autoplay',
    'Get the autoplay entries.',
    async ({ raw: includeRaw, continuation: token }) =>
      fromOutcome(
        await operations.autoplay(includeRaw ?? false, token),
        'No autoplay entries',
      ),
    { input: z.object({ raw, continuation }), readOnly: true },
  ),
  tool('clear_queue', 'Clear the queue.', () => {
    operations.clearQueue();
    return ok();
  }),

  // Config
  tool('config', 'Get the app config.', () => ok(operations.getConfig()), {
    readOnly: true,
  }),
  tool(
    'patch_config',
    'Deep-merge a partial config into the app config.',
    (patch) => {
      operations.patchConfig(patch);
      return ok();
    },
    { input: ConfigSchema },
  ),
  tool(
    'app_meta',
    'Get app version, platform and hardware info.',
    async () => ok(await operations.appMeta()),
    { readOnly: true },
  ),
  tool(
    'feature_flags',
    'Get the feature flags this app sets.',
    async () => ok({ flags: await operations.featureFlags() }),
    { readOnly: true },
  ),
  tool(
    'patch_feature_flags',
    'Set feature flag overrides.',
    async (patch) => {
      await operations.patchFeatureFlags(patch);
      return ok();
    },
    { input: FeatureFlagOverridesSchema },
  ),
  tool(
    'delete_feature_flags',
    'Remove feature flag overrides.',
    async ({ flags }) => {
      await operations.deleteFeatureFlags(flags);
      return ok();
    },
    { input: FeatureFlagDeleteSchema },
  ),
];

export type SongController = {
  previous: () => void;
  next: () => void;
  play: () => void;
  pause: () => void;
  playPause: () => void;
  like: () => void;
  dislike: () => void;
  seekTo: (seconds: number) => void;
  goBack: (seconds: number) => void;
  goForward: (seconds: number) => void;
  setVolume: (volume: number) => void;
  switchRepeat: () => void;
  shuffle: () => void;
};

/** Creates live operations wired to player controls and state. */
export const createDefaultOperations = (
  controller: SongController,
  getConfig: () => unknown,
  getSongInfo: () => SongInfo | undefined,
  getCurrentRepeatMode: () => RepeatMode | undefined,
  getVolumeState: () => VolumeState | undefined,
): Operations => ({
  video: () => Promise.resolve({ ok: true, value: getSongInfo() }),
  nextVideo: () => controller.next(),
  previousVideo: () => controller.previous(),
  playVideo: () => controller.play(),
  downloadVideo: () => Promise.resolve({ ok: true, value: undefined }),
  search: () => Promise.resolve({ ok: true, value: [] }),
  browse: () => Promise.resolve({ ok: true, value: {} }),
  lyrics: () => Promise.resolve({ ok: true, value: null }),
  lyricsTranslations: () => Promise.resolve({ ok: true, value: [] }),
  translateLyrics: () => Promise.resolve({ ok: true, value: undefined }),
  playing: () => !(getSongInfo()?.isPaused ?? true),
  play: () => controller.play(),
  pause: () => controller.pause(),
  togglePlay: () => controller.playPause(),
  playbackSpeed: () => 1,
  setPlaybackSpeed: () => {},
  playbackPosition: (percentage) =>
    Promise.resolve({
      ok: true,
      value: {
        position: getSongInfo()?.elapsedSeconds ?? 0,
        percentage: percentage ? 0 : undefined,
      },
    }),
  seekTo: (seconds) => controller.seekTo(seconds),
  seekBy: (seconds) => controller.goForward(seconds),
  shuffleState: () => false,
  shuffle: () => controller.shuffle(),
  setShuffle: () => controller.shuffle(),
  repeatMode: () => String(getCurrentRepeatMode() ?? 'NONE'),
  setRepeat: () => controller.switchRepeat(),
  switchRepeat: () => controller.switchRepeat(),
  volume: () => getVolumeState()?.state ?? 50,
  setVolume: (v) => controller.setVolume(v),
  muteState: () => getVolumeState()?.isMuted ?? false,
  setMute: () => {},
  toggleMute: () => {},
  likeState: () => 'INDIFFERENT',
  setLikeState: () => {},
  like: () => controller.like(),
  dislike: () => controller.dislike(),
  unlike: () => {},
  queue: () => Promise.resolve({ ok: true, value: { items: [] } }),
  addToQueue: () => {},
  moveInQueue: () => {},
  removeFromQueue: () => {},
  setQueueIndex: () => {},
  autoplay: () => Promise.resolve({ ok: true, value: [] }),
  clearQueue: () => {},
  getConfig: () => getConfig(),
  patchConfig: () => {},
  appMeta: () => Promise.resolve({ name: 'pear-desktop' }),
  featureFlags: () => Promise.resolve({}),
  patchFeatureFlags: () => Promise.resolve(),
  deleteFeatureFlags: () => Promise.resolve(),
});
