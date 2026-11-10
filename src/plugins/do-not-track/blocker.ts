import fs, { promises } from 'node:fs';
import path from 'node:path';

import { ElectronBlocker } from '@ghostery/adblocker-electron';
import { app, net } from 'electron';

let blocker: ElectronBlocker | undefined;

const SOURCES = [
  // ===== YouTube Specific (Ads + Cosmetic) =====
  'https://raw.githubusercontent.com/kbinani/adblock-youtube-ads/master/signed.txt',
  'https://cdn.jsdelivr.net/gh/uBlockOrigin/uAssetsCDN@main/filters/filters.txt',
  'https://cdn.jsdelivr.net/gh/uBlockOrigin/uAssetsCDN@main/filters/quick-fixes.txt',
  'https://cdn.jsdelivr.net/gh/uBlockOrigin/uAssetsCDN@main/filters/unbreak.txt',
  'https://cdn.jsdelivr.net/gh/uBlockOrigin/uAssetsCDN@main/filters/filters-2026.txt',
  'https://cdn.jsdelivr.net/gh/uBlockOrigin/uAssetsCDN@main/filters/filters-2025.txt',
  'https://cdn.jsdelivr.net/gh/uBlockOrigin/uAssetsCDN@main/filters/filters-2024.txt',
  'https://cdn.jsdelivr.net/gh/uBlockOrigin/uAssetsCDN@main/filters/filters-2023.txt',
  'https://cdn.jsdelivr.net/gh/uBlockOrigin/uAssetsCDN@main/filters/filters-2022.txt',
  'https://cdn.jsdelivr.net/gh/uBlockOrigin/uAssetsCDN@main/filters/filters-2021.txt',
  'https://cdn.jsdelivr.net/gh/uBlockOrigin/uAssetsCDN@main/filters/filters-2020.txt',
  'https://cdn.jsdelivr.net/gh/uBlockOrigin/uAssetsCDN@main/filters/filters-general.txt',
  'https://filters.adtidy.org/extension/ublock/filters/2_without_easylist.txt',
  'https://raw.githubusercontent.com/hl2guide/curated-adblock-lists/refs/heads/main/lists/video-media.txt',

  // Cosmetic / Clean YouTube UI
  'https://raw.githubusercontent.com/i5heu/ublock-hide-yt-shorts/master/list.txt',                  // Hide Shorts
  'https://raw.githubusercontent.com/Onsotumenh/YouTube-Cosmetic-Filters-for-uBlock-Origin/main/YouTubeFilterList.txt',
  'https://raw.githubusercontent.com/mchangrh/yt-neuter/main/yt-neuter.txt',                       // YouTube Neuter
  'https://raw.githubusercontent.com/jartf/ublock-lists/main/YouTube/cleaner-youtube-ui.txt',
  'https://codeberg.org/Sparronator9999/yt-ublock-filters/raw/branch/main/yt-filters.txt',         // Usability filters

  // ===== Core Ads & Trackers =====
  'https://ublockorigin.github.io/uAssets/thirdparties/easylist.txt',
  'https://ublockorigin.github.io/uAssets/thirdparties/easyprivacy.txt',
  'https://pgl.yoyo.org/adservers/serverlist.php?hostformat=hosts&showintro=1&mimetype=plaintext',
  'https://ublockorigin.github.io/uAssets/filters/filters.txt',
  'https://ublockorigin.github.io/uAssets/filters/privacy.txt',
  'https://ublockorigin.github.io/uAssets/filters/badware.txt',

  // ===== Mobile Ads & Privacy =====
  'https://filters.adtidy.org/extension/ublock/filters/11.txt',
  'https://ublockorigin.github.io/uAssets/filters/privacy-removeparam.txt',

  // ===== Annoyances =====
  'https://ublockorigin.github.io/uAssets/thirdparties/easylist-annoyances.txt',
  'https://secure.fanboy.co.nz/fanboy-annoyance_ubo.txt',
  'https://filters.adtidy.org/extension/ublock/filters/122_optimized.txt',

  // ===== Regional Filter Lists =====
  'https://raw.githubusercontent.com/AnXh3L0/blocklist/master/albanian-easylist-addition/Albania.txt',
  'https://easylist-downloads.adblockplus.org/Liste_AR.txt',
  'https://stanev.org/abp/adblock_bg.txt',
  'https://filters.adtidy.org/extension/ublock/filters/224.txt',
  'https://raw.githubusercontent.com/ABPindo/indonesianadblockrules/master/subscriptions/abpindo.txt',
  'https://easylist-downloads.adblockplus.org/indianlist.txt',
  'https://raw.githubusercontent.com/MasterKia/PersianBlocker/main/PersianBlocker.txt',
  'https://raw.githubusercontent.com/brave/adblock-lists/master/custom/is.txt',
  'https://raw.githubusercontent.com/easylist/EasyListHebrew/master/EasyListHebrew.txt',
  'https://easylist-downloads.adblockplus.org/easylistitaly.txt',
  'https://filters.adtidy.org/extension/ublock/filters/7.txt',
  'https://cdn.jsdelivr.net/npm/@filteringdev/filterslists-ko@latest/dist/filterslist-uBlockOrigin-classic.txt',

  // ===== Security & Threat Intelligence =====
  'https://cdn.jsdelivr.net/gh/hagezi/dns-blocklists@latest/adblock/pro.txt',
  'https://cdn.jsdelivr.net/gh/hagezi/dns-blocklists@latest/adblock/popupads.txt',
  'https://cdn.jsdelivr.net/gh/hagezi/dns-blocklists@latest/adblock/tif.mini.txt',
];

