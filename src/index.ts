import path from 'node:path';
import url from 'node:url';
import fs from 'node:fs';

import {
  BrowserWindow,
  app,
  screen,
  globalShortcut,
  session,
  shell,
  dialog,
  ipcMain,
  protocol,
  type BrowserWindowConstructorOptions,
} from 'electron';
import {
  enhanceWebRequest,
  type BetterSession,
} from '@jellybrick/electron-better-web-request';
import is from 'electron-is';
import unhandled from 'electron-unhandled';
import { autoUpdater } from 'electron-updater';
import electronDebug from 'electron-debug';
import { parse } from 'node-html-parser';
import { deepmerge } from 'deepmerge-ts';
import { deepEqual } from 'fast-equals';

import { allPlugins, mainPlugins } from 'virtual:plugins';

import { languageResources } from 'virtual:i18n';

import * as config from '@/config';

import { refreshMenu, setApplicationMenu } from '@/menu';
import { fileExists, injectCSS, injectCSSAsFile } from '@/plugins/utils/main';
import { isTesting } from '@/utils/testing';
import { setUpTray } from '@/tray';
import { setupSongInfo } from '@/providers/song-info';
import { restart, setupAppControls } from '@/providers/app-controls';
import { clearStaleCodeCaches } from '@/providers/cache-maintenance';
import {
  APP_PROTOCOL,
  handleProtocol,
  setupProtocolHandler,
} from '@/providers/protocol-handler';

import musicPlayerCss from '@/music-player.css?inline';

import {
  forceLoadMainPlugin,
  forceUnloadMainPlugin,
  getAllLoadedMainPlugins,
  loadAllMainPlugins,
} from '@/loader/main';

import { LoggerPrefix } from '@/utils';
import { APPLICATION_NAME, loadI18n, setLanguage, t } from '@/i18n';

import ErrorHtmlAsset from '@assets/error.html?asset';

import { defaultAuthProxyConfig } from '@/plugins/auth-proxy-adapter/config';

import packageJson from '../package.json';

import type { PluginConfig } from '@/types/plugins';

// Catch errors and log them
unhandled({
  logger: console.error,
  showDialog: false,
});

// Prevent window being garbage collected
let mainWindow: Electron.BrowserWindow | null;
autoUpdater.autoDownload = false;

const gotTheLock = isTesting() || app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.exit();
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'http',
    privileges: {
      standard: true,
      bypassCSP: true,
      allowServiceWorkers: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
      codeCache: true,
    },
  },
  {
    scheme: 'https',
    privileges: {
      standard: true,
      bypassCSP: true,
      allowServiceWorkers: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
      codeCache: true,
    },
  },
  { scheme: 'mailto', privileges: { standard: true } },
]);

// Ozone platform hint: Required for Wayland support
app.commandLine.appendSwitch('ozone-platform-hint', 'auto');

const enabledFeatures = [
  'SharedArrayBuffer',
  'OverlayScrollbar',
  'UseOzonePlatform',
  'WaylandWindowDecorations',
  'MemoryPurgeOnFreeze',
  'ReleaseResourceStrongReferencesOnMemoryPressure',
  'DeferSpeculativeRFHCreation',
];

const disabledFeatures = ['FluentScrollbar', 'BackForwardCache', 'Prerender2'];

if (is.linux() && (await config.plugins.isEnabled('shortcuts'))) {
  // Stops chromium from launching its own MPRIS service
  disabledFeatures.push('MediaSessionService');
}

app.commandLine.appendSwitch('enable-features', enabledFeatures.join(','));
app.commandLine.appendSwitch('disable-features', disabledFeatures.join(','));

if (config.get('options.disableHardwareAcceleration')) {
  if (is.dev()) {
    console.log('Disabling hardware acceleration');
  }

  app.disableHardwareAcceleration();
}

if (is.linux()) {
  // Overrides WM_CLASS for X11 to correspond to icon filename
  app.setName(
    'com.github.th_ch.\u0079\u006f\u0075\u0074\u0075\u0062\u0065\u005f\u006d\u0075\u0073\u0069\u0063',
  );
}

