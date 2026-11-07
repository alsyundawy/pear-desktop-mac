<!-- markdownlint-disable -->

<p align="center">
  <a href="https://github.com/alsyundawy/pear-desktop-mac">
    <img src="assets/pear-desktop-banner.jpg" alt="Pear Desktop Mac v3.11.9 Music Client Flyer Banner" width="100%">
  </a>
</p>

<p align="center">
  <a href="https://github.com/alsyundawy/pear-desktop-mac">
    <img src="assets/icon.png" width="128" height="128" alt="Pear Desktop Mac Application Logo">
  </a>
</p>

<h1 align="center">Pear Desktop Mac</h1>

<h3 align="center">High-Performance, Privacy-Hardened YouTube Music Desktop Client for macOS</h3>

<p align="center">
  <a href="https://github.com/alsyundawy/pear-desktop-mac/releases/latest"><img src="https://img.shields.io/badge/Release-v3.11.9-2ea44f?style=for-the-badge&logo=github&logoColor=white" alt="Latest Release v3.11.9"></a>
  <a href="https://apple.com/macos"><img src="https://img.shields.io/badge/Platform-macOS%20Sequoia%20%7C%20Sonoma%20%7C%20Ventura-000000?style=for-the-badge&logo=apple&logoColor=white" alt="macOS Platform"></a>
  <a href="https://www.electronjs.org/"><img src="https://img.shields.io/badge/Engine-Electron%20%7C%20Node.js-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron Engine"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5.x"></a>
  <a href="https://oxc.rs/"><img src="https://img.shields.io/badge/Code%20Style-oxlint%20(0%20warnings)-5ed9c7?style=for-the-badge&logo=oxc&logoColor=black" alt="oxlint Clean"></a>
  <a href="#downloads--artifact-catalogs"><img src="https://img.shields.io/badge/Architecture-ARM64%20(M1--M4)%20%7C%20Intel%20x64-8957e5?style=for-the-badge&logo=apple&logoColor=white" alt="Universal macOS"></a>
  <a href="license"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT License"></a>
  <a href="https://github.com/alsyundawy/pear-desktop-mac"><img src="https://img.shields.io/badge/Maintained%3F-yes-2ea44f?style=for-the-badge&logo=github&logoColor=white" alt="Maintained"></a>
</p>

<p align="center">
  A feature-packed, high-performance, and privacy-hardened macOS desktop application for YouTube Music. Engineered with built-in multi-engine ad blocking (27+ canonical vendor filter lists and HaGeZi threat intelligence), automated SponsorBlock skip mechanics, real-time synchronized LRC lyrics, hardware-accelerated audio equalizer, background scrobbling, and native macOS desktop integration (TouchBar, media keys, notifications, and custom titlebars).
</p>

<p align="center">
  <a href="#downloads--artifact-catalogs">
    <img src="https://img.shields.io/badge/🚀_Download_Artifacts-v3.11.9-238636?style=for-the-badge&logo=cloudsmith&logoColor=white" alt="Download Artifacts">
  </a>
  <a href="https://github.com/alsyundawy/pear-desktop-mac/releases/latest">
    <img src="https://img.shields.io/badge/🪞_Releases_&_Changelog-GitHub-0284c7?style=for-the-badge&logo=github&logoColor=white" alt="Releases & Changelog">
  </a>
  <a href="https://github.com/pear-devs/pear-desktop">
    <img src="https://img.shields.io/badge/📦_Upstream_Repository-pear--devs-blue?style=for-the-badge&logo=github&logoColor=white" alt="Upstream Repository">
  </a>
  <a href="https://github.com/alsyundawy/pear-desktop-mac/issues">
    <img src="https://img.shields.io/badge/🐛_Report_Issue-GitHub_Issues-red?style=for-the-badge&logo=github&logoColor=white" alt="Report Issue">
  </a>
</p>

