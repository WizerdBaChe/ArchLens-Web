/**
 * BlueprintTheme.tsx
 * 放置路徑：src/BlueprintTheme.tsx
 *
 * ArchLens Web 的唯一介面（系列統一為 Blueprint 風格後）。
 * 本檔由舊的 DefaultTheme 複製、依 @archlens/tokens 的 .al-theme-blueprint 色票重繪而來：
 * 不再硬編米白／indigo／slate，而是吃系列共用語意角色（--al-bg / --al-surface /
 * --al-text / --al-accent…）。<html> 已靜態掛 al-theme-blueprint，故這些變數恆為藍圖色票。
 *
 * 與舊版差異：
 *   - 移除主題切換（no useTheme / no toggle）——系列已收斂為單一 Blueprint look。
 *   - 招牌 ASCII 打字機展示保留，墨水改用藍圖前景色。
 *
 * 舊的 Light / Hacker 兩套已移至 _archive/（保留於磁碟、不進 repo）。
 */

import { useRef, useState, useEffect } from 'react'
import type { TreeNodeData, InputSource } from './types'
import { TreeNode } from './components/TreeNode'
import { TreeView } from './components/TreeView'

// ─── 型別 ──────────────────────────────────────────────────────────────────

interface BlueprintThemeProps {
  rootNode: TreeNodeData | null
  asciiResult: string
  isLoading: boolean
  error: string | null
  inputSource: InputSource
  mode: 'basic' | 'full'
  enableTruncation: boolean
  setMode: (m: 'basic' | 'full') => void
  setEnableTruncation: (v: boolean) => void
  handleFolderPick: () => Promise<void>
  handleZipUpload: (file: File) => Promise<void>
  handleToggle: (relPath: string, newStatus: boolean) => void
  handleClear: () => void
  folderSupported: boolean
}

// ─── 打字機 ASCII 展示（Signature 動畫）────────────────────────────────────

const DEMO_TREE = `my-project/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   └── Modal.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── favicon.svg
├── package.json
├── tsconfig.json
└── README.md`

function TypewriterDemo() {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    // 每個字元 28ms，整體約 0.9 秒跑完
    const timer = setInterval(() => {
      i++
      setDisplayed(DEMO_TREE.slice(0, i))
      if (i >= DEMO_TREE.length) {
        clearInterval(timer)
        setDone(true)
      }
    }, 28)
    return () => clearInterval(timer)
  }, [])

  return (
    <pre
      className="font-mono text-[13px] leading-[1.75] whitespace-pre select-none"
      style={{ color: 'var(--al-text-secondary)' }}
      aria-hidden="true"
    >
      {displayed}
      {!done && (
        <span
          className="inline-block w-[2px] h-[14px] ml-px align-middle"
          style={{ background: 'var(--al-accent)', animation: 'cursorBlink 0.9s step-end infinite' }}
        />
      )}
    </pre>
  )
}

// ─── 空白狀態 Hero ──────────────────────────────────────────────────────────

interface HeroProps {
  folderSupported: boolean
  isLoading: boolean
  isDragOver: boolean
  onFolderPick: () => void
  onZipClick: () => void
}