if (config.get('options.proxy')) {
  const authProxyEnabled = await config.plugins.isEnabled('auth-proxy-adapter');

  let proxyToUse = '';
  if (authProxyEnabled) {
    // Use proxy from Auth-Proxy-Adapter plugin
    const authProxyConfig = deepmerge(
      defaultAuthProxyConfig,
      config.get('plugins.auth-proxy-adapter') ?? {},
    ) as typeof defaultAuthProxyConfig;

    const { hostname, port } = authProxyConfig;
    proxyToUse = `socks5://${hostname}:${port}`;
  } else if (config.get('options.proxy')) {
    // Use global proxy settings
    proxyToUse = config.get('options.proxy');
  }
  console.log(LoggerPrefix, `Using proxy: ${proxyToUse}`);
  app.commandLine.appendSwitch('proxy-server', proxyToUse);
}

// Adds debug features like hotkeys for triggering dev tools and reload
electronDebug({
  showDevTools: false, // Disable automatic devTools on new window
});

const iconPath = app.getAppPath();
let icon = path.join(iconPath, 'assets/icon.png');
if (process.platform === 'win32') {
  icon = path.join(iconPath, 'assets/generated/icons/win/icon.ico');
} else if (process.platform === 'darwin') {
  icon = path.join(iconPath, 'assets/generated/icons/mac/icon.icns');
}

function onClosed() {
  // Dereference the window
  // For multiple Windows store them in an array
  mainWindow = null;
}

ipcMain.handle('peard:get-main-plugin-names', async () =>
  Object.keys(await mainPlugins()),
);

const handlePluginConfigChange = (
  id: string,
  newPluginConfig: unknown,
  oldPluginConfig: unknown,
  allPluginStubs: Awaited<ReturnType<typeof allPlugins>>,
  win: BrowserWindow,
) => {
  if (deepEqual(oldPluginConfig, newPluginConfig)) {
    return;
  }

  const oldConfig = oldPluginConfig as PluginConfig;
  const pluginConfig = deepmerge(
    allPluginStubs[id].config ?? { enabled: false },
    (newPluginConfig ?? {}) as PluginConfig,
  ) as PluginConfig;

  if (pluginConfig.enabled !== oldConfig?.enabled) {
    if (pluginConfig.enabled) {
      win.webContents.send('plugin:enable', id);
      ipcMain.emit('plugin:enable', id);
      forceLoadMainPlugin(id, win).catch((err: unknown) => {
        console.error(LoggerPrefix, `Failed to load plugin ${id}:`, err);
      });
    } else {
      win.webContents.send('plugin:unload', id);
      ipcMain.emit('plugin:unload', id);
      forceUnloadMainPlugin(id, win).catch((err: unknown) => {
        console.error(LoggerPrefix, `Failed to unload plugin ${id}:`, err);
      });
    }

    if (allPluginStubs[id]?.restartNeeded) {
      showNeedToRestartDialog(id).catch((err: unknown) => {
        console.error(
          LoggerPrefix,
          `Failed to show restart dialog for ${id}:`,
          err,
        );
      });
    }
  }

  const mainPlugin = getAllLoadedMainPlugins()[id];
  if (
    mainPlugin &&
    pluginConfig.enabled &&
    typeof mainPlugin.backend !== 'function'
  ) {
    Promise.resolve(mainPlugin.backend?.onConfigChange?.(pluginConfig)).catch(
      (err: unknown) => {
        console.error(
          LoggerPrefix,
          `Error in plugin ${id} onConfigChange:`,
          err,
        );
      },
    );
  }

  win.webContents.send('config-changed', id, pluginConfig);
};

const initHook = async (win: BrowserWindow) => {
  const allPluginStubs = await allPlugins();

  ipcMain.handle(
    'peard:get-config',
    (_, id: string) =>
      deepmerge(
        allPluginStubs[id].config ?? { enabled: false },
        config.get(`plugins.${id}`) ?? {},
      ) as PluginConfig,
  );
  ipcMain.handle('peard:set-config', (_, name: string, obj: object) =>
    config.setPartial(`plugins.${name}`, obj, allPluginStubs[name].config),
  );

  config.watch((newValue, oldValue) => {
    const newPluginConfigList = (newValue?.plugins ?? {}) as Record<
      string,
      unknown
    >;
    const oldPluginConfigList = (oldValue?.plugins ?? {}) as Record<
      string,
      unknown
    >;

    Object.entries(newPluginConfigList).forEach(([id, newPluginConfig]) => {
      handlePluginConfigChange(
        id,
        newPluginConfig,
        oldPluginConfigList[id],
        allPluginStubs,
        win,
      );
    });
  });
};