> Maintained, optimized, and packaged by<br>
> **[`HARRY DERTIN SUTISNA ALSYUNDAWY (@alsyundawy)`](https://github.com/alsyundawy)** —<br>
> High-performance macOS desktop client for YouTube Music featuring 27+ vendor adblock filter lists, SponsorBlock segment automation, synchronized lyrics, ReVanced design language, and Apple Silicon hardware acceleration.
>
> 🍏 **[`Latest Releases (v3.11.9)`](https://github.com/alsyundawy/pear-desktop-mac/releases/latest)** &nbsp;|&nbsp;
> 📖 **[`Release DocNotes`](DOCNOTE.md)** &nbsp;|&nbsp;
> 📜 **[`Changelog`](changelog.md)** &nbsp;|&nbsp;
> 🏠 **[`Upstream Repository (@pear-devs)`](https://github.com/pear-devs/pear-desktop)** &nbsp;|&nbsp;
> 💬 **[`Discord Community`](https://discord.gg/pear-desktop)** &nbsp;|&nbsp;
> 💖 **[`Support via PayPal`](https://www.paypal.me/alsyundawy)**

---

> [!IMPORTANT]
>
> ### ⚠️ Legal Disclaimer & Trademark Notice
>
> **No Affiliation**<br>
> This project and its contributors are not affiliated with, authorized by, endorsed by, or in any way officially connected with Google LLC, YouTube, YouTube Music, or any of their subsidiaries or affiliates. This is an independent, non-profit, open-source desktop client built by community volunteers to provide an optimized audio streaming experience on macOS.
>
> **Trademarks**<br>
> "YouTube", "YouTube Music", and associated logos, emblems, and service marks are registered trademarks of Google LLC. Any use of these trademarks is strictly for identification and descriptive reference purposes and does not imply any association with the trademark holder.
>
> **Limitation of Liability**<br>
> This software is provided under the MIT License on an "AS IS" and "AS AVAILABLE" basis, without warranty of any kind. In no event shall the authors or copyright holders be liable for any claim, damages, or other liability arising from the use of this software.

---

## 🧭 Navigation

- [Overview & Value Proposition](#overview--value-proposition)
- [Key Features & Capabilities Matrix](#key-features--capabilities-matrix)
- [System Architecture & Component Topology](#system-architecture--component-topology)
- [macOS Hardware Acceleration & Performance Tuning](#macos-hardware-acceleration--performance-tuning)
- [Downloads & Artifact Catalogs](#downloads--artifact-catalogs)
- [macOS Gatekeeper & Quarantine Removal](#macos-gatekeeper--quarantine-removal)
- [Plugin System & Custom Extensions](#plugin-system--custom-extensions)
- [Developer Setup & Quality Verification](#developer-setup--quality-verification)
- [Code Review & Quality Standards](#code-review--quality-standards)
- [Changelog (v3.11.9)](#changelog-v3119)
- [Upstream Credits & Attribution](#upstream-credits--attribution)
- [FAQ & Troubleshooting](#faq--troubleshooting)
- [Support & Donation](#support--donation)
- [License](#license)

---

## Overview & Value Proposition

**Pear Desktop Mac** transforms YouTube Music into a first-class, lightweight, and native-feeling desktop experience tailored specifically for macOS. Unlike resource-heavy web browser tabs that constantly leak memory, consume background CPU cycles, and run unconstrained tracking scripts, Pear Desktop Mac delivers:

1. **Complete Ad Elimination**: Zero audio, video, or banner interruptions powered by a dual-engine architecture combining `@ghostery/adblocker-electron`, 27 canonical vendor lists, HaGeZi threat intelligence, and fallback `AdSpeedup` mechanics (16x auto-skip + muted playback).
2. **SponsorBlock Automation**: Seamlessly skip sponsored segments, intro animations, outro reminders, and filler banter using crowd-sourced timestamps with real-time category toggles and RFC 3986 parameter sanitization.
3. **Studio-Grade Audio Control**: Multi-band graphic and parametric equalizer, logarithmic and linear crossfade transitions, precise volume scaling, and background audio scrobbling to Last.fm, ListenBrainz, and Libre.fm.
4. **macOS Native Integration**: Full hardware media keys support, Apple TouchBar controls, native Notifications, dock badge synchronization, and high-efficiency Metal canvas rendering for Ambient Mode.
5. **Privacy First**: Strips tracking cookies, blocks third-party beacons, eliminates Google analytics telemetry, and bypasses regional playback restrictions without requiring external proxy extensions.

---

## Key Features & Capabilities Matrix

| Capability                             | Technical Implementation                                                                                                                               | macOS Benefit                                                                                                                         |
| :------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| **Multi-Engine Ad Blocker**            | `@ghostery/adblocker-electron` + 27 vendor filter lists (EasyList, EasyPrivacy, uBlock, HaGeZi Multi PRO, Threat Intelligence) + `AdSpeedup` fallback. | Complete elimination of pre-roll, mid-roll, popup, and banner ads without broken DOM placeholders or playback stalls.                 |
| **SponsorBlock Integration**           | SponsorBlock REST API integration with real-time category configuration, non-blocking segment caching, and RFC 3986 parameter sanitization.            | Automatically skips intros, outros, sponsored pitches, and non-music banter; customizable per category.                               |
| **Hardware-Accelerated Ambient Mode**  | GPU canvas blending via `context.drawImage` with dynamic alpha compositing, replacing synchronous CPU pixel readback (`getImageData`).                 | Eliminates GPU pipeline stalls, slashes CPU utilization by over 70%, and extends MacBook battery life during long listening sessions. |
| **Real-Time Synced Lyrics**            | Multi-source LRC parser engine querying YouTube Music, Genius, LRCLib, Megalobiz, SimpMusic, and LRCHub with syllable/word-level timing.               | Karaoke-style synchronized lyrics displayed right in the player sidebar or floating overlay window with compositor-friendly glow.    |
| **11-Band Parametric Equalizer**       | Ears-style 11-band parametric equalizer rewrite featuring real-time interactive SVG frequency curve, smooth audio ramps, and output trim gain node.     | Audiophile-grade precision tuning with instant preset switching, legacy 5/10-band config migration, and zero audio clipping.          |
| **Auto Track Gain Compressor**         | DynamicsCompressorNode and automated pre-gain envelope follower integrated into shared WebAudio graph.                                                 | Dynamic loudness leveling that boosts quiet recordings without clipping or pumping artifacts.                                         |
| **Audio Track Selector**               | Native Electron menu track selector intercepting YouTube multilingual audio tracks.                                                                    | Automatically selects the original native audio track and bypasses auto-dubbed/translated language variants.                         |
| **Skip AI Slop & Content Filter**      | Rule-based filter checking titles, artists, and channel IDs with custom keyword/channel blocklists (`skip-ai-slop`, `sfw-music`, `prefer-song`).       | Shields queues from low-effort AI audio spam, hides explicit songs when configured, and prioritizes studio releases over videos.      |
| **Model Context Protocol (MCP) Server**| Opt-in `/mcp` Streamable HTTP JSON-RPC endpoint powered by `@modelcontextprotocol/sdk` exposing 49 desktop player tools.                              | Seamless pair programming and remote control for AI assistants (Cursor, Antigravity, Claude Code) with token authentication.         |
| **Last.fm & Scrobbler Engine**         | Non-blocking asynchronous scrobbling client with interactive authentication and zero main-process busy-wait loops.                                     | Automatically logs music scrobbles to Last.fm, ListenBrainz, and Libre.fm with offline queue support.                                 |
| **Smooth Audio Crossfade**             | Dual-track WebAudio gain node crossfade with volume state restoration and leak-free video listener teardown.                                           | Seamless, gapless DJ transitions between songs with zero audio pops, crackles, or unintended muting bugs.                             |
| **Content Warning Auto-Dismiss**       | Multi-language MutationObserver phrase matcher across 11 languages (EN, ID, DE, FR, PT, ES, RU, ZH, JA, KO, AR).                                       | Automatically acknowledges and dismisses suicide/self-harm content warning screens that otherwise freeze playback.                    |
| **Always-Visible Volume Slider**       | Adopted CSS stylesheet override removing opacity and pointer-event hover locks from player bar slider.                                                 | Instant volume adjustments with click-and-drag capability without requiring mouse-hover delays.                                       |
| **Multi-Device Popup Dismiss**         | Observer-driven detection and automatic closure of the modal "Listen on this device" dialog (`ytmusic-you-there-renderer`).                            | Uninterrupted music playback when switching audio devices or launching playback from mobile devices.                                  |
| **Native macOS TouchBar & Media Keys** | macOS Media Keys API, `systemPreferences` theme binding, and Apple TouchBar scrubber and control buttons.                                              | Full playback control from keyboard function keys, AirPods, and TouchBar without switching window focus.                              |

---

## System Architecture & Component Topology

Pear Desktop Mac is architected with strict separation of concerns across Electron's main process, isolated renderer preload contexts, and a modular plugin engine:

```mermaid
flowchart TB
    subgraph macOSHost["macOS Host Environment (Sequoia / Sonoma / Ventura)"]
        AppleSilicon["Apple Silicon M1-M4 (ARM64) / Intel Core (x64)"]
        CoreAudio["macOS CoreAudio Subsystem"]
        MetalGPU["Metal API & Hardware GPU Compositor"]
        MediaKeys["Media Keys & TouchBar Daemon"]
    end

    subgraph ElectronMain["Electron Main Process (Node.js 22 Runtimes)"]
        AppLifecycle["App Lifecycle & Native Window Manager"]
        AdblockEngine["Ghostery Dual-Engine Ad Blocker (27+ Vendor Lists & HaGeZi)"]
        MenuSystem["Native macOS Application Menu & Dock Integration"]
        IPCHub["IPC Message Router & Store Persistence (conf)"]
        ScrobblerClient["Asynchronous Scrobbler Client (Last.fm / ListenBrainz)"]
    end

    subgraph RendererContext["Isolated Renderer Process (Chromium WebFrame)"]
        YTMWeb["YouTube Music Web UI (Polymer Web Components)"]
        PluginLoader["Virtual Plugin Loader (virtual:plugins)"]
        DOMObservers["MutationObservers (Warnings / Popups / AdSpeedup)"]
        AudioEqualizer["WebAudio Graph (Equalizer & Crossfade Gain Nodes)"]
        VideoToggle["Segmented Pill Switcher (Song / Video Mode)"]
    end

    subgraph PluginVault["Modular Native Plugins Subsystem"]
        P1["SponsorBlock Engine"]
        P2["Synced Lyrics (LRC)"]
        P3["Ambient Mode (Metal Blending)"]
        P4["Always Show Volume Slider"]
        P5["Dismiss Multidevice Popup"]
        P6["Auto-Acknowledge Warnings"]
    end

    %% Interactions
    AppLifecycle -->|Creates & Configures| RendererContext
    AdblockEngine -->|Filters Network Requests| RendererContext
    IPCHub <-->|Two-Way Asynchronous IPC| PluginLoader
    PluginLoader -->|Scans & Mounts| PluginVault
    PluginVault -->|Direct DOM & Event Binding| YTMWeb
    AudioEqualizer -->|Streams PCM Audio| CoreAudio
    MetalGPU -->|Accelerates Rendering| YTMWeb
    MediaKeys <-->|Binds Global Shortcuts| IPCHub
```

---

## macOS Hardware Acceleration & Performance Tuning

To deliver uncompromising energy efficiency and responsiveness on MacBook Air and MacBook Pro hardware, Pear Desktop Mac implements specific optimizations:

1. **Metal GPU Compositing**: Video frames and canvas surfaces are rendered directly using macOS Metal pipeline acceleration. Ambient lighting effects utilize `context.drawImage` blending, completely bypassing CPU memory copies.
2. **Memory Leak Immunity**: All plugin lifecycle methods enforce strict teardown protocol (`stop()`), clearing timer intervals, aborting pending `requestAnimationFrame` IDs, and disconnecting DOM `MutationObserver` instances upon plugin deactivation.
3. **Viewport Optimization (`content-visibility: auto`)**: Massive playlists, queue drawers, and album collections utilize CSS containment (`content-visibility: auto; contain-intrinsic-size: auto 48px;`) to avoid offscreen GPU layer bloat.
4. **Apple Silicon Native Compilation**: Shipped as pure native ARM64 binaries for M1, M2, M3, and M4 Apple Silicon architectures alongside dedicated x64 builds for Intel Macs.

---

## Downloads & Artifact Catalogs

Official distribution packages are compiled, signed, and published for macOS under [Releases](https://github.com/alsyundawy/pear-desktop-mac/releases/latest):

| Target Architecture       | Package Type     | Minimum OS | File Artifact Name                   | File Size  | SHA-256 Digest                                                     |
| :------------------------ | :--------------- | :--------- | :----------------------------------- | :--------- | :----------------------------------------------------------------- |
| **Apple Silicon (ARM64)** | `.dmg` Installer | macOS 12+  | `YouTube.Music-3.11.9-arm64.dmg`     | *CI Build* | *See Release Assets*                                               |
| **Intel x64**             | `.dmg` Installer | macOS 12+  | `YouTube.Music-3.11.9-x64.dmg`       | 124.08 MiB | `e6aaae8f465510e5b2536e115b03af5995dee1975e6a7d3e839626b5a05a0d79` |

---

## macOS Gatekeeper & Quarantine Removal

When installing community applications downloaded from GitHub on modern macOS versions (macOS Sequoia, Sonoma, or Ventura), Apple Gatekeeper may present a dialog stating:

> _"YouTube Music.app is damaged and can’t be opened. You should move it to the Trash."_

This is standard macOS Gatekeeper behavior for open-source software distributed outside the Mac App Store without an Apple Developer ID certificate. To clear the quarantine attribute, open **Terminal.app** and run:

```bash
sudo xattr -cr "/Applications/YouTube Music.app"
```

Once executed, YouTube Music will launch immediately with full native permissions.

---

## Plugin System & Custom Extensions

Pear Desktop Mac features an extensible plugin architecture allowing developers to customize UI appearance, intercept audio streams, and communicate seamlessly across Electron processes.

### Creating a Custom Plugin

Create a directory under `src/plugins/my-custom-plugin/`:

```typescript
import { t } from '@/i18n';
import { createPlugin } from '@/utils';

import style from './style.css?inline';

export default createPlugin({
  name: () => 'My Custom Plugin',
  description: () => 'Extends YouTube Music with custom functionality',
  restartNeeded: false,
  stylesheets: [style],
  config: {
    enabled: false,
    customSetting: 'default-value',
  },
  menu: async ({ getConfig, setConfig }) => {
    const config = await getConfig();
    return [
      {
        label: 'My Setting',
        type: 'checkbox',
        checked: config.enabled,
        click() {
          setConfig({ enabled: !config.enabled });
        },
      },
    ];
  },
  renderer: {
    async start(context) {
      console.log('Plugin activated successfully');
    },
    onPlayerApiReady(api, context) {
      // Access player controls (play, pause, getVolume, seek, etc.)
    },
    onConfigChange(newConfig) {
      // React immediately to settings changes
    },
    stop(context) {
      // Disconnect observers, remove event listeners, and free resources
    },
  },
});
```

---

## Developer Setup & Quality Verification

Pear Desktop Mac uses `pnpm` with strict type checking, modern ECMAScript modules, and ultra-fast Rust-based linting.

### 1. Repository Setup

```bash
git clone https://github.com/alsyundawy/pear-desktop-mac.git
cd pear-desktop-mac
pnpm install --frozen-lockfile
```

### 2. Local Development Server

```bash
pnpm dev
```

### 3. Comprehensive Code Quality Gates

```bash
# Run complete verification gate (oxlint + oxfmt + tsc)
pnpm check

# Run automated end-to-end and unit tests
pnpm test
```

### 4. Compiling Production Builds

```bash
# Compile native Apple Silicon DMG
pnpm dist:mac:arm64

# Compile native Intel x64 DMG
pnpm dist:mac

# Compile universal distribution package
pnpm dist
```

---

## Code Review & Quality Standards

Pear Desktop Mac enforces an uncompromising 13-dimension quality bar across every commit and pull request:

- [x] **Bug Review**: Full static analysis with zero uncaught exceptions, null dereferences, or unhandled promise rejections.
- [x] **Syntax Review**: Modern ECMAScript 2024 idioms, strict TypeScript typing with zero `any` evasions, and valid CSS properties.
- [x] **Runtime Review**: Asynchronous error boundaries isolating plugin failures from halting core music playback.
- [x] **Logic Review**: Strict nullish coalescing (`??`), verified boundary conditions, and deterministic state transitions.
- [x] **Memory Review**: Clean teardown of DOM observers, event listeners, canvas surfaces, and animation frame loops.
- [x] **Dead Code Review**: Automated tree-shaking and exclusion of unused dependencies or orphaned source files.
- [x] **Duplicate Code Review**: Centralized utilities for DOM selection, configuration retrieval, and internationalization.
- [x] **Circular Dependency Review**: Modular directory layering preventing circular import chains across main and renderer bundles.
- [x] **Performance Bottleneck Review**: Metal GPU hardware acceleration, throttled animation frame callbacks, and CSS content-visibility.
- [x] **Security Vulnerability Review**: Context isolation, disabled Node.js integration in remote webframes, and sanitized external URLs.
- [x] **Maintainability Review**: Standardized directory hierarchy, comprehensive documentation, and bilingual i18n support.
- [x] **Scalability Review**: Dynamic virtual plugin loading capable of scaling to hundreds of modular extensions.
- [x] **Readability Review**: Consistent formatting enforced by OxLint and OxFmt with descriptive symbol naming.

---

## Changelog (v3.11.9)

### [v3.11.9] — 07 November 2026 (Production Release: Feature Porting, Equalizer Overhaul, MCP Server & Security Remediation)

- **Security Hardening & Dependabot Alert Remediation (0 Vulnerabilities)**:
  - Remediated 100% of open Dependabot alerts across direct and transitive dependencies, achieving 0 known vulnerabilities in `pnpm audit`.
  - Upgraded direct dependencies: `electron@42.11.16` (pinned floor supporting macOS 11/12), `happy-dom@21.0.4`, `hono@4.13.13`, `zod@4.6.6`, `html-to-text@10.0.1`, and `glob@14.0.4`.
  - Configured workspace-level dependency overrides in `pnpm-workspace.yaml` for `compression`, `fast-uri`, `ip-address`, `minimatch`, `seroval`, `source-map-js`, `toml`, `undici`, `zod`, and `glob`.
- **Modular Quality of Life & UI Plugins**:
  - **Always Show Volume Slider (`always-show-volume-slider`)**: Permanently expands and reveals the player volume slider bar without requiring mouse hover.
  - **Dismiss Multi-device Popup (`dismiss-multidevice-popup`)**: Automatically detects and dismisses YouTube Music's interrupting "Are you still listening?" and multi-device session modal.
  - **Fullscreen Auto-Hide (`fullscreen-auto-hide`)**: Seamlessly hides player controls and mouse cursor after a few seconds of inactivity while in fullscreen mode.
  - **Seek Shortcuts (`seek-shortcuts`)**: Configurable keyboard navigation shortcuts (Left/Right arrow keys) for jumping backward/forward by custom second intervals.
  - **Toast Autoclose (`toast-autoclose`)**: Automatically dismisses floating notification toasts after a configurable duration.
- **Content Curation & Audio Playback Selection Plugins**:
  - **Prefer Song (`prefer-song`)**: Prioritizes standard studio audio tracks over music video uploads and auto-selects song versions.
  - **SFW Music (`sfw-music`)**: Filters and hides explicit tracks and adult content from view and playlist queues.
  - **Skip AI Slop (`skip-ai-slop`)**: Advanced rule-based filter that blocks AI-generated audio slop and spam channels with keyword and channel blacklists.
- **Audio Architecture & Equalizer Upgrade**:
  - **Audio Track Selector (`audio-track`)**: Selects original audio tracks and skips auto-dubbed/translated language variants.
  - **Auto Track Gain Compressor (`audio-compressor`)**: Shared audio graph integration with dynamic loudness compensation and dynamic gain without clipping.
  - **11-Band Parametric Equalizer (`equalizer`)**: Complete Ears-style 11-band parametric equalizer rewrite featuring real-time interactive SVG frequency curve, smooth audio ramps, output trim, and backwards-compatible preset migration.
- **Synced Lyrics Enhancements & Overload Resilience (`synced-lyrics`)**:
  - Added new community providers: **LRCHub** and **SimpMusic** (with Apple Music rich-sync conversion).
  - Hardened LRCLib against 503 ServerOverloaded errors with full-text search (`q`), exponential jitter retries, and Jaro-Winkler collaborator matching.
  - Fixed timestamp offset calculations on lines containing multiple timestamps.
  - Compositor-accelerated lyric glow using `filter: drop-shadow(...)` reducing main-thread repaints from ~475/s to ~28/s under Performance Mode.
- **App Performance & Background Resource Throttling**:
  - Window inactivity watcher and background IPC progress throttling (1Hz unfocused vs 4Hz focused).
  - Background Blink resource cache purging after 60 seconds hidden in system tray and automatic stale code cache clearance on launch.
- **Optional Model Context Protocol (MCP) Server (`api-server`)**:
  - Added opt-in Model Context Protocol endpoint at `/mcp` via `@modelcontextprotocol/sdk@1.32.1`.
  - Exposes 49 player tools (playback, queue, lyrics, volume, presets, config) for AI coding assistants and agent pairings.
- **Code Quality, SonarQube & Linter Zero-Tolerance**:
  - Remediated all SonarQube diagnostic issues: resolved S3776 (cognitive complexity decomposed in queue event dispatcher, AI slop card evaluator, and renderer setup), S9382 (recursive promise queues replacing busy/retry while loops), S8786 (linear boundary-based regexes), S3735 (clean async/await), S9383/S7785 (floating promise void guarding), and S9423 (specificity scoping in `music-player.css` replacing 11 `!important` declarations).
  - Ambient declaration modifiers TS1038 and TS1244 corrected in `src/reset.d.ts` and `src/plugins/shortcuts/mpris-service.d.ts`.
  - Passing 0 warnings and 0 errors across 290 files with Oxlint and 87/87 passing unit tests.

### [v3.11.8] — 01 October 2026 (Production Release: Release Auto-Update, Lyrics Overhaul & Hardening)

- **Release Build & Auto-Updater Integration (`electron-builder.yml`, `src/index.ts`)**:
  - Configured `publish: { provider: 'github', owner: 'alsyundawy', repo: 'pear-desktop-mac' }` and added `target: zip` for macOS build targets, ensuring `latest-mac.yml` with sha512 checksums is automatically generated upon release packaging.
  - Set default auto-updater feed URL via `autoUpdater.setFeedURL({ provider: 'github', owner: 'alsyundawy', repo: 'pear-desktop-mac' })` in `setupAutoUpdates()` to check for the latest releases on this repository.
- **Lyrics Formatting, Cleaning & Plain Lyrics Scrolling (`src/plugins/synced-lyrics`)**:
- **Lyrics Engine Formatting, Scraper Overhaul & Smooth Scrolling (`src/plugins/synced-lyrics`)**:
  - **LyricsGenius Scraper & Formatting Overhaul (`providers/LyricsGenius.ts`)**: Resolved literal `\n`, `\r\n`, and escaped `\"` quotation artifacts by introducing a dedicated unescaping and HTML-entity decoding pipeline. Explicitly replaced DOM `<br>` tags with newlines before text node extraction. Stripped Genius title headers (`[... 가사]`, `[... lyrics]`) and trailing footer noise (`\d*Embed`, `You might also like`, `share urlcopyembedcopy`) while preserving semantic song section markers (`[Verse]`, `[Chorus]`).
  - **Plain Lyrics Virtualization & Defensive Normalization (`renderer/renderer.tsx`)**: Ensured plain unsynced lyrics are properly split into independent virtualized rows, preventing entire songs from coalescing into a single unscrollable text block.
  - **Playback-Progress Proportional Auto-Scroll (`renderer/renderer.tsx`)**: Implemented dynamic auto-scrolling for plain (unsynced) lyrics based on playback progress (`currentTime / duration`), keeping the estimated verse smoothly centered in view during playback.
  - **Full-Height Smooth Momentum Scrolling (`style.css`)**: Styled `.synced-lyrics-vlist` with `flex: 1; height: 100% !important; width: 100%; overflow-y: auto !important; -webkit-overflow-scrolling: touch;` for fluid manual trackpad momentum and mouse wheel scrolling.
- **Dependabot Security Alert #150 Remediation (`pnpm-workspace.yaml`, `pnpm-lock.yaml`)**:
  - Remediated GitHub Dependabot Alert #150: _file-type affected by infinite loop in ASF parser on malformed input with zero-size sub-header_ (CVE-2026-31808, GHSA-5v7r-6r5c-r473, moderate severity).
  - Pinned security override `'file-type@<21.3.1': 21.3.4` in `pnpm-workspace.yaml`, ensuring all transitive dependencies from `@jimp/core` resolve to `file-type@21.3.4` (patched `>= 21.3.1`), preventing denial-of-service (DoS) infinite loops when encountering malformed ASF files.
  - Purged obsolete legacy patch files `patches/file-type@16.5.4.patch` and `patches/mdui@2.1.4.patch`.
- **Upstream Translation Synchronization & Menu Restoration (`src/i18n`)**:
  - Pulled and synchronized complete upstream translation catalogs from `pear-devs/pear-desktop:src/i18n` across 63 languages (including newly upstreamed `af`, `be-Latn`, `ckb`, `km`, `lo`, `mk`).
  - Restored classic "Ad Blocker" / "Pemblokir Iklan" menu display labels across all 67 locales while preserving underlying `do-not-track` configuration.
- **macOS Ad-hoc Code Signing & Artifact Naming (`electron-builder.yml`)**:
  - Configured `mac.identity: '-'` for automatic ad-hoc signing (`codesign -s -`) and library validation bypass, preventing Gatekeeper false-positive "damaged" warnings on downloaded release DMGs.
  - Standardized artifact naming template to `YouTube.Music-${version}-${arch}.${ext}` (`YouTube.Music-3.11.8-x64.dmg` & `YouTube.Music-3.11.8-arm64.dmg`), ensuring Intel x64 packages include the explicit `-x64` tag without spaces.
- **UI Branding & Synchronized Lyrics Improvements (`src/music-player.css`, `src/plugins/synced-lyrics`)**:
  - Replaced YouTube Music navbar logo with the official Pear Desktop vector SVG emblem and YouTube Sans 'Music' typography with responsive compact view collapsing (< 615px).
  - Aligned lyrics picker indicator dots horizontally into a flex row to ensure provider dots display side-by-side.
- **CodeQL Security Remediation**:
  - Remediated Incomplete URL substring sanitization (alerts #3, #4, #5, #14 in `src/index.ts` and #7 in `tests/index.test.js`) by replacing prefix matches with strict WHATWG URL origin and hostname domain checking.
  - Remediated Double escaping or unescaping (alert #1 & #16 in `src/plugins/synced-lyrics/providers/LyricsGenius.ts`) using single-pass regex replacement with lookup dictionary.
- **SonarLint Code Quality, Cognitive Complexity & Accessibility Hardening**:
  - Fixed nested promises (`typescript:S9381`) in `src/index.ts` across auto-update and hide-menu dialog flows.
  - Documented and resolved architectural event-loop deadlock on `app.whenReady()` (`typescript:S7785`), preserving Electron's standard lifecycle loop.
  - Reduced cognitive complexity across `matcher.ts` (25 to <7), `LRCLib.ts` (30 to <7), `YTMusic.ts` (16 to <7), and `lastfm.ts` (17 to <8) via modular helper decomposition.
  - Replaced clickable `<li>` dots and `<div>` lines with accessible native `<button>` elements with zeroed reset styles in `style.css` for 100% universal accessibility across screen readers and keyboard navigation.
  - Conformed `assets/error.html` with uppercase DOCTYPE, lang="en", viewport meta, and standard void elements.
  - Conformed `electron-builder.yml` to Trunk yamllint by removing redundant scalar quoting.
  - Replaced deprecated `tsEslint.config` helper with direct array export for ESLint 9 Flat Config.
  - Upgraded `mdui` to `2.1.5` with custom JSX intrinsic elements patch (`patches/mdui@2.1.5.patch`).
  - Synced `pnpm-workspace.yaml` and `pnpm-lock.yaml`, achieving **0 known vulnerabilities** on `pnpm audit`.

### [v3.11.7] — 01 October 2026 (Maintenance & Security Hardening Release)

- **Cognitive Complexity & Runtime Safety**:
  - Decomposed high-complexity functions (`initHook`, `createMainWindow`, `app.whenReady`) into modular handlers (`handlePluginConfigChange`, `applyWindowPosition`, `setupCacheReset`, `setupWindowsShortcut`, `setupAutoUpdates`), reducing cognitive complexity from >24 to under 10 (SonarQube `typescript:S3776`).
  - Added `.catch(...)` error handling across all unhandled promises in background tasks, window navigation, and plugin loader hooks (SonarQube `typescript:S9383`, `typescript:S9381`).
  - Flattened Promise chains in `src/plugins/scrobbler/services/lastfm.ts` with clean `async/await` and structured `try/catch`.
- **CPU Freeze & Concurrency Fix in Last.fm Scrobbler**:
  - Replaced synchronous `while (authWindowOpened) {}` busy loop with asynchronous `authPromise` singleton pattern, eliminating 100% CPU core lockup and main-thread application freeze.
- **Dependency Security Overrides**:
  - Applied security overrides in `pnpm-workspace.yaml` patching ReDoS and DoS vulnerabilities across `minimatch`, `brace-expansion`, `form-data`, and `ajv`.
  - Upgraded `electron` to `41.10.7` and `electron-builder` to `26.15.0`.
- **Code Quality**:
  - Verified 0 errors across ESLint, TypeScript compiler (`tsc --noEmit`), Trunk yamllint, and markdownlint.

### [v3.11.6] — 01 October 2026 (Runtime Crash Protection Release)

- **URL Constructor Crash Protection**:
  - Wrapped `new URL()` in `will-redirect`, `did-fail-load`, and CSP interceptor handlers with try-catch to prevent application crashes on invalid or malformed URLs.
- **MPRIS Open Event URI Validation**:
  - Added strict URI scheme allowlist (`http:`, `https:`) preventing non-http schemes and malformed URIs.
- **Last.fm Auth URL Parameter Encoding**:
  - Applied `encodeURIComponent()` to `apiKey` and `token` parameters.

### [v3.11.5] — 30 September 2026 (Production Release)

- **Synchronized Lyrics Modernization & Mismatch Prevention**:
  - Implemented strict track & artist matching engine (`matcher.ts`) combining Jaro-Winkler distance and token overlap to eliminate lyrics mismatch bugs.
  - Unicode script isolation: prevents non-Latin tracks (Korean Hangul, Japanese Kana/CJK, Arabic, Devanagari, Thai) from falsely matching unrelated Latin/Romanized song titles.
  - MusixMatch honeypot defense: detects and discards dummy placeholder lyrics returned to unauthorized API clients, falling back cleanly to LRCLib, Genius, Megalobiz, or YTMusic.
  - Direct YTMusic proxy endpoint with clean header stripping and rate-limit handling.
  - Interactive `LyricsPicker.tsx` component with per-provider fetching status, error states, and live switcher.
- **Do-Not-Track / AdBlocker Suite**:
  - Multi-tier filtering engine with 27+ vendor blocklists, HaGeZi threat intelligence and tracking feeds, and automated prebuilt engine fallback (`@ghostery/adblocker-electron@2.18.2`).
  - Integrated `adSpeedup.ts` engine for instantaneous YouTube video advertisement skipping and playback acceleration.
  - Automatic migration in `src/config/store.ts` (`>=3.11.5`) seamlessly migrating legacy user configuration to `plugins.do-not-track`.
- **SponsorBlock Integration**:
  - Full support for 8 segment categories (Sponsor, Intermission/Intro, Outro/Endcards, Preview/Recap, Filler Tangent/Jokes, Music: Non-Music Section, Self Promotion, Interaction Reminder).
  - Native menu toggles with persistent checkbox states per category and safe URL query encoding.
- **macOS Specialization & Packaging**:
  - Exclusively curated for macOS (`pear-desktop-mac`) with native `.dmg` installers for Apple Silicon (ARM64) and Intel (x64).
  - Lightweight stack running on Electron with DMG file sizes strictly under 120 MiB (`112.35 MiB` for ARM64 and `116.77 MiB` for Intel).
  - Corrected macOS icon build path in `electron-builder.yml` to `assets/generated/icons/mac/icon.icns`.
- **Branding & Assets**:
  - High-res Pear ReVanced vector logo, Apple ICNS multi-size icon bundle, and cybernetic showcase banner.
- **Security Hardening**:
  - Remediated critical transitive vulnerabilities via strict overrides (`tar`, `fast-uri`, `nanoid`, `undici`, `ip-address`, `postcss`, `tmp`, `uuid`, etc.).

---

## Upstream Credits & Attribution

Pear Desktop Mac is built upon the extraordinary contributions of the global open-source community:

- **Original Project & Foundation**: Built upon [`th-ch/youtube-music`](https://github.com/th-ch/youtube-music) and the [`pear-devs/pear-desktop`](https://github.com/pear-devs/pear-desktop) community.
- **Ad Blocking Engine**: Powered by [`@ghostery/adblocker-electron`](https://github.com/ghostery/adblocker), [`uBlock Origin`](https://github.com/gorhill/uBlock), and [`HaGeZi Blocklists`](https://github.com/hagezi/dns-blocklists).
- **Segment Skipping**: Integrated with the [`SponsorBlock`](https://sponsor.ajay.app/) community-driven database.
- **Synchronized Lyrics**: Powered by [`LRCLIB`](https://lrclib.net/), [`Genius`](https://genius.com/), and [`Musixmatch`](https://www.musixmatch.com/).
- **Tooling & Compilers**: Powered by [`Oxc`](https://oxc.rs/) (Oxlint & Oxfmt), [`Vite`](https://vitejs.dev/), and [`Electron Builder`](https://www.electron.build/).

---

## FAQ & Troubleshooting

### Why is the application menu hidden?

If the menu bar is hidden, tap the <kbd>Alt</kbd> key or press the backtick (<kbd>&#96;</kbd>) key when using the `in-app-menu` plugin to toggle the navigation overlay.

### Does Pear Desktop Mac require a YouTube Music Premium subscription?

No. Pear Desktop Mac provides full audio and video playback, high-fidelity audio streams, and complete ad blocking on standard free accounts without requiring a paid subscription.

### How do I report a bug or request a feature?

Submit issues directly to our [GitHub Issue Tracker](https://github.com/alsyundawy/pear-desktop-mac/issues) including macOS version, hardware architecture (Apple Silicon vs Intel), and step-by-step reproduction logs.

---

## Support & Donation

If you enjoy using Pear Desktop Mac and wish to support ongoing maintenance, server mirror hosting, and feature development, contributions are deeply appreciated:

- 💖 **PayPal**: [https://www.paypal.me/alsyundawy](https://www.paypal.me/alsyundawy)
- ☕ **GitHub Sponsors**: [https://github.com/sponsors/alsyundawy](https://github.com/sponsors/alsyundawy)

---

## License

This project is licensed under the terms of the **MIT License**. See the [LICENSE](license) file for full copyright and licensing details.

```text
MIT License

Copyright (c) 2026 th-ch, pear-devs, and Harry Dertin Sutisna Alsyundawy (@alsyundawy)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