function Hero({ folderSupported, isLoading, isDragOver, onFolderPick, onZipClick }: HeroProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-0" style={{ minHeight: 'calc(100vh - 48px)' }}>

      {/* ── 左欄：內容水平置中，讓視覺重心不偏左 */}
      <div className="flex items-center justify-center px-8 py-20">
        <div style={{ width: '100%', maxWidth: 520 }}>

          {/* 產品類型 badge */}
          <div className="mb-8">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold tracking-[0.16em] uppercase"
              style={{
                color: 'var(--al-accent)',
                border: '1px solid var(--al-border)',
                background: 'var(--al-surface-raised)',
              }}
            >
              Project Structure Tool
            </span>
          </div>

          {/* 主標題 — 固定 48px，確保兩行不折斷 */}
          <h1
            className="font-bold tracking-tight whitespace-nowrap"
            style={{
              fontFamily: 'var(--al-font-display)',
              fontSize: 48,
              lineHeight: 1.12,
              color: 'var(--al-text)',
            }}
          >
            把專案結構整理成
            <br />
            <span style={{ color: 'var(--al-accent)' }}>可分享的文字摘要</span>
          </h1>

          {/* 說明文字 */}
          <p
            className="mt-8 text-[18px] leading-8"
            style={{ maxWidth: 460, color: 'var(--al-text-secondary)' }}
          >
            從資料夾到 README，只需要幾秒鐘。
            在瀏覽器直接分析專案結構，輸出乾淨的 TXT 或 Markdown。
          </p>

          {/* CTA 按鈕組 */}
          <div className="flex flex-wrap gap-4 mt-10">
            {folderSupported ? (
              <button
                onClick={onFolderPick}
                disabled={isLoading}
                className="px-7 py-4 rounded-2xl font-semibold text-[15px] transition-all duration-150 disabled:opacity-40"
                style={{ background: 'var(--al-accent)', color: 'var(--al-accent-contrast)' }}
              >
                📂 選取資料夾
              </button>
            ) : (
              <div
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm"
                style={{
                  background: 'var(--al-surface-raised)',
                  border: '1px solid var(--al-warning)',
                  color: 'var(--al-warning)',
                }}
              >
                ⚠️ 請使用 Chrome / Edge（支援資料夾選取）
              </div>
            )}
            <button
              onClick={onZipClick}
              disabled={isLoading}
              className="px-7 py-4 rounded-2xl font-semibold text-[15px] transition-all duration-150 disabled:opacity-40"
              style={{
                background: 'var(--al-surface)',
                border: '1px solid var(--al-border)',
                color: 'var(--al-text)',
              }}
            >
              📦 上傳 ZIP
            </button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-3 gap-3 mt-14">
            {[
              { k: 'Feature', t: 'Browser Only', d: '不需安裝任何工具' },
              { k: 'Output', t: 'TXT / MD', d: '可直接分享給 AI 或團隊' },
              { k: 'Workflow', t: 'ZIP Support', d: '支援拖放與壓縮檔' },
            ].map(c => (
              <div
                key={c.k}
                className="rounded-2xl p-5"
                style={{ background: 'var(--al-surface)', border: '1px solid var(--al-border)' }}
              >
                <div
                  className="text-[10px] uppercase tracking-wider font-semibold"
                  style={{ color: 'var(--al-text-tertiary)' }}
                >
                  {c.k}
                </div>
                <div className="font-semibold mt-2 text-[14px]" style={{ color: 'var(--al-text)' }}>
                  {c.t}
                </div>
                <div className="text-[13px] mt-1.5" style={{ color: 'var(--al-text-secondary)' }}>
                  {c.d}
                </div>
              </div>
            ))}
          </div>

          {/* 底部：拖放提示 */}
          <div className="mt-10 flex items-center justify-end">
            <p
              className="text-[13px] transition-colors duration-200"
              style={{ color: isDragOver ? 'var(--al-accent)' : 'var(--al-text-tertiary)' }}
            >
              {isDragOver ? '✦ 放開以載入 ZIP' : '支援將 ZIP 直接拖放到頁面'}
            </p>
          </div>

        </div>
      </div>

      {/* ── 右欄：藍圖格線背景 + 浮動終端機視窗 */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{ background: 'var(--al-surface-sunken)' }}
      >
        {/* 藍圖格線 — 藍圖風格招牌的方眼紙質感 */}
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.5,
            backgroundImage: [
              'linear-gradient(var(--al-border) 1px, transparent 1px)',
              'linear-gradient(90deg, var(--al-border) 1px, transparent 1px)',
            ].join(', '),
            backgroundSize: '32px 32px',
          }}
        />

        {/* 浮動終端機視窗 */}
        <div
          className="relative z-10 rounded-2xl mx-10 w-full"
          style={{
            maxWidth: 420,
            background: 'var(--al-surface)',
            border: '1px solid var(--al-border)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.25)',
          }}
        >
          {/* 視窗標題列 */}
          <div
            className="flex items-center gap-1.5 px-5 py-3.5"
            style={{ borderBottom: '1px solid var(--al-border)' }}
          >
            <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <span className="w-3 h-3 rounded-full bg-[#28C840]" />
            <span className="ml-3 font-mono text-[11px]" style={{ color: 'var(--al-text-tertiary)' }}>
              output.txt
            </span>
            <span
              className="ml-auto font-mono text-[10px] tracking-wider"
              style={{ color: 'var(--al-text-tertiary)' }}
            >
              匯出即是這個樣子
            </span>
          </div>
          {/* ASCII 打字機 */}
          <div className="p-6">
            <TypewriterDemo />
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── 主元件 ────────────────────────────────────────────────────────────────