const showNeedToRestartDialog = async (id: string) => {
  const plugin = (await allPlugins())[id];

  const dialogOptions: Electron.MessageBoxOptions = {
    type: 'info',
    buttons: [
      t('main.dialog.need-to-restart.buttons.restart-now'),
      t('main.dialog.need-to-restart.buttons.later'),
    ],
    title: t('main.dialog.need-to-restart.title'),
    message: t('main.dialog.need-to-restart.message', {
      pluginName: plugin?.name?.() ?? id,
    }),
    detail: t('main.dialog.need-to-restart.detail', {
      pluginName: plugin?.name?.() ?? id,
    }),
    defaultId: 0,
    cancelId: 1,
  };

  let dialogPromise: Promise<Electron.MessageBoxReturnValue>;
  if (mainWindow) {
    dialogPromise = dialog.showMessageBox(mainWindow, dialogOptions);
  } else {
    dialogPromise = dialog.showMessageBox(dialogOptions);
  }

  dialogPromise
    .then((dialogOutput) => {
      if (dialogOutput.response === 0) {
        restart();
      }
    })
    .catch((err: unknown) => {
      console.error(LoggerPrefix, 'Restart dialog error:', err);
    });
};

function initTheme(win: BrowserWindow) {
  injectCSS(win.webContents, musicPlayerCss).catch((err: unknown) => {
    console.error(LoggerPrefix, 'Failed to inject player CSS:', err);
  });
  // Load user CSS
  const themes: string[] = config.get('options.themes');
  if (Array.isArray(themes)) {
    for (const cssFile of themes) {
      fileExists(
        cssFile,
        () => {
          injectCSSAsFile(win.webContents, cssFile).catch((err: unknown) => {
            console.error(
              LoggerPrefix,
              `Failed to inject theme ${cssFile}:`,
              err,
            );
          });
        },
        () => {
          console.warn(
            LoggerPrefix,
            t('main.console.theme.css-file-not-found', { cssFile }),
          );
        },
      );
    }
  }

  win.webContents.once('did-finish-load', () => {
    if (is.dev()) {
      console.debug(LoggerPrefix, t('main.console.did-finish-load.dev-tools'));
      win.webContents.openDevTools();
    }
  });
}

function applyWindowPosition(
  win: BrowserWindow,
  windowPosition: Electron.Point,
  windowSize: { width: number; height: number },
) {
  const { x: windowX, y: windowY } = windowPosition;
  const winSize = win.getSize();
  const display = screen.getDisplayNearestPoint(windowPosition);
  const primaryDisplay = screen.getPrimaryDisplay();

  const scaleFactor = is.windows()
    ? primaryDisplay.scaleFactor / display.scaleFactor
    : 1;
  const scaledWidth = Math.floor(windowSize.width * scaleFactor);
  const scaledHeight = Math.floor(windowSize.height * scaleFactor);

  const scaledX = windowX;
  const scaledY = windowY;

  const halfWidth = Math.floor(scaledWidth / 2);
  const halfHeight = Math.floor(scaledHeight / 2);

  const isOffscreen =
    scaledX + halfWidth < display.bounds.x - 8 || // Left
    scaledX + halfWidth > display.bounds.x + display.bounds.width || // Right
    scaledY < display.bounds.y - 8 || // Top
    scaledY + halfHeight > display.bounds.y + display.bounds.height; // Bottom

  if (isOffscreen) {
    // Window is offscreen
    if (is.dev()) {
      console.warn(
        LoggerPrefix,
        t('main.console.window.tried-to-render-offscreen', {
          windowSize: String(winSize),
          displaySize: JSON.stringify(display.bounds),
          position: JSON.stringify(windowPosition),
        }),
      );
    }
  } else {
    win.setSize(scaledWidth, scaledHeight);
    win.setPosition(scaledX, scaledY);
  }
}