export const loadTrackerBlockerEngine = async (
  session?: Electron.Session,
  cache: boolean = true,
  additionalBlockLists: string[] = [],
  disableDefaultLists: boolean | unknown[] = false,
) => {
  // Only use cache if no additional blocklists are passed
  const cacheDirectory = path.join(app.getPath('userData'), 'adblock_cache');
  if (!fs.existsSync(cacheDirectory)) {
    fs.mkdirSync(cacheDirectory, { recursive: true });
  }
  const cachingOptions =
    cache && additionalBlockLists.length === 0
      ? {
          path: path.join(cacheDirectory, 'adblocker-engine.bin'),
          read: promises.readFile,
          write: promises.writeFile,
        }
      : undefined;

  const lists = [
    ...((disableDefaultLists && !Array.isArray(disableDefaultLists)) ||
    (Array.isArray(disableDefaultLists) && disableDefaultLists.length > 0)
      ? []
      : SOURCES),
    ...additionalBlockLists,
  ];

  try {
    blocker = await ElectronBlocker.fromLists(
      (url: string) => net.fetch(url),
      lists,
      {
        enableCompression: true,
        // When generating the engine for caching, do not load network filters
        // So that enhancing the session works as expected
        // Allowing to define multiple webRequest listeners
        loadNetworkFilters: session !== undefined,
      },
      cachingOptions,
    );
    if (session) {
      blocker.enableBlockingInSession(session);
    }
  } catch (error) {
    console.error(
      'Error loading adblocker engine from lists, falling back to prebuilt',
      error,
    );
    try {
      blocker = await ElectronBlocker.fromPrebuiltAdsAndTracking(
        (url: string) => net.fetch(url),
        cachingOptions,
      );
      if (session) {
        blocker.enableBlockingInSession(session);
      }
    } catch (fallbackError) {
      console.error(
        'Error loading fallback prebuilt blocker engine',
        fallbackError,
      );
    }
  }
};

export const unloadTrackerBlockerEngine = (session: Electron.Session) => {
  if (blocker) {
    blocker.disableBlockingInSession(session);
  }
};

export const isBlockerEnabled = (session: Electron.Session) =>
  blocker?.isBlockingEnabled(session) ?? false;
