/**
 * App.tsx
 * 主應用程式
 * 重構重點：
 * - 移除 axios / ArchLensAPI 呼叫
 * - 移除絕對路徑輸入欄位
 * - 改用 useProjectTree Hook 管理所有狀態
 * - 新增「選取資料夾」按鈕 + ZIP 拖放支援
 * - 新增 File System Access API 不支援時的降級提示
 */

import { useRef, useState } from 'react'
import './App.css'
import { useProjectTree, isFolderPickerSupported } from './hooks/useProjectTree'
import { TreeNode } from './components/TreeNode'
import { TreeView } from './components/TreeView'

function App() {
  const {
    rootNode,
    asciiResult,
    isLoading,
    error,
    inputSource,
    mode,
    enableTruncation,
    setMode,
    setEnableTruncation,
    handleFolderPick,
    handleZipUpload,
    handleToggle,
    handleClear,
  } = useProjectTree()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderSupported = isFolderPickerSupported()

  // ── 拖放 ZIP 支援
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.zip')) {
      handleZipUpload(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleZipUpload(file)
    // 重設 input，允許重複選取同一檔案
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">

      {/* ── Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white text-2xl">🔍</div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">
              ArchLens{' '}
              <span className="text-indigo-600 text-sm font-medium">Web</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
            <span>瀏覽器內專案結構整理工具</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 flex flex-col gap-8">

        {/* ── 輸入區 */}
        <section
          className={`bg-white p-6 rounded-2xl shadow-sm border-2 transition-all ${
            isDragOver ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200'
          }`}
          onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                選取專案來源
              </p>
              <div className="flex flex-wrap gap-3 items-center">

                {/* 選取資料夾按鈕 */}
                {folderSupported ? (
                  <button
                    onClick={handleFolderPick}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                  >
                    📂 選取資料夾
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-sm">
                    ⚠️ 此瀏覽器不支援資料夾選取，請使用 ZIP 上傳
                  </div>
                )}

                {/* ZIP 上傳按鈕 */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold border border-slate-200 transition-all disabled:opacity-50"
                >
                  📦 上傳 ZIP
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  onChange={handleFileInput}
                  className="hidden"
                />

                {/* 拖放提示 */}
                <span className="text-slate-400 text-sm">
                  或將 .zip 檔案拖放至此區域
                </span>

                {/* 清除按鈕（有資料時顯示） */}
                {rootNode && (
                  <button
                    onClick={handleClear}
                    className="ml-auto px-4 py-2 text-sm text-slate-400 hover:text-red-500 transition-colors"
                  >
                    ✕ 清除
                  </button>
                )}
              </div>
            </div>

            {/* 載入中狀態 */}
            {isLoading && (
              <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium">
                <span className="animate-spin">⟳</span>
                解析中，請稍候...
              </div>
            )}

            {/* 錯誤訊息 */}
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* 當前來源資訊 */}
            {inputSource && !isLoading && (
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <span>{inputSource.type === 'folder' ? '📂' : '📦'}</span>
                <span>
                  已載入：<span className="font-medium text-slate-700">{inputSource.name}</span>
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ── 雙欄主視圖（有資料才顯示） */}
        {rootNode && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[700px]">

            {/* 左側：互動式節點樹 */}
            <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-700">互動式節點配置</h3>
                <div className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                  LIVE
                </div>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <TreeNode node={rootNode} onToggle={handleToggle} />
              </div>
            </div>

            {/* 右側：ASCII 預覽 + 匯出 */}
            <div className="flex flex-col gap-4">

              {/* 控制列：折疊開關 + 模式切換 */}
              <div className="flex justify-between items-center px-1">

                {/* DD-025 智慧折疊開關 */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">智慧折疊</span>
                  <button
                    onClick={() => setEnableTruncation(!enableTruncation)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      enableTruncation ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        enableTruncation ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-[10px] text-slate-400">
                    {enableTruncation ? '開啟（略過同質檔）' : '關閉（顯示全結構）'}
                  </span>
                </div>

                {/* BASIC / FULL 模式切換 */}
                <div className="flex gap-1 p-1 bg-slate-200/50 rounded-xl">
                  {(['basic', 'full'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
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

              {/* TreeView */}
              <div className="flex-1 min-h-0">
                <TreeView asciiText={asciiResult} rootNodeName={rootNode.name} />
              </div>
            </div>
          </section>
        )}

        {/* ── 空白狀態提示（無資料時顯示） */}
        {!rootNode && !isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-300 gap-4">
            <div className="text-8xl opacity-20">📁</div>
            <p className="font-medium text-slate-400">選取資料夾或上傳 ZIP 以開始整理</p>
            <p className="text-sm text-slate-300">
              支援直接拖放 .zip 檔案至上方區域
            </p>
          </div>
        )}

      </main>
    </div>
  )
}

export default App