async function createMainWindow() {
  const windowSize = config.get('window-size');
  const windowMaximized = config.get('window-maximized');
  const windowPosition: Electron.Point = config.get('window-position');
  const useInlineMenu = await config.plugins.isEnabled('in-app-menu');

  const defaultTitleBarOverlayOptions: Electron.TitleBarOverlay = {
    color: '#00000000',
    symbolColor: '#ffffff',
    height: 32,
  };

  let titleBarStyle: 'hidden' | 'hiddenInset' | 'default' = 'default';
  if (useInlineMenu) {
    titleBarStyle = 'hidden';
  } else if (is.macOS()) {
    titleBarStyle = 'hiddenInset';
  }

  const decorations: Partial<BrowserWindowConstructorOptions> = {
    frame: !is.macOS() && !useInlineMenu,
    titleBarOverlay: defaultTitleBarOverlayOptions,
    titleBarStyle,
    autoHideMenuBar: config.get('options.hideMenu'),
  };

  // Note: on linux, for some weird reason, having these extra properties with 'frame: false' does not work
  if (is.linux() && useInlineMenu) {
    delete decorations.titleBarOverlay;
    delete decorations.titleBarStyle;
  }

  const electronWindowSettings: Electron.BrowserWindowConstructorOptions = {
    icon,
    title:
      '\u0059\u006f\u0075\u0074\u0075\u0062\u0065 \u004D\u0075\u0073\u0069\u0063',
    width: windowSize.width,
    height: windowSize.height,
    minWidth: 325,
    minHeight: 425,
    backgroundColor: '#000',
    show: false,
    webPreferences: {
      contextIsolation: true,
      spellcheck: false,
      preload: path.join(__dirname, '..', 'preload', 'preload.cjs'),
      ...(isTesting()
        ? undefined
        : {
            // Sandbox is only enabled in tests for now
            // See https://www.electronjs.org/docs/latest/tutorial/sandbox#preload-scripts
            sandbox: false,
          }),
    },
    ...decorations,
  };

  const win = new BrowserWindow(electronWindowSettings);

  await initHook(win);
  initTheme(win);

  await loadAllMainPlugins(win);

  if (windowPosition) {
    applyWindowPosition(win, windowPosition, windowSize);
  }

  if (windowMaximized) {
    win.maximize();
  }

  if (config.get('options.alwaysOnTop')) {
    win.setAlwaysOnTop(true);
  }

  const urlToLoad = config.get('options.resumeOnStart')
    ? config.get('url')
    : config.defaultConfig.url;
  win.on('closed', onClosed);

  win.on('move', () => {
    if (win.isMaximized()) {
      return;
    }

    const [x, y] = win.getPosition();
    lateSave('window-position', { x, y });
  });

  let winWasMaximized: boolean;

  win.on('resize', () => {
    const [width, height] = win.getSize();
    const isMaximized = win.isMaximized();

    if (winWasMaximized !== isMaximized) {
      winWasMaximized = isMaximized;
      config.set('window-maximized', isMaximized);
    }

    if (isMaximized) {
      return;
    }

    lateSave('window-size', {
      width,
      height,
    });
  });

  const savedTimeouts: Record<string, NodeJS.Timeout | undefined> = {};

  function lateSave(
    key: string,
    value: unknown,
    fn: (key: string, value: unknown) => void = config.set,
  ) {
    if (savedTimeouts[key]) {
      clearTimeout(savedTimeouts[key]);
    }

    savedTimeouts[key] = setTimeout(() => {
      fn(key, value);
      savedTimeouts[key] = undefined;
    }, 600);
  }

  app.on('render-process-gone', (_event, _webContents, details) => {
    showUnresponsiveDialog(win, details);
  });

  win.once('ready-to-show', () => {
    if (config.get('options.appVisible')) {
      win.show();
    }
  });

  // Hidden to tray: Blink's resource caches (decoded images, fonts) are
  // re-fetchable, so hand them back after a minute hidden instead of holding
  // them for the whole session.
  let hiddenCacheTimer: NodeJS.Timeout | undefined;
  win.on('hide', () => {
    hiddenCacheTimer = setTimeout(
      () => win.webContents.send('peard:clear-cache'),
      60_000,
    );
  });
  win.on('show', () => {
    if (!hiddenCacheTimer) return;
    clearTimeout(hiddenCacheTimer);
    hiddenCacheTimer = undefined;
  });
  win.on('closed', () => {
    if (hiddenCacheTimer) clearTimeout(hiddenCacheTimer);
  });

  removeContentSecurityPolicy();

  win.webContents.on('dom-ready', () => {
    if (useInlineMenu && is.windows()) {
      win.setTitleBarOverlay({
        ...defaultTitleBarOverlayOptions,
        height: Math.floor(
          defaultTitleBarOverlayOptions.height! *
            win.webContents.getZoomFactor(),
        ),
      });
    }
  });
  win.webContents.on('will-redirect', (event) => {
    // Guard against malformed URLs that would throw in the URL constructor
    let url: URL;
    try {
      url = new URL(event.url);
    } catch {
      return;
    }

    const isYouTube =
      url.hostname === '\u0079\u006f\u0075\u0074\u0075\u0062\u0065.com' ||
      url.hostname.endsWith('.\u0079\u006f\u0075\u0074\u0075\u0062\u0065.com');

    // Workarounds for regions where YTM is restricted
    if (isYouTube && url.pathname === '/premium') {
      event.preventDefault();

      win.webContents
        .loadURL(
          'https://accounts.google.com/ServiceLogin?ltmpl=music&service=\u0079\u006f\u0075\u0074\u0075\u0062\u0065&continue=https%3A%2F%2Fwww.\u0079\u006f\u0075\u0074\u0075\u0062\u0065.com%2Fsignin%3Faction_handle_signin%3Dtrue%26next%3Dhttps%253A%252F%252Fmusic.\u0079\u006f\u0075\u0074\u0075\u0062\u0065.com%252F',
        )
        .catch(() => {});
    }
  });

  win.webContents.loadURL(urlToLoad).catch(() => {});

  return win;
}

