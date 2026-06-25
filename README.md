# ArchLens Web

**把專案資料夾的結構整理成乾淨、可分享的文字摘要。**  
**Turn a project's folder structure into a clean, shareable text summary.**

所有處理完全在瀏覽器中執行 — 你的檔案永遠不會離開你的電腦。  
Everything runs entirely in your browser — your files never leave your machine.

---

**語言 / Language:** 繁體中文 | [English](#english-version)

---

## 繁體中文

### 功能介紹

ArchLens Web 掃描你的專案資料夾（或 `.zip`），產生 ASCII 目錄樹與結構總覽——你可以直接貼進 README、工單，或餵給 AI 的 prompt。

這是 [ArchLens 系列](../AGENTS.md) 的 `understand`（理解）階段：它是系列共用 `tree` 產物的**產生者**，其他姊妹工具（Diff、Dependency、DocsGap）會消費它的輸出。

- **掃描資料夾**：透過 File System Access API（Chrome / Edge），或**上傳 `.zip`**（以 JSZip 在瀏覽器內解析）；空白畫面支援拖放。
- **兩種呈現**：可互動的節點樹（逐一勾選檔案進 / 出）+ 即時更新的 ASCII 預覽。
- **智慧折疊** 與 `basic` / `full` 模式，讓大型專案樹保持易讀。
- **匯出** 為 `.txt`、`.md`，或系列的 `tree` JSON 信封，也可直接把結果交給 ArchLens Diff 比較。

無需帳號。無需伺服器。無需上傳。100% 瀏覽器端。

---

### 使用方式

```
npm install
npm run dev        # http://localhost:5173
npm run build      # 型別檢查 (tsc -b) + 生產建置 → dist/
npm run preview    # 在本機預覽生產建置
npm run lint       # eslint
```

1. 點 **選取資料夾**（Chrome / Edge），或把 `.zip` 拖進頁面。
2. 在左側節點樹勾選要保留的檔案 / 資料夾，右側 ASCII 預覽即時更新。
3. 從匯出選單輸出 `.txt` / `.md` / `tree` JSON，或送到 Diff 比較。

---

### 資料契約

ArchLens Web 是系列 `tree` 原子的**來源**。匯出時包進系列共用的有版本信封，讓任一姊妹產品可直接消費：

```json
{ "archlens": "1.0", "kind": "tree", "payload": { "nodes": [{ "path": "src/app.ts", "type": "file" }] } }
```

信封規格見系列層 [`AGENTS.md`](../AGENTS.md)（Layer B）。

---

### 主題

UI 採用系列共用設計 token（`@archlens/tokens`，vendored 於 `src/styles/archlens-tokens.css`），並收斂為單一 **Blueprint（藍圖）** 風格——`<html>` 靜態掛 `al-theme-blueprint`，因此 `BlueprintTheme.tsx` 讀的是共用的 `--al-*` 顏色語意角色，而非硬編色票。早期的 Light / Hacker 主題與執行期切換器已隨系列收斂為 Blueprint 而退役（保留於本 repo 的 `_archive/`，不進建置）。

---

### 隱私

100% 瀏覽器端。資料夾內容與上傳的 zip 都在你的瀏覽器中讀取與處理，不會送往任何伺服器。

---

### 開發者 & 貢獻者

架構說明、建置 / 測試指令與擴充點，請參閱 [DEV_README.md](DEV_README.md)。

---

## English Version

### What It Does

ArchLens Web scans a project folder (or a `.zip`) and produces an ASCII
directory tree and structure overview you can paste into a README, a ticket, or
an AI prompt.

This is the `understand` stage of the [ArchLens suite](../AGENTS.md): it is the
**producer** of the shared `tree` artifact that the sister tools (Diff,
Dependency, DocsGap) consume.

- **Scan a folder** via the File System Access API (Chrome / Edge), or **upload
  a `.zip`** (parsed in-browser with JSZip) — drag-and-drop on the empty state.
- **Two views**: an interactive node tree (toggle files in/out) and a live ASCII
  preview that updates as you toggle.
- **Smart truncation** and a `basic` / `full` mode keep large trees readable.
- **Export** as `.txt`, `.md`, or the suite's `tree` JSON envelope, or hand the
  result straight off to ArchLens Diff for comparison.

No account needed. No server. No upload. 100% browser-side.

---

### How to Use

```
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check (tsc -b) + production build → dist/
npm run preview    # serve the production build locally
npm run lint       # eslint
```

1. Click **Choose folder** (Chrome / Edge), or drop a `.zip` onto the page.
2. Toggle files/folders in the left node tree; the right-hand ASCII preview
   updates live.
3. Export `.txt` / `.md` / `tree` JSON from the export menu, or send to Diff.

---

### Data Contract

ArchLens Web is the **source** of the suite's `tree` atom. Exports are wrapped in
the shared versioned envelope so any sister product can consume them directly:

```json
{ "archlens": "1.0", "kind": "tree", "payload": { "nodes": [{ "path": "src/app.ts", "type": "file" }] } }
```

See the suite-level [`AGENTS.md`](../AGENTS.md) (Layer B) for the envelope spec.

---

### Theming

The UI uses the suite's shared design tokens (`@archlens/tokens`, vendored at
`src/styles/archlens-tokens.css`) and ships a single **Blueprint** look —
`<html>` statically mounts `al-theme-blueprint`, so `BlueprintTheme.tsx` reads
the shared `--al-*` color roles rather than hardcoding a palette. The earlier
Light / Hacker themes and the runtime theme toggle were retired when the suite
converged on Blueprint (kept in this repo's `_archive/`, out of the build).

---

### Privacy

100% client-side. Folder contents and uploaded zips are read and processed in
your browser; nothing is sent to a server.

---

### For Developers & Contributors

See [DEV_README.md](DEV_README.md) for architecture notes, build/test commands,
and extension points.
