/**
 * DefaultTheme.tsx
 * 放置路徑：src/DefaultTheme.tsx
 *
 * 設計計劃：
 *   Palette  #F5F4F0 暖米底 / #1A1A1A ink / #6B7280 slate /
 *            #4F46E5 indigo（唯一行動色）/ #FFFFFF white
 *   Type     Syne 700 (hero display) + Inter (body/UI)
 *   Empty    左 hero copy + 右 ASCII 打字機展示，空白頁即是產品說明
 *   Signature  ASCII 打字機動畫：首次載入時逐行打出範例 tree，
 *              用產品本身的語言說明產品能做什麼
 */

import { useRef, useState, useEffect } from 'react'
import type { TreeNodeData, InputSource } from './types'
import { TreeNode } from './components/TreeNode'
import { TreeView } from './components/TreeView'
import { useTheme } from './ThemeContext'

// ─── 型別 ──────────────────────────────────────────────────────────────────

interface DefaultThemeProps {
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
      className="font-mono text-[13px] leading-[1.75] text-slate-700 whitespace-pre select-none"
      aria-hidden="true"
    >
      {displayed}
      {!done && (
        <span
          className="inline-block w-[2px] h-[14px] bg-indigo-500 ml-px align-middle"
          style={{ animation: 'cursorBlink 0.9s step-end infinite' }}
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
  onToggleTheme: () => void
}

function Hero({ folderSupported, isLoading, isDragOver, onFolderPick, onZipClick, onToggleTheme }: HeroProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-0 min-h-[520px]">

      {/* 左：Hero copy + CTA */}
      <div className="flex flex-col justify-center px-10 py-14 lg:pr-16">

        {/* 產品類型標籤 */}
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-indigo-500 mb-5">
          專案結構工具 · 瀏覽器版
        </p>

        {/* 主標：Syne 字型，大、緊、有力 */}
        <h2
          className="text-[52px] font-bold leading-[1.08] tracking-tight text-[#1A1A1A] mb-6"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          把專案結構<br />
          整理成<br />
          <span className="text-indigo-600">可分享的</span><br />
          文字摘要。
        </h2>

        {/* 說明文字 */}
        <p className="text-[15px] leading-relaxed text-[#6B7280] mb-8 max-w-xs">
          選一個本機資料夾或上傳 ZIP，ArchLens 就會在瀏覽器裡解析目錄結構，讓你勾選要保留的節點，然後匯出成 <code className="text-[13px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">.txt</code> 或 <code className="text-[13px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">.md</code>。
          不需要安裝任何東西。
        </p>

        {/* CTA 按鈕組 */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {folderSupported ? (
            <button
              onClick={onFolderPick}
              disabled={isLoading}
              className="flex items-center justify-center gap-2.5 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-[15px] rounded-xl shadow-lg shadow-indigo-200 transition-all duration-150 disabled:opacity-40"
            >
              <span className="text-lg">📂</span>
              選取資料夾
            </button>
          ) : (
            <div className="flex items-center gap-2 px-5 py-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-sm">
              ⚠️ 請使用 Chrome / Edge（支援資料夾選取）
            </div>
          )}
          <button
            onClick={onZipClick}
            disabled={isLoading}
            className="flex items-center justify-center gap-2.5 px-7 py-3.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-[#1A1A1A] font-semibold text-[15px] rounded-xl border border-slate-200 shadow-sm transition-all duration-150 disabled:opacity-40"
          >
            <span className="text-lg">📦</span>
            上傳 ZIP
          </button>
        </div>

        {/* 拖放提示 */}
        <p
          className={`text-[13px] transition-colors duration-200 ${
            isDragOver ? 'text-indigo-500 font-medium' : 'text-slate-400'
          }`}
        >
          {isDragOver ? '✦ 放開以載入 ZIP' : '↓ 或直接拖放 .zip 至頁面上任何位置'}
        </p>

        {/* 主題切換 — 明顯的 pill，不藏在 header */}
        <div className="mt-10 pt-8 border-t border-slate-200">
          <p className="text-[12px] text-slate-400 mb-3">偏好終端機介面？</p>
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-2.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-mono font-bold text-[13px] rounded-xl transition-colors group"
          >
            <span className="text-base group-hover:animate-pulse">&gt;_</span>
            切換到開發者硬核模式
            <span className="text-[10px] text-slate-500 font-normal">HACKER</span>
          </button>
        </div>
      </div>

      {/* 右：ASCII 打字機展示 */}
      <div
        className="relative flex items-center justify-center bg-[#F0EFE9] lg:rounded-r-none overflow-hidden"
        style={{ minHeight: 360 }}
      >
        {/* 背景裝飾格線 */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* 模擬終端機視窗 */}
        <div className="relative z-10 bg-white rounded-2xl shadow-2xl shadow-slate-200 p-6 mx-8 w-full max-w-[340px]">
          {/* 視窗標題列 */}
          <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-slate-100">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-3 text-[11px] font-mono text-slate-400">output.txt</span>
          </div>
          <TypewriterDemo />
        </div>

        {/* 標籤 */}
        <div className="absolute bottom-6 right-6 text-[11px] font-mono text-slate-400 tracking-wider">
          匯出即是這個樣子
        </div>
      </div>
    </div>
  )
}

// ─── 主元件 ────────────────────────────────────────────────────────────────

export function DefaultTheme({
  rootNode, asciiResult, isLoading, error, inputSource,
  mode, enableTruncation, setMode, setEnableTruncation,
  handleFolderPick, handleZipUpload, handleToggle, handleClear,
  folderSupported,
}: DefaultThemeProps) {
  const { toggleTheme } = useTheme()
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
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700;900&display=swap');
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
        style={{ background: '#F5F4F0', fontFamily: "'Inter', sans-serif", color: '#1A1A1A' }}
        onDragOver={handlePageDragOver}
        onDragLeave={handlePageDragLeave}
        onDrop={handlePageDrop}
      >
        {/* ── Header（有資料後才顯示完整 header，空白狀態 header 很薄） */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-8 py-3 border-b"
          style={{ background: 'rgba(245,244,240,0.85)', backdropFilter: 'blur(12px)', borderColor: '#E5E3DC' }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              ArchLens
            </span>
            <span className="text-[11px] font-semibold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              Web
            </span>
          </div>

          {/* 有資料時在 header 顯示來源資訊 + 操作 */}
          {rootNode && (
            <div className="flex items-center gap-4">
              <span className="text-[13px] text-slate-500">
                {inputSource?.type === 'folder' ? '📂' : '📦'}{' '}
                <span className="font-medium text-slate-700">{inputSource?.name}</span>
              </span>
              <button
                onClick={handleClear}
                className="text-[13px] text-slate-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
              >
                ✕ 清除
              </button>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-mono text-[11px] font-bold rounded-lg transition-colors"
              >
                &gt;_ HACKER
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
                className="flex items-center justify-between px-8 py-3 border-b"
                style={{ borderColor: '#E5E3DC', background: '#FFFFFF' }}
              >
                <div className="flex items-center gap-3">
                  {/* 新增資料按鈕（小） */}
                  {folderSupported && (
                    <button
                      onClick={handleFolderPick}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-100 transition-colors disabled:opacity-40"
                    >
                      📂 換資料夾
                    </button>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-slate-600 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors disabled:opacity-40"
                  >
                    📦 換 ZIP
                  </button>
                  <input ref={fileInputRef} type="file" accept=".zip" onChange={handleFileInput} className="hidden" />
                  {isLoading && (
                    <span className="text-[13px] text-indigo-600 font-medium flex items-center gap-1.5">
                      <span className="animate-spin inline-block">⟳</span> 解析中...
                    </span>
                  )}
                  {error && (
                    <span className="text-[13px] text-red-500">⚠ {error}</span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* 智慧折疊 */}
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-slate-500">智慧折疊</span>
                    <button
                      onClick={() => setEnableTruncation(!enableTruncation)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        enableTruncation ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        enableTruncation ? 'translate-x-4' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  {/* 模式切換 */}
                  <div className="flex p-0.5 bg-slate-100 rounded-lg">
                    {(['basic', 'full'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`px-3 py-1 rounded-md text-[12px] font-semibold transition-all ${
                          mode === m
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
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
                  className="flex flex-col overflow-hidden border-r"
                  style={{ borderColor: '#E5E3DC', background: '#FFFFFF' }}
                >
                  <div
                    className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0"
                    style={{ borderColor: '#F0EFE9' }}
                  >
                    <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                      節點配置
                    </span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full font-semibold border border-indigo-100">
                      LIVE
                    </span>
                  </div>
                  <div className="flex-1 overflow-auto p-5">
                    <TreeNode node={rootNode} onToggle={handleToggle} />
                  </div>
                </div>

                {/* 右：預覽 */}
                <div className="flex flex-col overflow-hidden" style={{ background: '#F5F4F0' }}>
                  <TreeView asciiText={asciiResult} rootNodeName={rootNode.name} />
                </div>
              </div>
            </div>

          ) : (
            /* 空白狀態：Hero */
            <div
              className={`flex-1 relative transition-all duration-200 ${
                isDragOver ? 'ring-4 ring-inset ring-indigo-300' : ''
              }`}
            >
              {/* 全頁拖放遮罩 */}
              {isDragOver && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-indigo-50/80 backdrop-blur-sm pointer-events-none">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-xl font-bold text-indigo-600">放開以載入 ZIP</p>
                  </div>
                </div>
              )}

              <Hero
                folderSupported={folderSupported}
                isLoading={isLoading}
                isDragOver={isDragOver}
                onFolderPick={handleFolderPick}
                onZipClick={() => fileInputRef.current?.click()}
                onToggleTheme={toggleTheme}
              />

              {/* Loading 覆蓋層 */}
              {isLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="text-4xl mb-3 animate-spin inline-block">⟳</div>
                    <p className="text-[15px] font-medium text-indigo-600">解析中，請稍候...</p>
                  </div>
                </div>
              )}

              {/* 錯誤訊息 */}
              {error && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 px-5 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-[14px] shadow-lg">
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