app.once('browser-window-created', (_event, win) => {
  if (config.get('options.overrideUserAgent')) {
    // User agents are from https://developers.whatismybrowser.com/useragents/explore/
    const originalUserAgent = win.webContents.userAgent;
    const userAgents = {
      mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.152 Safari/537.36',
      windows:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.152 Safari/537.36',
      linux:
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.152 Safari/537.36',
    };

    let updatedUserAgent = userAgents.linux;
    if (is.macOS()) {
      updatedUserAgent = userAgents.mac;
    } else if (is.windows()) {
      updatedUserAgent = userAgents.windows;
    }

    win.webContents.userAgent = updatedUserAgent;
    app.userAgentFallback = updatedUserAgent;

    win.webContents.session.webRequest.onBeforeSendHeaders((details, cb) => {
      // This will only happen if login failed, and "retry" was pressed
      let isAccountsGoogle = false;
      try {
        const currentOrigin = new URL(win.webContents.getURL()).origin;
        const detailsOrigin = new URL(details.url).origin;
        isAccountsGoogle =
          currentOrigin === 'https://accounts.google.com' &&
          detailsOrigin === 'https://accounts.google.com';
      } catch {
        isAccountsGoogle = false;
      }

      if (isAccountsGoogle) {
        details.requestHeaders['User-Agent'] = originalUserAgent;
      }

      cb({ requestHeaders: details.requestHeaders });
    });
  }

  setupSongInfo(win);
  setupAppControls();

  win.webContents.on(
    'did-fail-load',
    (
      _event,
      errorCode,
      errorDescription,
      validatedURL,
      isMainFrame,
      frameProcessId,
      frameRoutingId,
    ) => {
      const log = JSON.stringify(
        {
          error: 'did-fail-load',
          errorCode,
          errorDescription,
          validatedURL,
          isMainFrame,
          frameProcessId,
          frameRoutingId,
        },
        null,
        '\t',
      );
      if (is.dev()) {
        console.log(log);
      }

      // Guard against malformed validatedURL strings that would throw in the URL constructor
      let validatedHostname = '';
      try {
        validatedHostname = new URL(validatedURL).hostname;
      } catch {
        // If URL parsing fails, treat as non-doubleclick and show error
      }

      const isDoubleClick =
        validatedHostname === 'doubleclick.net' ||
        validatedHostname.endsWith('.doubleclick.net');

      if (
        errorCode !== -3 &&
        // Workaround for #2435
        !isDoubleClick
      ) {
        // -3 is a false positive
        win.webContents.send('log', log);
        win.webContents.loadFile(ErrorHtmlAsset).catch(() => {});
      }
    },
  );

  win.webContents.on('will-prevent-unload', (event) => {
    event.preventDefault();
  });

  const customWindowTitle = config.get('options.customWindowTitle');

  if (customWindowTitle) {
    win.on('page-title-updated', (event) => {
      event.preventDefault();
      win.setTitle(customWindowTitle);
    });
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }

  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});

