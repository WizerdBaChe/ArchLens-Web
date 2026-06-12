/**
 * TreeView.tsx
 * ASCII 預覽區與匯出功能
 * 從原版移植，移除 isLoading（改為同步渲染，永遠不 loading）
 * 匯出邏輯完整保留（DD-026 純前端 Blob 匯出）
 */

import { useState } from 'react'

interface TreeViewProps {
  asciiText: string
  rootNodeName?: string
}

export const TreeView: React.FC<TreeViewProps> = ({ asciiText, rootNodeName }) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const [copied, setCopied] = useState(false)

  // DD-026：動態檔名生成器（過濾 OS 非法字元）
  const getDynamicFilename = (extension: string): string => {
    const safeName = rootNodeName
      ? rootNodeName.replace(/[<>:"/\\|?*]+/g, '')
      : 'Project'
    return `${safeName}_File_Structure.${extension}`
  }

  const triggerDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
    setShowDropdown(false)
  }

  const exportAsTxt = () => {
    if (!asciiText) return
    triggerDownload(getDynamicFilename('txt'), asciiText)
  }

  const exportAsMd = () => {
    if (!asciiText) return
    const title = rootNodeName
      ? rootNodeName.replace(/[<>:"/\\|?*]+/g, '')
      : 'Project'
    const markdownContent = `# ${title} Structure\n\n\`\`\`text\n${asciiText}\n\`\`\`\n`
    triggerDownload(getDynamicFilename('md'), markdownContent)
  }

  const handleCopy = async () => {
    if (!asciiText) return
    await navigator.clipboard.writeText(asciiText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
      {/* 頂部工具列 */}
      <div className="bg-slate-900 px-6 py-3.5 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400 font-mono text-xs uppercase tracking-wider font-bold">
            ASCII Preview
          </span>
        </div>

        <div className="flex items-center gap-2 relative">
          {/* 複製按鈕 */}
          <button
            onClick={handleCopy}
            disabled={!asciiText}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-xl border border-slate-700 cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {copied ? '✓ 已複製' : '📋 複製文字'}
          </button>

          {/* 匯出下拉 */}
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={!asciiText}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl shadow-md shadow-indigo-950/50 cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            📥 匯出檔案 ▼
          </button>

          {showDropdown && asciiText && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 top-10 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden py-1">
                <button
                  onClick={exportAsTxt}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-700 font-medium transition-colors cursor-pointer"
                >
                  📄 匯出純文字 (.txt)
                </button>
                <button
                  onClick={exportAsMd}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-700 font-medium transition-colors border-t border-slate-700/50 cursor-pointer"
                >
                  ✍️ 匯出 Markdown (.md)
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 預覽區 */}
      <div className="p-6 overflow-auto flex-1 bg-slate-950/50 scrollbar-thin scrollbar-thumb-slate-800">
        <pre className="text-emerald-400 font-mono text-sm leading-relaxed whitespace-pre font-normal tracking-wide selection:bg-indigo-500/30">
          {asciiText || (
            <span className="text-slate-600 italic font-light">
              等待左側解析完成後，此處將即時渲染 ASCII 結構圖...
            </span>
          )}
        </pre>
      </div>
    </div>
  )
}
