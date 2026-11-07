<!-- markdownlint-disable -->

<p align="center">
  <a href="https://github.com/alsyundawy/pear-desktop-mac">
    <img src="assets/icon.png" width="96" height="96" alt="Pear Desktop Mac Application Logo">
  </a>
</p>

# Memory & CPU Performance Profiling Guide: Pear Desktop

This document outlines the standard operating procedures for auditing, profiling, and benchmarking memory and CPU performance across main and renderer processes.

---

## 1. Renderer Heap Snapshots (Chrome DevTools)

1. Launch Pear Desktop with DevTools enabled:

  ```bash
  pnpm dev
  ```

2. Press `Cmd+Option+I` (macOS) or `Ctrl+Shift+I` (Windows/Linux) to open Chromium DevTools.
3. Switch to the **Memory** panel:
  - Select **Heap snapshot**
  - Click **Take snapshot** (Baseline `Snapshot 1`)
4. Perform the user scenario under test (e.g., switch 30 songs, toggle video mode, open/close settings).
5. Trigger manual Garbage Collection (trash can icon in DevTools).
6. Click **Take snapshot** again (`Snapshot 2`).
7. Switch view dropdown from **Summary** to **Comparison** against `Snapshot 1`:
  - Inspect **# Delta** and **Alloc. Size**:
  - Check for detached DOM trees (`Detached HTMLDivElement`, `Detached HTMLButtonElement`).
  - Check for uncollected closures or listeners in `event_listeners`.

---

## 2. Main Process Profiling (`--inspect`)

1. Start Electron with the Node inspector attached to the main process:

  ```bash
  pnpm start --inspect=9229
  ```

2. Open Google Chrome or Chromium and navigate to:

  ```text
  chrome://inspect
  ```

3. Under **Remote Target**, locate `Pear Desktop / Electron Main Process` and click **inspect**.
4. In the dedicated Node DevTools:
  - Run **Profiler** $\rightarrow$ **CPU Profile** during application startup or heavy IPC events to detect main thread stalls.
  - Run **Memory** $\rightarrow$ **Heap Snapshot** to inspect Node.js heap consumption.

---

## 3. Real-Time Memory Diagnostics & Native Leaks

### Diagnostic Commands in REPL / Console

```typescript
// Query Node process memory
console.table(process.memoryUsage());

// Query Chromium renderer process memory info
const procMem = await process.getProcessMemoryInfo();
console.table(procMem);

// Query Blink engine memory info
console.table(process.getBlinkMemoryInfo());
```

### Diagnosing RSS vs Heap Discrepancies

- **Signature 1: V8 Heap Growing & RSS Growing**
  - Cause: JavaScript memory leak (retained React/Preact state, unpruned arrays, unremoved event listeners).
  - Remediation: Trace retainer paths in Heap Snapshot comparison.
- **Signature 2: RSS Growing & V8 Heap Flat (or Declining)**
  - Cause: Native addon leak, unreleased OS file handles, uncollected window handles (`BrowserWindow`), GPU compositing buffer retention, or WebGL texture buildup.
  - Remediation: Inspect native C++ addons (`bufferutil`, `utf-8-validate`), verify `win = null` on closed events, and ensure WebGL context/canvas elements are explicitly disposed.

---

## 4. Module Boot Cost Analysis

To measure startup module overhead and identify expensive dependencies:

```bash
node --cpu-prof --heap-prof -e "require('./dist/main/index.js')"
```

Inspect the generated `.cpuprofile` and `.heapprofile` in Chrome DevTools under the **Performance** and **Memory** panels to evaluate boot delays and tree-shaking efficacy.