app.on('activate', async () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    mainWindow = await createMainWindow();
  } else if (!mainWindow.isVisible()) {
    mainWindow.show();
  }
});

const getDefaultLocale = async (locale: string) =>
  Object.keys(await languageResources()).includes(locale) ? locale : null;

function setupAboutPanel() {
  const iconPath = path.join(app.getAppPath(), 'assets', 'icon.png');
  app.setAboutPanelOptions({
    applicationName: APPLICATION_NAME,
    applicationVersion: packageJson.version,
    version: packageJson.version,
    copyright: `Copyright © ${new Date().getFullYear()} th-ch\nHardening & Optimize by alsyundawy`,
    credits: 'Hardening & Optimize by alsyundawy',
    authors: ['th-ch', 'alsyundawy'],
    website: 'https://github.com/alsyundawy/pear-desktop-mac',
    iconPath,
  });
}

function setupCacheReset() {
  if (config.get('options.autoResetAppCache')) {
    // Clear cache after 20s
    const clearCacheTimeout = setTimeout(() => {
      if (is.dev()) {
        console.log(
          LoggerPrefix,
          t('main.console.when-ready.clearing-cache-after-20s'),
        );
      }

      session.defaultSession.clearCache().catch(() => {});
      clearTimeout(clearCacheTimeout);
    }, 20_000);
  }
}

function setupWindowsShortcut() {
  if (!is.windows()) {
    return;
  }
  const appID =
    'com.github.th-ch.\u0079\u006f\u0075\u0074\u0075\u0062\u0065\u002d\u006d\u0075\u0073\u0069\u0063';
  app.setAppUserModelId(appID);
  const appLocation = process.execPath;
  const appData = app.getPath('appData');
  // Check shortcut validity if not in dev mode / running portable app
  if (
    !is.dev() &&
    !appLocation.startsWith(path.join(appData, '..', 'Local', 'Temp'))
  ) {
    const shortcutPath = path.join(
      appData,
      'Microsoft',
      'Windows',
      'Start Menu',
      'Programs',
      `${APPLICATION_NAME}.lnk`,
    );
    let operation: 'create' | 'update' | null = null;
    try {
      // Check if shortcut is registered and valid
      const shortcutDetails = shell.readShortcutLink(shortcutPath); // Throw error if it doesn't exist yet
      if (
        shortcutDetails.target !== appLocation ||
        shortcutDetails.appUserModelId !== appID
      ) {
        operation = 'update';
      }
    } catch {
      operation = 'create';
    }

    if (operation) {
      shell.writeShortcutLink(shortcutPath, operation, {
        target: appLocation,
        cwd: path.dirname(appLocation),
        description: `${APPLICATION_NAME} Desktop App - including custom plugins`,
        appUserModelId: appID,
      });
    }
  }
}

function setupAutoUpdates() {
  if (is.dev() || isTesting() || !config.get('options.autoUpdates')) {
    return;
  }
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'alsyundawy',
    repo: 'pear-desktop-mac',
  });
  const updateTimeout = setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify().catch(() => {});
    clearTimeout(updateTimeout);
  }, 2000);
  autoUpdater.on('update-available', async () => {
    const downloadLink =
      'https://github.com/alsyundawy/pear-desktop-mac/releases/latest';
    const dialogOptions: Electron.MessageBoxOptions = {
      type: 'info',
      buttons: [
        t('main.dialog.update-available.buttons.ok'),
        t('main.dialog.update-available.buttons.download'),
        t('main.dialog.update-available.buttons.disable'),
      ],
      title: t('main.dialog.update-available.title'),
      message: t('main.dialog.update-available.message'),
      detail: t('main.dialog.update-available.detail', { downloadLink }),
      defaultId: 1,
      cancelId: 0,
    };

    try {
      const dialogOutput = mainWindow
        ? await dialog.showMessageBox(mainWindow, dialogOptions)
        : await dialog.showMessageBox(dialogOptions);

      if (dialogOutput.response === 1) {
        await shell.openExternal(downloadLink);
      } else if (dialogOutput.response === 2) {
        config.set('options.autoUpdates', false);
      }
    } catch (err: unknown) {
      console.error(LoggerPrefix, 'Update dialog error:', err);
    }
  });
}