export function BlueprintTheme({
  rootNode, asciiResult, isLoading, error, inputSource,
  mode, enableTruncation, setMode, setEnableTruncation,
  handleFolderPick, handleZipUpload, handleToggle, handleClear,
  folderSupported,
}: BlueprintThemeProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // 全頁拖放（只在空白狀態啟用）
  const handlePageDragOver = (e: React.DragEvent) => {
    if (rootNode) return
    e.preventDefault()
    setIsDragOver(true)
  }
  const handlePageDragLeave = (e: React.DragEvent) => {
    // 只在離開視窗時取消，避免子元素觸發
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }
  const handlePageDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith('.zip')) handleZipUpload(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleZipUpload(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <>
      {/* keyframes + reduced-motion（字體已由 @archlens/tokens 的 --al-font-* 提供） */}
      <style>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <div
        className="min-h-screen flex flex-col"
        style={{ background: 'var(--al-bg)', fontFamily: 'var(--al-font-body)', color: 'var(--al-text)' }}
        onDragOver={handlePageDragOver}
        onDragLeave={handlePageDragLeave}
        onDrop={handlePageDrop}
      >
        {/* ── Header（有資料後才顯示完整 header，空白狀態 header 很薄） */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-8 py-3"
          style={{
            background: 'color-mix(in srgb, var(--al-bg) 85%, transparent)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--al-border)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--al-font-display)', color: 'var(--al-text)' }}
            >
              ArchLens
            </span>
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                color: 'var(--al-accent)',
                background: 'var(--al-surface-raised)',
                border: '1px solid var(--al-border)',
              }}
            >
              Web
            </span>
          </div>

          {/* 有資料時在 header 顯示來源資訊 + 操作 */}
          {rootNode && (
            <div className="flex items-center gap-4">
              <span className="text-[13px]" style={{ color: 'var(--al-text-secondary)' }}>
                {inputSource?.type === 'folder' ? '📂' : '📦'}{' '}
                <span className="font-medium" style={{ color: 'var(--al-text)' }}>{inputSource?.name}</span>
              </span>
              <button
                onClick={handleClear}
                className="text-[13px] transition-colors px-3 py-1.5 rounded-lg"
                style={{ color: 'var(--al-text-tertiary)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--al-danger)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--al-text-tertiary)')}
              >
                ✕ 清除
              </button>
            </div>
          )}
        </header>

        {/* ── 主內容 */}
        <main className="flex-1 flex flex-col">

          {/* 有資料：工作區（輸入列 + 雙欄視圖） */}
          {rootNode ? (
            <div className="flex-1 flex flex-col gap-0">

              {/* 次要工具列：折疊 + 模式切換 */}
              <div
                className="flex items-center justify-between px-8 py-3"
                style={{ borderBottom: '1px solid var(--al-border)', background: 'var(--al-surface)' }}
              >
                <div className="flex items-center gap-3">
                  {/* 新增資料按鈕（小） */}
                  {folderSupported && (
                    <button
                      onClick={handleFolderPick}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-lg transition-colors disabled:opacity-40"
                      style={{
                        color: 'var(--al-accent)',
                        background: 'var(--al-surface-raised)',
                        border: '1px solid var(--al-border)',
                      }}
                    >
                      📂 換資料夾
                    </button>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-lg transition-colors disabled:opacity-40"
                    style={{
                      color: 'var(--al-text-secondary)',
                      background: 'var(--al-surface)',
                      border: '1px solid var(--al-border)',
                    }}
                  >
                    📦 換 ZIP
                  </button>
                  <input ref={fileInputRef} type="file" accept=".zip" onChange={handleFileInput} className="hidden" />
                  {isLoading && (
                    <span
                      className="text-[13px] font-medium flex items-center gap-1.5"
                      style={{ color: 'var(--al-accent)' }}
                    >
                      <span className="animate-spin inline-block">⟳</span> 解析中...
                    </span>
                  )}
                  {error && (
                    <span className="text-[13px]" style={{ color: 'var(--al-danger)' }}>⚠ {error}</span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* 智慧折疊 */}
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium" style={{ color: 'var(--al-text-secondary)' }}>智慧折疊</span>
                    <button
                      onClick={() => setEnableTruncation(!enableTruncation)}
                      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                      style={{ background: enableTruncation ? 'var(--al-accent)' : 'var(--al-border)' }}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full shadow transition-transform ${
                        enableTruncation ? 'translate-x-4' : 'translate-x-1'
                      }`} style={{ background: 'var(--al-surface-raised)' }} />
                    </button>
                  </div>
                  {/* 模式切換 */}
                  <div className="flex p-0.5 rounded-lg" style={{ background: 'var(--al-surface-sunken)' }}>
                    {(['basic', 'full'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className="px-3 py-1 rounded-md text-[12px] font-semibold transition-all"
                        style={
                          mode === m
                            ? { background: 'var(--al-surface-raised)', color: 'var(--al-accent)' }
                            : { background: 'transparent', color: 'var(--al-text-secondary)' }
                        }
                      >
                        {m.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 雙欄主視圖 */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: 0, height: 'calc(100vh - 108px)' }}>

                {/* 左：節點樹 */}
                <div
                  className="flex flex-col overflow-hidden"
                  style={{ borderRight: '1px solid var(--al-border)', background: 'var(--al-surface)' }}
                >
                  <div
                    className="flex items-center justify-between px-6 py-3 flex-shrink-0"
                    style={{ borderBottom: '1px solid var(--al-border)' }}
                  >
                    <span
                      className="text-[12px] font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--al-text-secondary)' }}
                    >
                      節點配置
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        color: 'var(--al-accent)',
                        background: 'var(--al-surface-raised)',
                        border: '1px solid var(--al-border)',
                      }}
                    >
                      LIVE
                    </span>
                  </div>
                  <div className="flex-1 overflow-auto p-5">
                    <TreeNode node={rootNode} onToggle={handleToggle} />
                  </div>
                </div>

                {/* 右：預覽 */}
                <div className="flex flex-col overflow-hidden" style={{ background: 'var(--al-bg)' }}>
                  <TreeView asciiText={asciiResult} rootNodeName={rootNode.name} rootNode={rootNode} />
                </div>
              </div>
            </div>

          ) : (
            /* 空白狀態：Hero */
            <div
              className="flex-1 relative transition-all duration-200"
              style={isDragOver ? { boxShadow: 'inset 0 0 0 4px var(--al-accent)' } : undefined}
            >
              {/* 全頁拖放遮罩 */}
              {isDragOver && (
                <div
                  className="absolute inset-0 z-30 flex items-center justify-center backdrop-blur-sm pointer-events-none"
                  style={{ background: 'color-mix(in srgb, var(--al-surface) 80%, transparent)' }}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-xl font-bold" style={{ color: 'var(--al-accent)' }}>放開以載入 ZIP</p>
                  </div>
                </div>
              )}

              <Hero
                folderSupported={folderSupported}
                isLoading={isLoading}
                isDragOver={isDragOver}
                onFolderPick={handleFolderPick}
                onZipClick={() => fileInputRef.current?.click()}
              />

              {/* Loading 覆蓋層 */}
              {isLoading && (
                <div
                  className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-sm"
                  style={{ background: 'color-mix(in srgb, var(--al-bg) 60%, transparent)' }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3 animate-spin inline-block">⟳</div>
                    <p className="text-[15px] font-medium" style={{ color: 'var(--al-accent)' }}>解析中，請稍候...</p>
                  </div>
                </div>
              )}

              {/* 錯誤訊息 */}
              {error && (
                <div
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 px-5 py-3 rounded-xl text-[14px] shadow-lg"
                  style={{
                    background: 'var(--al-surface-raised)',
                    border: '1px solid var(--al-danger)',
                    color: 'var(--al-danger)',
                  }}
                >
                  ⚠️ {error}
                </div>
              )}

              <input ref={fileInputRef} type="file" accept=".zip" onChange={handleFileInput} className="hidden" />
            </div>
          )}
        </main>
      </div>
    </>
  )
}
