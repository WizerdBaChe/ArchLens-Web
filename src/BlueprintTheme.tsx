/**
 * BlueprintTheme.tsx
 * 放置路徑：src/BlueprintTheme.tsx
 *
 * ArchLens Web 的唯一介面（系列統一為 Blueprint 風格後）。
 * 不再硬編米白／indigo／slate，而是吃系列共用語意角色（--al-bg / --al-surface /
 * --al-text / --al-accent…）。<html> 已靜態掛 al-theme-blueprint，故這些變數恆為藍圖色票。
 */

import { useRef, useState, useEffect } from 'react'
import type { TreeNodeData, InputSource } from './types'
import { TreeNode } from './components/TreeNode'
import { TreeView } from './components/TreeView'
import { useLocale, LanguageSwitcher } from './i18n'

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

function TypewriterDemo({ caption }: { caption: string }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
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
    <>
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
      <div className="mt-2 font-mono text-[10px] tracking-wider" style={{ color: 'var(--al-text-tertiary)' }}>
        {caption}
      </div>
    </>
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
  const { t } = useLocale()

  return (
    <div className="grid lg:grid-cols-2 gap-0" style={{ minHeight: 'calc(100vh - 48px)' }}>

      {/* ── 左欄：內容水平置中 */}
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
              {t.badge}
            </span>
          </div>

          {/* 主標題 */}
          <h1
            className="font-bold tracking-tight"
            style={{
              fontFamily: 'var(--al-font-display)',
              fontSize: 48,
              lineHeight: 1.12,
              color: 'var(--al-text)',
            }}
          >
            {t.heroTitle}
            <br />
            <span style={{ color: 'var(--al-accent)' }}>{t.heroTitleAccent}</span>
          </h1>

          {/* 說明文字 */}
          <p
            className="mt-8 text-[18px] leading-8"
            style={{ maxWidth: 460, color: 'var(--al-text-secondary)' }}
          >
            {t.heroSubtitle}
          </p>

          {/* CTA 按鈕組 */}
          <div className="flex flex-wrap gap-4 mt-10">
            {folderSupported ? (
              <button
                onClick={onFolderPick}
                disabled={isLoading}
                className="px-7 py-4 rounded-2xl font-semibold text-[15px] transition-all duration-150 disabled:opacity-40 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                style={{ background: 'var(--al-accent)', color: 'var(--al-accent-contrast)' }}
              >
                {t.pickFolder}
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
                {t.browserWarning}
              </div>
            )}
            <button
              onClick={onZipClick}
              disabled={isLoading}
              className="px-7 py-4 rounded-2xl font-semibold text-[15px] transition-all duration-150 disabled:opacity-40 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
              style={{
                background: 'var(--al-surface)',
                border: '1px solid var(--al-border)',
                color: 'var(--al-text)',
              }}
            >
              {t.uploadZip}
            </button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-3 gap-3 mt-14">
            {[
              { k: 'Feature', title: t.featureBrowserOnly, desc: t.featureBrowserOnlyDesc },
              { k: 'Output', title: t.featureOutput, desc: t.featureOutputDesc },
              { k: 'Workflow', title: t.featureWorkflow, desc: t.featureWorkflowDesc },
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
                  {c.title}
                </div>
                <div className="text-[13px] mt-1.5" style={{ color: 'var(--al-text-secondary)' }}>
                  {c.desc}
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
              {isDragOver ? t.dragActive : t.dragHint}
            </p>
          </div>

        </div>
      </div>

      {/* ── 右欄：藍圖格線背景 + 浮動終端機視窗 */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{ background: 'var(--al-surface-sunken)' }}
      >
        {/* 藍圖格線 */}
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
          </div>
          {/* ASCII 打字機 */}
          <div className="p-6">
            <TypewriterDemo caption={t.typewriterCaption} />
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
  const { t } = useLocale()

  // 全頁拖放（只在空白狀態啟用）
  const handlePageDragOver = (e: React.DragEvent) => {
    if (rootNode) return
    e.preventDefault()
    setIsDragOver(true)
  }
  const handlePageDragLeave = (e: React.DragEvent) => {
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
        {/* ── Header */}
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

          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {rootNode && (
              <div className="flex items-center gap-4">
                <span className="text-[13px]" style={{ color: 'var(--al-text-secondary)' }}>
                  {inputSource?.type === 'folder' ? '📂' : '📦'}{' '}
                  <span className="font-medium" style={{ color: 'var(--al-text)' }}>{inputSource?.name}</span>
                </span>
                <button
                  onClick={handleClear}
                  className="text-[13px] transition-all px-3 py-1.5 rounded-lg hover:-translate-y-px hover:shadow-md active:translate-y-0"
                  style={{ color: 'var(--al-text-tertiary)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--al-danger)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--al-text-tertiary)')}
                >
                  {t.clear}
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ── 主內容 */}
        <main className="flex-1 flex flex-col">

          {rootNode ? (
            <div className="flex-1 flex flex-col gap-0">

              {/* 次要工具列 */}
              <div
                className="flex items-center justify-between px-8 py-3"
                style={{ borderBottom: '1px solid var(--al-border)', background: 'var(--al-surface)' }}
              >
                <div className="flex items-center gap-3">
                  {folderSupported && (
                    <button
                      onClick={handleFolderPick}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-lg transition-all disabled:opacity-40 hover:-translate-y-px hover:shadow-md active:translate-y-0"
                      style={{
                        color: 'var(--al-accent)',
                        background: 'var(--al-surface-raised)',
                        border: '1px solid var(--al-border)',
                      }}
                    >
                      {t.changeFolder}
                    </button>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-lg transition-all disabled:opacity-40 hover:-translate-y-px hover:shadow-md active:translate-y-0"
                    style={{
                      color: 'var(--al-text-secondary)',
                      background: 'var(--al-surface)',
                      border: '1px solid var(--al-border)',
                    }}
                  >
                    {t.changeZip}
                  </button>
                  <input ref={fileInputRef} type="file" accept=".zip" onChange={handleFileInput} className="hidden" />
                  {isLoading && (
                    <span
                      className="text-[13px] font-medium flex items-center gap-1.5"
                      style={{ color: 'var(--al-accent)' }}
                    >
                      <span className="animate-spin inline-block">⟳</span> {t.parsing}
                    </span>
                  )}
                  {error && (
                    <span className="text-[13px]" style={{ color: 'var(--al-danger)' }}>⚠ {error}</span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* 智慧折疊 */}
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium" style={{ color: 'var(--al-text-secondary)' }}>{t.smartCollapse}</span>
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
                        className="px-3 py-1 rounded-md text-[12px] font-semibold transition-all hover:-translate-y-px active:translate-y-0"
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
                      {t.nodeConfig}
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        color: 'var(--al-accent)',
                        background: 'var(--al-surface-raised)',
                        border: '1px solid var(--al-border)',
                      }}
                    >
                      {t.live}
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
              {isDragOver && (
                <div
                  className="absolute inset-0 z-30 flex items-center justify-center backdrop-blur-sm pointer-events-none"
                  style={{ background: 'color-mix(in srgb, var(--al-surface) 80%, transparent)' }}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-xl font-bold" style={{ color: 'var(--al-accent)' }}>{t.dropOverlay}</p>
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

              {isLoading && (
                <div
                  className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-sm"
                  style={{ background: 'color-mix(in srgb, var(--al-bg) 60%, transparent)' }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3 animate-spin inline-block">⟳</div>
                    <p className="text-[15px] font-medium" style={{ color: 'var(--al-accent)' }}>{t.parsingSplash}</p>
                  </div>
                </div>
              )}

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