// NOSONAR(typescript:S7785) - Top-level await on app.whenReady causes an Electron event loop deadlock
app
  .whenReady()
  .then(async () => {
    session.defaultSession.setSpellCheckerEnabled(false);
    try {
      await clearStaleCodeCaches();
    } catch (error) {
      console.error(LoggerPrefix, 'Failed to clear stale code caches:', error);
    }

    setupAboutPanel();

    if (!config.get('options.language')) {
      const locale = await getDefaultLocale(app.getLocale());
      if (locale) {
        config.set('options.language', locale);
      }
    }

    await loadI18n();
    await setLanguage(config.get('options.language') ?? 'en');
    console.log(LoggerPrefix, t('main.console.i18n.loaded'));

    setupCacheReset();
    setupWindowsShortcut();

    ipcMain.on('get-renderer-script', (event) => {
      // Inject index.html file as string using insertAdjacentHTML
      // In dev mode, get string from process.env.VITE_DEV_SERVER_URL, else use fs.readFileSync
      if (is.dev() && process.env.ELECTRON_RENDERER_URL) {
        // HACK: to make vite work with electron renderer (supports hot reload)
        event.returnValue = [
          null,
          `
        console.log('${LoggerPrefix}', 'Loading vite from dev server');
        (async () => {
          await new Promise((resolve) => {
            if (document.readyState === 'loading') {
              console.log('${LoggerPrefix}', 'Waiting for DOM to load');
              document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
            } else {
              resolve();
            }
          });
          const viteScript = document.createElement('script');
          viteScript.type = 'module';
          viteScript.src = '${process.env.ELECTRON_RENDERER_URL}/@vite/client';
          const rendererScript = document.createElement('script');
          rendererScript.type = 'module';
          rendererScript.src = '${process.env.ELECTRON_RENDERER_URL}/renderer.ts';
          document.body.appendChild(viteScript);
          document.body.appendChild(rendererScript);
        })();
        0
      `,
        ];
      } else {
        const rendererPath = path.join(__dirname, '..', 'renderer');
        const indexHTML = parse(
          fs.readFileSync(path.join(rendererPath, 'index.html'), 'utf-8'),
        );
        const scriptSrc = indexHTML.querySelector('script')!;
        const scriptPath = path.join(
          rendererPath,
          scriptSrc.getAttribute('src')!,
        );
        const scriptString = fs.readFileSync(scriptPath, 'utf-8');
        event.returnValue = [
          url.pathToFileURL(scriptPath).toString(),
          scriptString + ';0',
        ];
      }
    });

    mainWindow = await createMainWindow();
    await setApplicationMenu(mainWindow);
    await refreshMenu(mainWindow);
    setUpTray(app, mainWindow);

    setupProtocolHandler(mainWindow);

    app.on('second-instance', (_, commandLine) => {
      const uri = `${APP_PROTOCOL}://`;
      const protocolArgv = commandLine.find((arg) => arg.startsWith(uri));
      if (protocolArgv) {
        const lastIndex = protocolArgv.endsWith('/') ? -1 : undefined;
        const command = protocolArgv.slice(uri.length, lastIndex);
        if (is.dev()) {
          console.debug(
            LoggerPrefix,
            t('main.console.second-instance.receive-command', { command }),
          );
        }

        const splited = decodeURIComponent(command).split(' ');

        handleProtocol(splited.shift()!, ...splited);
        return;
      }

      if (!mainWindow) {
        return;
      }

      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }

      if (!mainWindow.isVisible()) {
        mainWindow.show();
      }

      mainWindow.focus();
    });

    // Autostart at login
    app.setLoginItemSettings({
      openAtLogin: config.get('options.startAtLogin'),
    });

    setupAutoUpdates();

    if (
      !isTesting() &&
      config.get('options.hideMenu') &&
      !config.get('options.hideMenuWarned')
    ) {
      try {
        await dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: t('main.dialog.hide-menu-enabled.title'),
          message: t('main.dialog.hide-menu-enabled.message'),
        });
      } catch {
        // Dialog closed
      }
      config.set('options.hideMenuWarned', true);
    }

    // Optimized for Mac OS X
    if (is.macOS() && !config.get('options.appVisible')) {
      app.dock?.hide();
    }

    let forceQuit = false;
    app.on('before-quit', () => {
      forceQuit = true;
    });

    if (is.macOS() || config.get('options.tray')) {
      mainWindow.on('close', (event) => {
        // Hide the window instead of quitting (quit is available in tray options)
        if (!forceQuit) {
          event.preventDefault();
          mainWindow!.hide();
        }
      });
    }
  })
  /* NOSONAR(typescript:S7785) */ .catch((err: unknown) => {
    console.error(LoggerPrefix, 'Error during app startup:', err);
  });

