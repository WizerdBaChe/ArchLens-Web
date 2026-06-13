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
      className="font-mono text-[13px] leading-[1.75] whitespace-pre select-none"
      style={{ color: '#374151' }}
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
    <div className="grid lg:grid-cols-2 gap-0" style={{ minHeight: 'calc(100vh - 48px)' }}>

      {/* ── 左欄：內容水平置中，讓視覺重心不偏左 */}
      <div className="flex items-center justify-center px-8 py-20">
        <div style={{ width: '100%', maxWidth: 520 }}>

          {/* 產品類型 badge */}
          <div className="mb-8">
            <span className="inline-flex items-center px-3 py-1 rounded-full border border-indigo-100 bg-indigo-50 text-[11px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">
              Project Structure Tool
            </span>
          </div>

          {/* 主標題 — 固定 48px，確保兩行不折斷 */}
          <h1
            className="font-bold tracking-tight text-[#1A1A1A] whitespace-nowrap"
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 48,
              lineHeight: 1.12,
            }}
          >
            把專案結構整理成
            <br />
            <span className="text-indigo-600">可分享的文字摘要</span>
          </h1>

          {/* 說明文字 */}
          <p className="mt-8 text-[18px] leading-8 text-slate-500" style={{ maxWidth: 460 }}>
            從資料夾到 README，只需要幾秒鐘。
            在瀏覽器直接分析專案結構，輸出乾淨的 TXT 或 Markdown。
          </p>

          {/* CTA 按鈕組 */}
          <div className="flex flex-wrap gap-4 mt-10">
            {folderSupported ? (
              <button
                onClick={onFolderPick}
                disabled={isLoading}
                className="px-7 py-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-2xl font-semibold text-[15px] shadow-lg shadow-indigo-200 transition-all duration-150 disabled:opacity-40"
              >
                📂 選取資料夾
              </button>
            ) : (
              <div className="flex items-center gap-2 px-5 py-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl text-sm">
                ⚠️ 請使用 Chrome / Edge（支援資料夾選取）
              </div>
            )}
            <button
              onClick={onZipClick}
              disabled={isLoading}
              className="px-7 py-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-[15px] transition-all duration-150 disabled:opacity-40"
            >
              📦 上傳 ZIP
            </button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-3 gap-3 mt-14">
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Feature</div>
              <div className="font-semibold mt-2 text-[14px]">Browser Only</div>
              <div className="text-[13px] text-slate-500 mt-1.5">不需安裝任何工具</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Output</div>
              <div className="font-semibold mt-2 text-[14px]">TXT / MD</div>
              <div className="text-[13px] text-slate-500 mt-1.5">可直接分享給 AI 或團隊</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Workflow</div>
              <div className="font-semibold mt-2 text-[14px]">ZIP Support</div>
              <div className="text-[13px] text-slate-500 mt-1.5">支援拖放與壓縮檔</div>
            </div>
          </div>

          {/* 底部：主題切換 + 拖放提示 */}
          <div className="mt-10 flex items-center justify-between">
            <button
              onClick={onToggleTheme}
              className="text-[13px] text-slate-400 hover:text-slate-700 transition-colors font-medium"
            >
              → 切換到 Developer Mode
            </button>
            <p className={`text-[13px] transition-colors duration-200 ${isDragOver ? 'text-indigo-500 font-medium' : 'text-slate-400'}`}>
              {isDragOver ? '✦ 放開以載入 ZIP' : '支援將 ZIP 直接拖放到頁面'}
            </p>
          </div>

        </div>
      </div>

      {/* ── 右欄：稿紙線背景 + 浮動終端機視窗（恢復原始設計） */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{ background: '#F0EFE9' }}
      >
        {/* 稿紙格線 — opacity 提升到 0.07 讓質感可見 */}
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.07,
            backgroundImage: [
              'linear-gradient(#1A1A1A 1px, transparent 1px)',
              'linear-gradient(90deg, #1A1A1A 1px, transparent 1px)',
            ].join(', '),
            backgroundSize: '32px 32px',
          }}
        />

        {/* 浮動終端機視窗 — 寬度拉大，讓它在右欄更有存在感 */}
        <div
          className="relative z-10 bg-white rounded-2xl mx-10 w-full"
          style={{
            maxWidth: 420,
            boxShadow: '0 24px 60px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06)',
          }}
        >
          {/* macOS 視窗標題列 */}
          <div className="flex items-center gap-1.5 px-5 py-3.5 border-b border-slate-100">
            <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <span className="w-3 h-3 rounded-full bg-[#28C840]" />
            <span className="ml-3 font-mono text-[11px] text-slate-400">output.txt</span>
            <span className="ml-auto font-mono text-[10px] text-slate-300 tracking-wider">匯出即是這個樣子</span>
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