function showUnresponsiveDialog(
  win: BrowserWindow,
  details: Electron.RenderProcessGoneDetails,
) {
  if (details) {
    console.error(
      LoggerPrefix,
      t('main.console.unresponsive.details', {
        error: JSON.stringify(details, null, '\t'),
      }),
    );
  }

  dialog
    .showMessageBox(win, {
      type: 'error',
      title: t('main.dialog.unresponsive.title'),
      message: t('main.dialog.unresponsive.message'),
      detail: t('main.dialog.unresponsive.detail'),
      buttons: [
        t('main.dialog.unresponsive.buttons.wait'),
        t('main.dialog.unresponsive.buttons.relaunch'),
        t('main.dialog.unresponsive.buttons.quit'),
      ],
      cancelId: 0,
    })
    .then((result) => {
      if (result.response === 1) {
        restart();
      } else if (result.response === 2) {
        app.quit();
      }
    })
    .catch((err: unknown) => {
      console.error(LoggerPrefix, 'Unresponsive dialog error:', err);
    });
}

function removeContentSecurityPolicy(
  betterSession: BetterSession = session.defaultSession as BetterSession,
) {
  // Allows defining multiple "onHeadersReceived" listeners
  // by enhancing the session.
  // Some plugins (e.g. adblocker) also define a "onHeadersReceived" listener
  enhanceWebRequest(betterSession);

  // Custom listener to tweak the content security policy
  betterSession.webRequest.onHeadersReceived((details, callback) => {
    details.responseHeaders ??= {};

    // Guard against malformed request URLs that would throw in the URL constructor
    let requestProtocol = '';
    try {
      requestProtocol = new URL(details.url).protocol;
    } catch {
      callback({ cancel: false, responseHeaders: details.responseHeaders });
      return;
    }

    if (requestProtocol === 'https:') {
      // Remove the content security policy
      delete details.responseHeaders['content-security-policy-report-only'];
      delete details.responseHeaders['Content-Security-Policy-Report-Only'];
      delete details.responseHeaders['content-security-policy'];
      delete details.responseHeaders['Content-Security-Policy'];

      if (
        !details.responseHeaders['access-control-allow-origin'] &&
        !details.responseHeaders['Access-Control-Allow-Origin']
      ) {
        details.responseHeaders['access-control-allow-origin'] = [
          'https://music.\u0079\u006f\u0075\u0074\u0075\u0062\u0065.com',
        ];
      }
    }

    callback({ cancel: false, responseHeaders: details.responseHeaders });
  });

  // When multiple listeners are defined, apply them all
  betterSession.webRequest.setResolver(
    'onHeadersReceived',
    async (listeners) => {
      return listeners.reduce(
        async (accumulator, listener) => {
          const acc = await accumulator;
          if (acc.cancel) {
            return acc;
          }

          const result = await listener.apply();
          return { ...acc, ...result };
        },
        Promise.resolve({ cancel: false }),
      );
    },
  );
}
